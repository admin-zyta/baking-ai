'use strict';

/** Canonical agent colors (Claude Code palette + Cursor frontmatter). See AGENTS.md */
const AGENT_COLORS = {
  baking: { color: 'cyan', emoji: '🩵', label: 'Orchestrator' },
  planner: { color: 'purple', emoji: '🟣', label: 'Plan · Opus' },
  'planner-hyper': { color: 'magenta', emoji: '🩷', label: 'Deep plan · Fable' },
  'planner-hyper-cursor': { color: 'magenta', emoji: '🩷', label: 'Deep plan · Fable' },
  'planner-cursor': { color: 'yellow', emoji: '🟡', label: 'Plan · Grok' },
  'executor-cursor': { color: 'green', emoji: '🟢', label: 'Execute · Composer' },
  executor: { color: 'blue', emoji: '🔵', label: 'Execute · Sonnet' },
  'executor-mecanic': { color: 'orange', emoji: '🟠', label: 'Mecanic · Haiku' },
  direct: { color: 'cyan', emoji: '⚡', label: 'Direct · orchestrator' },
  'gate-out': { color: 'gray', emoji: '⬜', label: 'No Baking · gate-out' },
};

function delegationBanner(from, to, flow) {
  const meta = AGENT_COLORS[to] || { emoji: '▶️', label: to };
  return `${meta.emoji} **${from} → ${to}** · ${flow || meta.label}`;
}

/** First line when orchestrator resolves without any subagent (still Baking). */
function directBanner(detail) {
  const extra = detail ? ` · ${detail}` : '';
  return `⚡ **Baking · DIRECT** · orchestrator resolves (no subagent)${extra}`;
}

/** First line when Baking was not used at all (Q&A, gate-out). */
function gateOutBanner(reason) {
  const extra = reason ? ` — ${reason}` : '';
  return `⬜ **No Baking** · gate-out${extra}`;
}

module.exports = { AGENT_COLORS, delegationBanner, directBanner, gateOutBanner };
