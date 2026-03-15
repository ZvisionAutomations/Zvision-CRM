"use server"

import { redirect } from "next/navigation"

// /assets era uma rota fora de escopo (asset vault de marketing).
// Redirecionando para o pipeline de missoes ate ser formalmente removida.
export default async function AssetsPage() {
  redirect("/missoes")
}