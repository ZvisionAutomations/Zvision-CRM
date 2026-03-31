# ZVISION AUTOMATION HUB — AGENT CONSTITUTION

## WHAT THIS IS
Elite sales CRM for high-ticket agencies. War Room aesthetic. Every lead is a target. Every closed deal is "Mission Complete." Built to eventually be sold as an AI infrastructure product for businesses.

## STACK
- Next.js 14 (App Router) + TypeScript (strict, zero `any`)
- Tailwind CSS + shadcn/ui + Magic UI
- Supabase (auth + database + realtime)
- Framer Motion (page transitions), @dnd-kit (kanban drag/drop)
- Gemini API (AI lead briefings — Sprint 3)

## COMMANDS
```bash
npm run dev          # dev server
npm run build        # production build (only when asked or validating)
npm run lint         # lint check
```

## CORE RULES — NEVER BREAK THESE

1. **Read before you write.** Before touching any file, read it fully.
2. **No assumptions.** If blocked, state what you need. Don't invent data or logic.
3. **TypeScript strict.** Zero `any`, zero `@ts-ignore`.
4. **Supabase is the source of truth.** All state mutations go through the DB.
5. **Atomic components.** Never build monolithic pages. Split into reusable pieces.
6. **Document decisions.** Architectural choices get a comment explaining why.
7. **Don't ask, execute.** If a decision is ambiguous but low-risk, choose and document. Only ask for high-impact irreversible decisions.
8. **Platform-agnostic.** Never hardcode framework-specific assumptions. Check CLAUDE.md first; if missing, ask the user and persist the answer here.

---

## ETHOS — BUILD PHILOSOPHY

### Boil the Lake
AI-assisted coding makes the marginal cost of completeness near-zero. When the complete implementation costs minutes more than the shortcut — do the complete thing. Every time.

- **Lake vs. ocean:** A "lake" is boilable — 100% coverage for a module, full feature implementation, all edge cases, complete error paths. An "ocean" is multi-quarter migrations. Boil lakes. Flag oceans as out of scope.
- **Completeness is cheap.** When comparing approach A (full) vs B (90%) — always prefer A. "Ship the shortcut" is legacy thinking.
- **Never say "2 weeks."** Say "~2 weeks human / ~1 hour AI-assisted" and ship the complete version.

### Search Before Building
Before designing any solution involving unfamiliar patterns, infrastructure, or runtime capabilities:
1. Search for `{runtime} {thing} built-in`
2. Search for `{thing} best practice {current year}`
3. Check official docs (Next.js, Supabase, shadcn)

Three layers: tried-and-true (L1), new-and-popular (L2), first-principles (L3). Prize L3 above all — it's where the best insights come from.

### User Sovereignty
AI models recommend. Users decide. This overrides all others.

Two models agreeing is a strong signal — not a mandate. The user always has context models lack. When in doubt: present the recommendation, explain the reasoning, state what context might be missing, **then ask**. Never act unilaterally on ambiguous direction.

**Anti-patterns:**
- Making a change and telling the user afterward → ask first
- "Both models agree so it must be correct" → agreement is signal, not proof
- Framing your assessment as settled fact → present both sides

### AI Effort Reality
| Task type | Human team | AI-assisted | Compression |
|---|---|---|---|
| Boilerplate / scaffolding | 2 days | 15 min | ~100x |
| Test writing | 1 day | 15 min | ~50x |
| Feature implementation | 1 week | 30 min | ~30x |
| Bug fix + regression test | 4 hours | 15 min | ~20x |
| Architecture / design | 2 days | 4 hours | ~5x |
| Research / exploration | 1 day | 3 hours | ~3x |

---

## COMMIT STYLE

**Always bisect commits.** Every commit = one logical change. When you've made multiple changes (rename + rewrite + tests), split them into separate commits before pushing. Each commit should be independently understandable and revertable.

Good bisection:
- Rename/move separate from behavior changes
- Component refactors separate from new features
- DB migrations separate from code changes

Never `git add .` or `git add -A` — always stage specific files.

---

## IDENTITY — QUICK REFERENCE
Full spec: `zvision_crm_identity.md` | Design skill: `skills/DESIGN.md`

```
accent-primary:   #A2E635   → tactical green — actions, CTAs, critical data
accent-ai:        #00D4FF   → electric blue — AI states, agent activity, insights  
surface-page:     #0A0A0A   → pitch black background
surface-card:     #111111
surface-elevated: #1A1A1A
border-default:   rgba(255,255,255,0.06)
text-primary:     #F0F0F0
text-secondary:   rgba(240,240,240,0.5)

Fonts: Space Grotesk (UI/display) + JetBrains Mono (data/labels/badges)
Background: tactical grid rgba(162,230,53,0.03) at 40px spacing
Tone: tactical — "Target" not "Client", "Intel" not "Notes", ">>" not "→"
```

---

## SCREENS STATUS
| Screen | Status | Notes |
|---|---|---|
| Boot Sequence | 🔴 TODO | Animated logo, progress bar, diagnostic log |
| Dashboard | 🟡 REFACTOR | Exists via v0 template — needs real data + identity |
| Mission Pipeline (Kanban) | 🟡 REFACTOR | Exists — needs dnd-kit + real Supabase data |
| Lead Intel Panel | 🔴 TODO | Slide-over 520px, typewriter AI briefing |
| Data Ingestion | 🟡 REFACTOR | Exists — needs corner ornaments + terminal log |
| Flows / Automations | 🔴 TODO | Dual-column cards with sparklines |
| Settings | 🟡 REFACTOR | Exists — needs terminal-style nav + danger zone |
| Financials | 🔵 FUTURE | Post-launch |
| Ads Dashboard | 🔵 FUTURE | Meta + Google Ads API |
| Agents Monitor | 🔵 FUTURE | Real-time automation status |

---

## SKILL GRAPH — DOMINIO COMPLETO

O Zvision tem um Skill Graph em `.claude/skills/zvision-graph/`.

**Antes de qualquer tarefa, SEMPRE:**
1. Leia o index: `.claude/skills/zvision-graph/index.md`
2. Identifique os MOCs e nodes relevantes
3. Navegue os wikilinks necessários
4. Só então formule a resposta

**MOCs disponíveis:**
- `moc-design-system` — cores, tipografia, componentes, identidade visual
- `moc-screens` — status e specs de cada tela
- `moc-arquitetura` — stack, padrões, estrutura de pastas, regras
- `moc-sprints` — o que foi feito, o que está pendente
- `moc-ai-features` — Gemini API, briefings, agentes, flows

Não responda com conhecimento genérico se existe um node específico no grafo sobre o tema.

---

## SKILLS — INVOKE WHEN NEEDED
- `use design skill` → load `skills/DESIGN.md` before any UI work
- `use context7` → fetch live docs for Next.js, Supabase, shadcn
- `use audit skill` → load `skills/UI_AUDIT.md` to review a finished screen

---

## SESSION HYGIENE
- Long session mid-task → run `/compact`
- Starting unrelated task → run `/clear`
- Resuming after `/clear` → say "Read CLAUDE.md and MISSION_BRIEF.md, then continue"
- MISSION_BRIEF.md is generated by the initial analysis prompt — it tracks what's done

---

## SPRINT PLAN
```
SPRINT 1 (NOW)    → Design system foundation → Dashboard → Kanban
SPRINT 2 (CORE)   → Lead Intel Panel → Data Ingestion → Boot Screen
SPRINT 3 (AI)     → Gemini integration → AI briefings → Flows
SPRINT 4 (FUTURE) → Financials → Ads → Agents monitor
```

---

## LONG-RUNNING TASKS: DON'T GIVE UP
When running builds, tests, or any long-running background task — poll until completion. Never say "I'll check later" and stop. Keep polling every cycle. Report progress at each check. The user wants to see it finish, not a promise to follow up.
