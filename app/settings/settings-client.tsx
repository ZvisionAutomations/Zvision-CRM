"use client"

import React, { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { Copy, Plus, Trash2, Eye, EyeOff, LogOut, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { updateProfile } from "@/lib/actions/profile"
import { getApiKeys, createApiKey, revokeApiKey, deleteApiKey } from "@/lib/actions/api-keys"
import type { User } from "@/types/database"
import type { ApiKey } from "@/types/database"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

// ── Section IDs ───────────────────────────────────────────────────────────────
type SectionId = 'IDENTITY_ACCESS' | 'BILLING_CYCLES' | 'AUDIT_LOGS' | 'TERMINATE_SESSION'

const SECTIONS: { id: SectionId; label: string }[] = [
    { id: 'IDENTITY_ACCESS',   label: 'IDENTITY_ACCESS' },
    { id: 'BILLING_CYCLES',    label: 'BILLING_CYCLES' },
    { id: 'AUDIT_LOGS',        label: 'AUDIT_LOGS' },
    { id: 'TERMINATE_SESSION', label: 'TERMINATE_SESSION' },
]

interface ProfileData {
    name: string | null
    email: string
    role: string | null
}

interface SettingsClientProps {
    initialProfile: ProfileData
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionNav({ active, onSelect }: { active: SectionId; onSelect: (id: SectionId) => void }) {
    return (
        <nav className="flex flex-col gap-0.5">
            {SECTIONS.map(({ id, label }) => {
                const isActive = id === active
                return (
                    <button
                        key={id}
                        onClick={() => onSelect(id)}
                        className="text-left px-3 py-2.5 font-mono text-xs tracking-wider transition-all relative"
                        style={{
                            color: isActive ? 'var(--accent-primary)' : 'rgba(240,240,240,0.35)',
                            borderLeft: isActive ? '2px solid var(--accent-primary)' : '2px solid transparent',
                        }}
                    >
                        {isActive ? `> ${label}` : `  ${label}`}
                    </button>
                )
            })}
        </nav>
    )
}

// Initials from name or email
function getInitials(name: string | null, email: string): string {
    if (name) return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    return email.slice(0, 2).toUpperCase()
}

// ── IDENTITY_ACCESS section ───────────────────────────────────────────────────

function IdentitySection({ profile }: { profile: ProfileData }) {
    const [name, setName] = useState(profile.name ?? '')
    const [isSaving, setIsSaving] = useState(false)

    // API Keys state
    const [keys, setKeys] = useState<ApiKey[]>([])
    const [keysLoading, setKeysLoading] = useState(true)
    const [newKeyLabel, setNewKeyLabel] = useState('')
    const [isCreating, setIsCreating] = useState(false)
    const [revealedRawKey, setRevealedRawKey] = useState<string | null>(null)

    const fetchKeys = useCallback(async () => {
        setKeysLoading(true)
        const { keys: data } = await getApiKeys()
        setKeys(data)
        setKeysLoading(false)
    }, [])

    useEffect(() => { fetchKeys() }, [fetchKeys])

    async function handleSave() {
        setIsSaving(true)
        const result = await updateProfile({ name })
        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success('// CONFIGURAÇÕES ATUALIZADAS', { description: 'Perfil sincronizado.' })
        }
        setIsSaving(false)
    }

    async function handleCreateKey() {
        if (!newKeyLabel.trim()) return
        setIsCreating(true)
        const result = await createApiKey(newKeyLabel)
        if (result.error) {
            toast.error(result.error)
        } else if (result.key && result.rawKey) {
            setKeys(prev => [result.key!, ...prev])
            setRevealedRawKey(result.rawKey!)
            setNewKeyLabel('')
            toast.success('// CHAVE CRIADA', { description: 'Copie agora — não será exibida novamente.' })
        }
        setIsCreating(false)
    }

    async function handleRevoke(id: string) {
        const { error } = await revokeApiKey(id)
        if (error) { toast.error(error); return }
        setKeys(prev => prev.map(k => k.id === id ? { ...k, is_active: false } : k))
        toast.success('// CHAVE REVOGADA')
    }

    async function handleDelete(id: string) {
        const { error } = await deleteApiKey(id)
        if (error) { toast.error(error); return }
        setKeys(prev => prev.filter(k => k.id !== id))
        toast.success('// CHAVE DELETADA')
    }

    const initials = getInitials(profile.name, profile.email)

    return (
        <div className="space-y-8">
            {/* ── Profile block ── */}
            <div>
                <h2
                    className="font-mono text-[11px] uppercase tracking-[0.2em] mb-4"
                    style={{ color: 'rgba(240,240,240,0.35)' }}
                >
                    // OPERADOR
                </h2>

                <div className="flex items-center gap-4 mb-6">
                    {/* Avatar */}
                    <div
                        className="w-12 h-12 flex items-center justify-center text-sm font-mono font-bold border"
                        style={{
                            background: 'rgba(162,230,53,0.08)',
                            borderColor: 'rgba(162,230,53,0.25)',
                            color: 'var(--accent-primary)',
                        }}
                    >
                        {initials}
                    </div>
                    <div>
                        <p className="font-mono text-sm text-white">{profile.name ?? '—'}</p>
                        <p className="font-mono text-xs" style={{ color: 'rgba(240,240,240,0.4)' }}>
                            {profile.email}
                        </p>
                    </div>
                    {/* Role badge */}
                    <span
                        className="ml-auto font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border"
                        style={{
                            color: profile.role === 'admin' ? 'var(--accent-primary)' : 'rgba(240,240,240,0.5)',
                            borderColor: profile.role === 'admin' ? 'rgba(162,230,53,0.4)' : 'rgba(255,255,255,0.1)',
                            background: profile.role === 'admin' ? 'rgba(162,230,53,0.06)' : 'transparent',
                        }}
                    >
                        {profile.role === 'admin' ? 'ADMIN' : 'OPERATOR'}
                    </span>
                </div>

                {/* Codinome field */}
                <div className="space-y-1.5 mb-4">
                    <label className="font-mono text-[11px] uppercase tracking-wider" style={{ color: 'rgba(240,240,240,0.4)' }}>
                        Codinome
                    </label>
                    <Input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="font-mono text-sm max-w-sm"
                        style={{
                            background: '#0A0A0A',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#F0F0F0',
                        }}
                        placeholder="Ex: Operador Alpha"
                    />
                </div>

                {/* Email read-only */}
                <div className="space-y-1.5 mb-6">
                    <label className="font-mono text-[11px] uppercase tracking-wider" style={{ color: 'rgba(240,240,240,0.4)' }}>
                        Email
                    </label>
                    <p
                        className="font-mono text-sm px-3 py-2 border max-w-sm"
                        style={{
                            background: 'rgba(255,255,255,0.02)',
                            borderColor: 'rgba(255,255,255,0.06)',
                            color: 'rgba(240,240,240,0.5)',
                        }}
                    >
                        {profile.email}
                    </p>
                </div>

                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="font-mono text-xs uppercase tracking-wider"
                    style={{
                        background: 'var(--accent-primary)',
                        color: '#0A0A0A',
                        fontWeight: 700,
                    }}
                >
                    {isSaving ? '>> SALVANDO...' : 'SALVAR ALTERAÇÕES'}
                </Button>
            </div>

            {/* Divider */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />

            {/* ── API Keys block ── */}
            <div>
                <h2
                    className="font-mono text-[11px] uppercase tracking-[0.2em] mb-4"
                    style={{ color: 'rgba(240,240,240,0.35)' }}
                >
                    // CHAVES DE API
                </h2>

                {/* Revealed raw key banner */}
                <AnimatePresence>
                    {revealedRawKey && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="flex items-center gap-3 p-3 mb-4 border font-mono text-xs"
                            style={{
                                borderColor: 'rgba(162,230,53,0.4)',
                                background: 'rgba(162,230,53,0.06)',
                            }}
                        >
                            <span style={{ color: 'var(--accent-primary)' }}>[NOVA CHAVE]</span>
                            <code className="flex-1 text-white break-all">{revealedRawKey}</code>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(revealedRawKey)
                                    toast.success('Chave copiada')
                                }}
                                className="shrink-0"
                                style={{ color: 'var(--accent-primary)' }}
                            >
                                <Copy className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setRevealedRawKey(null)}
                                className="shrink-0 font-mono text-[10px]"
                                style={{ color: 'rgba(240,240,240,0.35)' }}
                            >
                                [FECHAR]
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Existing keys */}
                <div
                    className="border mb-4 divide-y"
                    style={{ borderColor: 'rgba(255,255,255,0.06)', '--tw-divide-opacity': '1' } as React.CSSProperties}
                >
                    {keysLoading ? (
                        [1, 2].map(i => (
                            <div key={i} className="flex items-center gap-3 px-3 py-3 animate-pulse">
                                <div className="h-3 w-32 rounded bg-white/10" />
                                <div className="h-3 w-24 rounded bg-white/10 ml-auto" />
                                <div className="h-3 w-8 rounded bg-white/10" />
                            </div>
                        ))
                    ) : keys.length === 0 ? (
                        <div
                            className="px-3 py-6 text-center font-mono text-[11px]"
                            style={{ color: 'rgba(240,240,240,0.3)' }}
                        >
                            // SEM CHAVES CADASTRADAS
                        </div>
                    ) : (
                        keys.map(key => (
                            <div
                                key={key.id}
                                className="flex items-center gap-3 px-3 py-3"
                                style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="font-mono text-xs text-white truncate">{key.label}</p>
                                    <p
                                        className="font-mono text-[10px]"
                                        style={{ color: 'rgba(240,240,240,0.35)' }}
                                    >
                                        {key.key_preview}
                                    </p>
                                </div>
                                {/* Active/revoked badge */}
                                <span
                                    className="font-mono text-[10px] uppercase px-1.5 py-0.5 border shrink-0"
                                    style={{
                                        color: key.is_active ? 'var(--accent-primary)' : '#FF4444',
                                        borderColor: key.is_active ? 'rgba(162,230,53,0.3)' : 'rgba(255,68,68,0.3)',
                                        background: key.is_active ? 'rgba(162,230,53,0.04)' : 'rgba(255,68,68,0.04)',
                                    }}
                                >
                                    {key.is_active ? 'ATIVA' : 'REVOGADA'}
                                </span>
                                {/* Revoke / copy */}
                                {key.is_active && (
                                    <button
                                        onClick={() => handleRevoke(key.id)}
                                        title="Revogar"
                                        className="transition-colors"
                                        style={{ color: 'rgba(240,240,240,0.3)' }}
                                    >
                                        <EyeOff className="w-4 h-4 hover:text-amber-400" />
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDelete(key.id)}
                                    title="Deletar"
                                    className="transition-colors"
                                    style={{ color: 'rgba(240,240,240,0.3)' }}
                                >
                                    <Trash2 className="w-3.5 h-3.5 hover:text-red-400" />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Add new key */}
                <div className="flex gap-2">
                    <Input
                        value={newKeyLabel}
                        onChange={e => setNewKeyLabel(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleCreateKey() }}
                        placeholder="Label da nova chave..."
                        className="font-mono text-xs"
                        style={{
                            background: '#0A0A0A',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#F0F0F0',
                        }}
                    />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCreateKey}
                        disabled={isCreating || !newKeyLabel.trim()}
                        className="font-mono text-xs gap-1.5 border-white/10 text-slate-300 hover:text-white shrink-0"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        {isCreating ? 'CRIANDO...' : 'NOVA CHAVE'}
                    </Button>
                </div>
            </div>
        </div>
    )
}

// ── BILLING_CYCLES section ────────────────────────────────────────────────────

function BillingSection() {
    return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            <span
                className="font-mono text-[11px] uppercase tracking-[0.2em]"
                style={{ color: 'rgba(240,240,240,0.3)' }}
            >
                // MÓDULO EM DESENVOLVIMENTO
            </span>
            <span
                className="font-mono text-[10px] uppercase tracking-wider px-3 py-1 border"
                style={{
                    color: 'var(--accent-primary)',
                    borderColor: 'rgba(162,230,53,0.3)',
                    background: 'rgba(162,230,53,0.06)',
                }}
            >
                INTERNAL_BUILD v1.0
            </span>
        </div>
    )
}

// ── AUDIT_LOGS section ────────────────────────────────────────────────────────

function AuditSection() {
    return (
        <div className="flex items-center justify-center py-20">
            <span
                className="font-mono text-[11px] uppercase tracking-[0.2em]"
                style={{ color: 'rgba(240,240,240,0.3)' }}
            >
                // LOGS DE AUDITORIA — EM BREVE
            </span>
        </div>
    )
}

// ── TERMINATE_SESSION section ─────────────────────────────────────────────────

function TerminateSection() {
    const router = useRouter()
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    async function handleLogout() {
        setIsLoggingOut(true)
        const supabase = createClient()
        if (supabase) {
            await supabase.auth.signOut()
        }
        router.push('/login')
    }

    return (
        <div className="flex justify-center py-8">
            <div
                className="w-full max-w-sm border-2 p-6 space-y-6"
                style={{ borderColor: 'rgba(255,68,68,0.4)', background: 'rgba(255,68,68,0.03)' }}
            >
                <h3
                    className="font-mono text-sm uppercase tracking-[0.2em] text-center"
                    style={{ color: '#FF4444' }}
                >
                    // ZONA DE PERIGO
                </h3>

                {/* Encerrar sessão */}
                <div className="space-y-2">
                    <Button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        variant="outline"
                        className="w-full font-mono text-xs uppercase tracking-wider gap-2"
                        style={{
                            borderColor: 'rgba(255,68,68,0.5)',
                            color: '#FF4444',
                            background: 'transparent',
                        }}
                    >
                        <LogOut className="w-3.5 h-3.5" />
                        {isLoggingOut ? '>> ENCERRANDO...' : 'ENCERRAR SESSÃO'}
                    </Button>
                    <p
                        className="font-mono text-[10px] text-center"
                        style={{ color: 'rgba(240,240,240,0.3)' }}
                    >
                        Você será redirecionado para o login
                    </p>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,68,68,0.15)' }} />

                {/* Excluir conta — disabled */}
                <div className="space-y-2">
                    <div className="relative group">
                        <Button
                            disabled
                            variant="outline"
                            className="w-full font-mono text-xs uppercase tracking-wider gap-2 cursor-not-allowed"
                            style={{
                                borderColor: 'rgba(255,68,68,0.25)',
                                color: 'rgba(255,68,68,0.4)',
                                background: 'transparent',
                            }}
                        >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            EXCLUIR CONTA
                        </Button>
                        {/* Tooltip */}
                        <div
                            className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap font-mono text-[10px] px-2 py-1 border z-10"
                            style={{
                                background: '#1A1A1A',
                                borderColor: 'rgba(255,255,255,0.1)',
                                color: 'rgba(240,240,240,0.5)',
                            }}
                        >
                            Contate o administrador
                        </div>
                    </div>
                    <p
                        className="font-mono text-[10px] text-center"
                        style={{ color: 'rgba(240,240,240,0.2)' }}
                    >
                        Ação irreversível — apenas admins podem excluir
                    </p>
                </div>
            </div>
        </div>
    )
}

// ── Main SettingsClient ───────────────────────────────────────────────────────

export function SettingsClient({ initialProfile }: SettingsClientProps) {
    const [activeSection, setActiveSection] = useState<SectionId>('IDENTITY_ACCESS')

    return (
        <div
            className="flex gap-0 min-h-[600px]"
            // On mobile: column layout
        >
            {/* ── Left nav — 200px fixed, border-right ── */}
            <div
                className="shrink-0 pt-2 pb-8 hidden md:block"
                style={{
                    width: '200px',
                    borderRight: '1px solid rgba(255,255,255,0.06)',
                }}
            >
                <SectionNav active={activeSection} onSelect={setActiveSection} />
            </div>

            {/* ── Mobile: horizontal scrollable tab bar ── */}
            <div
                className="flex md:hidden overflow-x-auto pb-4 mb-6 w-full gap-0"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
                {SECTIONS.map(({ id, label }) => {
                    const isActive = id === activeSection
                    return (
                        <button
                            key={id}
                            onClick={() => setActiveSection(id)}
                            className="shrink-0 px-3 py-2 font-mono text-[10px] tracking-wider whitespace-nowrap transition-all border-b-2"
                            style={{
                                color: isActive ? 'var(--accent-primary)' : 'rgba(240,240,240,0.35)',
                                borderBottomColor: isActive ? 'var(--accent-primary)' : 'transparent',
                            }}
                        >
                            {label}
                        </button>
                    )
                })}
            </div>

            {/* ── Right content panel ── */}
            <div className="flex-1 pl-0 md:pl-8 pt-2">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeSection}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -12 }}
                        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                    >
                        {activeSection === 'IDENTITY_ACCESS'   && <IdentitySection profile={initialProfile} />}
                        {activeSection === 'BILLING_CYCLES'    && <BillingSection />}
                        {activeSection === 'AUDIT_LOGS'        && <AuditSection />}
                        {activeSection === 'TERMINATE_SESSION' && <TerminateSection />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}
