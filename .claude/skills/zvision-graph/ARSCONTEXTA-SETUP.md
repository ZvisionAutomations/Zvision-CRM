---
name: arscontexta-setup
description: Como instalar e usar o plugin arscontexta no Claude Code
---

# arscontexta — Setup

Plugin criado por Heinrich (@arscontexta) — ~250 arquivos de conhecimento estruturado sobre como construir skill graphs, ciencia cognitiva, zettelkasten, arquitetura de agentes.

## Instalacao

No terminal, dentro do projeto:

```bash
# 1. Adicionar o marketplace (uma vez so)
/plugin marketplace add agenticnotetaking/arscontexta

# 2. Instalar o plugin
/plugin install arscontexta@agenticnotetaking

# 3. Reiniciar o Claude Code

# 4. Setup inicial
/arscontexta:setup
```

## O que o Plugin Faz

Gera um sistema de conhecimento individualizado a partir de conversas:
- Vault de arquivos markdown conectados por wikilinks
- Pipeline de processamento que extrai insights e encontra conexoes
- Sistema de memoria persistente para agentes AI
- Nenhum banco de dados, cloud ou lock-in — arquivos locais puros

## Presets

Ao rodar `/arscontexta:setup`, escolha o preset:
- **research** — para construir bases de conhecimento (recomendado para Zvision)
- **zettelkasten** — para notas atomicas estilo Luhmann
- **project** — para contexto de projetos especificos

## Comandos Principais

```bash
/learn [topico]    # Adiciona conhecimento sobre um topico ao grafo
/reduce            # Consolida e conecta nodes existentes
```

## Referencia

- GitHub: https://github.com/agenticnotetaking/arscontexta
- Site: https://www.arscontexta.org/
