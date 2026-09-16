---
name: baking
description: Baking-AI orchestrator (Cursor). Metrics JSONL, planner, executor-cursor, light stack (Baking memory, verify, skill registry). /baking, use baking.
disable-model-invocation: false
user-invocable: true
---

# Baking — Cursor (global)

Reference: **`BAKING-CURSOR.md`**, **`METRICS.md`**, **`LIGHT-STACK.md`**. Claude Code: **`claude-code/BAKING.md`** (same `lightStack` config).

## Gate-out — when **not** to use Baking

**Before** light stack, subagents, handoff, or metrics — classify the user message.

Use **GATE-OUT** (direct answer, normal chat) when the request is:

- Pure question or explanation (no code change implied)
- Review / opinion only (*"what do you think?"*, *"does X make sense?"*)
- Status or meta about Baking, config, tools
- Conceptual *"is there a way to…?"* without *implement / build / fix*

On GATE-OUT:

1. **Do not** spawn planner/executor, write handoff, append metrics, or emit closing YAML.
2. Start the reply with **`⬜ **No Baking** · gate-out`** (optional short reason after).
3. Answer normally.

**Always use Baking** when the user says **`/baking`**, *use baking*, the message clearly asks to **implement, fix, refactor, deploy, or edit code**, or **this repo has** `.cursor/baking/required.json` (`bakingRequired: true`) — then implementation is **mandatory**; use **`⚡ **Baking · DIRECT**`** when you resolve inline without a subagent (still YAML + JSONL).

## Visibility — DIRECT vs GATE-OUT

| Tier | When | First line |
|------|------|------------|
| **Gate-out** | Q&A, no code change | `⬜ **No Baking** · gate-out` |
| **Direct** | Trivial fix, orchestrator edits (no subagent) | `⚡ **Baking · DIRECT** · orchestrator resolves (no subagent)` |
| **Delegate** | PLAN / EXECUTE via subagent | emoji banner per `AGENTS.md` |

Direct **is** Baking — close with YAML + metrics (`exec_agent: direct`). Gate-out **is not** Baking — no metrics.

Per-project: `baking require on` · Global fallback only: `baking auto-route on`.

## Light stack (lightweight — if `lightStack.enabled`)

1. **Start** (non-trivial): `baking memory context --query "<terms>"` (see **`MEMORY.md`**).
2. **Skill:** match the request against `~/.cursor/baking/skill-registry.md` → Read one SKILL.md.
3. **EXECUTE close:** handoff criteria vs diff → `## Verify` in the handoff.
4. **End:** YAML with `verify:` + `baking memory save` (session summary, 5 bullets).

Registry: `baking skill-registry` · Doctor: `baking doctor`.

## Mandatory close

1. YAML to the user (incl. `verify` if there was code)
2. Append JSONL → `.cursor/baking/metrics/runs.jsonl` — include **`usage`** (LLM tokens only; not Z.ai/Stripe/etc.)
3. `review` to calibrate routing (`runtime: cursor`)

## Routing

Direct TRIVIAL | `planner` / **`planner-hyper`** / `planner-cursor` | `executor-cursor`. **`executor-mecanic` is Claude Code only** — see `AGENTS.md`.
