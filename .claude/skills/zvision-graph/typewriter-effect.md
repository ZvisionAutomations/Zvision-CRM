---
name: typewriter-effect
description: Implementação do efeito typewriter via streaming do Gemini — sem setInterval, stream é o typewriter
type: node
---

# Typewriter Effect

O efeito typewriter no Zvision não usa `setInterval` ou delays artificiais.
O stream da API Gemini **é** o typewriter — cada chunk que chega é appendado ao estado.

## Hook: useLeadBriefing

```typescript
// hooks/useLeadBriefing.ts
const [briefing, setBriefing] = useState('')
const [isGenerating, setIsGenerating] = useState(false)

// Cada chunk do stream faz append direto
for await (const chunk of stream) {
  setBriefing(prev => prev + chunk.text())
}
```

## Cursor Piscante

Durante geração: cursor `▊` appendado ao texto com `animate-pulse` via Tailwind.
Desaparece quando `isGenerating` volta a false.

## Estados Visuais

- `isGenerating: true` + `briefing: ''` → loading shimmer bar
- `isGenerating: true` + `briefing: '...'` → texto + cursor `▊`
- `isGenerating: false` + `briefing: '...'` → texto completo + botão regenerar

Ver [[screen-lead-intel-panel]] para os estados visuais completos.
Ver [[gemini-integration]] para como o stream é iniciado.
