# Planner → Executor — **Baking** orchestrator (global)

Single config: **`~/Desktop/side/baking/config.json`** (`enabled`, `profile`, `handoffDir`).

**Do not** use per-repo `.claude/planner-executor.json`.

## Baking

- **`/baking`** or *"use baking for …"*
- Global agents: `~/.claude/agents/` (baking, planner, executor)
- Handoff: `.cursor/handoff/` (Baking creates the folder if missing)

## Profile

Edit `profile` in global config: `claude` | `cursor` | `hybrid`

Reference: `~/Desktop/side/baking/claude-code/BAKING.md`
