# Baking Memory — global cross-session store

Native Baking-AI memory. Same global path for **Cursor and Claude Code**.

## Problem

Decisions and conventions that span **repos and sessions** — not a single handoff or `AGENTS.md` line.

## Store

| Item | Default |
|------|---------|
| Directory | `~/.cursor/baking/memory/` |
| SQLite + FTS5 | `baking-memory.db` (Node 22+ `node:sqlite`) |
| Fallback | `observations.jsonl` + keyword scoring |

Config: `lightStack.memory.provider: "baking"` in `~/Desktop/side/baking/config.json`.

## CLI

```bash
baking memory status
baking memory save --topic baking/routing --title "Auto-route off by default" --body "Prefer baking require on per repo."
baking memory search "global memory sqlite"
baking memory context --query "cross-session memory sqlite"
```

### Save fields

| Flag | Purpose |
|------|---------|
| `--topic` | Stable key (`project/slug`) |
| `--title` | Short label |
| `--body` | What / why / where (structured, not a transcript) |
| `--type` | `decision` · `session` · `architecture` · `discovery` · `pattern` |
| `--project` | Repo slug (optional) |

## Orchestrator hooks (light stack)

When `lightStack.memory.provider` is `baking`:

| When | Action |
|------|--------|
| Non-trivial start | `baking memory context --query "<terms from prompt>"` (max 1–2) |
| Closed decision | `baking memory save …` |
| Session close | `baking memory save --type session --title "Session summary" --body "5 bullets"` |

**Don't:** dump full handoffs; duplicate everything every turn.

## vs other layers

| Layer | Scope |
|-------|--------|
| Handoff | One task |
| AGENTS.md | One repo |
| **Baking memory** | Cross-repo / cross-session decisions |

## FTS notes

SQLite FTS5 supports keyword search (`OR` between terms). Semantic embeddings are **not** in v1.9 — add later if keyword recall is insufficient.
