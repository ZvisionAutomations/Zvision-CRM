"use client"

import React from "react"
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

  return (
    <DashboardProvider>
      <div className="min-h-screen bg-background">
        {/* Rail lateral fixo 56px */}
        <Sidebar />
        <CommandSearch open={open} onOpenChange={setOpen} />

        {/* Conteudo principal deslocado 56px (w-14) da sidebar */}
        <main className="pl-14 min-h-screen">
          <AnimatePresence mode="wait">
            <motion.div
              key={typeof window !== "undefined" ? window.location.pathname : ""}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
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