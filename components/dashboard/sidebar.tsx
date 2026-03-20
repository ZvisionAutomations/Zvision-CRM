"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import {
  Activity,
  GitBranch,
  BarChart3,
  Users,
  Settings,
  Zap,
  Database,
  Wallet,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

// Navegacao principal
const navItems = [
  { href: "/",          label: "DASHBOARD", icon: Activity,   description: "Central de Comando" },
  { href: "/missoes",   label: "PIPELINE",  icon: GitBranch,  description: "Pipeline de Missoes" },
  { href: "/intel",     label: "INTEL",     icon: Users,      description: "Inteligencia de Alvos" },
  { href: "/ingestao",  label: "INGESTÃO",  icon: Database,   description: "Ingestao de Dados" },
  { href: "/flows",     label: "AGENTES",   icon: Zap,        description: "Automacoes" },
  { href: "/budget",    label: "FINANCEIRO", icon: Wallet,     description: "Comando Financeiro" },
  { href: "/analytics", label: "ANALYTICS", icon: BarChart3,  description: "Metricas" },
] as const

export function Sidebar() {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)

  // Initialize synchronously from localStorage to avoid layout shift
  const [expanded, setExpanded] = useState<boolean>(() => {
    if (typeof window === "undefined") return false
    return localStorage.getItem("zvision_sidebar_expanded") === "true"
  })

  // Carrega usuario autenticado do Supabase
  useEffect(() => {
    const supabase = createClient()
    if (!supabase) return
    supabase.auth.getUser().then(({ data }: { data: { user: User | null } }) => {
      if (data.user) setUser(data.user)
    })
  }, [])

  // Iniciais do usuario para o avatar
  const initials = user?.user_metadata?.name
    ? (user.user_metadata.name as string).split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? "??"

  function handleToggle() {
    const next = !expanded
    setExpanded(next)
    localStorage.setItem("zvision_sidebar_expanded", String(next))
    window.dispatchEvent(new Event("zvision_sidebar_toggle"))
  }

  return (
    <aside
      className="fixed left-0 top-0 h-screen flex flex-col border-r border-border bg-background z-50 py-3 overflow-hidden"
      style={{ width: expanded ? "200px" : "56px", transition: "width 0.2s ease" }}
    >
      {/* Logo area */}
      <Link
        href="/"
        className="flex items-center mb-6 shrink-0"
        style={{ paddingLeft: expanded ? "12px" : "0px", justifyContent: expanded ? "flex-start" : "center", transition: "padding-left 0.2s ease" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/zvision-logo.svg"
          alt="Zvision"
          width={32}
          height={32}
          className="w-8 h-8"
        />
        {expanded && (
          <span
            className="ml-2 font-['Space_Grotesk'] font-bold text-[12px] tracking-[0.2em] uppercase whitespace-nowrap"
            style={{
              color: "var(--text-primary)",
              opacity: expanded ? 1 : 0,
              transition: "opacity 0.15s ease 0.15s",
            }}
          >
            ZVISION
          </span>
        )}
      </Link>

      {/* Navegacao */}
      <nav className="flex-1 flex flex-col gap-1 w-full px-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              title={expanded ? undefined : item.description}
              className={cn(
                "relative group flex items-center h-10 w-full shrink-0",
                expanded ? "px-2 flex-row gap-2" : "justify-center",
                isActive
                  ? expanded
                    ? "bg-[var(--accent-subtle2)] text-[var(--accent-primary)]"
                    : "bg-[var(--accent-primary)] text-background"
                  : "text-muted-foreground hover:text-foreground"
              )}
              style={{
                transition: "background-color 150ms ease, color 150ms ease",
              }}
            >
              {/* Active left-border indicator */}
              {isActive && (
                <motion.span
                  layoutId="sidebar-active-indicator"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 20, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 bg-[var(--accent-primary)]"
                  style={{ boxShadow: "0 0 6px rgba(162,230,53,0.6)" }}
                />
              )}

              {/* Icon */}
              <motion.span
                animate={isActive ? { scale: 1.0 } : { scale: 1.0 }}
                whileHover={
                  !isActive
                    ? {
                        scale: 1.1,
                        filter: "drop-shadow(0 0 6px #A2E635)",
                        transition: { type: "spring", stiffness: 400, damping: 20 },
                      }
                    : {}
                }
                initial={{ scale: 0.9 }}
                key={isActive ? "active" : "inactive"}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="flex items-center justify-center shrink-0"
              >
                <item.icon className="w-4 h-4" />
              </motion.span>

              {/* Expanded: text label with fade-in */}
              {expanded && (
                <span
                  className="font-mono text-[11px] uppercase whitespace-nowrap overflow-hidden"
                  style={{
                    color: isActive ? "var(--accent-primary)" : "var(--text-secondary)",
                    opacity: expanded ? 1 : 0,
                    transition: "opacity 0.15s ease 0.15s",
                  }}
                >
                  {item.label}
                </span>
              )}

              {/* Collapsed: tooltip label on hover */}
              {!expanded && (
                <span className="
                  absolute left-14 bg-[var(--surface-elevated)] border border-border px-2 py-1
                  text-xs font-mono whitespace-nowrap
                  opacity-0 group-hover:opacity-100 pointer-events-none
                  transition-opacity duration-150 z-50
                ">
                  {item.label}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Rodape: toggle + settings + avatar */}
      <div
        className="flex flex-col gap-2 mt-auto"
        style={{ alignItems: expanded ? "flex-start" : "center" }}
      >
        {/* Toggle expand/collapse button */}
        <button
          onClick={handleToggle}
          title={expanded ? "Recolher sidebar" : "Expandir sidebar"}
          className={cn(
            "h-10 flex items-center text-muted-foreground hover:text-foreground shrink-0",
            expanded ? "w-full px-2 gap-2" : "w-10 justify-center"
          )}
          style={{ transition: "color 150ms ease" }}
          onMouseEnter={(e) => {
            const icon = e.currentTarget.querySelector("svg")
            if (icon) icon.style.filter = "drop-shadow(0 0 6px #A2E635)"
          }}
          onMouseLeave={(e) => {
            const icon = e.currentTarget.querySelector("svg")
            if (icon) icon.style.filter = "none"
          }}
        >
          {expanded
            ? <ChevronLeft className="w-4 h-4 shrink-0" style={{ transition: "filter 150ms ease" }} />
            : <ChevronRight className="w-4 h-4 shrink-0" style={{ transition: "filter 150ms ease" }} />
          }
          {expanded && (
            <span
              className="font-mono text-[11px] uppercase whitespace-nowrap"
              style={{
                color: "var(--text-secondary)",
                opacity: 1,
                transition: "opacity 0.15s ease 0.15s",
              }}
            >
              RECOLHER
            </span>
          )}
        </button>

        {/* Settings link */}
        <Link
          href="/settings"
          title={expanded ? undefined : "Configuracoes"}
          className={cn(
            "h-10 flex items-center text-muted-foreground hover:text-foreground shrink-0",
            expanded ? "w-full px-2 gap-2" : "w-10 justify-center"
          )}
          style={{ transition: "color 150ms ease" }}
          onMouseEnter={(e) => {
            const icon = e.currentTarget.querySelector("svg")
            if (icon) icon.style.filter = "drop-shadow(0 0 6px #A2E635)"
          }}
          onMouseLeave={(e) => {
            const icon = e.currentTarget.querySelector("svg")
            if (icon) icon.style.filter = "none"
          }}
        >
          <Settings className="w-4 h-4 shrink-0" style={{ transition: "filter 150ms ease" }} />
          {expanded && (
            <span
              className="font-mono text-[11px] uppercase whitespace-nowrap"
              style={{
                color: "var(--text-secondary)",
                opacity: 1,
                transition: "opacity 0.15s ease 0.15s",
              }}
            >
              CONFIG
            </span>
          )}
        </Link>

        {/* Avatar do usuario real */}
        <Link
          href="/settings"
          title={user?.user_metadata?.name ?? user?.email ?? "Operador"}
          className={cn(
            "w-8 h-8 border border-border flex items-center justify-center text-xs font-mono text-muted-foreground shrink-0",
            expanded ? "ml-2" : ""
          )}
          style={{ transition: "border-color 150ms ease, color 150ms ease" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--accent-primary)"
            e.currentTarget.style.color = "var(--accent-primary)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = ""
            e.currentTarget.style.color = ""
          }}
        >
          {initials}
        </Link>
      </div>
    </aside>
  )
}
