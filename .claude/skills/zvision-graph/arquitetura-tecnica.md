---
name: arquitetura-tecnica
description: Decisoes arquiteturais fundamentais do Zvision — por que cada escolha foi feita
---

# Arquitetura Tecnica

## Por que Next.js 14 App Router

O App Router permite server components por padrao, reduzindo bundle size e melhorando performance. As rotas refletem exatamente a estrutura do produto: cada tela tem sua pasta em `/app/`. Detalhes em [[stack-nextjs]].

## Por que Supabase

Supabase oferece auth, database PostgreSQL, realtime e storage em um so servico. O principio [[supabase-fonte-da-verdade]] significa que nenhuma mutacao de estado acontece sem passar pelo DB — isso elimina estados inconsistentes entre cliente e servidor.

## Por que TypeScript Strict

Zero `any`, zero `@ts-ignore`. Todos os tipos vivem em `/types/`. Isso nao e preferencia — e garantia: um erro de tipo em compile time e infinitamente mais barato que um bug em producao em um CRM de alto ticket.

## Por que shadcn/ui + Magic UI

shadcn/ui fornece componentes acessiveis e customizaveis que sao copiados para o projeto (nao dependencia). Magic UI adiciona componentes com animacoes sofisticadas. Ambos sao customizados com os [[tokens-de-cor]] do Zvision.

## Por que Framer Motion para animacoes

Framer Motion tem a melhor API para animacoes de layout e transicoes de pagina em React. O [[typewriter-effect]] dos AI briefings usa Framer Motion. O [[boot-sequence]] tambem.

## Por que dnd-kit para Kanban

dnd-kit e mais leve e acessivel que react-beautiful-dnd (descontinuado). O [[kanban-layout]] do Mission Pipeline depende dele para drag/drop entre colunas.

## Fluxo de Dados

```
Usuario → Componente → Server Action (/lib/actions/) → Supabase DB
                                                         ↓
Componente ← revalidatePath/revalidateTag ← Supabase ←←←
```

Nenhuma mutacao acontece diretamente no componente. Sempre via [[server-actions]].
