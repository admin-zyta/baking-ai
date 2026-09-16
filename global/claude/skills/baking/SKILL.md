---
name: baking
description: Baking-AI orchestrator (Claude Code). Mecanic, executor, fork, metrics JSONL, light stack. /baking, use baking.
disable-model-invocation: false
user-invocable: true
---

# Baking — Claude Code (global)

Reference: **`claude-code/BAKING.md`**, **`METRICS.md`**, **`LIGHT-STACK.md`**.

Config: **`~/.cursor/opus-sonnet/config.json`** (typically `claude` profile). Metrics: `runtime: claude-code`.

## Gate-out — when **not** to use Baking

Classify **before** subagents, handoff, or metrics.

**GATE-OUT** for pure Q&A, explanation, review-only, or status — no code change requested. Start with **`⬜ **No Baking** · gate-out`**. No YAML, JSONL, or handoff.

**DIRECT** when the orchestrator resolves trivial EXECUTE without a subagent — start with **`⚡ **Baking · DIRECT** · orchestrator resolves (no subagent)`**. Still close with YAML + JSONL (`exec_agent: direct`).

**Always Baking** for implement/fix/refactor/deploy or explicit **`/baking`** / *use baking*, or when **`.cursor/baking/required.json`** exists in the repo (implementation mandatory).

Per-project: `baking require on` · Global fallback: `baking auto-route on`.

## Light stack (lightweight — if `lightStack.enabled`)

1. **Start** (non-trivial): `baking memory context/search` if applicable.
2. **Skill:** match the request against `~/.cursor/baking/skill-registry.md` → Read one SKILL.md.
3. **EXECUTE close:** handoff criteria vs diff → `## Verify` in the handoff.
4. **End:** YAML with `verify:` + `baking memory save` (session summary).

Registry: `baking skill-registry` · Doctor: `baking doctor`.

## Mandatory close

1. YAML to the user (incl. `verify` if there was code)
2. Append JSONL → `.cursor/baking/metrics/runs.jsonl` — include **`usage`** (LLM tokens only; not Z.ai/Stripe/etc.)
3. `review` to calibrate routing

## Routing

Direct TRIVIAL → **mecanic** (Haiku) → **executor** (Sonnet) → **fork** (session). PLAN-DEEP → **planner-hyper**. PLAN → **planner**. PLAN-ONLY → planner/hyper, no exec.
