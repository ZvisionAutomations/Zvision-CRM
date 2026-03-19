---
name: tokens-de-cor
description: Todos os tokens de cor do Zvision com valores exatos e casos de uso
---

# Tokens de Cor

Use sempre estes valores. Nunca invente variacoes ou aproximacoes.

## Cores de Acento

```css
--accent-primary: #A2E635;   /* verde tatico — CTAs, acoes, dados criticos */
--accent-ai:      #00D4FF;   /* azul eletrico — AI states, agentes, insights */
```

O [[identidade-visual]] define quando usar cada um: verde para acoes humanas, azul para tudo relacionado a AI.

## Superficies

```css
--surface-page:     #0A0A0A;              /* background de todas as paginas */
--surface-card:     #111111;              /* cards, paineis, containers */
--surface-elevated: #1A1A1A;             /* modals, dropdowns, popovers */
```

## Bordas

```css
--border-default: rgba(255, 255, 255, 0.06);  /* bordas padrao — muito sutis */
--border-accent:  rgba(162, 230, 53, 0.2);    /* bordas com destaque verde */
--border-ai:      rgba(0, 212, 255, 0.2);     /* bordas de elementos AI */
```

## Texto

```css
--text-primary:   #F0F0F0;                    /* texto principal */
--text-secondary: rgba(240, 240, 240, 0.5);   /* texto secundario/muted */
--text-muted:     rgba(240, 240, 240, 0.3);   /* texto muito sutil */
```

## Como Usar no Tailwind

Estes tokens estao configurados no `tailwind.config`. Use as classes:
- `bg-surface-page`, `bg-surface-card`, `bg-surface-elevated`
- `text-primary`, `text-secondary`
- `border-default`
- `accent-primary` para o verde, `accent-ai` para o azul
