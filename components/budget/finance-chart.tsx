"use client"

import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
} from "recharts"

interface MonthDataPoint {
    month: string
    receita: number
    despesas: number
}

interface FinanceChartProps {
    data: MonthDataPoint[]
}

// pt-BR month abbreviations for chart labels
const monthLabels: Record<string, string> = {
    '10': 'Out',
    '11': 'Nov',
    '12': 'Dez',
    '01': 'Jan',
    '02': 'Fev',
    '03': 'Mar',
    '04': 'Abr',
    '05': 'Mai',
    '06': 'Jun',
    '07': 'Jul',
    '08': 'Ago',
    '09': 'Set',
}

function formatMonthLabel(month: string): string {
    // month is YYYY-MM-DD format
    const m = month.slice(5, 7)
    return monthLabels[m] ?? m
}

import { formatCurrencyShort, formatCurrency as formatCurrencyFull } from "@/lib/formatters"

// Custom tooltip for dark theme
interface TooltipPayload {
    value: number
    dataKey: string
    color: string
}

interface CustomTooltipProps {
    active?: boolean
    payload?: TooltipPayload[]
    label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
    if (!active || !payload?.length) return null

    return (
        <div
            className="border p-3 shadow-lg"
            style={{
                backgroundColor: 'var(--surface-elevated, #1A1A1A)',
                borderColor: 'var(--border-default)',
                borderRadius: '4px',
            }}
        >
            <p className="font-mono text-[10px] text-[var(--text-secondary)] uppercase mb-2">
                {label}
            </p>
            {payload.map((entry) => (
                <p
                    key={entry.dataKey}
                    className="font-mono text-[12px] font-bold"
                    style={{ color: entry.color }}
                >
                    {entry.dataKey === 'receita' ? 'Receita' : 'Despesas'}:{' '}
                    {formatCurrencyFull(entry.value)}
                </p>
            ))}
        </div>
    )
}

export function FinanceChart({ data }: FinanceChartProps) {
    const chartData = data.map((d) => ({
        ...d,
        label: formatMonthLabel(d.month),
    }))

    if (chartData.length === 0) {
        return (
            <div className="border border-[var(--border-default)] border-dashed p-8 flex items-center justify-center h-[280px]">
                <p className="font-mono text-[11px] text-[var(--text-secondary)] uppercase">
                    // DADOS INSUFICIENTES PARA GRÁFICO
                </p>
            </div>
        )
    }

    return (
        <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id="receitaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--accent-primary, #A2E635)" stopOpacity={0.1} />
                            <stop offset="100%" stopColor="var(--accent-primary, #A2E635)" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="despesasGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--status-error, #ef4444)" stopOpacity={0.08} />
                            <stop offset="100%" stopColor="var(--status-error, #ef4444)" stopOpacity={0} />
                        </linearGradient>
                    </defs>

                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.04)"
                        vertical={false}
                    />

                    <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                            fill: '#4b5563',
                            fontSize: 10,
                            fontFamily: 'var(--font-mono, JetBrains Mono)',
                        }}
                    />

                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{
                            fill: '#4b5563',
                            fontSize: 10,
                            fontFamily: 'var(--font-mono, JetBrains Mono)',
                        }}
                        tickFormatter={formatCurrencyShort}
                        width={70}
                    />

                    <Tooltip content={<CustomTooltip />} />

                    <Area
                        type="monotone"
                        dataKey="receita"
                        stroke="var(--accent-primary, #A2E635)"
                        strokeWidth={2}
                        fill="url(#receitaGradient)"
                        dot={false}
                    />

                    <Area
                        type="monotone"
                        dataKey="despesas"
                        stroke="var(--status-error, #ef4444)"
                        strokeWidth={2}
                        fill="url(#despesasGradient)"
                        dot={false}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}
