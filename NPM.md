# Publishing `@admin-zyta/baking-ai`

npm package that installs Baking-AI globally in Cursor + Claude Code (skills, agents, rules, config).

## Install (another machine)

**From npm** (after `npm publish`):

```bash
npx @admin-zyta/baking-ai install
```

**From GitHub** (no npm):

```bash
git clone https://github.com/admin-zyta/baking-ai.git ~/Desktop/side/baking
cd ~/Desktop/side/baking && node bin/baking.js install
```

Or in one line:

```bash
npx github:admin-zyta/baking-ai install
```

*(Requires the repo to be accessible with your GitHub token; if it's private, configure `GH_TOKEN`.)*

Global:

```bash
npm i -g @admin-zyta/baking-ai
baking-ai install
```

(`baking` CLI alias still works after global install.)

If you already have a custom `config.json` and don't want an automatic backup, install respects the existing one (it copies to `config.json.bak` only when overwriting docs; config is backed up if it exists).

Force config replacement:

```bash
baking-ai install --force-config
```

## Publish (maintainers)

1. Bump `VERSION`, `package.json` → `version`, `config.json` → `bakingVersion`, `CHANGELOG.md`
2. Login to npm with access to the `@admin-zyta` scope
3. From the repo root:

```bash
npm publish
```

Scope is **restricted** by default (`publishConfig.access`). For public: `"access": "public"` in `package.json`.

## Local dry-run

```bash
node bin/baking.js install
node bin/baking.js version
```

Equivalent to `sync-global.ps1` on Windows; the bin is cross-platform (Node 18+).

## What npm does not include

- Per-workspace metrics (`.cursor/baking/metrics/` in each project — created on run)
- Handoff diary (`.cursor/handoff/` per project)
- Fable acceptance / models available on the Cursor account
