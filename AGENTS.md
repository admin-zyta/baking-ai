# Baking agents — exact names for Task

**Important:** agents live in **`~/.cursor/agents/`** and **`~/.claude/agents/`** after `node bin/baking.js install`. Cloning the repo is **not** enough.

## Agent colors

Frontmatter `color:` (Claude Code UI; Cursor may ignore). The orchestrator **must** announce each delegation in chat:

`🟣 **Baking → planner** · PLAN · Opus`

| Agent | Color | Emoji | Role |
|-------|-------|-------|------|
| `baking` | cyan | 🩵 | Orchestrator |
| `planner` | purple | 🟣 | Plan · Opus |
| `planner-hyper` / `planner-hyper-cursor` | magenta | 🩷 | Deep plan · Fable |
| `planner-cursor` | yellow | 🟡 | Plan · Grok (hybrid) |
| `executor-cursor` | green | 🟢 | Execute · Composer |
| `executor` | blue | 🔵 | Execute · Sonnet |
| `executor-mecanic` | orange | 🟠 | Mecanic · Haiku (Claude only) |
| **`direct`** | cyan | ⚡ | Orchestrator resolves — **no subagent** (still Baking) |
| **gate-out** | — | ⬜ | **No Baking** — normal chat, no metrics |

Programmatic map: `lib/agent-colors.js` (`directBanner`, `gateOutBanner`, `delegationBanner`).

### Visibility (mandatory)

Announce **before** editing or answering:

| Tier | First line |
|------|------------|
| Subagent | `🟣 **Baking → planner** · PLAN` (emoji per agent table) |
| **Direct** | `⚡ **Baking · DIRECT** · orchestrator resolves (no subagent)` |
| **Gate-out** | `⬜ **No Baking** · gate-out` — then normal answer; **no** YAML/JSONL |

**Direct ≠ gate-out:** direct still closes with YAML + `runs.jsonl` (`exec_agent: direct`). Gate-out skips metrics entirely.

## Cursor (`~/.cursor/agents/`)

| Task `subagent_type` | File | Role |
|----------------------|---------|-----|
| `baking` | `baking.md` | Orchestrator |
| `planner` | `planner.md` | Normal plan (Opus) |
| `planner-hyper` | `planner-hyper.md` | Deep plan (Fable) |
| `planner-hyper-cursor` | `planner-hyper-cursor.md` | Same (alternate name) |
| `planner-cursor` | `planner-cursor.md` | Normal hybrid plan (Grok) |
| `executor-cursor` | `executor-cursor.md` | Executor (Composer) |
| `executor` | `executor.md` | Reference |

**Doesn't exist in Cursor:** `executor-mecanic` (Claude Code / Haiku only). Mechanical tasks → `executor-cursor` or resolve directly.

## Claude Code (`~/.claude/agents/`)

| Agent | File | Role |
|-------|---------|-----|
| `baking` | `baking.md` | Orchestrator |
| `planner` | `planner.md` | Normal plan (Opus) |
| `planner-hyper` | `planner-hyper.md` | Deep plan (Fable) |
| `executor` | `executor.md` | Executor (Sonnet) |
| `executor-mecanic` | `executor-mecanic.md` | Mecanic (Haiku) |

## Verify installation

```bash
node bin/baking.js doctor
```

It should list all the files above as **OK**.

## Light stack (Cursor + Claude Code)

Same `lightStack` config in `~/.cursor/opus-sonnet/config.json`. See **`LIGHT-STACK.md`**.

| Piece | Cursor | Claude Code |
|-------|--------|-------------|
| Baking docs | `BAKING-CURSOR.md` | `claude-code/BAKING.md` |
| Planner template | `~/.cursor/agents/planner.md` | **same path** |
| `runtime` metrics | `cursor` | `claude-code` |
| Baking memory | `baking memory …` | same CLI + DB |

Commands: `baking skill-registry` · `baking doctor` (reports light stack).
