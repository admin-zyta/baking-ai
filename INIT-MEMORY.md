# Baking init-memory

Project memory bootstrap (Claude `/init` style).

## Commands

```bash
baking init-memory              # scan + drafts in .cursor/baking/init/
baking init-memory --dry-run    # preview without writing
baking init-memory --force      # regenerates .cursor/rules/baking-project.mdc
baking init-memory --require    # also marks repo: implementation must use Baking-AI
```

Then: **`/init-memory`** or *use baking PLAN-ONLY to complete init-memory*.

## Per-project required (preferred)

```bash
baking require on       # creates .cursor/baking/required.json
baking require off
baking require status
```

When the marker exists, **implementation** in that repo must use Baking-AI (ROUTER + handoff + metrics). Pure Q&A may still gate-out.

Global `autoRoute` is only a fallback for repos **without** the marker — prefer `require on` per project.

## What it generates

| File | Role |
|---------|-----|
| `.cursor/baking/init/scan.json` | Detected signals (stack, CI, create/audit mode) |
| `.cursor/baking/init/AGENTS.draft.md` | Draft — base for the agent |
| `.cursor/baking/init/memory-topics.json` | Suggested topics for `baking memory save` |
| `.cursor/baking/init/NEXT.md` | PLAN-ONLY instructions |
| `AGENTS.md` | Written only in **create** mode (repo with no AGENTS/CLAUDE) |
| `.cursor/rules/baking-project.mdc` | Cursor alwaysApply rule (concise) |
| `.cursor/baking/required.json` | Optional — `baking require on` or `--require` |

## Auto-route (global fallback)

```bash
baking auto-route status
baking auto-route on    # all repos without require marker
baking auto-route off   # default — use require per repo
```

Config: `autoRoute.enabled` in `~/Desktop/side/baking/config.json`.
