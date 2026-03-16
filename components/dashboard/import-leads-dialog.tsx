"use client"

import React, { useState, useRef } from "react"
import { UploadCloud, FileSpreadsheet, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import * as XLSX from "xlsx"
import Papa from "papaparse"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import type { Lead } from "@/types/database"
import { importLeadsBatch } from "@/lib/actions/leads"

interface ImportLeadsDialogProps {
    children?: React.ReactNode
    onSuccess?: () => void
}

export function ImportLeadsDialog({ children, onSuccess }: ImportLeadsDialogProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const [parsedData, setParsedData] = useState<Partial<Lead>[]>([])
    const [fileName, setFileName] = useState<string | null>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)

    const processFile = (file: File) => {
        setFileName(file.name)
        const fileExt = file.name.split('.').pop()?.toLowerCase()

        if (fileExt === 'csv') {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    mapAndSetData(results.data as any[])
                },
                error: (error) => {
                    console.error(error)
                    toast.error("Erro ao processar arquivo CSV")
                }
            })
        } else if (fileExt === 'xlsx' || fileExt === 'xls') {
            const reader = new FileReader()
            reader.onload = (e) => {
                try {
                    const data = e.target?.result
                    const workbook = XLSX.read(data, { type: 'binary' })
                    const firstSheetName = workbook.SheetNames[0]
                    const worksheet = workbook.Sheets[firstSheetName]
                    const json = XLSX.utils.sheet_to_json(worksheet)
                    mapAndSetData(json as any[])
                } catch (error) {
                    console.error(error)
                    toast.error("Erro ao processar arquivo Excel")
                }
            }
            reader.readAsArrayBuffer(file)
        } else {
            toast.error("Formato de arquivo não suportado. Use CSV ou Excel.")
            setFileName(null)
        }
    }

    // Mapeia as colunas comuns do mercado para o nosso formato tático
    const mapAndSetData = (rawData: any[]) => {
        const mappedLeads: Partial<Lead>[] = rawData.map(row => {
            // Normalização de chaves para facilitar o match (tudo minúsculo sem espaços)
            const normalizedRow: Record<string, string> = {}
            for (const key in row) {
                normalizedRow[key.toLowerCase().replace(/\s+/g, '')] = String(row[key])
            }

            const name = normalizedRow['nome'] || normalizedRow['name'] || normalizedRow['contato'] || 'Sem Nome'
            const company = normalizedRow['empresa'] || normalizedRow['company'] || normalizedRow['organizacao'] || 'Sem Empresa'
            const email = normalizedRow['email'] || normalizedRow['e-mail'] || ''
            const rawValue = normalizedRow['valor'] || normalizedRow['valuation'] || normalizedRow['value'] || '0'
            const estimated_value = parseFloat(rawValue.replace(/[^0-9,-]+/g, "").replace(',', '.')) || 0

            return {
                name,
                company_name: company,
                email,
                estimated_value,
                pipeline_stage: 'NOVO_LEAD' as import("@/types/database").PipelineStage
            }
        }).filter(lead => lead.company_name !== 'Sem Empresa') // Só importa se tiver empresa

        if (mappedLeads.length === 0) {
            toast.error("Nenhum dado válido encontrado. Certifique-se de ter as colunas 'Nome' e 'Empresa'.")
            setFileName(null)
            return
        }

        setParsedData(mappedLeads)
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFile(e.dataTransfer.files[0])
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            processFile(e.target.files[0])
        }
    }

    const handleImport = async () => {
        if (parsedData.length === 0) return

        setIsLoading(true)
        try {
            // Usaremos uma nova Server Action específica para Batch Insert
            const result = await importLeadsBatch(parsedData)

            if (result.error) throw new Error(result.error)

            toast.success(`${parsedData.length} leads injetados com sucesso!`)
            setOpen(false)
            resetState()
            if (onSuccess) onSuccess()
        } catch (error: any) {
            console.error(error)
            toast.error("Falha ao injetar em massa: " + error.message)
        } finally {
            setIsLoading(false)
        }
    }

    const resetState = () => {
        setParsedData([])
        setFileName(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    return (
        <Dialog open={open} onOpenChange={(val) => {
            setOpen(val)
            if (!val) resetState()
        }}>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="outline" className="border-white/10 hover:bg-white/5 text-foreground/70 font-mono text-xs gap-2">
                        <FileSpreadsheet className="w-4 h-4" />
                        IMPORTAR LOTE
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent className="sm:max-w-[600px] bg-[#0d0d10] border-lime/20 text-foreground">
                <DialogHeader>
                    <DialogTitle className="font-mono text-lime uppercase tracking-widest text-lg flex items-center gap-2">
                        <FileSpreadsheet className="w-5 h-5" /> Ingestão Massiva de Dados
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground text-xs">
                        Arraste planilhas Excel (.xlsx) ou CSV para injetar múltiplos alvos simultaneamente no radar.
                    </DialogDescription>
                </DialogHeader>

                {!fileName ? (
                    <div
                        className={`mt-4 border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center transition-all cursor-pointer
              ${isDragging ? 'border-lime bg-lime/5' : 'border-white/10 hover:border-lime/50 bg-[#141418]'}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            className="hidden"
                            accept=".csv, .xlsx, .xls"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                        />
                        <div className="w-16 h-16 rounded-full bg-black border border-white/5 flex items-center justify-center mb-4">
                            <UploadCloud className={`w-8 h-8 ${isDragging ? 'text-lime animate-bounce' : 'text-muted-foreground'}`} />
                        </div>
                        <h3 className="font-bold text-lg mb-1">Arraste a Planilha Aqui</h3>
                        <p className="text-xs text-muted-foreground font-mono tracking-wide">Ou clique para procurar (CSV, XLSX)</p>
                    </div>
                ) : (
                    <div className="mt-4 space-y-4">
                        <div className="p-4 rounded-lg bg-[#141418] border border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <FileSpreadsheet className="w-8 h-8 text-lime" />
                                <div>
                                    <p className="font-bold text-sm truncate max-w-[300px]">{fileName}</p>
                                    <p className="text-xs font-mono text-muted-foreground">{parsedData.length} registros rastreados</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={resetState} className="text-destructive hover:text-destructive/80 text-xs font-mono">
                                DESCARTE
                            </Button>
                        </div>

                        {parsedData.length > 0 && (
                            <div className="border border-white/5 rounded-lg overflow-hidden bg-black/50">
                                <div className="max-h-[200px] overflow-y-auto custom-scrollbar text-xs">
                                    <table className="w-full text-left">
                                        <thead className="bg-[#141418] sticky top-0 border-b border-white/5 font-mono text-muted-foreground uppercase">
                                            <tr>
                                                <th className="p-2 font-normal">Empresa</th>
                                                <th className="p-2 font-normal">Contato</th>
                                                <th className="p-2 font-normal text-right">Valuation</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {parsedData.slice(0, 10).map((row, i) => (
                                                <tr key={i} className="hover:bg-white/5 transition-colors">
                                                    <td className="p-2 font-medium">{row.company_name}</td>
                                                    <td className="p-2 text-muted-foreground">{row.name}</td>
                                                    <td className="p-2 text-right text-lime font-mono">
                                                        {row.estimated_value ? `R$ ${row.estimated_value}` : '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {parsedData.length > 10 && (
                                    <div className="p-2 text-center text-[10px] font-mono text-muted-foreground bg-[#141418] border-t border-white/5">
                                        + {parsedData.length - 10} registros ocultos na pré-visualização
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                <div className="pt-4 flex justify-between items-center border-t border-white/5 mt-4">
                    <p className="text-[10px] font-mono text-muted-foreground max-w-[200px]">
                        O sistema tentará inferir automaticamente as colunas Nome, Empresa e Valuation.
                    </p>
                    <div className="flex gap-3">
                        <Button variant="outline" className="border-white/10 text-foreground/70 hover:text-white bg-transparent hover:bg-white/5" onClick={() => setOpen(false)}>
                            CANCELAR
                        </Button>
                        <Button
                            onClick={handleImport}
                            disabled={isLoading || parsedData.length === 0}
                            className="bg-lime hover:bg-lime/90 text-black font-bold"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ACIONANDO...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    AUTORIZAR INGESTÃO
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
