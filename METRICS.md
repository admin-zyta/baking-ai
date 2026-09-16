# Baking — routing and cost metrics

Append-only file per workspace for:

1. **Routing** — was planner / hyper / mecanic / executor the right call for the request?
2. **Cost** — do we pay less than baseline (S0 vs S3, parent Opus vs Baking)?

## Location

Default: **`.cursor/baking/metrics/runs.jsonl`** (one JSON line per run).

Config: `metrics.dir` and `metrics.enabled` in `~/Desktop/side/baking/config.json`.

Bootstrap: Baking creates the folder if it's missing (like `handoff/`).

## When to write

**Mandatory** at the close of **any** Baking run (PLAN-ONLY included), after the YAML shown to the user.

Use **Write** or append (Bash) — don't skip it out of laziness.

## Format (one line = one run)

See `metrics.schema.json`. Key fields:

| Field | What it's for |
|-------|----------|
| `prompt` | Original request (full or truncated to 2k chars) |
| `classification.flow` | PLAN+EXECUTE, PLAN-ONLY, TRIVIAL, … |
| `classification.plan_agent` | `planner` \| `hyper` \| `skipped` |
| `classification.exec_agent` | `mecanic` \| `executor` \| `fork` \| `direct` \| `skipped` |
| `classification.plan_mode` | `auto` \| `explicit-deep` \| `explicit-normal` \| `explicit-only` |
| `models.*` | **Actual** model used (orchestrator, planner, executor) |
| `signals` | Signals that triggered the classification |
| `review.plan_fit` | `good` \| `overkill` \| `underkill` \| `n/a` |
| `review.exec_fit` | same |
| `review.note` | One line — to improve the rules |
| **`benchmark.scenario_id`** | Optional — `S0-baseline`, `S3-plan-complex`, … |
| **`benchmark.arm`** | `baseline` \| `baking` \| `opus-parent` |
| **`benchmark.pair_id`** | Same ID on both arms of the **same prompt** |
| **`usage`** | **Required** — `total_usd` + `source: manual` when known; else `source: pending` + note |
| **`usage.total_usd`** | **LLM/orchestration only** — Cursor or Claude Code Usage for this run |
| **`usage.total_tokens`** | Optional detail — or sum of in/out tokens per layer |
| **`usage.source`** | `manual` \| `transcript` \| `usage_export` \| **`pending`** (backfill before metrics-review) |
| **`outcome.scores.verify`** | `pass` \| `partial` \| `fail` \| `skipped` — light stack handoff vs diff |
| **`runtime`** | `cursor` \| `claude-code` — same light stack, different environment |

## Cost (required — not optional)

Every JSONL line **must** include a **`usage`** object (`metrics.usageRequired: true` by default).

Cursor and Claude Code **do not** expose per-run USD to the orchestrator automatically. At close:

1. Check **Usage** in the IDE (or export) for this run's cost.
2. Write `"usage": { "total_usd": 0.42, "total_tokens": 185000, "source": "manual" }`.
3. If you cannot read cost yet → `"usage": { "total_usd": null, "source": "pending", "notes": "backfill from Usage" }` — **never omit `usage`.**

### What does **not** belong in `usage`

**Never** put product or third-party API spend here — those have their own ledgers in the app:

| Exclude from `usage.total_usd` | Track instead in |
|--------------------------------|------------------|
| Image APIs (Z.ai, Gemini images, DALL·E, …) | App ledger (`imagen_generaciones`, `gastoAcumuladoUsd`, …) |
| Stripe, SES, external SaaS | Billing / infra metrics |
| AWS, Turso, etc. | Cloud cost tools |

Baking `usage` measures **orchestrator + planner + executor token cost** (the routing savings story). Mixing in Z.ai or similar makes `metrics-summary` and bench pairs meaningless.

Bench pairs (S0 vs S3) still need **`benchmark.pair_id`** + **`total_usd`** (LLM only) on both arms before `metrics-review` can prove savings.

## Cost and benchmark

To claim **"we saved X%"** you need `usage.total_usd` (and `benchmark` to pair runs).

### S0 vs S3 (same prompt, two arms)

| Run | `benchmark.scenario_id` | `benchmark.arm` | `benchmark.pair_id` |
|---------|-------------------------|-----------------|---------------------|
| Without router (Opus/Composer the whole chat) | `S0-baseline` | `baseline` or `opus-parent` | `stream-plans-s3-badge` |
| With Baking | `S3-plan-complex` | `baking` | **`stream-plans-s3-badge`** (same) |

After closing, copy the cost from **Cursor Usage** or **Claude Code usage** → `usage.total_usd`, `source: "manual"`.

### Example line with cost

```json
{
  "ts": "2026-09-14T16:00:00-03:00",
  "bakingVersion": "1.4.0",
  "runtime": "claude-code",
  "profile": "claude",
  "prompt": "Add Most popular badge to PlanCard…",
  "handoff": ".cursor/handoff/2026-09-14-badge.md",
  "classification": { "flow": "PLAN+EXECUTE", "plan_agent": "planner", "exec_agent": "executor", "plan_mode": "auto", "exec_mode": "auto" },
  "models": { "orchestrator": "sonnet", "planner": "opus", "executor": "sonnet" },
  "signals": ["multi_file"],
  "benchmark": { "scenario_id": "S3-plan-complex", "arm": "baking", "pair_id": "stream-plans-s3-badge" },
  "usage": { "total_usd": 0.42, "total_tokens": 185000, "planner_tokens_in": 12000, "planner_tokens_out": 8000, "executor_tokens_in": 90000, "executor_tokens_out": 75000, "source": "manual", "notes": "Usage Claude 24h export" },
  "outcome": { "status": "completed", "scores": { "spec": "pass" } },
  "review": { "plan_fit": "good", "exec_fit": "good", "note": "" }
}
```

**Baseline** (S0): same structure, `"arm": "baseline"`, `"scenario_id": "S0-baseline"`, same `pair_id`, `total_usd` typically higher.

### Savings summary (CLI)

From the project root (where `.cursor/baking/metrics/runs.jsonl` lives):

```bash
baking metrics-summary
# or
node ~/Desktop/side/baking/bin/baking.js metrics-summary .cursor/baking/metrics/runs.jsonl
```

Prints averages per scenario/arm and **savings_pct** per `pair_id` when both have `usage.total_usd`.

## `review` self-assessment (Baking at close)

| Situation | plan_fit | exec_fit |
|-----------|----------|----------|
| Creative PLAN / architecture with `planner` when ≥2 deep signals | `underkill` | — |
| Architecture with `hyper` for a narrow typo/fix | `overkill` | — |
| Trivial with a subagent | — | `overkill` |
| Mechanical task with `executor` Sonnet | — | `overkill` |
| Craft/landing with `mecanic` | — | `underkill` |
| Routing per the BAKING.md table | `good` | `good` |
| PLAN-ONLY / no exec | `good` or evaluate the plan | `n/a` |

When **`planner-hyper`** exists: `underkill` = should have gone hyper; `overkill` = should have gone regular planner.

Typical deep signals in `signals`: `architecture`, `creative_brief`, `multi_file`, `strategic_only`, `explicit_plan_deep`.

## Analysis (offline)

```powershell
Get-Content .cursor/baking/metrics/runs.jsonl | ForEach-Object { $_ | ConvertFrom-Json } |
  Group-Object { $_.classification.exec_agent } | Select Name, Count

# underkill plan_fit
Get-Content .cursor/baking/metrics/runs.jsonl | ForEach-Object { $_ | ConvertFrom-Json } |
  Where-Object { $_.review.plan_fit -eq 'underkill' } | Select prompt, signals
```

AI-flow bench: copy `runs.jsonl` to `AI-flow/runs/<scenario>/exports/metrics.jsonl`.

## Conclusion cycle (routing + savings)

**Trigger:** every **7 days** *or* every **50 runs** since the last conclusion (whichever comes first). Config in `metrics.review` (`~/Desktop/side/baking/config.json`).

| Command | What it does |
|---------|----------|
| `baking metrics-review --status` | How much is left until the next conclusion |
| `baking metrics-review` | If due, generates a conclusion in `conclusions/` |
| `baking metrics-review --force` | Conclusion even if the threshold hasn't been reached |
| `baking metrics-review --close-cycle` | Archives the JSONL and restarts the cycle (after the goal is met) |

**Default thresholds ("goal met" conclusion):**

| Dimension | Criterion |
|-----------|----------|
| Routing | ≤10% underkill/overkill in a sample of the last 20 runs → `ROUTING_OK` |
| Savings | ≥3 bench pairs with ≥25% savings and `usage.total_usd` on both arms → `SAVINGS_PROVEN` |

If routing is OK but there's no cost bench → conclusion is still generated, verdict `NO_BENCH_DATA`.

**Don't delete** the JSONL when closing — archive with `--close-cycle`. The `.md` conclusions are the readable summary; the archived JSONL is the evidence.

## Privacy

`prompt` may contain repo data — don't commit it to a public git repo without reviewing. Add `.cursor/baking/metrics/` to the project's `.gitignore` if needed.
