"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { OAuthButtons } from "@/components/auth/oauth-buttons"
import { PasswordInput } from "@/components/auth/password-input"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState(false)
    const [errors, setErrors] = React.useState<Record<string, string>>({})
    const supabase = createClient()

    const errorSummaryRef = React.useRef<HTMLDivElement>(null)

    const errorList = Object.entries(errors)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setErrors({})
        setIsLoading(true)

        const formData = new FormData(e.currentTarget)
        const email = formData.get("email") as string
        const password = formData.get("password") as string

        // Client-side validation
        const newErrors: Record<string, string> = {}

        if (!email.trim()) newErrors.email = "Email é obrigatório"
        if (!password) newErrors.password = "Senha é obrigatória"

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            setIsLoading(false)
            setTimeout(() => {
                errorSummaryRef.current?.focus()
            }, 100)
            return
        }

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setErrors({ form: 'Credenciais inválidas. Tente novamente.' })
            setIsLoading(false)
            setTimeout(() => {
                errorSummaryRef.current?.focus()
            }, 100)
        } else {
            router.push("/")
            router.refresh()
        }
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-[3px] text-white font-sans uppercase">
                    ACESSO AUTORIZADO
                </h1>
                <p className="text-zinc-400 font-mono text-sm">
                    Insira suas credenciais para acessar o sistema
                </p>
            </div>

            <OAuthButtons isLoading={isLoading} />

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-[#1a1a1a]" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#050506] px-2 text-zinc-500 font-mono">
                        Ou continue com e-mail
                    </span>
                </div>
            </div>

            {errorList.length > 0 && (
                <div
                    ref={errorSummaryRef}
                    tabIndex={-1}
                    role="alert"
                    aria-labelledby="error-summary-title"
                    className="p-4 rounded-lg border border-red-500/50 bg-red-500/10 animate-in fade-in slide-in-from-top-2"
                >
                    <div className="flex gap-3">
                        <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <p id="error-summary-title" className="font-medium text-red-500 font-mono">
                                Corrija os erros abaixo:
                            </p>
                            <ul className="text-sm text-red-400 space-y-1 font-mono">
                                {errorList.map(([field, message]) => (
                                    <li key={field}>
                                        <a
                                            href={`#${field}`}
                                            className="underline underline-offset-2 hover:text-red-300"
                                        >
                                            {message}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="space-y-2">
                    <Label htmlFor="email" className="font-mono text-xs uppercase text-zinc-400">E-MAIL DO OPERADOR</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="operador@zvision.com"
                        autoComplete="email"
                        className="h-12 bg-[#111] border-[#222] text-white focus:border-[#A2E635] transition-all duration-200 font-mono text-sm"
                        disabled={isLoading}
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? "email-error" : undefined}
                    />
                    {errors.email && (
                        <p id="email-error" className="text-sm text-red-500 font-mono animate-in fade-in slide-in-from-top-1">
                            {errors.email}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="font-mono text-xs uppercase text-zinc-400">SENHA DE ACESSO</Label>
                        <Link
                            href="/auth/forgot-password"
                            className="text-xs text-zinc-500 hover:text-white underline underline-offset-4 transition-colors font-mono"
                        >
                            Esqueceu a senha?
                        </Link>
                    </div>
                    <PasswordInput
                        id="password"
                        name="password"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        disabled={isLoading}
                        aria-invalid={!!errors.password}
                        aria-describedby={errors.password ? "password-error" : undefined}
                        className="bg-[#111] border-[#222] text-white focus:border-[#A2E635] font-mono text-sm"
                    />
                    {errors.password && (
                        <p id="password-error" className="text-sm text-red-500 font-mono animate-in fade-in slide-in-from-top-1">
                            {errors.password}
                        </p>
                    )}
                </div>

                <div className="flex items-center space-x-2 pt-2">
                    <Checkbox
                        id="remember"
                        name="remember"
                        className="border-[#333] data-[state=checked]:bg-[#A2E635] data-[state=checked]:text-black"
                    />
                    <Label htmlFor="remember" className="text-xs font-mono text-zinc-400 cursor-pointer">
                        Manter sessão ativa por 30 dias
                    </Label>
                </div>

                <Button
                    type="submit"
                    className="w-full h-12 bg-[#A2E635] text-black hover:bg-[#A2E635]/90 font-bold font-mono tracking-wide transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] mt-4"
                    disabled={isLoading}
                >
                    {isLoading ? "AUTENTICANDO..." : "ENTRAR NO SISTEMA"}
                </Button>
            </form>

            <p className="text-center text-sm text-zinc-500 font-mono">
                <Link href="/auth/register" className="text-zinc-400 underline underline-offset-4 hover:text-white transition-colors">
                    Não tem acesso? Solicitar cadastro
                </Link>
            </p>
        </div>
    )
}
