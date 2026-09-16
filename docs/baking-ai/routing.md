# Routing — Baking-AI

← [Back to README](./README.md)

Full reference: [ROUTER.md](../../ROUTER.md) · Cursor: [BAKING-CURSOR.md](../../BAKING-CURSOR.md) · Claude: [claude-code/BAKING.md](../../claude-code/BAKING.md)

---

## Step 0 — Classify

First branch: **GATE-OUT** vs **BAKING**.

- **GATE-OUT** — question, explanation, review-only, no code change → start with `⬜ **No Baking** · gate-out`; skip everything below.
- **BAKING** — implementation request or explicit `/baking` / *use baking* → continue.

```
                    ┌─────────────┐
                    │    User     │
                    └──────┬──────┘
                           ▼
              ┌────────────────────────┐
              │  Baking orchestrator   │
              └────────────┬───────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
         GATE-OUT                   BAKING
      (direct reply)          (router below)
              │                         │
              └────────────┬────────────┘
                           ▼ (BAKING only)
     ┌─────────────────────┼─────────────────────┐
     ▼                     ▼                     ▼
 TRIVIAL              PLAN / PLAN-ONLY        EXECUTE
 (direct)             / PLAN-REVISE          (handoff ok)
     │                     │                     │
     │              ┌──────┴──────┐              │
     │              ▼             ▼              │
     │         planner      planner-hyper         │
     │         (Opus/Grok)     (Fable)           │
     │              │             │              │
     └──────────────┴─────────────┴──────────────┘
                           │
                           ▼ (if asked to execute)
              ┌────────────────────────┐
              │ executor / mecanic /   │
              │ fork / direct          │
              └────────────────────────┘
```

---

## Decision table

| Flow | Signals | Subagent | Visible banner |
|------|---------|-----------|----------------|
| **GATE-OUT** | Q&A, explain, review-only, no code change | — | `⬜ **No Baking** · gate-out` |
| **DIRECT** | trivial fix, orchestrator edits inline | — (orchestrator) | `⚡ **Baking · DIRECT**` |
| **TRIVIAL** | alias of DIRECT in docs | — | same as DIRECT |
| **PLAN** | multi-file, ambiguity, landing | `planner` | `🟣 **Baking → planner**` |
| **PLAN-DEEP** | "hyper", architecture, ≥2 signals | `planner-hyper` | Fable |
| **PLAN-ONLY** | "plan only", "don't execute" | planner / hyper | — no exec |
| **PLAN-REVISE** | "change the plan" | planner updates the `.md` | — |
| **EXECUTE** | handoff + "implement" | `executor-cursor` / `executor` | Composer / Sonnet |
| **EXECUTE-MECANIC** | mechanical, simple handoff | `executor-mecanic` | Haiku (CC only) |
| **EXECUTE-FORK** | session debugging, context already loaded | `fork` | inherits parent (CC) |

---

## PLAN-DEEP — when to go Hyper (Fable)

**Explicit:** *plan deep*, *hyper*, *think it through*.

**Automatic (≥2 signals):**

- architecture / migration / trade-offs
- creative-brief-bar (landing, vibe, portfolio)
- strategic PLAN-ONLY
- >3 files with no handoff
- high ambiguity

---

## EXECUTE ladder (Claude Code)

```
TRIVIAL (direct)
    ↓ if mechanical with a handoff
executor-mecanic (Haiku)
    ↓ if logic / craft / assets
executor (Sonnet)
    ↓ if it depends on session context
fork
```

Cursor: TRIVIAL → `executor-cursor` → (no native fork equivalent).

---

## Anti-patterns

- Opus as the main chat
- Paraphrasing the plan to the executor (**path** only)
- `fork` for PLAN (loses Opus/Fable)
- `completed` based only on build for landings
- SDD-style multi-phase pipelines on top of the starter (duplication)

---

## Close — gates

| Gate | When |
|------|------|
| `spec` | Technical criteria from the handoff |
| `craft` | creative-brief-bar / CRAFT-BAR |
| `assets` | External URLs 2xx |
| `verify` | Light stack — criteria vs diff |

`verify: fail` or `craft: fail` → **`status: partial`**
