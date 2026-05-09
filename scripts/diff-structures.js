'use strict';

/**
 * diff-structures.js
 * Compares output/reference-structure.json against output/rendered-structure.json
 * and produces output/structural-diff.json with exact % deltas and fix suggestions.
 *
 * Usage: node scripts/diff-structures.js
 * Exit 0 if score >= 8, exit 1 otherwise.
 */

const fs = require('fs');

// Threshold values (in % of image dimension) below which differences are ignored
const THRESHOLD_CENTER_POS = 2.0;  // center cx/cy within 2% is fine
const THRESHOLD_CENTER_SIZE = 3.0; // center w/h within 3% is fine
const THRESHOLD_GATE = 3.0;        // gate badge within 3% is fine

function loadJson(filepath, label) {
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  } catch (e) {
    console.error(`Cannot read ${label} (${filepath}): ${e.message}`);
    return null;
  }
}

function main() {
  const reference = loadJson('output/reference-structure.json', 'reference');
  const rendered  = loadJson('output/rendered-structure.json', 'rendered');

  if (!rendered) {
    console.error('No rendered-structure.json. Run extract-rendered.js first.');
    process.exit(1);
  }

  const diffs = [];

  // ── Centers ─────────────────────────────────────────────────────────────────
  if (reference && reference.centers) {
    for (const [name, refC] of Object.entries(reference.centers)) {
      const rendC = (rendered.centers || {})[name];
      if (!rendC) {
        diffs.push({
          element:  `CENTER_${name}`,
          issue:    'missing entirely — data-center attribute not found in DOM',
          fix:      null,
          severity: 'critical',
        });
        continue;
      }

      const dx = (refC.cx_pct || 0) - (rendC.cx_pct || 0);
      const dy = (refC.cy_pct || 0) - (rendC.cy_pct || 0);
      const dw = (refC.w_pct  || 0) - (rendC.w_pct  || 0);
      const dh = (refC.h_pct  || 0) - (rendC.h_pct  || 0);

      if (Math.abs(dx) > THRESHOLD_CENTER_POS) {
        diffs.push({
          element:  `CENTER_${name}`,
          issue:    `cx off by ${Math.abs(dx).toFixed(1)}% (ref=${refC.cx_pct}, got=${rendC.cx_pct})`,
          fix:      `adjust CENTER_${name} cx by ${dx.toFixed(2)}% (${dx >= 0 ? '+' : ''}${dx.toFixed(2)}%)`,
          severity: Math.abs(dx) > 5 ? 'critical' : 'minor',
        });
      }
      if (Math.abs(dy) > THRESHOLD_CENTER_POS) {
        diffs.push({
          element:  `CENTER_${name}`,
          issue:    `cy off by ${Math.abs(dy).toFixed(1)}% (ref=${refC.cy_pct}, got=${rendC.cy_pct})`,
          fix:      `adjust CENTER_${name} cy by ${dy.toFixed(2)}% (${dy >= 0 ? '+' : ''}${dy.toFixed(2)}%)`,
          severity: Math.abs(dy) > 5 ? 'critical' : 'minor',
        });
      }
      if (Math.abs(dw) > THRESHOLD_CENTER_SIZE) {
        diffs.push({
          element:  `CENTER_${name}`,
          issue:    `width off by ${Math.abs(dw).toFixed(1)}% (ref=${refC.w_pct}, got=${rendC.w_pct})`,
          fix:      `adjust CENTER_${name} width by ${dw.toFixed(2)}%`,
          severity: 'minor',
        });
      }
      if (Math.abs(dh) > THRESHOLD_CENTER_SIZE) {
        diffs.push({
          element:  `CENTER_${name}`,
          issue:    `height off by ${Math.abs(dh).toFixed(1)}% (ref=${refC.h_pct}, got=${rendC.h_pct})`,
          fix:      `adjust CENTER_${name} height by ${dh.toFixed(2)}%`,
          severity: 'minor',
        });
      }
    }
  }

  // ── Spine ────────────────────────────────────────────────────────────────────
  const refSpine  = (reference && reference.spine)  || {};
  const rendSpine = (rendered && rendered.spine)     || {};

  if (rendSpine.line_count === 0) {
    diffs.push({
      element:  'SPINE',
      issue:    'No spine lines found — data-spine-line attributes missing',
      fix:      null,
      severity: 'critical',
    });
  } else if (refSpine.line_count && rendSpine.line_count !== refSpine.line_count) {
    diffs.push({
      element:  'SPINE',
      issue:    `${rendSpine.line_count} spine lines, reference has ${refSpine.line_count}`,
      fix:      `change numLines from ${rendSpine.line_count} to ${refSpine.line_count} in renderer.ts renderSpine()`,
      severity: 'critical',
    });
  }

  // ── Gate badges ──────────────────────────────────────────────────────────────
  const refGates  = (reference && reference.gate_badges)  || {};
  const rendGates = (rendered && rendered.gate_badges)     || {};

  // Report gates in rendered but report large deviations from reference
  for (const [gate, refG] of Object.entries(refGates)) {
    const rendG = rendGates[gate];
    if (!rendG) {
      diffs.push({
        element:  `GATE_${gate}`,
        issue:    `Gate ${gate} not found in rendered output`,
        fix:      null,
        severity: 'minor',
      });
      continue;
    }

    const dx = (refG.cx_pct || 0) - (rendG.cx_pct || 0);
    const dy = (refG.cy_pct || 0) - (rendG.cy_pct || 0);

    if (Math.abs(dx) > THRESHOLD_GATE || Math.abs(dy) > THRESHOLD_GATE) {
      diffs.push({
        element:  `GATE_${gate}`,
        issue:    `position off: dx=${dx.toFixed(1)}% dy=${dy.toFixed(1)}% (ref cx=${refG.cx_pct} cy=${refG.cy_pct}, got cx=${rendG.cx_pct} cy=${rendG.cy_pct})`,
        fix:      `shift gate ${gate}: x+=${dx.toFixed(2)}% y+=${dy.toFixed(2)}%`,
        severity: (Math.abs(dx) > 6 || Math.abs(dy) > 6) ? 'critical' : 'minor',
      });
    }
  }

  // ── Activation columns ───────────────────────────────────────────────────────
  const rendCols = (rendered && rendered.activation_columns) || {};

  if (!rendCols.design || !rendCols.design.present) {
    diffs.push({
      element:  'COLUMN_DESIGN',
      issue:    'DESIGN column not rendered — data-column="design" missing',
      fix:      null,
      severity: 'critical',
    });
  }
  if (!rendCols.personality || !rendCols.personality.present) {
    diffs.push({
      element:  'COLUMN_PERSONALITY',
      issue:    'PERSONALITY column not rendered — data-column="personality" missing',
      fix:      null,
      severity: 'critical',
    });
  }

  // Compare column positions if reference has them
  const refCols = (reference && reference.activation_columns) || {};
  if (refCols.design && refCols.design.present && rendCols.design && rendCols.design.present) {
    const dx = (refCols.design.x_pct || 0) - (rendCols.design.x_pct || 0);
    if (Math.abs(dx) > 3) {
      diffs.push({
        element:  'COLUMN_DESIGN',
        issue:    `x position off by ${Math.abs(dx).toFixed(1)}% (ref=${refCols.design.x_pct}, got=${rendCols.design.x_pct})`,
        fix:      `adjust design column x by ${dx.toFixed(2)}%`,
        severity: 'minor',
      });
    }
  }

  // ── Scoring ──────────────────────────────────────────────────────────────────
  const critical = diffs.filter((d) => d.severity === 'critical');
  const minor    = diffs.filter((d) => d.severity === 'minor');

  // Score: start at 10, subtract for issues
  const score = Math.max(0, 10 - critical.length * 2 - minor.length * 0.5);

  const report = {
    score:          Math.round(score * 10) / 10,
    critical_count: critical.length,
    minor_count:    minor.length,
    viewbox:        rendered.image_dims || null,
    diffs,
  };

  fs.mkdirSync('output', { recursive: true });
  fs.writeFileSync('output/structural-diff.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));

  console.log(`\nScore: ${report.score}/10 | Critical: ${critical.length} | Minor: ${minor.length}`);

  if (report.score >= 8) {
    console.log('✓ Score >= 8. Structural match achieved!');
    process.exit(0);
  } else {
    console.log('✗ Score < 8. More refinement needed.');
    process.exit(1);
  }
}

main();
