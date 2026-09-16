# Baking-AI

**A lightweight orchestrator for Cursor and Claude Code.**

Opus (or Fable) plans. Composer or Sonnet executes. The plan lives on disk. You spend fewer tokens. You know what happened.

**Repo:** [github.com/admin-zyta/baking-ai](https://github.com/admin-zyta/baking-ai) · **Version:** `1.7.1` (see `VERSION` and `config.json` → `bakingVersion`)

---

Your agent codes with the expensive model for the whole chat, the plan stays in the conversation and gets lost, and “build OK” does not mean the request was actually fulfilled. **Baking-AI** sits in front as a router: it classifies work, delegates to cheaper planner/executor subagents, writes a **diary to disk**, and closes with metrics.

Baking-AI is **router + handoff + creative gates + optional light stack** — built for day-to-day work in Cursor and Claude Code.

**Full docs:** [BAKING-AI.md](./BAKING-AI.md) → [docs/baking-ai/](./docs/baking-ai/README.md)

---

## Works with

| Environment | How to invoke | Typical config profile |
|-------------|---------------|------------------------|
| **Cursor** | `/baking` · baking skill · *“use baking for…”* | `"profile": "cursor"` |
| **Claude Code** | `/baking` · baking skill · natural language | `"profile": "claude"` |

Single global config: `~/Desktop/side/baking/config.json`. **No** per-repo Baking install.

---

## Features

### Handoff diary — Plans do not die in the chat

Every serious run leaves a file at `.cursor/handoff/YYYY-MM-DD-slug.md`: context, done criteria, execution, and verify. The executor gets the **path**, not a summary. The next session picks up from there.

**[Mental model →](docs/baking-ai/intended-usage.md)** · **[Cursor reference →](BAKING-CURSOR.md)** · **[Claude Code →](claude-code/BAKING.md)**

---

### Routing — Opus plans, a cheaper executor implements

Baking classifies **PLAN / EXECUTE / TRIVIAL / PLAN-ONLY**, picks `planner` vs `planner-hyper` (Fable) vs a direct executor, and avoids Opus as the main chat model.

**[Routing →](docs/baking-ai/routing.md)** · **[Use cases →](docs/baking-ai/use-cases.md)**

---

### Light stack — Memory, verify, skills (optional)

Three optional pieces under `lightStack` (on by default since v1.5):

| Piece | Purpose |
|-------|---------|
| **Baking memory** | Cross-session decisions (`baking memory search/save`) |
| **Verify** | Handoff criteria vs `git diff` at close |
| **Skill registry** | `baking skill-registry` → invoke the right skill |

**[LIGHT-STACK.md →](LIGHT-STACK.md)**

---

### Init-memory — Project bootstrap

Scans the repo, drafts `AGENTS.md`, memory topics, and a Cursor rule. A **PLAN-ONLY** run then fills persistent memory.

```bash
baking init-memory          # scan → .cursor/baking/init/
# in chat:
/init-memory                # PLAN-ONLY + baking memory save
```

**[INIT-MEMORY.md →](INIT-MEMORY.md)**

---

### Per-project required — Baking mandatory in this repo

```bash
cd your-repo
baking require on       # .cursor/baking/required.json
baking require off
baking require status
baking init-memory --require
```

Implementation in that repo **must** use Baking-AI. Questions may still gate-out. See **[INIT-MEMORY.md →](INIT-MEMORY.md)**.

### Auto-route — global fallback (optional)

For all repos **without** a require marker (default off):

```bash
baking auto-route on
baking auto-route off
baking auto-route status
```

Config: `autoRoute.enabled` in `~/Desktop/side/baking/config.json`.

---

### Metrics — Is routing (and savings) real?

One JSONL line per run (`.cursor/baking/metrics/runs.jsonl`). Review every **7 days or 50 runs**:

```bash
baking metrics-summary
baking metrics-review --status
baking metrics-review              # routing/savings conclusion
```

**[METRICS.md →](METRICS.md)**

---

### creative-brief-bar — Landings that do not look like templates

Perceptual quality gate for visual work (craft, assets, prod+spec). See `creative-brief-bar.md`.

---

## Get started

> **Cloning GitHub ≠ installing.** Run `install` after clone.

### macOS / Linux

```bash
git clone https://github.com/admin-zyta/baking-ai.git ~/Desktop/side/baking
cd ~/Desktop/side/baking && node bin/baking.js install
baking doctor
```

### Windows (PowerShell)

```powershell
git clone https://github.com/admin-zyta/baking-ai.git $env:USERPROFILE\Desktop\side\baking
cd $env:USERPROFILE\Desktop\side\baking
node bin/baking.js install
node bin/baking.js doctor
```

### Without cloning

```bash
npx github:admin-zyta/baking-ai install
# private repo: GH_TOKEN=ghp_... npx github:admin-zyta/baking-ai install
```

### Baking Memory (cross-session, recommended)

```bash
baking memory status
baking memory save --title "..." --body "..." [--topic key] [--type decision]
baking memory search "query terms"
baking memory context --query "terms"   # start-of-session context
```

SQLite + FTS5 at `~/.cursor/baking/memory/baking-memory.db` — same store for Cursor and Claude Code. See **[MEMORY.md](MEMORY.md)**.

Step-by-step: **[docs/baking-ai/quickstart.md](docs/baking-ai/quickstart.md)**

---

## Daily usage

### First run in a project

```bash
mkdir -p .cursor/handoff .cursor/baking/metrics   # or let Baking create them
```

**Cursor / Claude Code:**

```
/baking

Add email validation to the signup form
```

You get: classification · handoff path (if planned) · closing YAML · line in `runs.jsonl`.

### Modes that matter

| Mode | When |
|------|------|
| **PLAN+EXECUTE** | Feature, multi-file, ambiguity |
| **PLAN-ONLY** | *“plan only”* — no code until *“execute”* |
| **EXECUTE** | Handoff exists, obvious fix, typo |
| **TRIVIAL** | 2–3 commands, status check |

### Model profiles

Edit `~/Desktop/side/baking/config.json`:

```json
{
  "enabled": true,
  "profile": "cursor",
  "autoRoute": { "enabled": false },
  "lightStack": { "enabled": true }
}
```

| Profile | Planner | Executor | Pool |
|---------|---------|----------|------|
| `cursor` | Opus / Fable | Composer | Mixed (default) |
| `hybrid` | Grok | Composer | Cursor Models only |
| `claude` | Opus / Fable | Sonnet + Haiku mecanic | Claude Code |

---

## CLI

```bash
baking install [--force-config]   # deploy globally to Cursor + Claude
baking doctor                     # agents + light stack + auto-route
baking skill-registry [--force]   # skill index (~/.cursor/baking/)
baking init-memory [--force]      # bootstrap AGENTS + memory topics
baking memory status|save|search|context   # global SQLite memory
baking require on|off|status       # per-repo mandatory Baking
baking auto-route on|off|status   # global fallback (default off)
baking metrics-summary [path]     # JSONL summary
baking metrics-review [--status]  # 7d / 50-run conclusion
baking version
```

Publishing npm: **[NPM.md](NPM.md)**

---

## Documentation

| Doc | Contents |
|-----|----------|
| **[Intended usage](docs/baking-ai/intended-usage.md)** | Mental model — **start here if you read one page** |
| **[Quickstart](docs/baking-ai/quickstart.md)** | Install, profiles, first run, troubleshooting |
| **[Use cases](docs/baking-ai/use-cases.md)** | Real scenarios |
| **[Components](docs/baking-ai/components.md)** | Pieces, agents, profiles |
| **[Routing](docs/baking-ai/routing.md)** | PLAN / EXECUTE / Hyper / mecanic / fork |
| **[LIGHT-STACK.md](LIGHT-STACK.md)** | Baking Memory, Verify, registry |
| **[INIT-MEMORY.md](INIT-MEMORY.md)** | Project memory bootstrap |
| **[METRICS.md](METRICS.md)** | JSONL, S0 vs S3 bench, `metrics-review` |
| **[ROUTER.md](ROUTER.md)** · **[consumption.md](consumption.md)** | Orchestrator rules |
| **[AGENTS.md](AGENTS.md)** | Exact Task / Agent names in Cursor |

---

## Flow (30 seconds)

```
User → Baking (cheap orchestrator)
         ├─ [optional] baking memory context / search
         ├─ PLAN → planner | planner-hyper
         └─ EXECUTE → executor | executor-mecanic | direct
         → .cursor/handoff/YYYY-MM-DD-slug.md
         → Verify (handoff vs diff)
         → YAML + runs.jsonl + baking memory save (summary)
```

---

## Repo (maintainers)

```
~/Desktop/side/baking/          ← clone of admin-zyta/baking-ai
  global/cursor/                → deploy to ~/.cursor/
  global/claude/                → deploy to ~/.claude/
  bin/baking.js                 → CLI
  config.json                   → defaults (install keeps your existing file)
```

After editing:

```powershell
# bump VERSION, CHANGELOG, bakingVersion
node bin/baking.js install
git commit && git tag vX.Y.Z && git push && git push origin vX.Y.Z
```

---

## Deprecated

Per-repo `/init-baking`, `enable-project.ps1`, local `.cursor/opus-sonnet.json` — see `init-baking` skill (alias of **`init-memory`**).

---

## Changelog

See **[CHANGELOG.md](CHANGELOG.md)** (Keep a Changelog).
