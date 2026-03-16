"use client"

// SparklineChart — pure SVG, no chart library
// Renders a single polyline of the last 7 execution history values.
// Color: accent-primary when healthy, destructive when error/warning.

interface SparklineChartProps {
    data: number[]
    /** Drives stroke color */
    variant: 'healthy' | 'error'
    className?: string
}

export function SparklineChart({ data, variant, className }: SparklineChartProps) {
    // Need at least 2 points to draw a line
    if (!data || data.length < 2) return null

    const width = 100  // SVG viewBox units (percentage-friendly)
    const height = 24

    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1 // avoid division by zero when all values are equal

    // Map data values to SVG coordinates
    const points = data.map((v, i) => {
        const x = (i / (data.length - 1)) * width
        // Invert Y: SVG y=0 is top, we want high values to appear high
        const y = height - ((v - min) / range) * (height - 4) - 2
        return `${x.toFixed(2)},${y.toFixed(2)}`
    })

    const pointsStr = points.join(' ')
    const stroke = variant === 'healthy' ? 'var(--accent-primary)' : 'var(--destructive)'

    return (
        <svg
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            width="100%"
            height={height}
            className={className}
            aria-hidden="true"
        >
            <polyline
                points={pointsStr}
                fill="none"
                stroke={stroke}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
            />
        </svg>
    )
}
