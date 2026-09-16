Documentation language: English.

# Baking-AI

**The lightweight orchestrator for Cursor and Claude Code.**

Opus (or Fable) plans. Composer or Sonnet executes. The plan stays on disk. You pay fewer tokens. You know what happened.

---

## What problem it solves

| Problem | Without Baking | With Baking |
|----------|------------|------------|
| Opus coding the whole chat | Expensive, slow | Opus **only plans** (1 subagent) |
| Plan in the chat, gets lost | Re-explain every session | Persistent **Handoff** in `.cursor/handoff/` |
| "Build OK" but poorly done | Blind trust | **Verify** — criteria vs diff |
| Forgetting decisions across repos | Manual friction | **Baking Memory** (SQLite FTS, light stack) |
| Generic landings | Clean template | **creative-brief-bar** + on-disk craft bars |

Baking is a **router + diary + gates** for Cursor and Claude Code — not a full SDD pipeline, just what you need to plan cheaply, execute safely, and keep context on disk.

---

## Works with

| Environment | Invocation | Typical profile |
|---------|------------|---------------|
| **Cursor** | `/baking` · *use baking* | `cursor` (Opus plan + Composer exec) |
| **Claude Code** | `/baking` · *use baking* | `claude` (Opus plan + Sonnet exec) |

One global config: `~/Desktop/side/baking/config.json`. **Do not** install per repo.

---

## Components

| Component | What it does |
|------------|----------|
| **Orchestrator** | Classifies PLAN / EXECUTE / TRIVIAL · delegates to subagents |
| **Planner** | Researches · writes the handoff · doesn't touch `src/` |
| **Planner Hyper** | Deep plan (Fable) — architecture, complex landings |
| **Executor** | Implements per the handoff · appends `## Execution` |
| **Handoff diary** | Plan + execution in one `.md` per task |
| **Light stack** | Baking Memory · Verify · Skill registry |
| **Metrics** | `runs.jsonl` — routing, cost, `metrics-review` |
| **Init-memory** | Bootstrap AGENTS + memory topics (`baking init-memory`) |
| **Auto-route** | Toggle: Baking by default (`baking auto-route on`) |
| **creative-brief-bar** | Perceptual quality on landings (craft, visual) |

Details: [components.md](./components.md)

---

## Flow in 30 seconds

```
User → Baking (cheap orchestrator)
           ├─ PLAN → planner | planner-hyper
           └─ EXECUTE → executor | executor-mecanic | direct
           → .cursor/handoff/YYYY-MM-DD-slug.md
           → verify + YAML + metrics JSONL
```

Mental model: [intended-usage.md](./intended-usage.md)
Concrete cases: [use-cases.md](./use-cases.md)

---

## Get started

```bash
npx @admin-zyta/baking-ai install
baking doctor
baking skill-registry
```

Cursor or Claude Code → `/baking` + your request.

Full guide: [quickstart.md](./quickstart.md)

---

## Documentation

| Doc | Contents |
|-----|-----------|
| [intended-usage.md](./intended-usage.md) | How to think about it — if you read one, make it this one |
| [use-cases.md](./use-cases.md) | Real scenarios (landings, fixes, deploy…) |
| [components.md](./components.md) | Each piece, agents, profiles |
| [routing.md](./routing.md) | PLAN / EXECUTE / Hyper / mecanic / fork |
| [quickstart.md](./quickstart.md) | Install, profiles, first run |
| [../../INIT-MEMORY.md](../../INIT-MEMORY.md) | Project memory bootstrap |
| [../../LIGHT-STACK.md](../../LIGHT-STACK.md) | Baking Memory, Verify, registry |
| [../../METRICS.md](../../METRICS.md) | JSONL, S0 vs S3 benchmark, cost |
| [../../AGENTS.md](../../AGENTS.md) | Exact Task / Agent names |

Technical references: `BAKING-CURSOR.md` · `claude-code/BAKING.md`

---

## Version

`bakingVersion` in `config.json` · package `@admin-zyta/baking-ai` · repo [admin-zyta/baking-ai](https://github.com/admin-zyta/baking-ai)
