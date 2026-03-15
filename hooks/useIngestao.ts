"use client"

import { useState, useCallback, useRef } from "react"
import Papa from "papaparse"
import * as XLSX from "xlsx"
import { createClient } from "@/lib/supabase/client"
import { createImportRecord, updateImportRecord } from "@/lib/actions/imports"
import type { PipelineStage } from "@/types/database"

// ── State machine ────────────────────────────────────────────────────────────
export type IngestaoState = 'idle' | 'parsing' | 'uploading' | 'complete' | 'error'

// ── Terminal log entry ────────────────────────────────────────────────────────
export type LogLevel = 'ok' | 'skip' | 'err' | 'done' | 'info'
export interface LogEntry {
    id: number
    level: LogLevel
    message: string
}

// ── Typed parsed row (before validation) ────────────────────────────────────
interface RawRow {
    name: string
    company_name: string
    email: string
    phone: string
    company_website: string
    company_linkedin: string
    estimated_value: number | null
    pipeline_stage: PipelineStage
}

// ── Validated lead payload ready for insert ──────────────────────────────────
interface LeadPayload {
    name: string
    company_name: string
    email: string | null
    phone: string | null
    company_website: string | null
    company_linkedin: string | null
    estimated_value: number | null
    pipeline_stage: PipelineStage
}

const BATCH_SIZE = 50
const PARSE_CHUNK_DELAY_MS = 10
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5MB

// ── Column key normalization ─────────────────────────────────────────────────
function normalizeKey(key: string): string {
    return key.toLowerCase().replace(/[\s_\-]+/g, '')
}

function pickField(row: Record<string, string>, ...keys: string[]): string {
    const normalized = Object.fromEntries(
        Object.entries(row).map(([k, v]) => [normalizeKey(k), v])
    )
    for (const key of keys) {
        const val = normalized[normalizeKey(key)]
        if (val && val.trim()) return val.trim()
    }
    return ''
}

function mapRow(raw: Record<string, string>): RawRow {
    const rawValue = pickField(raw, 'valor', 'valuation', 'value', 'estimatedvalue')
    const numericValue = rawValue
        ? parseFloat(rawValue.replace(/[^0-9,.-]+/g, '').replace(',', '.')) || null
        : null

    const stageRaw = pickField(raw, 'etapa', 'stage', 'pipeline').toUpperCase()
    const validStages: PipelineStage[] = [
        'NOVO_LEAD', 'QUALIFICACAO', 'REUNIAO_BRIEFING', 'REUNIAO_PROPOSTA', 'FECHAMENTO', 'KIA'
    ]
    const pipeline_stage: PipelineStage = (validStages.includes(stageRaw as PipelineStage)
        ? stageRaw
        : 'NOVO_LEAD') as PipelineStage

    return {
        name: pickField(raw, 'nome', 'name', 'contato'),
        company_name: pickField(raw, 'empresa', 'company', 'organizacao', 'organization'),
        email: pickField(raw, 'email', 'e-mail', 'email'),
        phone: pickField(raw, 'telefone', 'phone', 'tel', 'celular'),
        company_website: pickField(raw, 'website', 'site', 'url'),
        company_linkedin: pickField(raw, 'linkedin'),
        estimated_value: numericValue,
        pipeline_stage,
    }
}

function validateRow(row: RawRow): LeadPayload | null {
    // Skip rows where both name AND company_name are empty
    if (!row.name && !row.company_name) return null

    return {
        name: row.name || '(sem nome)',
        company_name: row.company_name || '(sem empresa)',
        email: row.email || null,
        phone: row.phone || null,
        company_website: row.company_website || null,
        company_linkedin: row.company_linkedin || null,
        estimated_value: row.estimated_value,
        pipeline_stage: row.pipeline_stage,
    }
}

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useIngestao() {
    const [state, setState] = useState<IngestaoState>('idle')
    const [log, setLog] = useState<LogEntry[]>([])
    const [importedCount, setImportedCount] = useState(0)
    const [fileName, setFileName] = useState<string | null>(null)
    const logIdRef = useRef(0)

    function addLog(level: LogLevel, message: string) {
        const id = ++logIdRef.current
        setLog(prev => {
            const next = [...prev, { id, level, message }]
            // Keep max 200 entries
            return next.length > 200 ? next.slice(next.length - 200) : next
        })
    }

    function resetToIdle() {
        setState('idle')
        setLog([])
        setImportedCount(0)
        setFileName(null)
        logIdRef.current = 0
    }

    // ── Parse raw rows asynchronously in chunks ───────────────────────────────
    async function processRawRows(rawRows: Record<string, string>[], filename: string) {
        setState('parsing')
        setFileName(filename)
        addLog('info', `// Iniciando parsing de ${rawRows.length} linhas...`)

        const validLeads: LeadPayload[] = []
        let skipped = 0

        // Process in chunks to keep UI alive
        for (let i = 0; i < rawRows.length; i += BATCH_SIZE) {
            const chunk = rawRows.slice(i, i + BATCH_SIZE)

            for (let j = 0; j < chunk.length; j++) {
                const rowIndex = i + j + 1
                const mapped = mapRow(chunk[j])
                const validated = validateRow(mapped)

                if (validated) {
                    validLeads.push(validated)
                    if (rowIndex <= 5 || rowIndex % 50 === 0) {
                        addLog('ok', `Row ${rowIndex} — "${validated.company_name}" queued`)
                    }
                } else {
                    skipped++
                    addLog('skip', `Row ${rowIndex} — sem nome/empresa, ignorado`)
                }
            }

            if (i + BATCH_SIZE < rawRows.length) {
                addLog('info', `>> Parsing row ${Math.min(i + BATCH_SIZE + 1, rawRows.length)}...`)
                // Yield to the event loop
                await new Promise(resolve => setTimeout(resolve, PARSE_CHUNK_DELAY_MS))
            }
        }

        if (validLeads.length === 0) {
            addLog('err', `Nenhum registro válido encontrado. Certifique-se de ter colunas Nome e Empresa.`)
            setState('error')
            return
        }

        addLog('info', `>> Parsing concluído — ${validLeads.length} válidos, ${skipped} ignorados`)
        await uploadLeads(validLeads, filename)
    }

    // ── Upload to Supabase in batches ─────────────────────────────────────────
    async function uploadLeads(leads: LeadPayload[], filename: string) {
        setState('uploading')

        // Create import record
        const { id: importId, error: createErr } = await createImportRecord({
            filename,
            total_rows: leads.length,
        })

        if (createErr || !importId) {
            addLog('err', `Falha ao registrar importação: ${createErr}`)
            setState('error')
            return
        }

        const supabase = createClient()
        if (!supabase) {
            addLog('err', 'Cliente Supabase não disponível')
            setState('error')
            return
        }

        const totalBatches = Math.ceil(leads.length / BATCH_SIZE)
        let totalInserted = 0
        const errorLog: string[] = []

        for (let i = 0; i < leads.length; i += BATCH_SIZE) {
            const batchNum = Math.floor(i / BATCH_SIZE) + 1
            const batch = leads.slice(i, i + BATCH_SIZE)

            addLog('info', `>> Uploading batch ${batchNum}/${totalBatches} para Supabase...`)

            const { error } = await supabase
                .from('leads')
                .insert(batch)

            if (error) {
                // Check for duplicate (conflict)
                if (error.code === '23505') {
                    addLog('skip', `Batch ${batchNum} — conflito de duplicata, registros ignorados`)
                    errorLog.push(`Batch ${batchNum}: duplicate conflict`)
                } else {
                    addLog('err', `Batch ${batchNum} — ${error.message}`)
                    errorLog.push(`Batch ${batchNum}: ${error.message}`)
                }
            } else {
                totalInserted += batch.length
                addLog('ok', `Batch ${batchNum} — ${batch.length} alvos inseridos`)
            }
        }

        // Update import record
        const finalStatus = errorLog.length === 0
            ? 'COMPLETED'
            : totalInserted > 0 ? 'COMPLETED' : 'FAILED'

        await updateImportRecord({
            id: importId,
            processed_rows: totalInserted,
            status: finalStatus,
            error_log: errorLog.length > 0 ? errorLog : null,
        })

        if (totalInserted === 0) {
            addLog('err', 'Nenhum registro foi inserido. Verifique os logs acima.')
            setState('error')
            return
        }

        addLog('done', `[DONE] ${totalInserted} leads importados — mission ready`)
        setImportedCount(totalInserted)
        setState('complete')
    }

    // ── Public: process a dropped/selected file ───────────────────────────────
    const processFile = useCallback((file: File) => {
        if (file.size > MAX_FILE_SIZE_BYTES) {
            addLog('err', `Arquivo muito grande (${(file.size / 1024 / 1024).toFixed(1)}MB). Limite: 5MB`)
            setState('error')
            return
        }

        const ext = file.name.split('.').pop()?.toLowerCase()

        if (ext === 'csv') {
            Papa.parse<Record<string, string>>(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    processRawRows(results.data, file.name)
                },
                error: (err) => {
                    addLog('err', `Erro ao parsear CSV: ${err.message}`)
                    setState('error')
                },
            })
        } else if (ext === 'xlsx' || ext === 'xls') {
            const reader = new FileReader()
            reader.onload = (e) => {
                try {
                    const data = e.target?.result
                    const workbook = XLSX.read(data, { type: 'array' })
                    const sheetName = workbook.SheetNames[0]
                    const worksheet = workbook.Sheets[sheetName]
                    const json = XLSX.utils.sheet_to_json<Record<string, string>>(worksheet, { defval: '' })
                    processRawRows(json, file.name)
                } catch (err) {
                    addLog('err', `Erro ao parsear Excel: ${err instanceof Error ? err.message : 'Desconhecido'}`)
                    setState('error')
                }
            }
            reader.readAsArrayBuffer(file)
        } else {
            addLog('err', `Formato não suportado: .${ext}. Use CSV, XLSX ou XLS.`)
            setState('error')
        }
    }, [])

    return {
        state,
        log,
        importedCount,
        fileName,
        processFile,
        resetToIdle,
    }
}
