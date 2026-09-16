# Consumption — global planner/executor rules

Apply when the router is active (`enabled: true` in **`~/Desktop/side/baking/config.json`** — global, no per-repo overrides). Respect the config's `profile`.

## Cursor pools

| Pool | Typical models | When to use |
|------|-----------------|-------------|
| **Cursor Models** | Composer 2.5, Grok 4.6 | Day-to-day, heavy Agent use; more included in Pro |
| **Other Models** | Claude Opus/Sonnet, GPT, Gemini | Hard plans or `claude` profile |

## By profile

### `cursor` (default — Opus + Composer)

- Orchestrator: **Composer 2.5**
- Planner: **Opus 5** (PLAN only, once)
- Executor: **Composer 2.5**
- Best plan; cheap execution in the Cursor Models pool

### `hybrid` (100% Cursor pool)

- Orchestrator: **Composer 2.5**
- Planner: **Grok 4.6** (not Fast unless urgent)
- Executor: **Composer 2.5**
- Zero Opus; maximum Other Models savings

### `claude`

- Orchestrator: **Composer 2.5** or Sonnet (not Opus)
- Planner: Opus | Executor: Sonnet
- Best end-to-end Claude quality; pricier execution

## Subagents

- **Planner:** PLAN only; don't edit product code except `handoffDir`.
- **Executor:** all product editing.
- Max `maxParallelSubagents` in parallel (default 2).
- In the `cursor` profile, don't use Grok Fast or Composer Fast unless explicitly requested.

## Handoff = savings

- The diary avoids re-explaining context in the chat.
- Pass the **file path**, not the plan content, to the executor.
- Trivial requests (≤12 words, one action): **direct** (Baking, no subagent) — cheaper than mecanic.
- Mechanical steps with a handoff (rename, loose field, doc-only, simple verify, no craft/assets):
  delegate to **`executor-mecanic`** (Haiku fixed in frontmatter — Claude Code). Don't use a `model:`
  override on the Agent call; don't use mecanic if the handoff includes creative-brief-bar / asset verify.
- Logic, craft, landings, schema: **`executor`** (Sonnet). Composer/Grok are already the cheap option in
  Cursor (`executor-cursor`); there, direct TRIVIAL or executor-cursor, no Haiku mecanic.
- When closing a task (`status: completed`), suggest `/compact` — the on-disk handoff already preserves
  plan+execution, nothing is lost. `/clear` if the next request is an unrelated topic.
  Evidence: 24h usage report — 84% subagent-heavy, 74% usage at >150k context.

## When NOT to use a strong planner (Opus/Grok plan)

- Typos, renames, color changes, imports, formatting.
- User says "follow the plan in `.cursor/handoff/...`".
- Bug with a stack trace and an obvious file.

## When to use a strong planner

- Architecture, migrations, "what's the best approach", comparing approaches.
- >3 files with no prior plan.
- In the `hybrid` profile, Grok is enough for many plans; move up to `cursor` if quality falls short.

## Claude Code — `fork` vs a fresh agent (`executor`/`planner`)

Full Baking workflow (Claude Code): **`~/Desktop/side/baking/claude-code/BAKING.md`**.

Only applies to Claude Code: `fork` (the Agent tool's subagent_type) inherits the full context of
the current conversation — it shares the prompt cache, rereads nothing. A fresh `executor`/`planner`
starts cold: if it needs something the orchestrator already established in this session (login
already done, ports/tokens already discovered, files already read), it pays for it again in tokens.

**Real evidence** (lore-forge session, 2026-09-11): a fresh `executor` for "diagnose an encoding
bug" spent 38.6k tokens — largely re-surveying a process and re-reading code the orchestrator
already had at hand. With `fork` that part would have cost ~0.

**Rule:** in Step 2 (EXECUTE), before delegating ask yourself whether the task depends on state that
*this* conversation already has:

| Signal | Delegate to |
|---|---|
| Needs a process/login/port/token the orchestrator already obtained in this session | **`fork`** |
| Needs files the orchestrator already read in this session | **`fork`** |
| The profile requires a different model than the current orchestrator's (e.g. planner on Opus, orchestrator on Sonnet) | fresh `planner`/`executor` — `fork` always runs on the parent's model, it can't upgrade to Opus |
| Self-contained handoff, doesn't depend on anything from this session (plan already written with everything inside, long/unattended run worth isolating from your own context) | fresh `executor`/`planner` — re-derivation cost is low or isolation is the goal |
| Trivial request (2-3 commands, a status check) | None — resolve it directly, no handoff |

`fork` is **not** useful for the PLAN step when the profile requires Opus and the orchestrator runs
on a different model (`fork` always inherits the parent's model, the override is ignored) — there a
fresh `planner` is worth it despite the re-reading cost, because the plan quality justifies it.

## Subagent down due to infrastructure — retry alone, don't escalate to the user

A subagent can fail with an infrastructure message, not a content one — e.g. `"Agent stalled:
no progress for 600s (stream watchdog did not recover)"`. It's distinguished from a real failure
because the result says nothing about the handoff/task itself, only about the runtime that ran it.

**Real evidence** (lore-forge session, 2026-09-12): a `planner` stalled like this having only read
the handoff (without writing anything yet). The same request was relaunched on the same intact
handoff and it finished fine on the second attempt.

**Rule:** faced with a failure of this profile (infra message, zero or little progress, handoff
untouched or intact):

1. Confirm no work was lost (read the handoff / check the file it was supposed to touch).
2. Relaunch the **same** request on the **same** handoff, without asking the user for permission
   first — it's a mechanical retry, not a design decision.
3. Only notify if it fails again a second time, or if this time there is a sign that something
   was lost.

The user doesn't need to notice the stall for it to be retried — the only reason to escalate is
if the retry also fails.

## Metrics close — reread the skill after a change, don't rely on workflow memory

Baking ≥1.2.0 added a mandatory closing step: appending a line to
`.cursor/baking/metrics/runs.jsonl` (see `METRICS.md`). The orchestrator can stop applying it if,
after the skill/global config is updated mid-session, it keeps orchestrating from memory
(dispatching `planner`/`executor`/`fork` directly, without going through `/baking`) instead of
invoking the skill again or rereading `SKILL.md` — the new content never re-enters its context,
even though the file on disk already has it.

**Real evidence** (lore-forge session, 2026-09-14): baking went from v1.1.0 to v1.4.0 mid-session
(visible from a system-reminder about "New agent types are now available"), adding
`executor-mecanic` and the metrics requirement. The orchestrator kept dispatching
`planner-hyper`/`executor`/`executor-mecanic` directly (a pattern already learned before the
update) without rereading `SKILL.md` even once over the next ~15 runs — zero metrics lines
written, until the user asked directly "is the JSON being generated?".

**Rule:** when the harness reports new agents/skills available (or any signal that the global
baking config changed), reread `SKILL.md`/`BAKING.md`/`METRICS.md` before the next run — don't
assume the workflow is still the one learned at the start of the session. In long sessions
(several hours, many runs), it's worth rechecking this even without an explicit notification —
the config can sync live without announcing it in the chat.

## Spend review

- Cursor → Settings → Usage: filter by pool (Cursor Models vs Other Models).
- Projects with heavy Agent use: `profile: "cursor"` (Opus plan + Composer exec).
- No Opus at all: `profile: "hybrid"` (Grok + Composer).
- Critical end-to-end Claude projects: `profile: "claude"`.

## Light stack (Cursor + Claude Code)

If `lightStack.enabled` in config → **`LIGHT-STACK.md`**. Same global config; metrics use `runtime: cursor | claude-code`.

| Hook | Orchestrator | Tokens |
|------|-------------|--------|
| Baking memory start | `baking memory context/search` if non-trivial | ≤2 calls |
| Skill registry | Read 1 SKILL.md if it matches the index | 1 read |
| Verify close | Handoff criteria vs `git diff` → `## Verify` | no SDD subagent |
| Baking memory end | `baking memory save` (session summary) | 1 call |

Skip verify on TRIVIAL / PLAN-ONLY. Claude Code: verify at the orchestrator's close or in the executor/fork's `## Execution`.

Refresh skills: `baking skill-registry` (global `~/.cursor/baking/skill-registry.md`).
