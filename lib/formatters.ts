// ─── Shared formatters (pt-BR / BRL) ────────────────────────────────────────
// Single source of truth for all currency, ROAS, and compact number formatting.

/** Full currency: R$ 12.450,00 */
export function formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
    })
}

/** Compact currency with null handling: R$ 1.2M / R$ 450K / R$ 1.200 / N/A */
export function formatCompactCurrency(val: number | null): string {
    if (val === null || val === 0) return 'N/A'
    if (val >= 1_000_000) return `R$ ${(val / 1_000_000).toFixed(1)}M`
    if (val >= 1_000) return `R$ ${(val / 1_000).toFixed(0)}K`
    return `R$ ${val.toLocaleString('pt-BR')}`
}

/** Compact number (no currency symbol): 2.8M / 127K / 842 */
export function formatCompactNumber(num: number): string {
    if (num >= 1_000_000) {
        return (num / 1_000_000).toFixed(num >= 10_000_000 ? 1 : 2).replace(/\.?0+$/, '') + 'M'
    }
    if (num >= 1_000) {
        return (num / 1_000).toFixed(num >= 10_000 ? 1 : 2).replace(/\.?0+$/, '') + 'K'
    }
    return num.toLocaleString()
}

/** Short currency for Y-axis labels: R$12.5K / R$800 */
export function formatCurrencyShort(value: number): string {
    if (value >= 1_000) {
        return `R$${(value / 1_000).toFixed(1)}K`
    }
    return `R$${value.toFixed(0)}`
}

/** Percent: "3.8%" */
export function formatPercent(value: number): string {
    return `${value.toFixed(1)}%`
}

/** ROAS: "4.2x" */
export function formatRoas(value: number): string {
    return `${value.toFixed(1)}x`
}
