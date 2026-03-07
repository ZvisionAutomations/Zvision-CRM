"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { OAuthButtons } from "@/components/auth/oauth-buttons"
import { PasswordInput } from "@/components/auth/password-input"
import { PasswordStrength } from "@/components/auth/password-strength"
import { PasswordMatch } from "@/components/auth/password-match"
import { createClient } from "@/lib/supabase/client"

export default function SignUpPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState(false)
    const [errors, setErrors] = React.useState<Record<string, string>>({})
    const [password, setPassword] = React.useState("")
    const [confirmPassword, setConfirmPassword] = React.useState("")
    const supabase = createClient()

    const errorSummaryRef = React.useRef<HTMLDivElement>(null)
    const firstErrorRef = React.useRef<HTMLInputElement>(null)

    const errorList = Object.entries(errors)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setErrors({})
        setIsLoading(true)

        const formData = new FormData(e.currentTarget)
        const fullName = formData.get("fullName") as string
        const email = formData.get("email") as string

        // Client-side validation
        const newErrors: Record<string, string> = {}

        if (!fullName.trim()) newErrors.fullName = "Nome completo é obrigatório"
        if (!email.trim()) newErrors.email = "E-mail é obrigatório"
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Endereço de e-mail inválido"
        if (!password) newErrors.password = "Senha é obrigatória"
        else if (password.length < 8) newErrors.password = "A senha deve ter no mínimo 8 caracteres"
        if (password !== confirmPassword) newErrors.confirmPassword = "As senhas não coincidem"

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            setIsLoading(false)

            // Focus first error field
            setTimeout(() => {
                errorSummaryRef.current?.focus()
            }, 100)
            return
        }

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name: fullName }
            }
        })

        if (error) {
            setErrors({ form: error.message })
            setIsLoading(false)
            setTimeout(() => {
                errorSummaryRef.current?.focus()
            }, 100)
        } else {
            router.push('/auth/login?registered=true')
        }
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-white font-mono uppercase">SOLICITAR ACESSO</h1>
                <p className="text-zinc-400 font-mono text-sm">
                    Crie suas credenciais de operador
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
                    <Label htmlFor="fullName" className="font-mono text-xs uppercase text-zinc-400">Nome completo</Label>
                    <Input
                        ref={errors.fullName ? firstErrorRef : undefined}
                        id="fullName"
                        name="fullName"
                        placeholder="Seu nome"
                        autoComplete="name"
                        className="h-12 bg-[#111] border-[#222] text-white focus:border-[#A2E635] transition-all duration-200"
                        disabled={isLoading}
                        aria-invalid={!!errors.fullName}
                        aria-describedby={errors.fullName ? "fullName-error" : undefined}
                    />
                    {errors.fullName && (
                        <p id="fullName-error" className="text-sm text-red-500 font-mono animate-in fade-in slide-in-from-top-1">
                            {errors.fullName}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email" className="font-mono text-xs uppercase text-zinc-400">E-mail</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="operador@zvision.com"
                        autoComplete="email"
                        className="h-12 bg-[#111] border-[#222] text-white focus:border-[#A2E635] transition-all duration-200"
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
                    <Label htmlFor="password" className="font-mono text-xs uppercase text-zinc-400">Senha</Label>
                    <PasswordInput
                        id="password"
                        name="password"
                        placeholder="Crie uma senha"
                        autoComplete="new-password"
                        disabled={isLoading}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        aria-invalid={!!errors.password}
                        aria-describedby="password-strength password-error"
                        className="bg-[#111] border-[#222] text-white focus:border-[#A2E635]"
                    />
                    <PasswordStrength password={password} />
                    {errors.password && (
                        <p id="password-error" className="text-sm text-red-500 font-mono animate-in fade-in slide-in-from-top-1">
                            {errors.password}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="font-mono text-xs uppercase text-zinc-400">Confirmar senha</Label>
                    <PasswordInput
                        id="confirmPassword"
                        name="confirmPassword"
                        placeholder="Confirme sua senha"
                        autoComplete="new-password"
                        disabled={isLoading}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        aria-invalid={!!errors.confirmPassword}
                        aria-describedby="password-match confirmPassword-error"
                        className="bg-[#111] border-[#222] text-white focus:border-[#A2E635]"
                    />
                    <PasswordMatch
                        password={password}
                        confirmPassword={confirmPassword}
                    />
                    {errors.confirmPassword && (
                        <p id="confirmPassword-error" className="text-sm text-red-500 font-mono animate-in fade-in slide-in-from-top-1">
                            {errors.confirmPassword}
                        </p>
                    )}
                </div>

                <Button
                    type="submit"
                    className="w-full h-12 bg-[#A2E635] text-black hover:bg-[#A2E635]/90 font-bold font-mono tracking-wide transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] mt-4"
                    disabled={isLoading}
                >
                    {isLoading ? "CRIANDO ACESSO..." : "CRIAR ACESSO"}
                </Button>
            </form>

            <p className="text-center text-sm text-zinc-500 font-mono">
                Já tem acesso?{" "}
                <Link href="/auth/login" className="text-zinc-400 underline underline-offset-4 hover:text-white transition-colors">
                    Entrar no sistema
                </Link>
            </p>
        </div>
    )
}
