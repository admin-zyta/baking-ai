---
name: init-baking
description: DEPRECATED — Baking is global. Don't install per repo. Use /baking or "use baking".
disable-model-invocation: true
user-invocable: true
---

# DEPRECATED — Baking is global

**No per-project init needed.** Everything lives at:

- Config: `~/Desktop/side/baking/config.json`
- Cursor: `~/.cursor/skills/baking/`, `~/.cursor/agents/`
- Claude Code: `~/.claude/skills/baking/`, `~/.claude/agents/`
- Another machine: `npx @admin-zyta/baking-ai install`

## Usage

`/baking` or *"use baking for …"*

Baking only creates `.cursor/handoff/` in the workspace if it's missing.

## Change profile / enabled

Edit **`~/Desktop/side/baking/config.json`** (e.g. `"profile": "cursor"` | `"claude"` | `"hybrid"`).

## Update globally

```bash
npx @admin-zyta/baking-ai install
```

Or from the git repo: `sync-global.ps1` / `install-claude-skills.ps1`.

Don't use `enable-project.ps1` — deprecated.
