'use strict';

const fs = require('fs');
const path = require('path');
const {
  PACKAGE_ROOT,
  homeDir,
  bakingHome,
  legacyOpusSonnetHome,
  defaultBakingHome,
} = require('./paths');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyFile(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

function copyTree(src, destRoot) {
  if (!fs.existsSync(src)) {
    throw new Error(`Missing source tree: ${src}`);
  }
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(destRoot, entry.name);
    if (entry.isDirectory()) {
      copyTree(srcPath, destPath);
    } else if (entry.isFile()) {
      copyFile(srcPath, destPath);
    }
  }
}

function readVersion() {
  return fs.readFileSync(path.join(PACKAGE_ROOT, 'VERSION'), 'utf8').trim();
}

function migrateLegacyHome(targetHome) {
  const legacy = legacyOpusSonnetHome();
  if (!fs.existsSync(legacy)) return null;
  if (path.resolve(legacy) === path.resolve(targetHome)) return null;

  const legacyConfig = path.join(legacy, 'config.json');
  const newConfig = path.join(targetHome, 'config.json');
  if (fs.existsSync(legacyConfig) && !fs.existsSync(newConfig)) {
    ensureDir(targetHome);
    copyFile(legacyConfig, newConfig);
  }

  try {
    fs.rmSync(legacy, { recursive: true, force: true });
    return { removed: legacy };
  } catch (err) {
    if (err.code === 'EPERM' || err.code === 'EBUSY') {
      return { legacy, pendingRemoval: true, note: 'Close Cursor/terminals using the old path, then delete manually' };
    }
    throw err;
  }
}

function removeLegacyRouterRule(cursorRoot) {
  const oldRule = path.join(cursorRoot, 'rules', 'opus-sonnet-router.mdc');
  if (fs.existsSync(oldRule)) fs.unlinkSync(oldRule);
}

function install(options = {}) {
  const home = homeDir();
  const cursorRoot = path.join(home, '.cursor');
  const claudeRoot = path.join(home, '.claude');
  const version = readVersion();
  const homeRoot = bakingHome();

  const legacyMemoryRule = path.join(cursorRoot, 'rules', 'engram-memory.mdc');
  if (fs.existsSync(legacyMemoryRule)) {
    fs.unlinkSync(legacyMemoryRule);
  }

  removeLegacyRouterRule(cursorRoot);

  const migratedFrom = migrateLegacyHome(homeRoot);

  const cursorSrc = path.join(PACKAGE_ROOT, 'global', 'cursor');
  const claudeSrc = path.join(PACKAGE_ROOT, 'global', 'claude');

  copyTree(cursorSrc, cursorRoot);
  copyTree(claudeSrc, claudeRoot);

  return {
    version,
    home,
    cursorRoot,
    claudeRoot,
    bakingHome: homeRoot,
    defaultBakingHome: defaultBakingHome(),
    migratedFrom,
    configPath: path.join(homeRoot, 'config.json'),
  };
}

module.exports = { install, readVersion, PACKAGE_ROOT };
