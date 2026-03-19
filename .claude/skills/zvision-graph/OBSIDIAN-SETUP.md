---
name: obsidian-setup
description: Guia de configuracao do Obsidian como editor do Skill Graph do Zvision
---

# Obsidian Setup — Zvision Skill Graph

## 1. Instalar o Obsidian

Download gratuito em https://obsidian.md (Mac/Win/Linux)

## 2. Abrir o Vault

```
File → Open Vault → Open folder as vault
```

Aponte para:
```
c:\Users\Lenovo\Documents\Zvision Automation HUB\zvision-crm\.claude\skills\zvision-graph\
```

## 3. Configuracoes Essenciais

**Settings → Files & Links:**
- [x] Use `[[Wikilinks]]` — ativar
- [x] New link format: `Shortest path when possible`
- [x] Automatically update internal links — ativar

**Core Plugins — ativar:**
- [x] Graph View
- [x] Backlinks
- [x] Outgoing Links
- [x] Templates

**Templates:**
- Template folder: `_templates`

## 4. Ver o Grafo Visual

`Ctrl+G` (Windows) ou `Cmd+G` (Mac) — abre o Graph View.

Nodes com mais wikilinks ficam maiores. MOCs viram hubs naturais. Voce ve a topologia do dominio.

## 5. Usar os Templates

Para criar um novo node:
1. Crie um arquivo novo
2. `Ctrl+P` → "Templates: Insert template"
3. Selecione `skill-node` ou `skill-moc`

## 6. Plugin Claudian (Opcional — AI dentro do Obsidian)

Para ter o Claude Code diretamente no Obsidian:

1. Settings → Community Plugins → desativar Safe Mode
2. Instale o plugin **BRAT**
3. BRAT → Add Beta Plugin → `https://github.com/YishenTu/claudian`
4. Ative o Claudian

**Requisito:** Claude Code CLI instalado e configurado.

## Dica — Graph View

Ao abrir o grafo, clique em um MOC (ex: `moc-design-system`) para ver todos os nodes conectados a ele destacados. Isso mostra as areas do dominio que precisam de mais nodes.
