# Zvision Cyber-Core: Project Constitution (gemini.md)

## Strategic Vision (North Star)
Transformar qualquer lead em uma oportunidade qualificada com inteligência completa em menos de 2 minutos. O operador entra na reunião preparado como um analista sênior.

## Estética: Cyber-Core Tática
- **Cores Dominantes**: Pitch Black (#050506), Cyber Lime (#A2E635).
- **Atmosfera**: Elite War Room, Glassmorphism, Tactical Grid.
- **Tipografia**: Space Grotesk (Comando/UI), JetBrains Mono (Inteligência/Dados).

## Behavioral Rules
- Frio, tático e extremamente preciso. 
- Linguagem de sistema — nunca corporativo.
- Interface responde em < 200ms. 
- Sem confirmações desnecessárias. Ação acontece, log aparece, missão registrada.

## Regras Invariantes
1. **Always On Multi-Tenancy (Source of Truth)**: O `company_id` é obrigatório no Supabase via RLS.
2. **Logic/UI Split**: Componentes visuais não tocam o banco diretamente.
3. **Bento Layout**: O Dashboard deve manter a grade modular Bento.
4. **Delivery Payload**: Aplicação Web Serverless na Vercel.

## Technical Architecture & Integrations
- **Database**: Supabase.
- **Deploy**: Vercel.
- **Docs/Briefings**: Notion & NotebookLM.
- **Scraping**: Apify.
- **Context**: Context7.
- **UI Gen**: Stitch.

## Technical Architecture
- **Database**: Supabase (RLS habilitado).
- **Framework**: Next.js (App Router).
- **Animações**: Framer Motion.
- **Gráficos**: Chart.js / Recharts.

## Schemas (Draft)
- `leads`: { id, name, company_id, status, budget, intelligence_briefing, created_at }
- `companies`: { id, name, settings, api_keys }
- `missions`: { id, lead_id, status, logs }
