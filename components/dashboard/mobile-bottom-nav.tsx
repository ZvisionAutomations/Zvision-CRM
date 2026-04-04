"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Target, BarChart2, Radio, Zap, Settings } from "lucide-react"

const navItems = [
  { href: "/", icon: BarChart2, label: "Dashboard" },
  { href: "/missoes", icon: Target, label: "Pipeline" },
  { href: "/intel", icon: Radio, label: "Intel" },
  { href: "/flows", icon: Zap, label: "Flows" },
  { href: "/settings", icon: Settings, label: "Config" },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* Borda neon topo */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="backdrop-blur-xl border-t border-border" style={{ background: 'rgba(10,10,10,0.95)' }}>
        <div className="flex items-stretch justify-around px-1">
          {navItems.map(({ href, icon: Icon, label }) => {
            // Pipeline ativo para sub-rotas de missoes
            const isActive =
              href === "/"
                ? pathname === "/"
                : pathname.startsWith(href)

            return (
              <Link
                key={href}
                href={href}
                className={`
                  relative flex flex-col items-center justify-center gap-1
                  flex-1 py-3 px-2 min-h-[56px]
                  transition-colors duration-200
                  ${isActive
                    ? "text-primary"
                    : "text-muted-foreground active:text-foreground"}
                `}
              >
                {/* Indicador ativo — linha topo */}
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-primary rounded-b-full" />
                )}

                <Icon
                  className={`w-5 h-5 transition-all duration-200 ${
                    isActive
                      ? "drop-shadow-[0_0_8px_rgba(162,230,53,0.7)]"
                      : ""
                  }`}
                />

                <span
                  className={`text-[10px] font-mono uppercase tracking-wider leading-none ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
