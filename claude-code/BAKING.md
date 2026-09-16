# Baking — Claude Code (full reference)

Orchestrator: **Sonnet**. Planner: **Opus** or **Hyper (Fable)**. Executor: **Sonnet** or **Mecanic (Haiku)**. Handoff: `.cursor/handoff/`.

Also read: `~/.cursor/opus-sonnet/ROUTER.md`, `consumption.md`, `creative-brief-bar.md`.

---

## Bootstrap (handoff only)

Baking is **100% global**. Config in `~/.cursor/opus-sonnet/config.json` (`claude` profile for Claude Code end-to-end).

Only create **`.cursor/handoff/`** in the workspace if missing. **No** `.claude/planner-executor.json`.

---

## Step 0 — Classify

| Type | Signals |
|------|---------|
| **EXECUTE-MECANIC** | rename, typo, doc-only, a single field, trivial wiring, simple verify; handoff with no craft/visual/assets | → **`executor-mecanic`** (Haiku) |
| **EXECUTE** | logic, multi-file, craft, assets, landing, schema | → **`executor`** (Sonnet) or **`fork`** |
| **PLAN** | architecture, multi-file, ambiguity, landing/portfolio/vibe |
| **PLAN-ONLY** | "plan only", "don't execute", "just plan", "ask before doing anything" | → planner, **without executor** |
| **PLAN-REVISE** | follow-up question / "change the plan" with an existing handoff | → planner updates it or Baking answers from the handoff |
| **TRIVIAL** | 2–3 commands, one obvious action | → **direct** — announce `⚡ **Baking · DIRECT**` before editing; metrics `exec_agent: direct` |

When in doubt → **PLAN**. If they ask for a plan with no code → **PLAN-ONLY**.

### Visibility — DIRECT vs GATE-OUT

| Outcome | First line | Metrics |
|---------|------------|---------|
| Gate-out | `⬜ **No Baking** · gate-out` | None |
| **Direct** | `⚡ **Baking · DIRECT** · orchestrator resolves (no subagent)` | YAML + JSONL |
| Delegate | emoji banner per `AGENTS.md` | YAML + JSONL |

### Light stack (v1.5 — Cursor and Claude Code)

If `lightStack.enabled` → **`LIGHT-STACK.md`**. Same global config; `runtime` in metrics distinguishes the environment.

| Piece | When | Action |
|-------|--------|--------|
| **Baking Memory** | Non-trivial start | `baking memory context --query "…"` + `baking memory search "…"` |
| **Baking Memory** | Close | `baking memory save --title "Session summary" --body "…"` (5 bullets) |
| **Skill registry** | Request matches a skill | Read one `SKILL.md` from `~/.cursor/baking/skill-registry.md` |
| **Verify** | Post-EXECUTE | Handoff criteria vs `git diff` → `## Verify` + YAML |

Skip verify: `TRIVIAL`, `PLAN-ONLY`. `verify: fail` → `status: partial`.

Claude Code: verify can be done by the **orchestrator** at close (no SDD subagent needed). Executor/fork append `## Verify` if they implemented anything.

### PLAN-DEEP → `planner-hyper` (Fable)

**Explicit (always wins):** *"plan deep"*, *"hyper"*, *"think it through"*, *"deep plan"* → **`planner-hyper`**, `plan_mode: explicit-deep`.

**Explicit normal:** *"simple plan"*, *"quick plan"* → **`planner`** (Opus), `plan_mode: explicit-normal`.

**Automatic** → **`planner-hyper`** if **≥2 signals**:

- architecture, migration, comparing options / trade-offs
- creative-brief-bar (landing, portfolio, vibe, visual)
- strategic PLAN-ONLY
- >3 files with no prior handoff
- high ambiguity

**Automatic** → **`planner`** (Opus) if the plan is narrow, a fix with a plan, or a minor PLAN-REVISE.

**Never `fork`** for planning.

---

## Step 1 — PLAN

| Routing | Subagent | Model |
|---------|-----------|--------|
| PLAN-DEEP | **`planner-hyper`** | Fable |
| Normal PLAN | **`planner`** | Opus |

Prompt (both):

- The user's **full** request (don't shorten the visual brief).
- Handoff using the `~/.cursor/agents/planner.md` template.
- If it's a creative brief → **"include creative-brief-bar"** + **prod+spec+craft** (+ visual if the repo has visual bars).
- Assets table if there are external URLs.

Wait for the **exact path** of the `.md`. Blocking questions → ask the user before EXECUTE.

---

## PLAN-ONLY mode (no execution)

**Signals:** "plan only", "don't execute", "just plan", "ask and follow up".

1. Agent → **`planner`** or **`planner-hyper`** — **never `fork`**.
2. **Do not** call `executor` or `fork` to implement. **Do not** edit `src/`.
3. Present the handoff + **Open questions**. Wait for follow-up questions or "execute".

**Follow-up questions:** minor clarification → Baking answers from the handoff; plan change → **`planner`** updates the same `.md`.

**EXECUTE** only if the user explicitly asks ("execute", "implement", "go ahead").

Close: `flow: PLAN-ONLY`, `exec_mode: skipped`, `status: plan-ready | blocked-on-questions`.

---

## Step 2 — EXECUTE (only if applicable)

**Cost ladder:** direct TRIVIAL → **mecanic** (Haiku) → **executor** (Sonnet) → **fork** (session).

Before delegating, does the task depend on context **already loaded in this session**?

| Signal | Mode | How |
|-------|------|------|
| 2–3 commands, one obvious action | **direct** | you, no subagent |
| Mechanical with a handoff (no craft/assets/visual) | **`executor-mecanic`** | Agent → **path only** for the handoff |
| Login/port/token/process already obtained here | **`fork`** | Agent → fork |
| Files already read; iterative debugging | **`fork`** | same |
| Logic, craft, assets, landing, schema | **`executor`** | Agent → **path only** for the handoff |
| Self-contained handoff; isolate context | **`executor`** or **`executor-mecanic`** per the table above | same |

**Golden rule:** self-contained handoff → a fresh agent is fine. If it depends on session context → **`fork`**. Don't use **`executor-mecanic`** if the handoff calls for creative-brief-bar, asset verify, or VISUAL-BAR.

**`executor-mecanic`** prompt (path only):

```text
Implement the mechanical steps per: .cursor/handoff/YYYY-MM-DD-slug.md
Read it first. If it's not mechanical, stop and ask the parent for a Sonnet executor.
Append ## Execution to the same file.
```

**`executor`** prompt (path only):

```text
Implement per: .cursor/handoff/YYYY-MM-DD-slug.md
First step: Read that file. Append ## Execution to the same file.
Verify: technical checklist, creative-brief-bar, CRAFT-BAR if it exists, asset verification (2xx).
Anti-fork: don't copy src/ from previous apps.
```

**`fork`** prompt:

```text
[Minimal context if needed: what we already found out]
Implement per the handoff: <path> (Read it first).
Or: [concrete task using session context]
Append ## Execution to the handoff if applicable.
```

---

## Creative brief (creative-brief-bar)

Signals: landing, portfolio, vibe, palette, typography, motion, "feels like", editorial copy.

Default mode: **prod + spec + craft**.

1. PLAN + planner with creative-brief-bar.
2. Executor: asset verification (2xx) + craft bar + anti-fork (don't copy previous `src/`).
3. Post-exec: build OK **≠** completed if craft or assets fail.

---

## Step 3 — Close (mandatory gates)

`npm run build` **≠** completed on creative tasks.

```yaml
baking:
  version: "1.5.1"   # config.bakingVersion
  handoff: .cursor/handoff/YYYY-MM-DD-slug.md
  flow: PLAN+EXECUTE | PLAN-ONLY | EXECUTE | TRIVIAL
  plan_agent: planner | hyper | skipped
  plan_mode: auto | explicit-deep | explicit-normal | explicit-only | skipped
  exec_agent: mecanic | executor | fork | direct
  scores:
    spec: pass | partial | fail
    craft: pass | partial | fail
    assets: pass | fail
  verify: pass | partial | fail | skipped
  status: completed | partial | blocked
  models: { planner: opus|fable, exec: haiku|sonnet|fork-parent }
```

**Rules:** partial if craft/assets/verify fail; never completed with `assets: fail` or **`verify: fail`**.

**Fork note:** `fork` (Agent tool) reuses session context — fine for debugging. It is **forbidden** to use fork/copy to paste `src/` from another app (invalid bench).

**Suggest `/compact` when closing** (`status: completed`), especially if it's already the 2nd+ task
closed in the session — the on-disk handoff already preserves plan + execution, compacting loses
nothing durable. If the user starts an unrelated topic, suggest `/clear` instead of `/compact`.
Evidence: the user's 24h usage report — *"74% of your usage was at >150k context... /compact
mid-task, /clear when switching to new tasks"*.

Brief message to the user + handoff path.

---

## Step 4 — Metrics (mandatory)

Read **`~/.cursor/opus-sonnet/METRICS.md`**. Append **one JSON line** to:

`<metrics.dir>/runs.jsonl` (default `.cursor/baking/metrics/runs.jsonl`)

Create the folder if missing. Respect `metrics.enabled` in config (default true).

Fill in an honest **`review`** (see METRICS.md). **`usage` is required** on every line — `total_usd` from Usage, or `source: pending`. Bench runs: add **`benchmark`** + paired **`usage.total_usd`**.

Example (routing + cost bench):

```json
{"ts":"2026-09-14T16:00:00-03:00","bakingVersion":"1.4.0","runtime":"claude-code","profile":"claude","prompt":"…","handoff":".cursor/handoff/….md","classification":{"flow":"PLAN+EXECUTE","plan_agent":"planner","exec_agent":"mecanic","plan_mode":"auto","exec_mode":"auto"},"models":{"orchestrator":"sonnet","planner":"opus","executor":"haiku"},"signals":["mechanical"],"benchmark":{"scenario_id":"S3-plan-complex","arm":"baking","pair_id":"stream-plans-s3-badge"},"usage":{"total_usd":0.35,"total_tokens":95000,"source":"manual"},"outcome":{"status":"completed","scores":{"spec":"pass"}},"review":{"plan_fit":"good","exec_fit":"good","note":""}}
```

---

## Anti-patterns

- Paraphrasing the plan to the executor (path only).
- Opus in the main chat.
- `fork` for PLAN (loses Opus).
- Sonnet `executor` for mechanical work with a handoff (use **`executor-mecanic`**).
- `executor-mecanic` on landings / craft / assets (use **`executor`**).
- Marking as completed based only on `build` for creative briefs.

---

## Evidence

- lore-forge 2026-09-11: a fresh executor spent 38.6k tokens re-reading context → use **fork** in iterative EXECUTE.
- S5 yoga/studio: build OK, poor UI → **creative-brief-bar** made mandatory.
- Bench runs: spec OK / craft weak / broken asset URLs → scores + asset verify in the handoff.
