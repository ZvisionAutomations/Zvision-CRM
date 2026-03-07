import TacticalLayout from "@/components/TacticalLayout"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <TacticalLayout>{children}</TacticalLayout>
}
