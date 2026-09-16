'use strict';

const fs = require('fs');
const { homeDir, bakingHome, configPath } = require('./paths');

function readConfig() {
  const p = configPath();
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

function writeConfig(config) {
  const p = configPath();
  fs.mkdirSync(require('path').dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(config, null, 2) + '\n', 'utf8');
}

function patchConfig(patch) {
  const current = readConfig() || {};
  const next = deepMerge(current, patch);
  writeConfig(next);
  return next;
}

function deepMerge(base, patch) {
  const out = { ...base };
  for (const [k, v] of Object.entries(patch)) {
    if (v && typeof v === 'object' && !Array.isArray(v) && base[k] && typeof base[k] === 'object') {
      out[k] = deepMerge(base[k], v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

module.exports = { homeDir, bakingHome, configPath, readConfig, writeConfig, patchConfig };
