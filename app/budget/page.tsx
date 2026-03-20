import { getExpensesByMonth, getExpensesLast6Months, getSubscriptions, getWonDeals } from "@/lib/actions/budget"
import { FinancialCommandClient } from "./financial-command-client"

// ─── Server Component: fetches all financial data ────────────────────────────

export default async function FinancialCommandCenter() {
    // Current month (March 2026)
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

    // Generate last 6 months for the selector
    const months: string[] = []
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`)
    }

    // Fetch all data in parallel
    const [
        currentExpenses,
        allExpenses6m,
        subscriptionsResult,
        wonDealsResult,
    ] = await Promise.all([
        getExpensesByMonth(currentMonth),
        getExpensesLast6Months(),
        getSubscriptions(),
        getWonDeals(),
    ])

    // Fetch previous month expenses for trend calculation
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const prevMonth = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}-01`
    const prevExpenses = await getExpensesByMonth(prevMonth)

    // Detect TABLE_NOT_FOUND
    const tableNotFound = currentExpenses.error === 'TABLE_NOT_FOUND'
        || subscriptionsResult.error === 'TABLE_NOT_FOUND'

    // Build expenses map: month → expenses[] for all 6 months
    const expensesByMonth: Record<string, typeof currentExpenses.expenses> = {}
    for (const month of months) {
        expensesByMonth[month] = allExpenses6m.expenses.filter(
            (e) => e.month.startsWith(month.slice(0, 7))
        )
    }

    // Also ensure current and prev month data is in the map
    expensesByMonth[currentMonth] = currentExpenses.expenses
    expensesByMonth[prevMonth] = prevExpenses.expenses

    return (
        <FinancialCommandClient
            months={months}
            currentMonth={currentMonth}
            expensesByMonth={expensesByMonth}
            subscriptions={subscriptionsResult.subscriptions}
            wonDeals={wonDealsResult.deals}
            allExpenses6m={allExpenses6m.expenses}
            tableNotFound={tableNotFound}
        />
    )
}
