# Intended Usage — Baking-AI

← [Back to README](./README.md)

---

This page explains **how Baking is meant to be used**. Not the flags or the schema — the mental model. If you read only one page besides the README, make it this one.

---

## After installing — you're already set

Run `baking install` once. In each project you only need **`.cursor/handoff/`** (Baking creates it if missing).

Don't memorize subagents or models. Just say:

> *"use baking for …"*
> or **`/baking`** + your request.

Baking classifies on its own and delegates.

---

## The golden rule

**Baking doesn't write product code.** It orchestrates.

| Role | Who | Typical model |
|-----|-------|---------------|
| Talk to you, classify, close | **Orchestrator** (main chat) | Composer / Sonnet |
| Think and write the plan | **Planner** | Opus or Fable (Hyper) |
| Implement | **Executor** | Composer / Sonnet / Haiku (mecanic) |

Never Opus as the main chat unless you explicitly ask for it.

---

## The handoff is the source of truth

Every serious plan lives at:

```
.cursor/handoff/YYYY-MM-DD-my-task.md
```

- The **planner** writes it.
- The **executor** reads it (it only gets the **path**, not a summary).
- When done, it appends **`## Execution`** (and **`## Verify`** if applicable).
- **Don't delete it** — it's history and saves tokens in the next session.

If you asked for *"plan only"* → **PLAN-ONLY**: handoff ready, **no** code touched until you say *"execute"*.

---

## Organic classification

You don't pick a "PLAN mode". Baking infers it:

| Request | What happens |
|--------|----------|
| "Change the button color to navy" | **TRIVIAL** or direct EXECUTE |
| "Build an editorial landing for a yoga studio" | **PLAN** (+ creative-brief-bar) |
| "Plan only, don't execute" | **PLAN-ONLY** |
| "Deep plan / hyper" | **PLAN-DEEP** → Fable |
| "Follow yesterday's handoff and implement it" | **EXECUTE** with an existing handoff |

When in doubt → **PLAN**. Better an extra handoff than Opus coding blind.

---

## Profiles (one single config)

You edit `"profile"` in `~/Desktop/side/baking/config.json`:

| Profile | Planner | Executor | When |
|--------|---------|----------|--------|
| `cursor` | Opus | Composer 2.5 | Cursor default — best plan, cheap exec |
| `hybrid` | Grok 4.6 | Composer 2.5 | Zero Opus — all Cursor pool |
| `claude` | Opus | Sonnet (+ Haiku mecanic) | Claude Code end-to-end |

---

## Light stack — optional but recommended

Three **lightweight** hooks (not a full SDD pipeline):

1. **Baking Memory** — decisions across sessions/repos (`baking memory …`)
2. **Verify** — handoff vs diff at close
3. **Skill registry** — find the right skill

Active if `lightStack.enabled: true`. See [LIGHT-STACK.md](../../LIGHT-STACK.md).

---

## Closing each run

You always get a brief **YAML** + a metric line in `.cursor/baking/metrics/runs.jsonl`:

```yaml
baking:
  handoff: .cursor/handoff/2026-09-15-landing-yoga.md
  flow: PLAN+EXECUTE
  verify: pass
  status: completed
```

That calibrates routing and (optionally) justifies savings vs baseline.

---

## Quick reference

| Do | Don't |
|------|----------|
| `/baking` or *use baking* | Opus coding the whole chat |
| Keep the plan in the handoff | Plan only in the chat |
| `baking doctor` after install | Clone the repo without `baking install` |
| PLAN-ONLY until you say execute | Infer EXECUTE after plan-only |
| Verify when closing features with criteria | Mark completed based only on build |
