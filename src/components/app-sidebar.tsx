"use client"

import {
    LayoutDashboard,
    Trello,
    Settings,
    HardDrive,
    Activity,
    ShieldAlert
} from "lucide-react"
import { usePathname } from "next/navigation"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarFooter,
} from "@/components/ui/sidebar"
import Link from "next/link"

const items = [
    {
        title: "Command Center",
        url: "/",
        icon: LayoutDashboard,
    },
    {
        title: "Mission Pipeline",
        url: "/pipeline",
        icon: Trello,
    },
    {
        title: "Data Ingestion",
        url: "/import",
        icon: HardDrive,
    },
    {
        title: "System Config",
        url: "/settings",
        icon: Settings,
    },
]

export function AppSidebar() {
    const pathname = usePathname()

    return (
        <Sidebar className="w-[56px] border-r border-[#A2E635]/15 bg-[#050506]" collapsible="none">
            <SidebarContent className="flex flex-col items-center py-4 bg-[#050506]">

                {/* Top Logo Button */}
                <div className="mb-8 relative group">
                    <div className="w-10 h-10 bg-[#0d0d10] border border-[#A2E635]/20 rounded-[4px] flex items-center justify-center transition-colors group-hover:border-[#A2E635]/50 group-hover:bg-[#141418]">
                        <ShieldAlert className="w-5 h-5 text-[#A2E635]" />
                    </div>
                    {/* Subtle glow underneath */}
                    <div className="absolute inset-0 bg-[#A2E635]/10 blur-[8px] -z-10 group-hover:bg-[#A2E635]/20 transition-all"></div>
                </div>

                <SidebarGroup className="w-full px-0">
                    <SidebarGroupContent>
                        <SidebarMenu className="flex flex-col items-center gap-3">
                            {items.map((item) => {
                                const isActive = pathname === item.url

                                return (
                                    <SidebarMenuItem key={item.title} className="w-full">
                                        <SidebarMenuButton asChild className="p-0 justify-center h-12 w-full rounded-none hover:bg-transparent relative group">
                                            <Link href={item.url} className="flex items-center justify-center w-full h-full relative">
                                                {/* Active state styling */}
                                                {isActive && (
                                                    <>
                                                        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#A2E635] shadow-[0_0_8px_#A2E635]"></div>
                                                        <div className="absolute inset-0 bg-gradient-to-r from-[#A2E635]/10 to-transparent"></div>
                                                    </>
                                                )}

                                                {/* Hover hint */}
                                                {!isActive && (
                                                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                )}

                                                <item.icon
                                                    className={`w-5 h-5 transition-colors ${isActive ? "text-[#A2E635]" : "text-[#4b5563] group-hover:text-[#9ca3af]"
                                                        }`}
                                                />
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* Footer Area with Live Feed Indicator */}
            <SidebarFooter className="flex flex-col items-center pb-6 bg-[#050506]">
                <div className="w-10 h-10 flex items-center justify-center bg-[#141418] border border-white/5 rounded-[4px] group relative overflow-hidden cursor-pointer">
                    <div className="absolute inset-0 bg-[#A2E635]/5 group-hover:bg-[#A2E635]/10 transition-colors"></div>
                    <Activity className="w-4 h-4 text-[#9ca3af] group-hover:text-white transition-colors" />
                    {/* Live Dot */}
                    <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#22c55e] shadow-[0_0_6px_#22c55e] animate-pulse"></div>
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}
