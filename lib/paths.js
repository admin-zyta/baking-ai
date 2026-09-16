'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const PACKAGE_ROOT = path.resolve(__dirname, '..');

function homeDir() {
  return process.env.USERPROFILE || os.homedir();
}

/** Default clone location (Windows). Override with BAKING_HOME. */
function defaultBakingHome() {
  return path.join(homeDir(), 'Desktop', 'side', 'baking');
}

function legacyOpusSonnetHome() {
  return path.join(homeDir(), '.cursor', 'opus-sonnet');
}

function bakingHome() {
  if (process.env.BAKING_HOME) {
    return path.resolve(process.env.BAKING_HOME);
  }
  const candidates = [
    defaultBakingHome(),
    PACKAGE_ROOT,
    legacyOpusSonnetHome(),
  ];
  for (const c of candidates) {
    if (fs.existsSync(path.join(c, 'config.json'))) return c;
  }
  if (fs.existsSync(path.join(PACKAGE_ROOT, 'VERSION'))) return PACKAGE_ROOT;
  return defaultBakingHome();
}

function configPath() {
  return path.join(bakingHome(), 'config.json');
}

function resolveFromHome(rel) {
  return path.join(bakingHome(), rel.replace(/\//g, path.sep));
}

module.exports = {
  PACKAGE_ROOT,
  homeDir,
  defaultBakingHome,
  legacyOpusSonnetHome,
  bakingHome,
  configPath,
  resolveFromHome,
};
