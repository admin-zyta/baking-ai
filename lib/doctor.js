'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const { readVersion, PACKAGE_ROOT } = require('./install');
const { lightStackReport } = require('./light-stack');
const { bakingHome, configPath } = require('./config');

const CURSOR_AGENTS = [
  'baking.md',
  'planner.md',
  'planner-hyper.md',
  'planner-hyper-cursor.md',
  'planner-cursor.md',
  'executor-cursor.md',
  'executor.md',
];

const CLAUDE_AGENTS = [
  'baking.md',
  'planner.md',
  'planner-hyper.md',
  'executor.md',
  'executor-mecanic.md',
];

function homeDir() {
  return process.env.USERPROFILE || os.homedir();
}

function checkAgents(dir, expected) {
  return expected.map((file) => {
    const full = path.join(dir, file);
    return { file, ok: fs.existsSync(full), path: full };
  });
}

function doctor() {
  const home = homeDir();
  const cursorAgents = path.join(home, '.cursor', 'agents');
  const claudeAgents = path.join(home, '.claude', 'agents');
  const pkgVersion = readVersion();
  const cfgPath = configPath();
  const configOk = fs.existsSync(cfgPath);
  const skillOk = fs.existsSync(path.join(home, '.cursor', 'skills', 'baking', 'SKILL.md'));

  const cursor = checkAgents(cursorAgents, CURSOR_AGENTS);
  const claude = checkAgents(claudeAgents, CLAUDE_AGENTS);
  const cursorMissing = cursor.filter((x) => !x.ok);
  const claudeMissing = claude.filter((x) => !x.ok);
  const ok = cursorMissing.length === 0 && claudeMissing.length === 0 && configOk && skillOk;
  const lightStack = lightStackReport();

  return {
    ok,
    version: pkgVersion,
    bakingHome: bakingHome(),
    configPath: cfgPath,
    cursor,
    claude,
    configOk,
    skillOk,
    lightStack,
    cursorMissing,
    claudeMissing,
    hint: ok
      ? null
      : 'Run: node bin/baking.js install (from repo clone or npx @admin-zyta/baking-ai install)',
  };
}

function listInstalledAgents() {
  const home = homeDir();
  return {
    cursor: checkAgents(path.join(home, '.cursor', 'agents'), CURSOR_AGENTS),
    claude: checkAgents(path.join(home, '.claude', 'agents'), CLAUDE_AGENTS),
  };
}

module.exports = { doctor, listInstalledAgents, CURSOR_AGENTS, CLAUDE_AGENTS };
