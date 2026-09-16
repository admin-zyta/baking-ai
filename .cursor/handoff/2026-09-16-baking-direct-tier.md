# Baking — tier DIRECT visible + GATE-OUT distinto

**Source:** Lore Forge session scratchpad `baking-direct-mode-fix-request.md`  
**Status:** implemented in Baking-AI v1.9.4

## Problem

When the orchestrator fixed a trivial change **without** delegating to mecanic/executor, there was no visible signal — looked the same as **not using Baking at all**.

## Fix

| Situation | Banner (first line of response) | Metrics `exec_agent` |
|-----------|----------------------------------|----------------------|
| **DIRECT** — Baking, orchestrator resolves | `⚡ **Baking · DIRECT** · orchestrator resolves (no subagent)` | `direct` |
| **GATE-OUT** — Baking not used | `⬜ **No Baking** · gate-out` | *(no JSONL)* |
| Delegate to subagent | `🟢 **Baking → executor-cursor** · …` | `executor` / `mecanic` / `fork` |

## Done

- [x] `lib/agent-colors.js` — `directBanner`, `gateOutBanner`
- [x] ROUTER, BAKING-CURSOR, claude BAKING, skills, routing.md, AGENTS.md
- [x] Router rule gate-out banner
