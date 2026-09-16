# Quickstart — Baking-AI

← [Back to README](./README.md)

---

## Requirements

- **Cursor** and/or **Claude Code**
- **Node 18+** (for CLI install)
- Optional: **Baking Memory** (light stack — enabled by default)

---

## 1. Install (once per machine)

```bash
# From npm (once published)
npx @admin-zyta/baking-ai install

# Or from a clone
git clone https://github.com/admin-zyta/baking-ai ~/Desktop/side/baking
node ~/Desktop/side/baking/bin/baking.js install
```

Windows alternative:

```powershell
& "$env:USERPROFILE\Desktop\side\baking\sync-global.ps1"
```

---

## 2. Verify

```bash
baking doctor
baking skill-registry
```

Expected:

- Cursor agents 7/7 · Claude 5/5
- Light stack: enabled
- skill-registry: OK

---

## 3. Choose a profile

Edit `~/Desktop/side/baking/config.json`:

```json
{
  "enabled": true,
  "profile": "cursor",
  "lightStack": { "enabled": true }
}
```

| Profile | Use |
|--------|-----|
| `cursor` | Cursor — Opus plan + Composer exec |
| `hybrid` | Cursor — Grok + Composer (no Opus) |
| `claude` | Claude Code — Opus + Sonnet + Haiku mecanic |

---

## 4. Bootstrap the project

At the repo root (once):

```bash
mkdir -p .cursor/handoff
mkdir -p .cursor/baking/metrics
```

Or just ask for any Baking run — it creates the folders if they're missing.

---

## 5. First run

**Cursor:**

```
/baking

use baking to add a tooltip to the Save button in Settings.tsx
```

**Claude Code:** same, with `/baking` or natural language.

You'll get:

1. Classification (PLAN or EXECUTE)
2. Handoff path (if there was a plan)
3. Closing YAML
4. A line in `runs.jsonl`

---

## 6. Light stack — Baking Memory

```bash
baking memory status
baking memory save --title "..." --body "..." [--topic key]
baking memory search "query"
baking doctor              # Baking memory: OK (sqlite)
```

See [../../MEMORY.md](../../MEMORY.md).

---

## 7. Useful commands

```bash
baking version
baking doctor
baking skill-registry [--force]
baking init-memory [--force]       # bootstrap AGENTS + memory topics (see INIT-MEMORY.md)
baking memory status|save|search|context
baking auto-route on|off|status    # Baking by default without /baking every time
baking metrics-summary
baking metrics-review --status
```

---

## 8. Init project memory (legacy / new repo)

```bash
baking init-memory
# then in chat: /init-memory  (PLAN-ONLY + baking memory save)
```

See [../../INIT-MEMORY.md](../../INIT-MEMORY.md).

---

## 9. Auto-route (optional)

```bash
baking auto-route on     # implementation → automatic Baking
baking auto-route status
```

---

## 10. Next docs

- [intended-usage.md](./intended-usage.md) — mental model
- [use-cases.md](./use-cases.md) — scenarios
- [components.md](./components.md) — pieces
- [routing.md](./routing.md) — PLAN / EXECUTE

---

## Troubleshooting

| Problem | Fix |
|----------|----------|
| "planner-hyper agent doesn't exist" | `baking install` + restart Cursor |
| runs.jsonl isn't created | Reread the baking skill · see METRICS.md |
| Fable blocked | Accept data retention in the Cursor Dashboard |
| Baking memory MISSING | `baking memory status` · check `lightStack.memory.provider` in config |
