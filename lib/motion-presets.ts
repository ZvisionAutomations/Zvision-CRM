import type { Variants } from "framer-motion"

// ─── Shared framer-motion Variants ──────────────────────────────────────────
// Single source of truth for stagger / fade-slide presets used across KPI cards,
// glance cards, and stat headers.

// Standard stagger (0.08s gap) — KPI cards, stat headers
export const kpiContainerVariants: Variants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.05,
        },
    },
}

export const kpiItemVariants: Variants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
    },
}

// Glance card stagger (0.1s gap, 0.4s duration) — slightly slower for dashboard overview
export const glanceCardContainerVariants: Variants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.05,
        },
    },
}

export const glanceCardItemVariants: Variants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
    },
}

// Aliases — agent-command-header used the same timing as KPI
export const statsContainerVariants = kpiContainerVariants
export const statsItemVariants = kpiItemVariants
