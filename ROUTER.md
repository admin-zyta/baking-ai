# Opus → Sonnet Router (automatic mode)

Cost orchestrator: **Opus plans**, **Sonnet executes**. Every run leaves a persistent **diary**.

## Active configuration

1. Read **`~/Desktop/side/baking/config.json`** (global — single source).
2. There is **no** per-project `.cursor/opus-sonnet.json`; don't mix local overrides.
3. Resolve the active **profile** from global `profile` (default `cursor`).
4. Load `planner`, `plannerHyper`, `executor`, and `orchestrator` from `profiles[<profile>]`.
5. Use `handoffDir`, subagents, and `consumption` flags from the global config.

If `enabled` is not `true`, **do not apply** this router (invoke `/baking` manually).

## Per-project required (preferred)

Marker: **`.cursor/baking/required.json`** with `"bakingRequired": true`.

```bash
cd your-repo
baking require on      # implementation must use Baking-AI in this repo
baking require off
baking require status
```

| Marker | Implementation | Q&A |
|--------|----------------|-----|
| **yes** | **BAKING mandatory** | GATE-OUT OK |
| **no** | Baking only if `/baking`, *use baking*, or global `autoRoute` | GATE-OUT unless explicit |

`baking init-memory --require` creates the marker while bootstrapping the repo.

Global **`autoRoute`** is a fallback for **all** repos without a marker — prefer **`require on`** per project instead.

**Auto-route (optional, global fallback):** if `autoRoute.enabled` is `true`, apply this router on implementation when the repo has **no** require marker.

## Gate-out (before Baking)

Classify every message **before** planner/executor/handoff/metrics:

| Class | Trigger | Action |
|-------|---------|--------|
| **GATE-OUT** | Q&A, explain, review-only, opinion, status — **no** code change requested | Normal reply. Optional: *"Baking not needed here."* No subagents, handoff, YAML, or JSONL. |
| **BAKING** | implement / fix / refactor / deploy / edit files — or explicit `/baking` / *use baking* | Full router below. |

Explicit **`/baking`** or *use baking* → always **BAKING**, even for PLAN-ONLY.

## Visibility — DIRECT vs GATE-OUT (mandatory)

Users cannot tell "Baking direct" from "Baking not used" unless you announce it **before** acting.

| Outcome | First line in chat | Metrics |
|---------|-------------------|---------|
| **GATE-OUT** | `⬜ **No Baking** · gate-out` (+ optional reason) | **None** |
| **DIRECT** (orchestrator resolves, no subagent) | `⚡ **Baking · DIRECT** · orchestrator resolves (no subagent)` | JSONL with `exec_agent: direct` |
| **Delegate** | `🩵 **Baking → …**` per agent table (`AGENTS.md`) | JSONL with planner/executor |

**Direct** applies to trivial EXECUTE (copy fix, one field, 2–3 commands) when skipping mecanic/executor is cheaper or avoids edit conflicts. Still write YAML + `runs.jsonl` + `usage`.

**Project memory init:** `baking init-memory` + `/init-memory` (Claude `/init` style).

## Light stack (v1.5+)

One config (`lightStack` in `config.json`) for **Cursor and Claude Code**. Details: **`LIGHT-STACK.md`**.

- **Baking memory** — cross-session decisions (`MEMORY.md`, `baking memory …`)
- **Verify** — handoff criteria vs diff at EXECUTE close
- **Skill registry** — `baking skill-registry` → global index

## Model profiles

| Profile | Normal planner | Deep planner (Hyper) | Executor | Billing pool |
|--------|----------------|----------------------|----------|-----------------|
| `claude` | Opus 5 (`planner`) | Fable (`planner-hyper`) | Sonnet (`executor`) | Other Models (Claude) |
| `cursor` | Opus 5 (`planner`) | Fable (`planner-hyper-cursor`) | Composer 2.5 (`executor-cursor`) | Mixed — **default** |
| `hybrid` | Grok 4.6 (`planner-cursor`) | Fable (`planner-hyper-cursor`) | Composer 2.5 (`executor-cursor`) | Cursor Models (no regular Opus plan) |

**Global profile** — edit in `~/Desktop/side/baking/config.json`:

```json
{
  "enabled": true,
  "profile": "cursor"
}
```

**Opus 5 plans + Composer executes:** `"profile": "cursor"` (global default).

**All Cursor pool, no Opus (Grok + Composer):** `"profile": "hybrid"`.

**All Claude:** `"profile": "claude"`.

## Main chat model (orchestrator)

- Use **Composer or Sonnet**, never Opus as the parent (unless the user explicitly asks).
- Suggested models: see `orchestrator.recommendedModels` in config.

## Diary (persistent handoff)

| Field | Value |
|-------|--------|
| Folder | `handoffDir` from config (default `.cursor/handoff/`) |
| Name | `YYYY-MM-DD-<slug>.md` |
| Same-day collision | `-HHmm` or `-2`, `-3` |
| Content | Plan (planner) + `## Execution` (executor) in the **same** file |

Create the folder if it doesn't exist. **Do not delete** old entries.

## Step 0 — Classify

**PLAN** → research, design, compare, architecture, large/ambiguous task, multi-file with no prior handoff.

**EXECUTE** → narrow change, specific fix, plan/handoff already exists **and the user asked to implement**.

**PLAN-DEEP** → explicit (*hyper*, *plan deep*) or ≥2 signals (architecture, creative-brief, ambiguity) → the profile's `plannerHyper` subagent.

**PLAN-ONLY** → "plan only", "don't execute", "just plan", "ask before doing anything" → planner or hyper, **without executor**.

**PLAN-REVISE** → follow-up question or "change the plan" → planner updates the handoff or the orchestrator answers from the `.md`.

Config rules:

- `routing.defaultOnAmbiguity` → default when in doubt (`PLAN` recommended).
- If `consumption.skipPlannerForTrivialTasks` and the request has ≤ `trivialTaskMaxWords` words and is a single obvious action → direct **EXECUTE**.
- If `routing.forcePlanIfNoHandoffExists` and the task is non-trivial and there's no related handoff for the day → **PLAN**.

## Step 1 — PLAN (if applicable)

Delegate to the profile's subagent (`planner`, `planner-cursor`, or `plannerHyper` per PLAN-DEEP routing):

- The user's full request.
- Handoff in `handoffDir` with the full template (see the corresponding planner agent).
- Wait for the file's **exact path**.

Blocking open questions → ask the user. If the request was **PLAN-ONLY** → **stop here**; don't move to EXECUTE until explicitly asked.

## Step 2 — EXECUTE (if applicable — not in PLAN-ONLY)

**Skip** if you classified PLAN-ONLY or the user didn't ask to implement.

Delegate to the profile's subagent (`executor` or `executor-cursor`, per config):

**With a plan:**

```text
Implement per: <exact handoff path>
First step: read that file. When done: append an Execution section to the same file.
```

**Direct execution:**

```text
Direct execution. Minimal handoff in <handoffDir>, implement, append Execution.
Request: [copy the request]
```

Respect `consumption.maxParallelSubagents` (default 2).

## Step 3 — Close

1. Diary path
2. PLAN + EXECUTE or EXECUTE only
3. **[Light]** Verify + YAML `verify:` if there was code (see `LIGHT-STACK.md`)
4. Status: completed | partial | blocked
5. Brief summary
6. **[Light]** `baking memory save` (session summary) if `lightStack.enabled`

## Hard rules

- **Never** paraphrase the plan to the executor: only the **file path**.
- Subagents with `force-default-model: true` in `~/.cursor/agents/`.
- Also apply `~/Desktop/side/baking/consumption.md`.
