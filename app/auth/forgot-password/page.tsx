"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const [sent, setSent] = React.useState(false)
    const supabase = createClient()

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError(null)
        setIsLoading(true)

        const formData = new FormData(e.currentTarget)
        const email = formData.get("email") as string

        if (!email.trim()) {
            setError("Email é obrigatório")
            setIsLoading(false)
            return
        }

        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/login`,
        })

        if (resetError) {
            setError("Erro ao enviar email de recuperação. Tente novamente.")
        } else {
            setSent(true)
        }

        setIsLoading(false)
    }

    if (sent) {
        return (
            <div className="space-y-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-[3px] text-white font-sans uppercase">
                        EMAIL ENVIADO
                    </h1>
                    <p className="text-zinc-400 font-mono text-sm">
                        Verifique sua caixa de entrada
                    </p>
                </div>

                <div className="p-4 rounded-lg border border-[#A2E635]/30 bg-[#A2E635]/5">
                    <div className="flex gap-3">
                        <CheckCircle2 className="h-5 w-5 text-[#A2E635] shrink-0 mt-0.5" />
                        <p className="text-sm text-zinc-300 font-mono">
                            Se o email estiver cadastrado, você receberá um link para redefinir sua senha.
                        </p>
                    </div>
                </div>

                <Link
                    href="/auth/login"
                    className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors font-mono"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar ao login
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-[3px] text-white font-sans uppercase">
                    RECUPERAR ACESSO
                </h1>
                <p className="text-zinc-400 font-mono text-sm">
                    Informe seu email para receber o link de redefinição
                </p>
            </div>

            {error && (
                <div
                    role="alert"
                    className="p-4 rounded-lg border border-red-500/50 bg-red-500/10 animate-in fade-in slide-in-from-top-2"
                >
                    <div className="flex gap-3">
                        <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-400 font-mono">{error}</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="space-y-2">
                    <Label htmlFor="email" className="font-mono text-xs uppercase text-zinc-400">
                        E-MAIL DO OPERADOR
                    </Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="operador@zvision.com"
                        autoComplete="email"
                        className="h-12 bg-[#111] border-[#222] text-white focus:border-[#A2E635] transition-all duration-200 font-mono text-sm"
                        disabled={isLoading}
                    />
                </div>

                <Button
                    type="submit"
                    className="w-full h-12 bg-[#A2E635] text-black hover:bg-[#A2E635]/90 font-bold font-mono tracking-wide transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] mt-4"
                    disabled={isLoading}
                >
                    {isLoading ? "ENVIANDO..." : "ENVIAR LINK DE RECUPERAÇÃO"}
                </Button>
            </form>

            <Link
                href="/auth/login"
                className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors font-mono"
            >
                <ArrowLeft className="w-4 h-4" />
                Voltar ao login
            </Link>
        </div>
    )
}
