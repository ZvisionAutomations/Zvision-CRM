## 1. VISÃO GERAL

**Nome do produto:** Zvision Automation HUB

**O que faz:** CRM de elite focado em "missões" de vendas. Centraliza leads, gera briefings táticos via IA, e permite que operadores de vendas acompanhem negociações complexas com inteligência em tempo real.

**Para quem:** Agências high-ticket e equipes de vendas de alta performance que precisam de uma interface centralizada e tática para monitorar negociações de alto valor.

**North Star:** Transformar qualquer lead em uma oportunidade qualificada com inteligência completa em menos de 2 minutos. O operador entra na reunião preparado como um analista sênior, sem ter pesquisado nada manualmente.

**O que NÃO é:** App genérico de CRM, dashboard corporativo plano, substituto de Pipedrive ou HubSpot para usuários comuns.

---

## 2. PERSONAS

**Operador de Vendas (usuário principal)**

- Gerencia 15–50 leads simultâneos
- Precisa de briefings rápidos antes de reuniões
- Quer ver o pipeline de missões em um relance
- Não tem tempo para pesquisar manualmente cada lead

**Gestor de Operações (usuário secundário)**

- Monitora performance do time
- Acompanha métricas de conversão e receita
- Configura automações e fluxos

---

## 3. FLUXO DO USUÁRIO

### Autenticação

1. Usuário acessa a URL do sistema
2. Boot Sequence animada (splash screen tática)
3. Login com email/senha ou Google OAuth
4. Redirecionamento ao Dashboard Principal

### Fluxo Principal — Gestão de Lead

1. Lead entra no sistema (importação manual via CSV/XLSX ou automação)
2. Aparece no Kanban na coluna `NOVO LEAD`
3. Operador clica no card → abre Painel de Intel do Lead
4. IA gera briefing tático automaticamente (via Apify + NotebookLM)
5. Operador arrasta o lead para próxima etapa do funil
6. Sistema registra todas as atividades no log

### Fluxo de Importação

1. Operador acessa tela de Ingestão de Dados
2. Faz upload de CSV/XLSX com dados dos leads
3. Sistema processa e exibe terminal de log em tempo real
4. Leads processados aparecem automaticamente no Kanban

---

## 4. FUNCIONALIDADES — V1 (MVP)

### ✅ Dashboard Principal

- Métricas em cards: Receita Total, Pipeline Ativo, Taxa de Conversão, Leads Ativos
- Gráfico de área: atividade ao longo do tempo
- Lista de Alvos Ativos: leads com maior probabilidade de fechamento
- Indicador LIVE FEED pulsante

### ✅ Pipeline de Missões (Kanban)

- 5 colunas fixas: `NOVO LEAD` | `QUALIFICAÇÃO` | `REUNIÃO BRIEFING` | `REUNIÃO PROPOSTA` | `FECHAMENTO`
- Cards arrastáveis entre colunas (drag & drop)
- Contador de cards por coluna
- Clique no card abre Painel de Intel

### ✅ Painel de Intel do Lead

- Briefing gerado por IA com efeito typewriter
- Grid de stats: Valor Estimado, Probabilidade de Vitória, Score, Dias no Pipeline
- Activity Log em timeline
- Informações da empresa

### ✅ Ingestão de Dados

- Upload de CSV/XLSX
- Drop zone com terminal de log
- Validação e feedback de erros
- Histórico de uploads

### ✅ Autenticação

- Login com email/senha
- Login com Google OAuth
- Gestão de sessão segura
- Multi-tenant por company_id

### ✅ Configurações

- Perfil do operador
- Chaves de API (mascaradas)
- Gestão de membros do workspace

---

## 5. FUNCIONALIDADES — V2 (PÓS-MVP)

- Flows / Automações: criação de fluxos automáticos de acompanhamento
- Integração com WhatsApp Business
- Relatórios exportáveis em PDF
- App mobile (PWA)
- Notificações push de mudança de status
- Integração com calendário para agendamento de reuniões
- Score de leads automático via IA

---

## 6. O QUE O SISTEMA NÃO FAZ (V1)

- Não envia emails marketing em massa
- Não tem módulo financeiro/faturamento
- Não integra com telefonia VoIP
- Não tem app mobile nativo
- Não tem modo offline

---

## 7. MÉTRICAS DE SUCESSO

- Tempo médio para gerar briefing de lead: < 2 minutos
- Taxa de adoção do Painel de Intel: > 80% dos leads abertos
- Tempo de carregamento da interface: < 200ms
- Build sem erros de TypeScript: 100%