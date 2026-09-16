#!/usr/bin/env node
'use strict';

const { install, readVersion } = require('../lib/install');
const { doctor, listInstalledAgents } = require('../lib/doctor');
const { summarize, formatReport } = require('../lib/metrics-summary');
const { runReview } = require('../lib/metrics-review');
const { runInitMemory } = require('../lib/init-memory');
const { autoRouteStatus, setAutoRoute } = require('../lib/auto-route');
const { projectRequiredStatus, setProjectRequired } = require('../lib/project-required');
const {
  saveObservation,
  searchObservations,
  contextObservations,
  memoryStatus,
  formatHits,
} = require('../lib/baking-memory');
const { buildRegistry } = require('../lib/skill-registry');
const { lightStackReport } = require('../lib/light-stack');
const path = require('path');

const HELP = `
@admin-zyta/baking-ai — planner → executor orchestrator (Cursor + Claude Code)

Usage:
  baking-ai install [--force-config]   Deploy skills, agents, rules, global config
  baking install                       Alias of baking-ai install
  baking sync                       Alias for install
  baking doctor                     Verify agents + light stack
  baking skill-registry [--force]   Lightweight skills index (~/.cursor/baking/)
  baking init-memory [--force] [--dry-run] [--require]
                                    Scan repo → AGENTS + init/ (then /init-memory)
  baking memory status|save|search|context   Global memory (SQLite FTS, Cursor + Claude)
  baking require on|off|status      Mark this repo: implementation must use Baking-AI
  baking auto-route on|off|status   Global fallback (all repos); prefer baking require on
  baking metrics-review [--status] [--force] [--close-cycle]
                                    Routing/savings conclusion (7 days or 50 runs)
  baking version                    Show installed package version

Examples:
  npx @admin-zyta/baking-ai install
  npm i -g @admin-zyta/baking-ai && baking-ai install

Targets:
  ~/.cursor/skills/baking/          Cursor skill
  ~/.cursor/agents/                 Cursor subagents
  ~/.cursor/rules/                  Router gate
  ~/Desktop/side/baking/            Config + docs
  ~/.claude/skills/ + agents/       Claude Code
`;

function parseFlag(rest, flag) {
  const i = rest.indexOf(flag);
  if (i < 0 || i + 1 >= rest.length || rest[i + 1].startsWith('-')) return null;
  return rest[i + 1];
}

function parseMemoryCli(rest) {
  const sub = rest.find((a) => !a.startsWith('-'));
  const positional = rest.filter((a, i) => !a.startsWith('-') && a !== sub);
  return {
    sub,
    topic: parseFlag(rest, '--topic'),
    title: parseFlag(rest, '--title'),
    body: parseFlag(rest, '--body'),
    type: parseFlag(rest, '--type'),
    project: parseFlag(rest, '--project'),
    query: parseFlag(rest, '--query') || positional.join(' '),
    limit: Number(parseFlag(rest, '--limit')) || 5,
  };
}

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  const forceConfig = rest.includes('--force-config');

  if (!cmd || cmd === 'help' || cmd === '-h' || cmd === '--help') {
    process.stdout.write(HELP);
    process.exit(0);
  }

  if (cmd === 'doctor') {
    const report = doctor();
    console.log(`Baking-AI ${report.version} — doctor`);
    console.log('');
    console.log('Cursor (~/.cursor/agents/):');
    for (const a of report.cursor) {
      console.log(`  ${a.ok ? 'OK' : 'MISSING'}  ${a.file}`);
    }
    console.log('');
    console.log('Claude Code (~/.claude/agents/):');
    for (const a of report.claude) {
      console.log(`  ${a.ok ? 'OK' : 'MISSING'}  ${a.file}`);
    }
    console.log('');
    console.log(`  config.json: ${report.configOk ? 'OK' : 'MISSING'} — ${report.configPath || ''}`);
    console.log(`  baking home: ${report.bakingHome || ''}`);
    console.log(`  skill baking: ${report.skillOk ? 'OK' : 'MISSING'}`);
    if (report.lightStack) {
      console.log('');
      console.log('Light stack:');
      console.log(`  enabled: ${report.lightStack.enabled ? 'yes' : 'no'}`);
      const mem = report.lightStack.bakingMemory;
      if (mem) {
        console.log(
          `  Baking memory: ${mem.ok ? 'OK' : 'empty'} (${mem.mode}, ${mem.count} obs) — ${mem.path}`
        );
      }
      const reg = report.lightStack.skillRegistry;
      if (reg.ok) {
        const stale = reg.stale ? ' (stale — baking skill-registry)' : '';
        console.log(`  skill-registry: OK — ${reg.count} skills, ${reg.ageHours}h${stale}`);
      } else {
        console.log('  skill-registry: MISSING — run: baking skill-registry');
      }
    }
    const ar = autoRouteStatus();
    console.log('');
    console.log(`Auto-route: ${ar.autoRouteEnabled ? 'ON' : 'OFF'} (baking enabled: ${ar.bakingEnabled ? 'yes' : 'no'})`);
    if (ar.bakingEnabled && !ar.autoRouteEnabled) {
      console.log('  → baking auto-route on   # Baking default without repeating /baking');
    }
    if (!report.ok) {
      console.log('');
      console.log(report.hint);
      console.log('See AGENTS.md — executor-mecanic does not exist in Cursor (Claude Code only).');
    }
    process.exit(report.ok ? 0 : 1);
  }

  if (cmd === 'skill-registry') {
    const force = rest.includes('--force');
    const ls = lightStackReport();
    const reg = ls.skillRegistry;
    if (reg.ok && !reg.stale && !force) {
      console.log(`skill-registry OK (${reg.count} skills, ${reg.ageHours}h) — ${reg.path}`);
      console.log('Use --force to regenerate.');
      process.exit(0);
    }
    try {
      const result = buildRegistry();
      console.log(`skill-registry: ${result.count} skills → ${result.path}`);
      process.exit(0);
    } catch (err) {
      console.error(`skill-registry failed: ${err.message}`);
      process.exit(1);
    }
  }

  if (cmd === 'metrics-summary') {
    const fileArg = rest.find((a) => !a.startsWith('-'));
    const filePath = path.resolve(
      fileArg || path.join(process.cwd(), '.cursor', 'baking', 'metrics', 'runs.jsonl')
    );
    try {
      const report = summarize(filePath);
      console.log(formatReport(report));
      process.exit(0);
    } catch (err) {
      console.error(`metrics-summary failed: ${err.message}`);
      process.exit(1);
    }
  }

  if (cmd === 'init-memory') {
    const force = rest.includes('--force');
    const dryRun = rest.includes('--dry-run');
    const requireProject = rest.includes('--require');
    try {
      const result = runInitMemory({ force, dryRun, requireProject });
      if (!result.ok) {
        console.error(result.error);
        process.exit(1);
      }
      if (result.dryRun) {
        console.log(`dry-run: mode=${result.scan.mode} stack=${result.scan.stack.signals.join(',')}`);
        console.log(`would write: ${result.wouldWrite.join(', ')}`);
        process.exit(0);
      }
      console.log(result.message);
      if (result.bakingRequired && result.requiredMarker) {
        console.log(`  baking required: ${result.requiredMarker}`);
      }
      console.log('');
      for (const [k, p] of Object.entries(result.artifacts)) {
        console.log(`  ${k}: ${p}`);
      }
      console.log('');
      console.log('Next: /init-memory or "use baking PLAN-ONLY to complete init-memory"');
      process.exit(0);
    } catch (err) {
      console.error(`init-memory failed: ${err.message}`);
      process.exit(1);
    }
  }

  if (cmd === 'memory') {
    const args = parseMemoryCli(rest);
    try {
      if (!args.sub || args.sub === 'status') {
        const s = memoryStatus();
        console.log(`Baking memory (${s.mode}): ${s.path}`);
        console.log(`Observations: ${s.count}`);
        if (s.note) console.log(`Note: ${s.note}`);
        process.exit(0);
      }
      if (args.sub === 'save') {
        if (!args.title || !args.body) {
          console.error('Usage: baking memory save --title "..." --body "..." [--topic key] [--type decision]');
          process.exit(1);
        }
        const r = saveObservation(args);
        console.log(`Saved (${r.mode}) id=${r.id ?? 'jsonl'} → ${r.path}`);
        process.exit(0);
      }
      if (args.sub === 'search') {
        if (!args.query) {
          console.error('Usage: baking memory search "query terms" [--limit 5]');
          process.exit(1);
        }
        const r = searchObservations(args.query, args.limit);
        console.log(`Search (${r.mode}): ${r.hits.length} hit(s)`);
        for (const h of formatHits(r.hits)) {
          console.log('');
          console.log(`#${h.id ?? '—'} [${h.type}] ${h.title}`);
          if (h.topic_key) console.log(`  topic: ${h.topic_key}`);
          console.log(`  ${h.body}`);
        }
        process.exit(0);
      }
      if (args.sub === 'context') {
        const r = contextObservations(args.query, args.limit);
        console.log(`Context (${r.mode}): ${r.hits.length} item(s)`);
        for (const h of formatHits(r.hits)) {
          console.log('');
          console.log(`#${h.id ?? '—'} [${h.type}] ${h.title}`);
          console.log(`  ${h.body}`);
        }
        process.exit(0);
      }
      console.error('Usage: baking memory status|save|search|context');
      process.exit(1);
    } catch (err) {
      console.error(`memory failed: ${err.message}`);
      process.exit(1);
    }
  }

  if (cmd === 'require') {
    const sub = rest.find((a) => !a.startsWith('-'));
    if (!sub || sub === 'status') {
      const s = projectRequiredStatus();
      console.log(`Project: ${process.cwd()}`);
      console.log(`Baking required: ${s.bakingRequired ? 'yes' : 'no'}`);
      console.log(`Marker: ${s.markerFile}`);
      if (s.error) console.log(`Error reading marker: ${s.error}`);
      process.exit(0);
    }
    if (sub === 'on') {
      const r = setProjectRequired(true);
      console.log(`Baking required ON → ${r.markerFile}`);
      console.log('Implementation in this repo must use Baking-AI (Q&A may still gate-out).');
      process.exit(0);
    }
    if (sub === 'off') {
      setProjectRequired(false);
      console.log('Baking required OFF — marker removed.');
      process.exit(0);
    }
    console.error('Usage: baking require on|off|status');
    process.exit(1);
  }

  if (cmd === 'auto-route') {
    const sub = rest.find((a) => !a.startsWith('-'));
    if (!sub || sub === 'status') {
      const s = autoRouteStatus();
      console.log(`Baking enabled: ${s.bakingEnabled ? 'yes' : 'no'}`);
      console.log(`Auto-route: ${s.autoRouteEnabled ? 'ON' : 'OFF'}`);
      console.log(`Effective (auto Baking on code tasks): ${s.effective ? 'yes' : 'no'}`);
      if (!s.bakingEnabled) console.log('→ Enable baking in config: enabled: true');
      process.exit(0);
    }
    if (sub === 'on') {
      const r = setAutoRoute(true);
      console.log('Auto-route ON — global fallback for implementation (prefer `baking require on` per repo).');
      console.log('Rule gate: ~/.cursor/rules/baking-router.mdc (run baking install if not updated).');
      process.exit(r.bakingEnabled ? 0 : 0);
    }
    if (sub === 'off') {
      setAutoRoute(false);
      console.log('Auto-route OFF — invoke /baking or "use baking" explicitly again.');
      process.exit(0);
    }
    console.error('Usage: baking auto-route on|off|status');
    process.exit(1);
  }

  if (cmd === 'metrics-review') {
    const statusOnly = rest.includes('--status');
    const force = rest.includes('--force');
    const closeCycle = rest.includes('--close-cycle');
    try {
      const result = runReview({ statusOnly, force, closeCycle });
      if (!result.ok) {
        console.error(result.error);
        process.exit(1);
      }
      if (result.closed) {
        console.log(result.message);
        process.exit(0);
      }
      if (result.status && !result.due) {
        console.log(result.status);
        process.exit(0);
      }
      if (result.conclusionPath) {
        console.log(result.summary);
        console.log('');
        console.log(`Conclusion written: ${result.conclusionPath}`);
        process.exit(0);
      }
      console.log(result.status || 'OK');
      process.exit(0);
    } catch (err) {
      console.error(`metrics-review failed: ${err.message}`);
      process.exit(1);
    }
  }

  if (cmd === 'version' || cmd === '-v') {
    console.log(readVersion());
    process.exit(0);
  }

  if (cmd === 'install' || cmd === 'sync') {
    try {
      const result = install({ forceConfig });
      console.log(`Baking-AI ${result.version} — installed`);
      console.log(`  Cursor:  ${result.cursorRoot}`);
      console.log(`  Claude:  ${result.claudeRoot}`);
      console.log(`  Baking home:  ${result.bakingHome}`);
      console.log(`  Config:       ${result.configPath}`);
      if (result.migratedFrom?.removed) {
        console.log(`  Removed legacy: ${result.migratedFrom.removed}`);
      } else if (result.migratedFrom?.pendingRemoval) {
        console.log(`  Legacy still present: ${result.migratedFrom.legacy}`);
        console.log(`  → ${result.migratedFrom.note}`);
      }
      console.log('');
      const installed = listInstalledAgents();
      console.log('  Cursor agents:', installed.cursor.filter((a) => a.ok).length + '/' + installed.cursor.length);
      console.log('  Claude agents:', installed.claude.filter((a) => a.ok).length + '/' + installed.claude.length);
      console.log('');
      console.log('Verify: baking doctor');
      console.log('Usage: /baking or "use baking for …"');
      console.log('Profile: edit ~/Desktop/side/baking/config.json');
      process.exit(0);
    } catch (err) {
      console.error(`baking install failed: ${err.message}`);
      process.exit(1);
    }
  }

  console.error(`Unknown command: ${cmd}`);
  process.stdout.write(HELP);
  process.exit(1);
}

main();
