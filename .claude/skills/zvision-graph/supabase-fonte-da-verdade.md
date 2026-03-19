---
name: supabase-fonte-da-verdade
description: Principio arquitetural — todo estado do Zvision passa pelo Supabase antes de atualizar o UI
---

# Supabase e a Fonte da Verdade

## O Principio

Nenhuma mutacao de estado acontece sem passar pelo Supabase DB. O UI e sempre um reflexo do banco — nunca o contrario.

## Por que isso e critico para um CRM de alto ticket

Em vendas de alto ticket, um estado inconsistente (ex: lead marcado como fechado no UI mas aberto no DB) pode custar uma comissao ou danificar um relacionamento. O principio elimina essa classe de bugs.

## Como Implementar

```
// ERRADO — mutacao direta no estado local
const [leads, setLeads] = useState([])
setLeads([...leads, newLead])

// CORRETO — via server action
async function addLead(data) {
  await supabase.from('leads').insert(data)
  revalidatePath('/missoes')
}
```

Todas as server actions vivem em `/lib/actions/`. Ver [[server-actions]] para padroes.

## Realtime

O Supabase Realtime permite subscriptions a mudancas no DB. Usar para features como:
- Notificacoes quando um lead muda de status
- Atualizacoes ao vivo no kanban quando outro usuario move um card
- Status de agentes AI em [[screen-agents-monitor]]

## Supabase Client

O cliente e configurado em `/lib/supabase/`. Nunca criar instancias do cliente diretamente em componentes — usar as funcoes exportadas de `/lib/supabase/client.ts` e `/lib/supabase/server.ts`.
