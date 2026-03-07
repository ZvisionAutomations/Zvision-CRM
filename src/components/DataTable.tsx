import React from "react"
import { motion } from "framer-motion"
import StatusBadge from "./StatusBadge"
import { ChevronRight } from "lucide-react"

interface Column {
    key: string
    title: string
    isNumeric?: boolean
}

interface DataRow {
    id: string
    [key: string]: string | number | boolean | null | undefined
}

interface DataTableProps {
    title: string
    columns: Column[]
    data: DataRow[]
    onRowClick?: (row: DataRow) => void
    statusKey?: string // Identifies which column maps to a status badge
}

export default function DataTable({ title, columns, data, onRowClick, statusKey }: DataTableProps) {
    const getStatusVariant = (statusText: string) => {
        const text = statusText.toLowerCase()
        if (text.includes("alta") || text.includes("quente") || text.includes("sucesso")) return "success"
        if (text.includes("risco") || text.includes("alerta")) return "warning"
        if (text.includes("falha") || text.includes("morto")) return "danger"
        if (text.includes("inativo") || text.includes("neutro")) return "neutral"
        return "default"
    }

    return (
        <div className="glass-panel flex flex-col h-full overflow-hidden border border-white/5 rounded-xl">
            <div className="p-4 border-b border-white/5 bg-[#0d0d10]/50 backdrop-blur-sm flex justify-between items-center z-10">
                <div className="flex items-center gap-3">
                    <h3 className="text-slate-100 text-sm font-bold uppercase tracking-wider font-display">{title}</h3>
                </div>
                <div className="flex gap-2">
                    <span className="text-[10px] font-mono text-slate-500">{data.length} REGISTROS</span>
                </div>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar relative">
                {/* Background grid texture */}
                <div className="absolute inset-0 tactical-grid opacity-20 pointer-events-none z-0"></div>

                <table className="w-full text-left border-collapse relative z-10">
                    <thead className="sticky top-0 bg-[#0d0d10]/95 backdrop-blur-md border-b border-white/10 shadow-md">
                        <tr>
                            {columns.map((col, i) => (
                                <th
                                    key={col.key}
                                    className={`p-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest ${col.isNumeric ? 'text-right' : ''} ${i === 0 ? 'pl-6' : ''}`}
                                >
                                    {col.title}
                                </th>
                            ))}
                            {onRowClick && <th className="w-10"></th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono">
                        {data.map((row, rowIndex) => (
                            <motion.tr
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: rowIndex * 0.05 }}
                                key={row.id}
                                onClick={() => onRowClick && onRowClick(row)}
                                className={`group hover:bg-white/5 transition-colors cursor-pointer ${row.selected ? 'bg-primary/5 border-l-2 border-l-primary' : 'border-l-2 border-l-transparent'
                                    }`}
                            >
                                {columns.map((col, colIndex) => {
                                    const isStatus = statusKey === col.key;
                                    const value = row[col.key]

                                    return (
                                        <td
                                            key={col.key}
                                            className={`p-3 text-xs text-slate-300 ${col.isNumeric ? 'text-right' : ''} ${colIndex === 0 ? 'pl-6' : ''}`}
                                        >
                                            {isStatus ? (
                                                <StatusBadge variant={getStatusVariant(String(value))} pulse={getStatusVariant(String(value)) === 'success'}>
                                                    {String(value)}
                                                </StatusBadge>
                                            ) : (
                                                <span className={`${colIndex === 0 ? 'font-bold text-slate-100 glow-text-subtle group-hover:text-primary transition-colors font-display tracking-wide' : ''}`}>
                                                    {value}
                                                </span>
                                            )}
                                        </td>
                                    )
                                })}
                                {onRowClick && (
                                    <td className="pr-4 text-right">
                                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-primary transition-colors inline-block transform group-hover:translate-x-1" />
                                    </td>
                                )}
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
