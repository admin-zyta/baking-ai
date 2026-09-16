---
name: baking
description: Baking orchestrator (Claude Code). Mecanic, executor, fork, metrics JSONL, light stack. /baking, use baking.
disable-model-invocation: false
user-invocable: true
---

# Baking — Claude Code (global)

Reference: **`claude-code/BAKING.md`**, **`METRICS.md`**, **`LIGHT-STACK.md`**.

Config: **`~/Desktop/side/baking/config.json`** (typically `claude` profile). Metrics: `runtime: claude-code`.

## Light stack (lightweight — if `lightStack.enabled`)

1. **Start** (non-trivial): `baking memory context --query "<terms>"` + `baking memory search` if applicable.
2. **Skill:** match the request against `~/.cursor/baking/skill-registry.md` → Read one SKILL.md.
3. **EXECUTE close:** handoff criteria vs diff → `## Verify` in the handoff.
4. **End:** YAML with `verify:` + `baking memory save` (session summary, 5 bullets).

Registry: `baking skill-registry` · Doctor: `baking doctor`.

## Mandatory close

1. YAML to the user (incl. `verify` if there was code)
2. Append JSONL → `.cursor/baking/metrics/runs.jsonl`
3. `review` to calibrate routing

## Routing

Direct TRIVIAL → **mecanic** (Haiku) → **executor** (Sonnet) → **fork** (session). PLAN-DEEP → **planner-hyper**. PLAN → **planner**. PLAN-ONLY → planner/hyper, no exec.
