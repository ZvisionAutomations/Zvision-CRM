## 1. STACK TECNOLÓGICO

### Frontend

- **Framework:** Next.js 16 (App Router)
- **Linguagem:** TypeScript (strict mode — zero `any` implícito)
- **Estilização:** Tailwind CSS v4 + tokens semânticos customizados
- **Componentes:** ShadCN/UI + Radix UI primitives
- **Animações:** Framer Motion
- **Gráficos:** Recharts
- **Drag & Drop:** @hello-pangea/dnd
- **Fontes:** Geist (UI) + Geist Mono (dados/código)
- **Ícones:** Lucide React
- **Notificações:** Sonner
- **Formulários:** React Hook Form + Zod

### Backend

- **API:** Next.js API Routes (App Router, Route Handlers)
- **Banco de dados:** Supabase (PostgreSQL)
- **Autenticação:** Supabase Auth (email/senha + Google OAuth)
- **ORM:** Supabase JS Client (query builder nativo)
- **Upload de arquivos:** Supabase Storage
- **Deploy:** Vercel

### Serviços Externos

- **Scraping de leads:** Apify (site + LinkedIn)
- **Briefings de IA:** NotebookLM MCP
- **Gerador de UI:** Stitch (Google AI Studio)
- **Documentação:** Notion MCP
- **Referência de código:** Context7 MCP

---

## 2. ARQUITETURA DO BANCO DE DADOS

### Tabela: `companies`

```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
```

### Tabela: `users`

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  company_id UUID NOT NULL REFERENCES companies(id),
  name TEXT,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'operator', -- 'admin' | 'operator'
  codename TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_company_isolation" ON users
  USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));
```

### Tabela: `leads`

```sql
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company_name TEXT NOT NULL,
  company_website TEXT,
  company_linkedin TEXT,
  estimated_value DECIMAL(12,2),
  pipeline_stage TEXT DEFAULT 'NOVO_LEAD',
    -- 'NOVO_LEAD' | 'QUALIFICACAO' | 'REUNIAO_BRIEFING' | 'REUNIAO_PROPOSTA' | 'FECHAMENTO' | 'KIA'
  signal_strength TEXT DEFAULT 'MEDIO',
    -- 'ALTO' | 'MEDIO' | 'BAIXO'
  win_probability DECIMAL(5,2) DEFAULT 0,
  ai_briefing TEXT,
  ai_briefing_generated_at TIMESTAMPTZ,
  assigned_to UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "leads_company_isolation" ON leads
  USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE INDEX idx_leads_company_id ON leads(company_id);
CREATE INDEX idx_leads_pipeline_stage ON leads(pipeline_stage);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
```

### Tabela: `activities`

```sql
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  type TEXT NOT NULL,
    -- 'STAGE_CHANGE' | 'NOTE' | 'EMAIL' | 'MEETING' | 'CALL' | 'AI_BRIEFING'
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "activities_company_isolation" ON activities
  USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE INDEX idx_activities_lead_id ON activities(lead_id);
CREATE INDEX idx_activities_company_id ON activities(company_id);
```

### Tabela: `imports`

```sql
CREATE TABLE imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  user_id UUID REFERENCES users(id),
  filename TEXT NOT NULL,
  status TEXT DEFAULT 'PROCESSING',
    -- 'PROCESSING' | 'COMPLETED' | 'FAILED'
  total_rows INTEGER,
  processed_rows INTEGER DEFAULT 0,
  error_log JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE imports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "imports_company_isolation" ON imports
  USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));
```

---

## 3. ARQUITETURA DE CÓDIGO

### Estrutura de pastas

```
src/
  app/
    (auth)/
      login/page.tsx
      register/page.tsx
    (dashboard)/
      page.tsx                    -- Dashboard principal
      missoes/page.tsx            -- Kanban pipeline
      intel/page.tsx              -- Intel briefings
      ingestao/page.tsx           -- Import de dados
      configuracoes/page.tsx      -- Settings
    api/
      leads/route.ts
      leads/[id]/route.ts
      leads/[id]/briefing/route.ts
      activities/route.ts
      imports/route.ts
      auth/callback/route.ts
    layout.tsx
    globals.css
  components/
    dashboard/
      sidebar.tsx
      header-hud.tsx
      stat-card.tsx
      area-chart.tsx
    leads/
      mission-pipeline.tsx       -- Kanban
      lead-card.tsx
      lead-intel-panel.tsx       -- Slide-over
    imports/
      drop-zone.tsx
      import-terminal.tsx
    ui/                           -- ShadCN components
  hooks/
    useTypewriter.ts
    useLeads.ts
    useActivities.ts
  lib/
    supabase/
      client.ts                   -- Browser client
      server.ts                   -- Server client
      middleware.ts
    utils.ts
    validations.ts
  types/
    database.ts                   -- Tipos gerados do Supabase
    index.ts
```

### Regra de separação de responsabilidades

- **Route Handlers** (`app/api/`): apenas validam input com Zod e chamam services
- **Services** (`lib/services/`): contêm toda a lógica de negócio
- **Components**: apenas UI — zero lógica de negócio inline
- **Hooks**: estado e side effects de UI

---

## 4. SEGURANÇA

### Multi-tenancy

```tsx
// CORRETO — company_id sempre do servidor
const { data: { user } } = await supabase.auth.getUser();
const { data: profile } = await supabase
  .from('users')
  .select('company_id')
  .eq('id', user.id)
  .single();

// ERRADO — nunca aceitar company_id do body/params
const { company_id } = req.body; // ❌ PROIBIDO
```

### Row Level Security

- Todas as tabelas têm RLS habilitado
- Todas as policies filtram por `company_id`
- Nunca desabilitar RLS em produção

### Variáveis de ambiente

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=       # apenas server-side

# Apify
APIFY_TOKEN=                     # apenas server-side

# Vercel
VERCEL_TOKEN=                    # apenas CI/CD
```

**Regra:** Variáveis sem prefixo `NEXT_PUBLIC_` são exclusivamente server-side.

Nunca expor `SERVICE_ROLE_KEY` ou tokens de terceiros no cliente.

### Sessão e cookies

```tsx
// Cookies devem ter:
// httpOnly: true
// secure: true (produção)
// sameSite: 'lax'
```

---

## 5. API ROUTES — CONTRATOS

### GET /api/leads

```tsx
// Query params: stage?, assignedTo?, search?, page?, limit?
// Response: { leads: Lead[], total: number, page: number }
// Autenticação: obrigatória
// company_id: extraído da sessão
```

### POST /api/leads

```tsx
// Body: { name, email?, phone?, company_name, company_website?, estimated_value? }
// Response: { lead: Lead }
// Validação: Zod schema
```

### PATCH /api/leads/[id]

```tsx
// Body: campos para atualizar (parcial)
// Response: { lead: Lead }
// Verifica ownership via company_id
```

### POST /api/leads/[id]/briefing

```tsx
// Dispara scraping via Apify + gera briefing via IA
// Response: { briefing: string, generated_at: string }
// Async — pode demorar até 60s
```

### POST /api/imports

```tsx
// Body: FormData com arquivo CSV/XLSX
// Response: { import_id: string, status: 'PROCESSING' }
// Processa em background
```

---

## 6. TRATAMENTO DE ERROS

```tsx
// Padrão de erro em todas as API routes
try {
  const result = await leadService.createLead(data);
  return Response.json({ lead: result }, { status: 201 });
} catch (error) {
  console.error('[LeadService] Falha ao criar lead:', {
    userId: user.id,
    companyId: profile.company_id,
    error
  });
  return Response.json(
    { error: 'Falha ao criar lead. Tente novamente.' },
    { status: 500 }
  );
}

// NUNCA:
catch (e) {} // ❌ catch vazio
catch (error) { console.log(error) } // ❌ sem contexto
```

---

## 7. PERFORMANCE

- Todas as queries com `LIMIT` e paginação (máx 100 registros por requisição)
- Índices obrigatórios em todas as colunas de filtro
- Imagens com `loading="lazy"` e dimensões definidas
- Componentes pesados com `dynamic import` e `Suspense`
- Meta: interface responde em < 200ms

---

## 8. DEPLOY

- **Plataforma:** Vercel
- **Branch principal:** `main` — deploy automático
- **Preview:** PRs geram previews automáticos
- **Variáveis de ambiente:** configuradas no painel Vercel
- **Build command:** `npm run build`
- **Output:** `.next/`

---

## 9. PADRÕES DO PROJETO DE REFERÊNCIA (mini-crm-tutorial)

O projeto de referência usa Clerk + Drizzle + SQLite. O Zvision usa Supabase Auth + Supabase JS. As adaptações obrigatórias são:

### Autenticação — Clerk → Supabase Auth

```tsx
// REFERÊNCIA (Clerk) — NÃO usar
import { auth } from '@clerk/nextjs';
const { userId, orgId } = auth();

// ZVISION (Supabase Auth) — usar sempre
import { createServerClient } from '@/lib/supabase/server';
const supabase = createServerClient();
const { data: { user } } = await supabase.auth.getUser();
const { data: profile } = await supabase
  .from('users')
  .select('company_id')
  .eq('id', user.id)
  .single();
```

### Middleware — Clerk → Supabase

```tsx
// ZVISION — middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();
  
  const isPublicRoute = ['/', '/login', '/register'].includes(req.nextUrl.pathname);
  
  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  
  return res;
}
```

### ORM — Drizzle → Supabase JS

```tsx
// REFERÊNCIA (Drizzle) — NÃO usar
await db.insert(leads).values({ id, userId, name });
await db.update(leads).set({ status }).where(eq(leads.id, leadId));

// ZVISION (Supabase JS) — usar sempre
await supabase.from('leads').insert({ company_id, name, pipeline_stage });
await supabase.from('leads').update({ pipeline_stage: newStage }).eq('id', leadId);
// RLS garante isolamento automaticamente
```

### Server Actions — Padrão Zvision

```tsx
// lib/actions/leads.ts
'use server';

import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const createLeadSchema = z.object({
  name: z.string().min(1),
  company_name: z.string().min(1),
  email: z.string().email().optional(),
  estimated_value: z.number().optional(),
});

export async function createLead(data: unknown) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Não autorizado');
  
  const validated = createLeadSchema.parse(data);
  
  const { data: lead, error } = await supabase
    .from('leads')
    .insert(validated)
    .select()
    .single();
  
  if (error) {
    console.error('[createLead] Falha:', { userId: user.id, error });
    throw new Error('Falha ao criar lead');
  }
  
  revalidatePath('/missoes');
  return lead;
}
```

### Soft Delete — Padrão

```tsx
// Soft delete (igual ao projeto de referência)
await supabase
  .from('leads')
  .update({ deleted_at: new Date().toISOString() })
  .eq('id', leadId);

// Sempre filtrar deletados nas queries
await supabase
  .from('leads')
  .select('*')
  .is('deleted_at', null); // RLS não faz isso — filtrar explicitamente
```

---

## 10. PADRÕES DE CHARTS — REFERÊNCIA DIRETA

O projeto de referência tem 3 charts prontos em português. Adaptar para o Zvision trocando as cores para os tokens semânticos:

```tsx
// RevenueChart — trocar #3b82f6 por var(--accent-primary)
// Tooltip background: var(--surface-card)
// Grid stroke: var(--border-default)
// Tick fill: var(--text-muted)

// FunnelBarChart — funil de vendas horizontal
// Dados: Novo Lead → Qualificação → Reunião Briefing → Reunião Proposta → Fechamento
// Cores por estágio usando tokens de status

// SourcePieChart — origem dos leads
// Donut chart com innerRadius={60} outerRadius={80}
```

### Layout do Dashboard — Estrutura de Referência

```tsx
// Grid de 4 stat cards (Receita Total, Novos Leads, Propostas Ativas, Taxa de Conversão)
// Grid 7 colunas: AreaChart (col-span-4) + PieChart (col-span-3)
// FunnelBarChart full width embaixo
// Sidebar sticky com nav + meta mensal
```

---

## 11. PROMPT INICIAL PARA O BACKEND

Quando for iniciar a construção do backend, use este prompt:

```
Leia os arquivos PRD.md e SPEC.md do projeto antes de começar.
Leia também o gemini.md e o SOUL.md.

Agora construa o backend do Zvision CRM:

1. Configure o Supabase Auth (login email + Google OAuth)
2. Crie o middleware de proteção de rotas
3. Crie os clientes Supabase (browser e server)
4. Execute as migrations SQL das 4 tabelas (companies, users, leads, activities)
   com RLS habilitado em todas
5. Crie as Server Actions em lib/actions/:
   - leads.ts: createLead, updateLead, updateLeadStage, deleteLead, getLeads
   - activities.ts: createActivity, getActivitiesByLead
   - imports.ts: processImport
6. Crie as API Routes em app/api/:
   - leads/route.ts (GET, POST)
   - leads/[id]/route.ts (GET, PATCH, DELETE)
   - leads/[id]/briefing/route.ts (POST — dispara Apify + IA)
   - imports/route.ts (POST)
7. Conecte o frontend existente aos dados reais do Supabase
   (substitua todos os dados mock/estáticos por queries reais)
8. Rode npm run build — zero erros antes de considerar concluído

Regras obrigatórias:
- company_id SEMPRE da sessão, nunca do body
- Zod validation em todos os inputs
- try/catch com contexto em todos os handlers
- Soft delete em leads (deleted_at), nunca DELETE físico
- Comentários em Português Brasil
```