# Changelog — Baking-AI

Format based on [Keep a Changelog](https://keepachangelog.com/). Versioned in `VERSION` and `config.json` → `bakingVersion`.

## [1.10.0] — 2026-09-16

### Changed

- **Repo home** — canonical path `~/Desktop/side/baking` (override with **`BAKING_HOME`**). Removed `~/.cursor/opus-sonnet/` install mirror; config + docs live in the repo.
- Router rule renamed **`baking-router.mdc`** (replaces `opus-sonnet-router.mdc`).
- `lib/paths.js` — `bakingHome()`, legacy migration deletes old `.cursor/opus-sonnet` on install.

## [1.9.4] — 2026-09-16

### Added

- **DIRECT tier visibility** — orchestrator must announce `⚡ **Baking · DIRECT**` before inline fixes; `exec_agent: direct` in metrics. Distinct from **`⬜ **No Baking** · gate-out`** (no metrics). Source: Lore Forge scratchpad handoff.
- `lib/agent-colors.js` — `directBanner`, `gateOutBanner`.

## [1.9.3] — 2026-09-15

### Changed

- **`usage` scope clarified** — LLM/orchestration cost only (Cursor/Claude Usage). Explicit exclusion of product APIs (Z.ai images, Stripe, AWS, …) in `METRICS.md` and schema.

## [1.9.2] — 2026-09-15

### Changed

- **`usage` required** on every `runs.jsonl` line (`metrics.usageRequired: true` by default). `source: pending` when USD not yet known — never omit the block.

## [1.9.1] — 2026-09-15

### Added

- **`baking-memory.mdc`** — global Cursor rule for Baking Memory protocol (save/search/close).

### Removed

- All third-party memory product references from docs and changelog history wording.
- **`engram-memory.mdc`** — deleted from `~/.cursor/rules/` on `baking install`.

## [1.9.0] — 2026-09-15

### Added

- **Baking Memory** — global cross-session store (`MEMORY.md`): SQLite + FTS5 at `~/.cursor/baking/memory/`, CLI `baking memory save|search|context|status`. Default `lightStack.memory.provider: "baking"`.

### Removed

- Third-party MCP memory as recommended light-stack provider — use `baking memory` (same path for Cursor + Claude Code).

## [1.8.1] — 2026-09-15

### Added

- **Agent colors** — `color` frontmatter on all agents; emoji delegation banners in orchestrator (`AGENTS.md`, `lib/agent-colors.js`).

## [1.8.0] — 2026-09-15

### Added

- **`baking require on|off|status`** — per-repo marker `.cursor/baking/required.json`; implementation must use Baking-AI in that repo (Q&A may gate-out).
- **`baking init-memory --require`** — bootstrap + require marker in one step.
- **`projectRequired`** in config schema · router rule and docs updated.

### Changed

- **Per-project required preferred** over global auto-route; template `autoRoute.enabled: false`.
- Global auto-route documented as fallback only when the repo has no require marker.

## [1.7.2] — 2026-09-15

### Added

- **Gate-out** — router rule, baking skill, and `ROUTER.md` / `routing.md`: classify Q&A vs implementation; optional *"Baking not needed here"*; no handoff/metrics on gate-out.

## [1.7.1] — 2026-09-15

### Changed

- **Project name: Baking-AI** — npm `@admin-zyta/baking-ai`, GitHub `admin-zyta/baking-ai`, CLI `baking-ai` (`baking` remains an alias).
- README and docs use **Baking-AI** as the product name; `/baking` and the `baking` skill unchanged as invocation shortcuts.

## [1.7.0] — 2026-09-15

### Removed

- **Witch** — dropped from light stack, config, skills, and docs (product-specific; did not belong in generic Baking).
- **Boogiepop references** — docs, creative-brief-bar, and npm scope now `@admin-zyta/baking`.

### Changed

- Light stack is **three pieces**: cross-session memory, Verify, skill registry (`LIGHT-STACK.md`).
- npm package renamed `@boogiepop/baking` → `@admin-zyta/baking`.

## [1.6.0] — 2026-09-15

### Added

- **`baking init-memory`** — repo scan → `.cursor/baking/init/` + `AGENTS.md` (create) or audit + **`/init-memory`** skill (PLAN-ONLY + Baking Memory saves).
- **`baking auto-route on|off|status`** — optional toggle: Baking by default on code requests (`autoRoute.enabled` in config).
- **`INIT-MEMORY.md`** · updated gate rule (auto-route + Q&A exclusions).

### Changed

- **Documentation default language: English** — README, `docs/baking-ai/`, specs, skills, agents, router rule; `config.language: "en"`.
- README product-style guide (features, CLI, daily usage).

## [1.5.3] — 2026-09-15

### Added

- **`baking metrics-review`** — automatic routing and savings conclusion when **7 days** or **50 runs** pass since the last review (config `metrics.review`).
- Writes `.cursor/baking/metrics/conclusions/YYYY-MM-DD-cycle-N.md` + `review-state.json`.
- **`baking metrics-review --close-cycle`** — archives `runs.jsonl` to `runs-cycle-N-YYYY-MM-DD.jsonl` and starts a new cycle (no deletion).

## [1.5.2] — 2026-09-15

### Added

- **Baking-AI docs** — `docs/baking-ai/` (README, intended-usage, use-cases, components, routing, quickstart).
- `BAKING-AI.md` index · `baking-ai-docs.html` (Desktop) for reading in parts.

## [1.5.1] — 2026-09-15

### Added

- **Cursor + Claude Code parity** for the light stack: `claude-code/BAKING.md`, Claude agents/skills, `executor` verify, `consumption.md`, `ROUTER.md`.
- Light stack doctor checks memory provider + skill registry paths.
- Metrics: `outcome.scores.verify` in the schema.

## [1.5.0] — 2026-09-15

### Added

- **Light stack** (`config.lightStack`, `LIGHT-STACK.md`): cross-session memory + handoff-vs-diff verify + Boogiepop Witch + lightweight skill registry.
- **`baking skill-registry`** — generates `~/.cursor/baking/skill-registry.md` from installed skills.
- **`baking doctor`** — reports Baking Memory (when enabled) and registry age.
- Closing YAML: `verify: pass | partial | fail | skipped` field.
- Planner: note in "Done criteria" for verify at Baking close.

### Usage

- Memory hooks in the Baking skill (`baking memory …` when provider is `baking`).
- Registry: `baking skill-registry` (weekly or `--force`).

## [1.4.1] — 2026-09-14

### Fixed

- **Closing metrics weren't being written after a hot update** — `consumption.md` documents the
  real case: the orchestrator stopped rereading `SKILL.md` after a mid-session version bump and
  kept orchestrating from memory, without seeing the `runs.jsonl` requirement again (in effect
  since 1.2.0). New rule: reread `SKILL.md`/`BAKING.md`/`METRICS.md` when the harness reports
  new agents/skills available, don't assume the workflow is still the same.

### Evidence

- lore-forge session, 2026-09-14: baking went from v1.1.0 to v1.4.0 in the same session; ~15 runs
  of `planner-hyper`/`executor`/`executor-mecanic` with not a single metrics line, only detected
  when the user asked directly "is the JSON being generated?".

[1.4.1]: https://github.com/admin-zyta/baking/releases/tag/v1.4.1

## [1.4.0] — 2026-09-14

### Added

- **Cost metrics** — optional `usage` fields (tokens, `total_usd`, `source`) and
  `benchmark` (`scenario_id`, `arm`, `pair_id`) in `metrics.schema.json` / `METRICS.md`.
- **`baking metrics-summary`** — compares paired arms (S0 vs S3) and computes `savings_pct`.

[1.4.0]: https://github.com/admin-zyta/baking/releases/tag/v1.4.0

## [1.3.1] — 2026-09-14

### Fixed

- **`planner-hyper`** in Cursor — alias in `global/cursor/agents/planner-hyper.md` (Task no longer fails if Baking invokes `planner-hyper` instead of `planner-hyper-cursor`).
- **`baking doctor`** — verifies agents in `~/.cursor/agents/` and `~/.claude/agents/`.
- **`AGENTS.md`** — exact name table; clarifies that **`executor-mecanic` doesn't exist in Cursor**.

[1.3.1]: https://github.com/admin-zyta/baking/releases/tag/v1.3.1

## [1.3.0] — 2026-09-13

### Added

- **npm `@boogiepop/baking`** — `npx @boogiepop/baking install` deploys skills, agents, rules, and global config (see `NPM.md`).

### Added (Hyper)

- **`planner-hyper`** (Claude Code) and **`planner-hyper-cursor`** (Cursor) — deep plan with **Fable**
  (`claude-fable-5[effort=high]`).
- **PLAN-DEEP** routing: explicit (*hyper*, *plan deep*, *think it through*) or automatic (≥2 signals:
  architecture, creative-brief, ambiguity, >3 files).
- Config `profiles.*.plannerHyper` + metrics `plan_agent: hyper`, `plan_mode: explicit-deep|…`.

[1.3.0]: https://github.com/local/baking/releases/tag/v1.3.0

## [1.2.0] — 2026-09-13

### Added

- **JSONL metrics** — Baking appends to `.cursor/baking/metrics/runs.jsonl` per run:
  `prompt`, agents, models, signals, `review.plan_fit` / `exec_fit` (`METRICS.md`,
  `metrics.schema.json`, config `metrics.enabled`).
- `plan_agent: hyper` prepared in the schema for a future `planner-hyper`.

[1.2.0]: https://github.com/local/baking/releases/tag/v1.2.0

## [1.1.1] — 2026-09-12

### Added

- **`executor-mecanic`** — fixed Haiku subagent (`model: haiku` in frontmatter) for
  mechanical steps with a handoff (rename, doc-only, trivial wiring). Replaces the
  unreliable `model: haiku` override on the Agent call.
- EXECUTE ladder: direct TRIVIAL → mecanic → executor → fork.
- Closing YAML: `exec_agent: mecanic | executor | fork | direct`.

[1.1.1]: https://github.com/local/baking/releases/tag/v1.1.1

## [1.1.0] — 2026-09-12

### Added

- **Cheap executor for mechanical tasks** — `model: "haiku"` (Claude Code) instead of the
  profile's default Sonnet for rename/loose field/doc-only/verification with no design (`claude-code/BAKING.md`,
  `consumption.md`)
- **Suggest `/compact` when closing** a task (`status: completed`), `/clear` if the next request
  is an unrelated topic (`claude-code/BAKING.md`, `consumption.md`)
- **Automatic retry on subagent infrastructure failure** (stream watchdog, not a content
  failure) — relaunch the same request on the same handoff without escalating to the user, unless
  it fails again (`consumption.md`)

### Evidence

- 24h usage report (lore-forge session, 2026-09-12): 84% subagent-heavy, 84% sessions 8h+, 74%
  usage at >150k context
- `planner` stalled by the stream watchdog after only reading the handoff, without writing
  anything — a manual retry on the same intact handoff resolved it on the second attempt

[1.1.0]: https://github.com/local/baking/releases/tag/v1.1.0

## [1.0.0] — 2026-09-12

First versioned release. Repo: `~/Desktop/side/baking/`.

### Added

- **Git + VERSION** — versioned source of truth; deploy with `sync-global.ps1`
- **Single global config** — `~/Desktop/side/baking/config.json` (no per-project install)
- **Baking orchestrator** — `/baking`, skills, and agents in Cursor + Claude Code
- **PLAN-ONLY / PLAN-REVISE** — plan and follow up without an executor until explicitly requested
- **Closure gates** — `spec` / `craft` / `assets` scores; build ≠ completed
- **creative-brief-bar** — prod+spec+craft, asset verification, anti-fork
- **fork vs executor** (Claude Code) — rules in `consumption.md` and `claude-code/BAKING.md`
- **Profiles** — `cursor` | `hybrid` | `claude` in global config

### Deprecated

- `/init-baking`, `enable-project.ps1`, per-repo config (`.cursor/opus-sonnet.json`, `.claude/planner-executor.json`)

### Evidence

- Yoga bench v0.0.4 — `starter-base/docs/BAKING-IMPROVEMENTS.md`
- S5 / Stillwater — creative-brief-bar

[1.0.0]: https://github.com/local/baking/releases/tag/v1.0.0
