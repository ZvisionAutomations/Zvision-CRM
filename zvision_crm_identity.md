# IDENTIDADE VISUAL — ZVISION AUTOMATION HUB CRM

---

## CONTEXTO DO PROJETO

**Nome:** Zvision Automation HUB
**O que faz:** CRM de elite focado em "missões" de vendas. Usa IA (Gemini) para analisar sites, redes sociais e históricos de conversas de leads importados via Excel, gerando briefings táticos e prevendo o "humor" do alvo para garantir fechamentos de alta conversão.
**Para quem:** Operação interna de agências high-ticket e equipes de vendas de alta performance que precisam de uma interface tática e centralizada para monitorar negociações complexas.
**Sensação desejada:** Centro de Comando de Elite. Um "War Room" premium onde cada lead é um alvo e cada fechamento é uma "Missão Cumprida". O usuário deve se sentir um operador de alto nível, não um vendedor comum.
**O que NÃO deve parecer:** App genérico, banco tradicional, dashboard corporativo plano, template Shadcn com ícones Lucide soltos.
**Mode:** DARK MODE absoluto. Pitch Black.
**Referência de energia:** A precisão minimalista do Linear + a energia "high-tech" brutalista do Supabase + a estética visual do universo Cyberpunk 2077 HUD.

---

## DECISÕES DE IDENTIDADE

### Camada 1 — ESTRUTURA

**Navegação:** Rail lateral de ícones com 56px de largura. Sem texto, só ícones. Estado ativo: borda esquerda de 2px na cor accent + fundo translúcido. Logo no topo como botão quadrado.

**Layout geral:** Sidebar fixa + área de conteúdo principal. Topbar fina (52px) com nome do sistema, versão em mono, indicador de status ao vivo, e ações do operador.

**Hierarquia visual:** O que é dado crítico (valores, probabilidades, nomes de alvo) tem tipografia monospace grande e ganha destaque imediato. Labels são sempre menores, uppercase, com letter-spacing exagerado.

**Apresentação de dados:**
- Dashboard: grade de cards de métricas + gráfico de área + lista de alvos
- Pipeline: Kanban board horizontal com scroll, colunas fixas por estágio
- Lead Detail: Painel slide-over da direita (600px), com briefing de IA + stats em grade + activity log em timeline
- Importação: Drop zone centralizada com terminal de log embaixo
- Configurações: Two-column — nav de seções à esquerda + form panel à direita
- Flows/Automações: Cards em grade dupla com miniatura de gráfico sparkline inline

**Densidade:** Compacta mas respirada. Cards com padding interno de 16px. Gap entre elementos de 12px. Sem espaços mortos.

**Fundo de tela:** Grade tática — linhas horizontais e verticais em `rgba(162, 230, 53, 0.03)` com espaçamento de 40px. É a única decoração de fundo. Cria a sensação de HUD sem poluir.

---

### Camada 2 — LINGUAGEM

**Tipografia — 2 fontes apenas:**

- `Space Grotesk` — display e UI. Usada em nomes de empresa, títulos de tela, botões. Bold (700) para destaque, Medium (500) para corpo.
- `JetBrains Mono` — dados, labels, badges, versões, timestamps, valores numéricos, qualquer coisa técnica. Cria o efeito "terminal" sem exagero.

**Regras tipográficas:**
- Títulos de tela: `Space Grotesk 700`, maiúsculas, `letter-spacing: 3px`, 20–24px
- Labels de card: `JetBrains Mono 400`, maiúsculas, `letter-spacing: 2px`, 9–10px, cor muted
- Valores métricos: `JetBrains Mono 700`, 28–32px, cor primária ou accent
- Badges de status: `JetBrains Mono 700`, 8–9px, uppercase, `letter-spacing: 1px`
- Texto de briefing IA: `JetBrains Mono 400`, 11px, `line-height: 1.7`

**Geometria:** Bordas retas ou micro-arredondadas. `border-radius: 4px` máximo em cards. `border-radius: 3px` em botões e inputs. Zero glassmorphism excessivo — apenas `backdrop-filter: blur(12px)` em elementos flutuantes como modais e topbar.

**Ícones:** Lucide React — tamanho uniforme de 16–18px. Sempre monocromáticos. Nunca decorativos soltos — cada ícone acompanha texto ou tem função clara.

**Tom de voz dos labels:** Linguagem de "operação tática". Exemplos: `// ANÁLISE TÁTICA`, `LIVE FEED ACTIVE`, `SINAL ALTO`, `ALVO CONFIRMADO`, `MISSÃO PENDENTE`, `PIPELINE DE MISSÃO`, `INGESTÃO DE DADOS // UPLINK`, `OPERADOR Nív. 4`, `SECURE_LINK_ESTABLISHED`.

---

### Camada 3 — RIQUEZA VISUAL

**Princípio:** 4–5 componentes de alto impacto têm conceitos visuais únicos. O resto é limpo. O contraste entre componentes ricos e componentes simples É a identidade.

**Elementos ambiente permitidos (apenas como camada de fundo):**
- Grade tática no background da página (ver acima)
- Scanlines CRT sutis: `repeating-linear-gradient` com opacidade de 3–5% sobre gráficos
- Marcas de canto em cards especiais: 4 cantos com `border-width: 1px 0 0 1px` (topo-esquerdo) e `0 1px 1px 0` (baixo-direito), cor accent com 30% opacidade, tamanho 8–10px

---

## CONCEITOS VISUAIS DOS COMPONENTES

##### Card de Boot / Splash Screen

**Representa:** O sistema "acordando", passando por autenticação e inicializando módulos. É a primeira impressão — precisa estabelecer a linguagem de "eu sou um sistema de alto nível" imediatamente.

**Metáfora visual:** Tela de inicialização de um sistema operacional tático. Logo central com glow pulsante, barra de progresso, log de diagnóstico ao vivo no canto inferior esquerdo.

**Cena detalhada:** Fundo pitch black com grade tática visível. Centro: logo quadrado (72x72px) com `border-radius: 12px`, fundo accent (`#A2E635`), ícone de escudo em SVG preenchido na cor `#050506`. O logo tem `box-shadow` de glow animado — pulsando entre `0 0 40px rgba(162,230,53,0.4)` e `0 0 60px rgba(162,230,53,0.6)` em loop de 2s. Abaixo do logo: "ZVISION" em `JetBrains Mono 700`, `letter-spacing: 8px`, 36px, cor primária. Abaixo: "CYBER-CORE PRD" em `JetBrains Mono 400`, `letter-spacing: 4px`, 11px, cor accent. Barra de progresso: 320px de largura, 3px de altura, fundo `surface-elevated`, fill accent com glow (`box-shadow: 0 0 8px accent`). Label de porcentagem em mono acima à direita. Canto inferior esquerdo: painel de log `DIAGNOSTIC_LOG` com fundo `rgba(13,13,16,0.9)`, borda sutil, entradas `[OK]` em verde, `>>` em amber para item ativo. Cantos da tela: metadados do sistema em 9px mono muted (`SYSTEM ARCHITECTURE / X-CORE_v9.4.2` em cima à esquerda; `DEPLOYMENT STATUS / STABLE_PRODUCTION` em cima à direita; coordenadas lat/long simuladas embaixo à direita).

**Viabilidade:** CÓDIGO PURO — SVG + CSS animations.

---

##### Card de Métrica (ROI-Meter)

**Representa:** O pulso financeiro da operação. Um número que resume se a missão está indo bem ou mal.

**Metáfora visual:** Medidor de sinal — um número grande com contexto de tendência + uma barra de "intensidade" embaixo que é quase um EKG simplificado.

**Cena detalhada:** Card com fundo `surface-card`, borda `border-default`. Topo: label monospace uppercase muted (`RECEITA TOTAL`, `PIPELINE ATIVO`, `TAXA DE CONVERSÃO`) com ícone funcional à direita. Valor principal: `JetBrains Mono 700`, 28–32px, cor `text-primary`. Linha de tendência: número com seta (`↑ +12.5%` em accent verde para positivo; `↓ -2.1%` em status-error para negativo) em 11px mono. Barra de intensidade: 2px de altura, fundo muted, fill em accent (para positivo) ou status-error (para negativo), `border-radius: 1px`. A barra é o único elemento visual além dos dados — ela transforma um número em uma sensação de "quanto" desse alvo foi conquistado. Sem blobs, sem gradientes de fundo.

**Viabilidade:** CÓDIGO PURO.

---

##### Gráfico de Área — Internal Zvision Flows

**Representa:** O fluxo de dados/atividade do sistema ao longo do tempo. A prova de que o sistema está "vivo".

**Metáfora visual:** Sinal de radar — uma linha que oscila como um cardiograma de uma operação em andamento.

**Cena detalhada:** Container com fundo `surface-card`, borda, grade interna em linhas `rgba(255,255,255,0.04)`. Linha do gráfico: 2px stroke accent (`#A2E635`). Fill: gradiente linear da linha até transparente — `rgba(162,230,53,0.2)` no topo, `rgba(162,230,53,0.0)` embaixo. Pontos de dados: círculos de 5px, borda 2px accent, fundo `surface-card` — aparecem no hover. Crosshair no hover: linha vertical e horizontal em `rgba(162,230,53,0.3)`, 1px dashed, com tooltip flutuante mostrando valor e hora. Scanlines CRT sutis sobre o gráfico: `repeating-linear-gradient` opacidade 4%. Filtros de tempo (1H / 24H / 7D): pills mono pequenos com estado ativo em accent. Texto "LIVE FEED" com dot pulsante verde (`animation: pulse 2s infinite`).

**Viabilidade:** CÓDIGO PURO — Chart.js com configuração customizada.

---

##### Lead Card (no Kanban)

**Representa:** Um "alvo" identificado — uma empresa com potencial de conversão. A cor do ponto de sinal no canto imediatamente comunica a urgência.

**Metáfora visual:** Ficha de briefing de inteligência. Limpa, densa, acionável.

**Cena detalhada:** Card `surface-card`, borda `border-default`, `border-radius: 4px`. Hover: `border-color` sobe para `rgba(162,230,53,0.35)`, `translateY(-1px)`. Topo: nome da empresa (`Space Grotesk 700`, 15px, `text-primary`) + dot de sinal no canto direito (`8px`, `border-radius: 50%`, com `box-shadow` glow na cor do status — verde/amber/vermelho para ALTO/MÉDIO/BAIXO). Meio: label `VALOR EST.` em 9px mono muted + valor em `JetBrains Mono 700`, 15px, accent. Badge de status (`SINAL ALTO`, `AGENDADO`, `AGUARDANDO`) em `8px mono uppercase`, fundo translúcido da cor correspondente, borda 1px. Rodapé: separador 1px + avatar circular 22px do agente responsável + nome do agente em 10px mono + tempo relativo (`2h atrás`) em 9px mono muted alinhado à direita. Sem decorações extras.

**Viabilidade:** CÓDIGO PURO.

---

##### Painel de Intel do Lead (Slide-over)

**Representa:** O dossiê completo do alvo. Onde a IA entrega inteligência acionável para o operador decidir o próximo movimento.

**Metáfora visual:** Terminal de inteligência — como um relatório de operações especiais sendo sintetizado em tempo real.

**Cena detalhada:** Painel lateral de 520px que desliza da direita com `transition: right 0.3s cubic-bezier(0.4,0,0.2,1)`. Overlay semitransparente com `backdrop-filter: blur(2px)` sobre o resto da tela. Header: logo da empresa (52x52px, fundo `surface-elevated`, borda sutil, sigla em accent mono) + nome da empresa (`JetBrains Mono 700`, 18px, `letter-spacing: 2px`) + tag de tipo (`CORPORATIVO`, `STARTUP`) em badge accent + ID de missão (`#ZX-9921`) em 10px muted + botão X de fechar (hover: borda vermelha). Seção de Briefing IA: fundo `rgba(162,230,53,0.04)`, borda `rgba(162,230,53,0.25)`, linha de topo como gradiente accent horizontal. Header interno: `// ANÁLISE TÁTICA` em 9px mono accent com ícone + `CONFIANÇA_IA: 98.4%` em 9px mono muted à direita. Texto do briefing: `JetBrains Mono 400` 11px, `line-height: 1.7`, cor `text-secondary`. Palavras-chave destacadas têm `background: rgba(162,230,53,0.15)`, cor accent, `padding: 1px 4px`. Recomendação da IA: linha separada começando com `> ` em accent, cor accent total. Stats em grade 2x2: cards `surface-elevated` com label 9px muted + valor 22px mono bold + detalhe 9px muted. Card de "Probabilidade de Vitória" tem barra de progresso de 3px em accent embaixo. Activity Log: header com filtro à direita + lista vertical com linha de timeline em `border-left: 1px solid border-default`, dots de 11px (ativo = borda accent + fundo translúcido accent), nome do evento (`Space Grotesk 600`, 13px) + timestamp à direita + detalhe em 10px mono muted + chips de arquivo quando houver anexo.

**Viabilidade:** CÓDIGO PURO.

---

##### Drop Zone de Importação

**Represents:** O "portal de entrada" de dados brutos. O momento em que dados crus do mundo real entram no sistema e se tornam inteligência tática.

**Metáfora visual:** Terminal de uplink — uma zona de transferência segura e criptografada com feedback de status em tempo real.

**Cena detalhada:** Container grande (full-width menos padding) com borda `1px dashed rgba(162,230,53,0.3)`, `border-radius: 4px`, fundo `rgba(162,230,53,0.02)`. Hover/drag-over: `border-color` sobe para accent sólido, fundo sobe para `rgba(162,230,53,0.05)`. Marcas de canto decorativas em accent 30% opacidade nos 4 cantos. Centro: ícone de upload em 48px (círculo escuro com seta para cima em accent) + título `INICIAR TRANSFERÊNCIA DE DADOS` em `Space Grotesk 600` 18px + subtítulo `Solte cargas criptografadas CSV/XLSX aqui` em `JetBrains Mono 400` 11px muted + dois pills informativos (`MAX: 50MB`, `SECURE: AES-256`) em mono 9px com borda sutil. Rodapé interno: linha de status do sistema em mono 9px muted esquerda (`● API: CONNECTED  ● DB: WRITABLE`) + versão à direita (`VER 2.0.4 // CRIPTOGRAFADO`). Estado "processando": terminal de log aparece abaixo com fundo `#000`, texto mono verde rolando (`> Parsing row 1... OK`, `> Validating emails... OK`), barra de progresso accent animada. Estado "completo": texto `UPLOAD SUCCESSFUL` em accent grande + botão para ver pipeline.

**Viabilidade:** CÓDIGO PURO.

---

##### Cards de Automação (Flows)

**Representa:** Cada automação de IA rodando na plataforma — um processo vivo com métricas de saúde em tempo real.

**Metáfora visual:** Monitor de processo de sistema — como ver processos rodando no `htop`, mas bonito.

**Cena detalhada:** Grade de 2 colunas (Internal Flows | Client Flows). Cada card: fundo `surface-card`, borda sutil. Topo: ícone de categoria (quadrado escuro 36px com ícone mono) + nome da automação (`Space Grotesk 600`, 16px) + ID em 10px mono muted + toggle switch accent no canto direito. Meio: duas métricas principais lado a lado (label 8px uppercase muted + valor `JetBrains Mono 700` 22px) + sparkline de 100px — miniatura de gráfico de linha em 24px de altura, só a linha (2px stroke, sem fill), cor accent para saudável, vermelho para com erro. Rodapé: dot de status colorido + label de status (`● 99.9% Uptime`, `● Warning`, `● Paused`) + timestamp `Last run: 2s ago` à direita em 10px mono muted.

**Viabilidade:** CÓDIGO PURO — SVG inline para sparklines.

---

## Tokens de Design

### Cores — Fundos

| Token | Valor | Uso |
|---|---|---|
| `surface-page` | `#050506` | Fundo principal da aplicação |
| `surface-card` | `#0d0d10` | Cards, painéis, containers |
| `surface-elevated` | `#141418` | Elementos elevados dentro de cards, inputs |
| `surface-hover` | `#1c1c22` | Estado hover de itens interativos |

### Cores — Texto

| Token | Valor | Uso |
|---|---|---|
| `text-primary` | `#e8e8e8` | Títulos, valores principais |
| `text-secondary` | `#9ca3af` | Texto de apoio, descrições |
| `text-muted` | `#4b5563` | Labels, placeholders, timestamps |

### Cores — Accent (UMA COR APENAS)

| Token | Valor | Uso |
|---|---|---|
| `accent-primary` | `#A2E635` | A COR da marca — botões, links ativos, ícones ativos, badges, sparklines, glow |
| `accent-hover` | `#b8f040` | Hover state do accent |
| `accent-subtle` | `rgba(162, 230, 53, 0.08)` | Fundos translúcidos — hover tints, card backgrounds de briefing |
| `accent-subtle2` | `rgba(162, 230, 53, 0.15)` | Estado ativo de nav, highlights mais fortes |

### Cores — Status (APENAS para feedback funcional)

| Token | Valor | Uso |
|---|---|---|
| `status-success` | `#22c55e` | Sinal alto, upload OK, sistema online — APENAS feedback positivo |
| `status-error` | `#ef4444` | Sinal baixo, erro, cancelado — APENAS feedback negativo |
| `status-warning` | `#f59e0b` | Sinal médio, pendente, aguardando — APENAS alerta |

### Bordas

| Token | Valor | Uso |
|---|---|---|
| `border-default` | `rgba(162, 230, 53, 0.15)` | Contorno padrão de todos os cards e painéis |
| `border-bright` | `rgba(162, 230, 53, 0.5)` | Bordas de elementos ativos, focados ou em destaque |

### Geometria

| Token | Valor | Uso |
|---|---|---|
| `radius-card` | `4px` | Cards, painéis, containers |
| `radius-button` | `3px` | Botões, badges, pills |
| `radius-input` | `3px` | Inputs, selects |

### Sombras

| Token | Valor | Uso |
|---|---|---|
| `shadow-neon` | `0 0 12px rgba(162,230,53,0.25)` | Elementos com glow ativo (logo, botão primário, dot de status vivo) |
| `shadow-neon-sm` | `0 0 6px rgba(162,230,53,0.3)` | Dots de status pequenos |
| `shadow-panel` | `-8px 0 32px rgba(0,0,0,0.6)` | Painel slide-over |

---

## Componentes — Overrides

| Componente | Override |
|---|---|
| `<Card>` | `background: surface-card`, `border: 1px solid border-default`, `border-radius: radius-card`, `transition: border-color 0.2s`. Hover: `border-color: rgba(162,230,53,0.25)` |
| `<Button primary>` | `background: accent-primary`, `color: surface-page`, `font-family: mono`, `font-size: 11px`, `font-weight: 700`, `letter-spacing: 1px`, `border-radius: radius-button`. Hover: `background: accent-hover`, `box-shadow: shadow-neon` |
| `<Button outline>` | `background: transparent`, `border: 1px solid border-default`, `color: text-secondary`, `font-family: mono`. Hover: `border-color: border-bright`, `color: accent-primary` |
| `<Badge>` | `font-family: mono`, `font-size: 8px`, `font-weight: 700`, `letter-spacing: 1px`, `padding: 2px 6px`, `border-radius: 2px`. Variantes por cor de status com fundo translúcido + borda 1px da cor correspondente |
| `<Input>` | `background: surface-page`, `border: 1px solid border-default`, `border-radius: radius-input`, `font-family: mono`, `font-size: 12px`, `color: text-primary`. Focus: `border-color: accent-primary`, `box-shadow: 0 0 0 2px rgba(162,230,53,0.1)` |
| `<Toggle>` | Track inativo: `surface-elevated`. Track ativo: `accent-primary`. Thumb: branco. Transição suave. |
| `<Avatar>` | `border-radius: 50%`, `border: 1px solid border-default`. Fallback: fundo `surface-elevated`, iniciais em `accent-primary mono`. |

---

## Telas do Sistema

**[Boot Sequence]:** Splash screen de inicialização com logo animado, progress bar e log de diagnóstico. Aparece na entrada da aplicação. Redireciona automaticamente ao dashboard após completar.

**[Dashboard Principal]:** Métricas de ROI (grade 3 colunas) + gráfico de área "Fluxos Internos Zvision" (2/3 da largura) + lista "Alvos Ativos" (1/3) + gráfico de linhas "Fluxo de Clientes" embaixo. Sidebar com navegação por ícones.

**[Pipeline de Missão]:** Kanban board horizontal com scroll. Colunas: `NOVO LEAD`, `QUALIFICAÇÃO`, `REUNIÃO BRIEFING`, `REUNIÃO PROPOSTA`, `FECHAMENTO`. Cada coluna tem header sticky com contador de cards. Cards são arrastáveis. Clique em card abre o Painel de Intel.

**[Painel de Intel do Lead]:** Slide-over 520px da direita. Header com identidade do alvo. Seção de Briefing IA com efeito typewriter na primeira abertura. Grid 2x2 de stats. Activity Log em timeline.

**[Ingestão de Dados]:** Drop zone centralizada com ornamentos de canto. Estado idle → processando (terminal de log) → completo (feedback de sucesso). Tabela de uploads recentes abaixo.

**[Flows / Automações]:** Grade dupla de cards de automação com sparklines inline. Coluna esquerda: fluxos internos. Coluna direita: fluxos de clientes. Toggle de ativo/inativo por card.

**[Configurações]:** Two-column. Esquerda: nav de seções em estilo terminal (`> IDENTITY_ACCESS`, `BILLING_CYCLES`, `AUDIT_LOGS`, `TERMINATE_SESSION`). Direita: form panel. Seção de perfil do operador com nível de acesso, codinome, email. Seção de chaves de API com valores mascarados e ações de copiar/regenerar/excluir. Seção Danger Zone com borda vermelha.

---

## Interações e Animações

**Hover em cards:** `transition: border-color 0.2s ease`, `transform: translateY(-1px)` em lead cards do kanban.

**Abertura do slide-over:** `transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1)`. Overlay com `backdrop-filter: blur(2px)` que faz fade-in simultâneo.

**Typewriter do briefing IA:** Texto aparece caractere por caractere com velocidade de 30ms/char. Cursor piscante `|` fica ativo durante a geração.

**Dot de status live:** `animation: pulse 2s infinite` com `opacity` variando entre 1.0 e 0.4.

**Barra de progresso do boot:** Animação linear de 0% a 100% em 3s com pequenos "saltos" simulando carregamento real.

**Scroll do terminal de log:** Linhas aparecem de baixo para cima com `animation: slideIn 0.2s ease` por entrada.

**Glow do logo no boot:** `animation: logoGlow 2s ease-in-out infinite` alternando entre dois valores de `box-shadow`.

---

## Regra de Ouro

Ao criar qualquer tela ou componente:

1. Siga TODAS as decisões de identidade (estrutura + linguagem + conceitos visuais)
2. Use `Space Grotesk` para UI e `JetBrains Mono` para dados — nunca Inter, nunca Roboto
3. APENAS tokens semânticos — nunca valores crus de cor ou tamanho
4. UMA cor accent (`#A2E635`) para tudo — a interface inteira é `surface-page` + accent + neutros. Nenhuma outra cor vibrante além das de status funcionais
5. Componentes de alto impacto (Boot, Briefing IA, Drop Zone, Gráfico de Área) DEVEM ter os conceitos visuais descritos acima — não decoração genérica
6. Nunca blobs, dot grids decorativos ou partículas flutuantes aleatórias — a grade tática de fundo é suficiente como textura ambiente
7. Linguagem de interface sempre em tom tático: `//`, `_`, `[ ]`, `>>`, nomenclatura de sistema
8. O fundo da página SEMPRE tem a grade tática como único elemento decorativo de background

**A alma do Zvision em 1 linha:** *Cada lead é um alvo, cada dado é inteligência, cada tela é um posto de comando.*

---

## Teste Final

Coloque a interface ao lado de um dashboard Shadcn padrão. A diferença deve ser óbvia em TRÊS níveis:

- **ESTRUTURA:** Rail de ícones sem texto, topbar com metadados do sistema, kanban como tela principal de trabalho
- **LINGUAGEM:** JetBrains Mono em todos os dados, Space Grotesk nos títulos, UMA cor accent (#A2E635) em tudo, geometria sharp (4px max), tom de voz tático nos labels
- **RIQUEZA:** Boot screen com glow animado, briefing IA com typewriter, gráfico de área com crosshair, drop zone com marcas de canto e terminal de log — cada um contando a história do que representa, não decoração genérica
