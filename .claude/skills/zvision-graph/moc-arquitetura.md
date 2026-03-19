---
name: moc-arquitetura
description: Stack tecnica, padroes de codigo, estrutura de pastas e regras de desenvolvimento do Zvision
---

# Arquitetura — MOC

## Stack Principal

- [[stack-nextjs]] — Next.js 14 App Router, TypeScript strict (zero any, zero @ts-ignore)
- [[stack-supabase]] — auth + database + realtime; fonte da verdade para todo estado
- [[stack-ui]] — Tailwind CSS + shadcn/ui + Magic UI
- [[stack-animacoes]] — Framer Motion para transicoes, @dnd-kit para kanban drag/drop

## Padroes de Codigo

- [[atomic-components]] — nunca construir paginas monoliticas; dividir em pecas reutilizaveis
- [[typescript-strict]] — strict mode, zero any, sem @ts-ignore; tipos em /types/
- [[server-actions]] — mutacoes via lib/actions/, nunca diretamente no componente
- [[supabase-fonte-da-verdade]] — todo estado passa pelo DB antes de atualizar o UI

## Estrutura de Pastas

- [[estrutura-app]] — /app/ com rotas: analytics, auth, budget, flows, ingestao, intel, missoes, settings
- [[estrutura-components]] — /components/ organizado por dominio: auth, dashboard, flows, ingestao, ui
- [[estrutura-lib]] — /lib/actions/ para server actions, /lib/supabase/ para cliente e tipos
- [[estrutura-hooks]] — /hooks/ para logica de estado reutilizavel

## Regras de Desenvolvimento

- [[regra-leia-antes-de-escrever]] — sempre ler o arquivo completo antes de modificar
- [[regra-sem-suposicoes]] — se bloqueado, declarar o que precisa; nao inventar dados ou logica
- [[regra-documente-decisoes]] — escolhas arquiteturais recebem comentario explicando o porque
- [[regra-execute-sem-perguntar]] — decisoes ambiguas de baixo risco: escolher e documentar

## Configuracoes

- [[mcp-config]] — servidores MCP: GitHub, Supabase, Magic, shadcn, v0
- [[env-config]] — variaveis de ambiente em .env.local (nunca commitar)
