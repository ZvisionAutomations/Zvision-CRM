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
    // Google Places extras
    street: string
    city: string
    state: string
    category: string
}

// ── Validated lead payload ready for insert ──────────────────────────────────
interface LeadPayload {
    company_id: string
    name: string
    company_name: string
    email: string | null
    phone: string | null
    company_website: string | null
    company_linkedin: string | null
    estimated_value: number | null
    pipeline_stage: PipelineStage
    ai_briefing: string | null
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

    // 'title' is the Google Places business name — maps to both name and company_name
    const businessName = pickField(raw, 'nome', 'name', 'contato', 'title')
    const companyName = pickField(raw, 'empresa', 'company', 'organizacao', 'organization', 'title')

    // Google Places: 'categories/0' column header is normalized to 'categories0' by normalizeKey
    const category = pickField(raw, 'categories0', 'categoryname', 'categoria', 'category')

    return {
        name: businessName,
        company_name: companyName,
        email: pickField(raw, 'email', 'e-mail'),
        phone: pickField(raw, 'telefone', 'phone', 'tel', 'celular', 'fone'),
        company_website: pickField(raw, 'website', 'site'),
        company_linkedin: pickField(raw, 'linkedin'),
        estimated_value: numericValue,
        pipeline_stage,
        // Google Places address fields
        street: pickField(raw, 'street', 'rua', 'endereco', 'logradouro'),
        city: pickField(raw, 'city', 'cidade'),
        state: pickField(raw, 'state', 'estado'),
        category,
    }
}

// ── Normalization helpers ─────────────────────────────────────────────────────
function normalizePhone(phone: string): string {
    const digits = phone.replace(/\D/g, '')
    // Brazilian number: 10 or 11 digits → add +55
    if (digits.length === 10 || digits.length === 11) {
        return `+55${digits}`
    }
    // Already has country code (12-13 digits starting with 55)
    if ((digits.length === 12 || digits.length === 13) && digits.startsWith('55')) {
        return `+${digits}`
    }
    // Return cleaned digits if can't determine format
    return digits || phone
}

function normalizeEmail(email: string): string {
    return email.toLowerCase().trim()
}

// ── Deduplication key ────────────────────────────────────────────────────────
function dedupeKey(row: { name: string; company_name: string; email: string | null; phone: string | null }): string {
    if (row.email) return `email:${row.email}`
    // Use normalized phone as dedup key (Google Places rows often have no email)
    if (row.phone) return `phone:${row.phone.replace(/\D/g, '')}`
    return `name_company:${row.name.toLowerCase()}|${row.company_name.toLowerCase()}`
}

// ── Build ai_briefing from Google Places address + category ───────────────────
function buildPlacesBriefing(row: RawRow): string | null {
    const parts: string[] = []
    const addressParts = [row.street, row.city, row.state].filter(Boolean)
    if (addressParts.length > 0) {
        parts.push(`Endereço: ${addressParts.join(', ')}`)
    }
    if (row.category) {
        parts.push(`Categoria: ${row.category}`)
    }
    return parts.length > 0 ? parts.join(' | ') : null
}

function validateRow(row: RawRow, companyId: string): LeadPayload | null {
    const normalizedPhone = row.phone ? normalizePhone(row.phone) : null

    // Accept if has: name/company (standard) OR phone (Google Places — no email)
    const hasIdentifier = row.name || row.company_name || normalizedPhone
    if (!hasIdentifier) return null

    return {
        company_id: companyId,
        name: row.name || row.company_name || '(sem nome)',
        company_name: row.company_name || row.name || '(sem empresa)',
        email: row.email ? normalizeEmail(row.email) : null,
        phone: normalizedPhone,
        company_website: row.company_website || null,
        company_linkedin: row.company_linkedin || null,
        estimated_value: row.estimated_value,
        pipeline_stage: row.pipeline_stage,
        ai_briefing: buildPlacesBriefing(row),
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

    // ── Fetch company_id from authenticated user ──────────────────────────────
    async function fetchCompanyId(): Promise<string | null> {
        const supabase = createClient()
        if (!supabase) return null

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) return null

        const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('company_id')
            .eq('id', user.id)
            .single()

        if (profileError || !profile) return null
        return profile.company_id as string
    }

    // ── Parse raw rows asynchronously in chunks ───────────────────────────────
    async function processRawRows(rawRows: Record<string, string>[], filename: string) {
        setState('parsing')
        setFileName(filename)
        addLog('info', `// Arquivo recebido: ${filename}`)
        addLog('info', `// Iniciando parsing de ${rawRows.length} linhas...`)

        // Resolve company_id before processing
        const companyId = await fetchCompanyId()
        if (!companyId) {
            addLog('err', 'Sessão expirada ou perfil não encontrado. Faça login novamente.')
            setState('error')
            return
        }

        // Detect mapped columns from first row headers
        if (rawRows.length > 0) {
            const headers = Object.keys(rawRows[0])
            addLog('info', `// Detectando colunas...`)
            addLog('info', `// Colunas encontradas: ${headers.join(', ')}`)
        }

        const validLeads: LeadPayload[] = []
        const seen = new Set<string>()
        let skipped = 0
        let duplicates = 0

        // Process in chunks to keep UI alive
        for (let i = 0; i < rawRows.length; i += BATCH_SIZE) {
            const chunk = rawRows.slice(i, i + BATCH_SIZE)

            for (let j = 0; j < chunk.length; j++) {
                const rowIndex = i + j + 1
                const mapped = mapRow(chunk[j])
                const validated = validateRow(mapped, companyId)

                if (!validated) {
                    skipped++
                    addLog('skip', `Row ${rowIndex} — sem identificador (nome/empresa/telefone), ignorado`)
                    continue
                }

                // In-memory deduplication
                const key = dedupeKey(validated)
                if (seen.has(key)) {
                    duplicates++
                    addLog('skip', `Row ${rowIndex} — duplicata: ${validated.email || validated.name}`)
                    continue
                }
                seen.add(key)

                validLeads.push(validated)
                if (rowIndex <= 5 || rowIndex % 50 === 0) {
                    addLog('ok', `Row ${rowIndex} — "${validated.company_name}" queued`)
                }
            }

            if (i + BATCH_SIZE < rawRows.length) {
                addLog('info', `>> Parsing row ${Math.min(i + BATCH_SIZE + 1, rawRows.length)}...`)
                // Yield to the event loop
                await new Promise(resolve => setTimeout(resolve, PARSE_CHUNK_DELAY_MS))
            }
        }

        if (validLeads.length === 0) {
            addLog('err', `Nenhum registro válido encontrado. Certifique-se de ter pelo menos: nome, empresa ou telefone.`)
            setState('error')
            return
        }

        addLog('info', `>> Parsing concluído — ${validLeads.length} válidos, ${skipped} ignorados, ${duplicates} duplicatas`)
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

        addLog('done', `INGESTÃO CONCLUÍDA: ${totalInserted} importados — mission ready`)
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
