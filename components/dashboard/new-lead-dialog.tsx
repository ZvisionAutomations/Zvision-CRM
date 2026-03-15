"use client"

import React, { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2 } from "lucide-react"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { createLead } from "@/lib/actions/leads"
import { toast } from "sonner"

const formSchema = z.object({
    name: z.string().min(2, {
        message: "O nome do contato deve ter pelo menos 2 caracteres.",
    }),
    company_name: z.string().min(2, {
        message: "O nome da empresa é obrigatório.",
    }),
    email: z.string().email({
        message: "E-mail inválido.",
    }).optional().or(z.literal('')),
    estimated_value: z.coerce.number().min(0, {
        message: "O valuation deve ser positivo.",
    }).optional(),
})

interface NewLeadDialogProps {
    children?: React.ReactNode
    onSuccess?: () => void
}

export function NewLeadDialog({ children, onSuccess }: NewLeadDialogProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    // Define form
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            company_name: "",
            email: "",
            estimated_value: 0,
        },
    })

    // Submit handler
    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        try {
            await createLead({
                name: values.name,
                company_name: values.company_name,
                email: values.email || undefined,
                estimated_value: values.estimated_value || 0,
                pipeline_stage: 'NOVO_LEAD' // Opcional, já cai nisso por padrão na action
            })

            toast.success("Lead injetado com sucesso no Pipeline!")
            setOpen(false)
            form.reset()
            if (onSuccess) onSuccess()
        } catch (error) {
            console.error(error)
            toast.error("Falha ao injetar lead. Verifique sua conexão e tente novamente.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button className="bg-lime hover:bg-lime/90 text-black px-4 py-2 flex items-center gap-2 rounded text-xs font-bold font-mono tracking-widest uppercase transition-colors">
                        + INJETAR LEAD
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-[#0d0d10] border-lime/20 text-slate-100">
                <DialogHeader>
                    <DialogTitle className="font-mono text-lime uppercase tracking-widest text-lg">Injetar Novo Lead</DialogTitle>
                    <DialogDescription className="text-slate-400 text-xs">
                        Adicione um novo alvo ao radar tático. Leads recém injetados aparecerão primeiro na coluna "NOVO LEAD".
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">

                        <FormField
                            control={form.control}
                            name="company_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-300">Organização Alvo (Empresa) *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Zvision, Corp." className="bg-[#141418] border-white/10" {...field} />
                                    </FormControl>
                                    <FormMessage className="text-destructive/80 text-xs" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-300">Contato Chave (Pessoa) *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Maria Silva" className="bg-[#141418] border-white/10" {...field} />
                                    </FormControl>
                                    <FormMessage className="text-destructive/80 text-xs" />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-300">E-mail (Recomendado)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="contato@empresa.com" type="email" className="bg-[#141418] border-white/10" {...field} />
                                        </FormControl>
                                        <FormMessage className="text-destructive/80 text-xs" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="estimated_value"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-300">Valuation (R$)</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="0" step="1000" placeholder="Ex: 5000" className="bg-[#141418] border-white/10" {...field} />
                                        </FormControl>
                                        <FormMessage className="text-destructive/80 text-xs" />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <Button type="button" variant="outline" className="border-white/10 text-slate-300 hover:text-white bg-transparent hover:bg-white/5" onClick={() => setOpen(false)}>
                                CANCELAR
                            </Button>
                            <Button type="submit" disabled={isLoading} className="bg-lime hover:bg-lime/90 text-black font-bold">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        INJETANDO...
                                    </>
                                ) : (
                                    "INJETAR AGORA"
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
