"use client"

import React, { useEffect, useState } from "react"
import { Sidebar } from "./sidebar"
import { CommandSearch, useCommandSearch } from "./command-search"
import { NotificationToast } from "./notification-toast"
import { DashboardProvider } from "@/context/dashboard-context"
import { motion, AnimatePresence } from "framer-motion"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { open, setOpen } = useCommandSearch()

  // Mirror sidebar expanded state — reads same localStorage key
  const [expanded, setExpanded] = useState<boolean>(() => {
    if (typeof window === "undefined") return false
    return localStorage.getItem("zvision_sidebar_expanded") === "true"
  })

  useEffect(() => {
    const handleSidebarToggle = () => {
      setExpanded(localStorage.getItem("zvision_sidebar_expanded") === "true")
    }
    // storage fires for cross-tab updates; custom event fires for same-tab
    window.addEventListener("storage", handleSidebarToggle)
    window.addEventListener("zvision_sidebar_toggle", handleSidebarToggle)
    return () => {
      window.removeEventListener("storage", handleSidebarToggle)
      window.removeEventListener("zvision_sidebar_toggle", handleSidebarToggle)
    }
  }, [])

  const sidebarWidth = expanded ? "200px" : "56px"

  return (
    <DashboardProvider>
      <div className="min-h-screen bg-background">
        {/* Rail lateral — width managed by sidebar itself */}
        <Sidebar />
        <CommandSearch open={open} onOpenChange={setOpen} />

        {/* Scanlines overlay */}
        <div
          className="pointer-events-none fixed inset-0 z-[9999]"
          aria-hidden="true"
          style={{
            background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.025) 2px, rgba(0,0,0,0.025) 4px)",
          }}
        />

        {/* Topbar — left offset tracks sidebar width */}
        <header
          className="fixed top-0 right-0 h-[52px] flex items-center justify-between px-5 z-40 backdrop-blur-sm"
          style={{
            left: sidebarWidth,
            transition: "left 0.2s ease",
            background: "rgba(17,17,17,0.85)",
            borderBottom: "1px solid var(--border-default)",
          }}
        >
          {/* System name + version */}
          <div className="flex items-center gap-2">
            <span
              className="font-['Space_Grotesk'] font-bold text-sm tracking-[0.1em] uppercase"
              style={{ color: "var(--text-primary)" }}
            >
              ZVISION
            </span>
            <span className="font-mono text-[10px]" style={{ color: "var(--text-secondary)" }}>
              v1.0.0
            </span>
          </div>

          {/* Live system status */}
          <div className="flex items-center gap-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] pulse-live"
              style={{ boxShadow: "0 0 4px rgba(162,230,53,0.7)" }}
              aria-hidden="true"
            />
            <span
              className="font-mono text-[11px] uppercase tracking-widest hidden sm:inline"
              style={{ color: "var(--accent-primary)" }}
            >
              SISTEMA OPERACIONAL
            </span>
          </div>

          <div className="w-24" />
        </header>

        {/* Conteudo principal — left padding tracks sidebar width */}
        <main
          className="pt-[52px] min-h-screen"
          style={{
            paddingLeft: sidebarWidth,
            transition: "padding-left 0.2s ease",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={typeof window !== "undefined" ? window.location.pathname : ""}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        <NotificationToast />
      </div>
    </DashboardProvider>
  )
}
