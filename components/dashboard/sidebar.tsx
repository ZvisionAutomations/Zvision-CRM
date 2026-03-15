"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
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
} from "lucide-react"

// Navegacao principal — icones apenas (rail 56px)
// Tooltip com label aparece no hover via CSS
const navItems = [
  { href: "/",          label: "COMANDO",  icon: Activity,   description: "Central de Comando" },
  { href: "/missoes",   label: "MISSOES",  icon: GitBranch,  description: "Pipeline de Missoes" },
  { href: "/intel",     label: "INTEL",    icon: Users,      description: "Inteligencia de Alvos" },
  { href: "/ingestao",  label: "INGESTAO", icon: Database,   description: "Ingestao de Dados" },
  { href: "/flows",     label: "FLUXOS",   icon: Zap,        description: "Automacoes" },
  { href: "/analytics", label: "ANALISE",  icon: BarChart3,  description: "Metricas" },
]

export function Sidebar() {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)

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

  return (
    <aside className="fixed left-0 top-0 h-screen w-14 flex flex-col items-center border-r border-border bg-background z-50 py-3">
      {/* Logo — real Zvision Z mark */}
      <Link
        href="/"
        className="w-8 h-8 flex items-center justify-center mb-6 transition-all hover:scale-110"
        style={{ filter: "drop-shadow(0 0 4px rgba(162,230,53,0.2))" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.filter = "drop-shadow(0 0 8px rgba(162,230,53,0.5))"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.filter = "drop-shadow(0 0 4px rgba(162,230,53,0.2))"
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/zvision-logo.svg"
          alt="Zvision"
          width={32}
          height={32}
          className="w-8 h-8"
        />
      </Link>

      {/* Navegacao */}
      <nav className="flex-1 flex flex-col items-center gap-1 w-full px-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.description}
              className={cn(
                "relative group w-10 h-10 flex items-center justify-center transition-all",
                isActive
                  ? "bg-lime text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface-hover"
              )}
            >
              {/* Indicador ativo na borda esquerda */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-lime lime-glow-sm" />
              )}
              <item.icon className="w-4 h-4" />
              {/* Tooltip label */}
              <span className="
                absolute left-14 bg-surface-elevated border border-border px-2 py-1
                text-xs font-mono whitespace-nowrap
                opacity-0 group-hover:opacity-100 pointer-events-none
                transition-opacity duration-150 z-50
              ">
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Rodape: settings + avatar */}
      <div className="flex flex-col items-center gap-2 mt-auto">
        <Link
          href="/settings"
          title="Configuracoes"
          className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-all"
        >
          <Settings className="w-4 h-4" />
        </Link>

        {/* Avatar do usuario real */}
        <Link
          href="/settings"
          title={user?.user_metadata?.name ?? user?.email ?? "Operador"}
          className="w-8 h-8 border border-border flex items-center justify-center text-xs font-mono text-muted-foreground hover:border-lime hover:text-lime transition-all"
        >
          {initials}
        </Link>
      </div>
    </aside>
  )
}