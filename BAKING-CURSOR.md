# Baking — Cursor (full reference)

Orchestrator: **Composer 2.5**. Planner: **Opus 5** / **Hyper (Fable)** / Grok (hybrid). Executor: **Composer 2.5** (`executor-cursor`). Handoff: `.cursor/handoff/`.

Also read: `ROUTER.md`, `consumption.md`, `creative-brief-bar.md`.

---

## Bootstrap (handoff only)

Baking is **100% global**. Config in `~/.cursor/opus-sonnet/config.json`.

In each workspace, only make sure **`.cursor/handoff/`** (diary) exists. **Do not** create `.cursor/opus-sonnet.json` or copy agents into the repo.

Global subagents: `~/.cursor/agents/` (planner, planner-hyper-cursor, planner-cursor, executor-cursor, baking).

---

## Step 0 — Classify

| Type | Signals |
|------|---------|
| **EXECUTE** | typo, color, rename, one file, obvious stack trace, handoff already exists |
| **PLAN** | architecture, multi-file, ambiguity, landing/portfolio/vibe |
| **PLAN-ONLY** | "plan only", "don't execute", "just plan", "ask before doing anything", "just research/design" | → planner, **without executor** |
| **PLAN-REVISE** | follow-up question about an existing handoff, "change the plan", "add to the plan" | → planner updates the same `.md`, or Baking answers from the handoff |
| **TRIVIAL** | 2–3 commands, status check, copy/one-field fix | → **DIRECT**: orchestrator resolves — announce `⚡ **Baking · DIRECT**` · metrics `exec_agent: direct` |

When in doubt → **PLAN**. If they ask for a plan with no code → **PLAN-ONLY** (don't infer EXECUTE afterward).

### Visibility — DIRECT vs GATE-OUT

| Outcome | Announce **before** acting | Metrics |
|---------|---------------------------|---------|
| Gate-out (no Baking) | `⬜ **No Baking** · gate-out` | None |
| **Direct** (Baking, no subagent) | `⚡ **Baking · DIRECT** · orchestrator resolves (no subagent)` | YAML + JSONL `exec_agent: direct` |
| Delegate | `🩵 **Baking → …**` per `AGENTS.md` | YAML + JSONL |

**Direct ≠ silent edit.** Users must see that Baking ran at its lowest tier.

### Light stack (v1.5 — lightweight)

If `lightStack.enabled` in config → **`LIGHT-STACK.md`**. Three hooks, minimal usage:

| Piece | When | Action |
|-------|--------|--------|
| **Baking memory** | Non-trivial start | `baking memory context/search` |
| **Baking memory** | Close | `baking memory save` (session summary) |
| **Skill registry** | If the request matches a skill | Read `~/.cursor/baking/skill-registry.md` → Read only that SKILL.md |
| **Verify** | Post-EXECUTE | Handoff criteria vs `git diff` → `## Verify` + YAML `verify:` |

Skip verify on `TRIVIAL` / `PLAN-ONLY`. `verify: fail` → `status: partial`.

Refresh registry: `baking skill-registry` (weekly or when adding skills).

### PLAN-DEEP → `planner-hyper-cursor` (Fable)

**Explicit:** *"plan deep"*, *"hyper"*, *"think it through"*, *"deep plan"* → **`planner-hyper-cursor`**, `plan_mode: explicit-deep`.

**Explicit normal:** *"simple plan"*, *"quick plan"* → **`planner`** (Opus) or **`planner-cursor`** (Grok in `hybrid` profile), `plan_mode: explicit-normal`.

**Automatic** → **`planner-hyper-cursor`** if **≥2 signals**: architecture/migration/trade-offs; creative-brief-bar; strategic PLAN-ONLY; >3 files with no handoff; high ambiguity.

**Automatic** → regular planner if the plan is narrow or it's a minor PLAN-REVISE.

---

## Step 1 — PLAN

| Routing | Subagent (profile) | Model |
|---------|-------------------|--------|
| PLAN-DEEP | **`planner-hyper-cursor`** | Fable |
| Normal PLAN | **`planner`** (`cursor`/`claude`) or **`planner-cursor`** (`hybrid`) | Opus / Grok |

Task → fresh subagent. **Cursor fallback:** if Task doesn't expose the subagent, the parent writes the handoff using the `~/.cursor/agents/planner.md` template + full **creative-brief-bar**.

Prompt (both tiers):

- The user's **full** request (don't shorten the visual brief).
- Handoff in `handoffDir` with the `~/.cursor/agents/planner.md` template.
- If it's a creative brief → **"include creative-brief-bar"** + **prod+spec+craft** mode.
- Assets table if there are external URLs; `verify before ship`.

Wait for the **exact path** of the `.md`. Blocking questions → ask the user before EXECUTE.

---

## PLAN-ONLY mode (no execution)

**Signals:** "plan only", "don't execute", "just plan", "ask and follow up", "design/architecture only".

1. Task → **`planner`**, **`planner-hyper-cursor`**, or **`planner-cursor`** (per routing).
2. **Do not** call `executor-cursor`. **Do not** edit `src/`.
3. Present to the user: handoff path, summary, the plan's **Open questions**.
4. Close:

```yaml
baking:
  flow: PLAN-ONLY
  exec_mode: skipped
  status: plan-ready | blocked-on-questions
```

**Follow-up questions from the user:**

| Type | Action |
|------|--------|
| Minor clarification (reading the handoff is enough) | Baking answers directly — **no** subagents |
| Scope change, options, creative sections | Task → **`planner`**: "Update `<path>` — …" |
| "Execute", "implement", "go ahead" | Move to **EXECUTE** with the existing handoff |

Until the user explicitly asks to execute → **never** delegate to the executor.

---

## Step 2 — EXECUTE

Task → **`executor-cursor`** subagent (Composer 2.5).

To the executor: **only the path** of the handoff — never paraphrase the plan.

```text
Implement per: .cursor/handoff/YYYY-MM-DD-slug.md
First step: Read that file. Append ## Execution to the same file.
Verify: technical checklist, creative-brief-bar, CRAFT-BAR if it exists, asset verification (2xx).
Anti-fork: don't copy src/ from previous apps.
```

Trivial post-plan → resolve directly, no subagent.

**Cursor note:** there's no `fork` like in Claude Code. If the executor needs session context, include it in the handoff or delegate with a minimal context prompt — don't re-summarize the whole plan.

---

## Creative brief (creative-brief-bar)

Signals: landing, portfolio, vibe, palette, typography, motion, editorial copy.

Default mode: **prod + spec + craft**. Build OK **≠** completed.

Before closing, evaluate scores in the handoff (the executor must have run asset verify).

---

## Step 3 — Close (mandatory gates)

`npm run build` **≠** completed on creative tasks.

```yaml
baking:
  version: "1.5.1"   # config.bakingVersion
  handoff: .cursor/handoff/YYYY-MM-DD-slug.md
  flow: PLAN+EXECUTE | PLAN-ONLY | PLAN-REVISE | EXECUTE | TRIVIAL
  plan_agent: planner | hyper | skipped
  plan_mode: auto | explicit-deep | explicit-normal | explicit-only | skipped
  exec_mode: executor-cursor | direct
  scores:
    spec: pass | partial | fail
    craft: pass | partial | fail
    assets: pass | fail
  verify: pass | partial | fail | skipped
  status: completed | partial | blocked
  models: { planner: opus-5|fable|grok, executor: composer-2.5 }
```

**Close rules:**

- **partial** if build OK but `craft: partial|fail`, `assets: fail`, or **`verify: fail|partial`**
- **never completed** with `assets: fail`
- **never completed** on a creative landing without reviewing the craft bar (handoff or `docs/CRAFT-BAR.md`)

Brief message to the user + handoff path.

---

## Step 4 — Metrics (mandatory)

`METRICS.md` — append a JSONL line to `.cursor/baking/metrics/runs.jsonl`. Include `prompt`, agents, `models`, `signals`, `review`, and **`usage`** (required). **`usage.total_usd`** from Usage when possible; else `source: pending`. Bench: `benchmark` + paired `total_usd`. Summary: `baking metrics-summary`.

`runtime: cursor`. Same self-assessment as Claude Code.

---

Runs that copy `src/` from previous apps or use fork to paste code are **not valid controls** — exclude them from comparison or flag it in the handoff.

Evidence: bench runs with spec OK / craft weak / broken asset URLs → scores + asset verify in the handoff.

---

## Anti-patterns

- Paraphrasing the plan to the executor (path only).
- Opus in the main chat (planner subagent only).
- Marking as completed based only on `build` for creative briefs.
- Copying subagents into the repo (they're already global).
- Creating a per-project `.cursor/opus-sonnet.json` (config is global).
