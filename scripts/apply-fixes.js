'use strict';

/**
 * apply-fixes.js
 * Reads a diff file and applies coordinate fixes to src/geometry.ts.
 *
 * Supports three input formats:
 *   1. output/structural-diff.json (precision pipeline) — pass as first argument
 *      Parses diffs[].fix strings like:
 *        "shift gate 44: x+=-2.3% y+=1.1%"
 *        "adjust CENTER_Head cx by +3.50%"
 *   2. output/vision-comparison.json (pixelmatch vision pipeline)
 *      Parses issues[].fix strings — same format as structural-diff
 *   3. output/comparison.json (legacy vision pipeline) — used when no arg given
 *      Parses specific_fixes[] text strings.
 *
 * Usage:
 *   node scripts/apply-fixes.js output/structural-diff.json      # precision mode
 *   node scripts/apply-fixes.js output/vision-comparison.json    # vision-compare mode
 *   node scripts/apply-fixes.js                                  # legacy mode
 */

const fs = require('fs');

// ViewBox dimensions — must match VIEWBOX in src/geometry.ts
const VIEWBOX_W = 820;
const VIEWBOX_H = 650;

// ─── Geometry patchers ────────────────────────────────────────────────────────

function readGeometry() {
  return fs.readFileSync('src/geometry.ts', 'utf8');
}

function writeGeometry(content) {
  fs.writeFileSync('src/geometry.ts', content, 'utf8');
}

function adjustGateX(src, gate, newX) {
  const re = new RegExp(`(\\{\\s*gate:\\s*${gate}\\s*,\\s*x:\\s*)\\d+(\\.\\d+)?`, 'g');
  return src.replace(re, (m, pre) => `${pre}${newX}`);
}

function adjustGateY(src, gate, newY) {
  const re = new RegExp(`(\\{\\s*gate:\\s*${gate}\\s*,\\s*x:\\s*\\d+(?:\\.\\d+)?\\s*,\\s*y:\\s*)\\d+(\\.\\d+)?`, 'g');
  return src.replace(re, (m, pre) => `${pre}${newY}`);
}

function adjustGatePosition(src, gate, newX, newY) {
  const re = new RegExp(`(\\{\\s*gate:\\s*${gate}\\s*,\\s*x:\\s*)\\d+(\\.\\d+)?([^}]*?y:\\s*)\\d+(\\.\\d+)?`, 'g');
  return src.replace(re, (m, pre, _xd, mid, _yd) => `${pre}${newX}${mid}${newY}`);
}

function adjustCenterCX(src, centerName, newCX) {
  // Match: { name: 'Head', ..., cx: OLD, ... }
  const re = new RegExp(`(\\{\\s*name:\\s*'${centerName}'[^}]*?cx:\\s*)\\d+(\\.\\d+)?`, 'g');
  return src.replace(re, (m, pre) => `${pre}${newCX}`);
}

function adjustCenterCY(src, centerName, newCY) {
  const re = new RegExp(`(\\{\\s*name:\\s*'${centerName}'[^}]*?cy:\\s*)\\d+(\\.\\d+)?`, 'g');
  return src.replace(re, (m, pre) => `${pre}${newCY}`);
}

// ─── Precision pipeline: parse structural-diff.json ──────────────────────────

function applyStructuralDiff(diffPath) {
  let diff;
  try {
    diff = JSON.parse(fs.readFileSync(diffPath, 'utf8'));
  } catch (e) {
    console.error(`Cannot read ${diffPath}: ${e.message}`);
    process.exit(1);
  }

  const diffs = diff.diffs || [];
  if (diffs.length === 0) {
    console.log('No diffs found in structural-diff.json');
    return;
  }

  // Only apply fixes that have a non-null fix string
  const fixable = diffs.filter((d) => d.fix && d.severity !== undefined);
  console.log(`Processing ${fixable.length} fixable diffs (of ${diffs.length} total)...`);

  let geometry = readGeometry();
  let fixCount = 0;

  for (const entry of fixable) {
    const fix = entry.fix;
    console.log(`\nElement: ${entry.element}`);
    console.log(`Issue:   ${entry.issue}`);
    console.log(`Fix:     ${fix}`);

    // ── Gate shift: "shift gate N: x+=P% y+=Q%"
    const gateShift = fix.match(/shift gate (\d+):\s*x\+=([-\d.]+)%\s*y\+=([-\d.]+)%/i);
    if (gateShift) {
      const gate  = parseInt(gateShift[1], 10);
      const dxPct = parseFloat(gateShift[2]);
      const dyPct = parseFloat(gateShift[3]);

      // Find current gate position, compute new absolute coords
      const xMatch = geometry.match(new RegExp(`{\\s*gate:\\s*${gate}\\s*,\\s*x:\\s*(\\d+(?:\\.\\d+)?)\\s*,\\s*y:\\s*(\\d+(?:\\.\\d+)?)`));
      if (xMatch) {
        const curX = parseFloat(xMatch[1]);
        const curY = parseFloat(xMatch[2]);
        const newX = Math.round(curX + (dxPct / 100) * VIEWBOX_W);
        const newY = Math.round(curY + (dyPct / 100) * VIEWBOX_H);
        geometry = adjustGatePosition(geometry, gate, newX, newY);
        fixCount++;
        console.log(`  → Gate ${gate}: (${curX},${curY}) → (${newX},${newY}) [Δx=${dxPct}%→${Math.round((dxPct/100)*VIEWBOX_W)}px, Δy=${dyPct}%→${Math.round((dyPct/100)*VIEWBOX_H)}px]`);
      } else {
        console.log(`  ⚠ Gate ${gate} not found in geometry.ts`);
      }
      continue;
    }

    // ── Center cx: "adjust CENTER_X cx by P%"
    const centerCX = fix.match(/adjust CENTER_(\w+) cx by ([-\d.]+)%/i);
    if (centerCX) {
      const name  = centerCX[1];
      const dxPct = parseFloat(centerCX[2]);
      const cxMatch = geometry.match(new RegExp(`{\\s*name:\\s*'${name}'[^}]*?cx:\\s*(\\d+(?:\\.\\d+)?)`));
      if (cxMatch) {
        const curCX = parseFloat(cxMatch[1]);
        const newCX = Math.round(curCX + (dxPct / 100) * VIEWBOX_W);
        geometry = adjustCenterCX(geometry, name, newCX);
        fixCount++;
        console.log(`  → CENTER_${name} cx: ${curCX} → ${newCX}`);
      } else {
        console.log(`  ⚠ CENTER_${name} not found in geometry.ts`);
      }
      continue;
    }

    // ── Center cy: "adjust CENTER_X cy by P%"
    const centerCY = fix.match(/adjust CENTER_(\w+) cy by ([-\d.]+)%/i);
    if (centerCY) {
      const name  = centerCY[1];
      const dyPct = parseFloat(centerCY[2]);
      const cyMatch = geometry.match(new RegExp(`{\\s*name:\\s*'${name}'[^}]*?cy:\\s*(\\d+(?:\\.\\d+)?)`));
      if (cyMatch) {
        const curCY = parseFloat(cyMatch[1]);
        const newCY = Math.round(curCY + (dyPct / 100) * VIEWBOX_H);
        geometry = adjustCenterCY(geometry, name, newCY);
        fixCount++;
        console.log(`  → CENTER_${name} cy: ${curCY} → ${newCY}`);
      } else {
        console.log(`  ⚠ CENTER_${name} not found in geometry.ts`);
      }
      continue;
    }

    console.log(`  ⚠ Could not auto-apply fix: "${fix}"`);
  }

  if (fixCount > 0) {
    writeGeometry(geometry);
    console.log(`\n✓ Applied ${fixCount} fix(es) to src/geometry.ts`);
  } else {
    console.log('\n⚠ No fixes could be applied automatically. Review structural-diff.json manually.');
  }
}

// ─── Legacy pipeline: parse comparison.json ───────────────────────────────────

function applyComparisonFixes() {
  let comparison;
  try {
    comparison = JSON.parse(fs.readFileSync('output/comparison.json', 'utf8'));
  } catch (e) {
    console.error('output/comparison.json not found or invalid. Run compare.js first.');
    process.exit(1);
  }

  const fixes = comparison.specific_fixes || [];
  if (fixes.length === 0) {
    console.log('No specific fixes found in comparison.json');
    return;
  }

  console.log(`Processing ${fixes.length} fixes...`);

  let geometry = readGeometry();
  let fixCount = 0;

  for (const fix of fixes) {
    console.log(`\nFix: ${fix}`);

    const gateXYPattern = /[Gg]ate\s+(\d+).*?x[=\s]+(\d+(?:\.\d+)?)[,\s]+y[=\s]+(\d+(?:\.\d+)?)/;
    let matched = false;

    const xyMatch = fix.match(gateXYPattern);
    if (xyMatch) {
      const [, gateStr, xStr, yStr] = xyMatch;
      const gate = parseInt(gateStr, 10);
      const newX = parseFloat(xStr);
      const newY = parseFloat(yStr);
      geometry = adjustGatePosition(geometry, gate, newX, newY);
      fixCount++;
      matched = true;
      console.log(`  → Set gate ${gate} to x=${newX}, y=${newY}`);
    }

    if (!matched) {
      const shouldBeX = fix.match(/should be x[=\s]+(\d+(?:\.\d+)?)/i);
      const gateNum   = fix.match(/[Gg]ate\s+(\d+)/);
      if (shouldBeX && gateNum) {
        const gate = parseInt(gateNum[1], 10);
        const newX = parseFloat(shouldBeX[1]);
        geometry = adjustGateX(geometry, gate, newX);
        fixCount++;
        matched = true;
        console.log(`  → Set gate ${gate} x to ${newX}`);
      }
    }

    if (!matched) {
      const shouldBeY = fix.match(/should be y[=\s]+(\d+(?:\.\d+)?)/i);
      const gateNum   = fix.match(/[Gg]ate\s+(\d+)/);
      if (shouldBeY && gateNum) {
        const gate = parseInt(gateNum[1], 10);
        const newY = parseFloat(shouldBeY[1]);
        geometry = adjustGateY(geometry, gate, newY);
        fixCount++;
        matched = true;
        console.log(`  → Set gate ${gate} y to ${newY}`);
      }
    }

    if (!matched) {
      console.log(`  ⚠ Could not parse fix automatically: "${fix}"`);
    }
  }

  if (fixCount > 0) {
    writeGeometry(geometry);
    console.log(`\n✓ Applied ${fixCount} coordinate fix(es) to src/geometry.ts`);
  } else {
    console.log('\n⚠ No coordinate fixes could be parsed and applied automatically.');
    console.log('Review the fixes manually and update src/geometry.ts');
  }
}

// ─── Vision-compare pipeline: parse vision-comparison.json ───────────────────

function applyVisionFixes(filePath) {
  let data;
  try {
    data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.error(`Cannot read ${filePath}: ${e.message}`);
    process.exit(1);
  }

  // Normalize issues[] to the same shape as diffs[]
  const issues = data.issues || [];
  if (issues.length === 0) {
    console.log('No issues found in vision-comparison.json');
    return;
  }

  // Convert to structural-diff format and reuse the same fix-apply logic
  const normalized = {
    diffs: issues.map((i) => ({
      element: i.element,
      issue: i.description,
      fix: typeof i.fix === 'string' ? i.fix : null,
      severity: 'minor', // all issues treated as fixable
    })),
  };

  const tmpPath = 'output/_normalized-vision-fixes.json';
  fs.writeFileSync(tmpPath, JSON.stringify(normalized, null, 2));
  applyStructuralDiff(tmpPath);
  fs.unlinkSync(tmpPath);
}

// ─── Entry point ──────────────────────────────────────────────────────────────

const inputPath = process.argv[2];

if (inputPath && inputPath.includes('vision-comparison')) {
  // Vision-compare mode: read issues[] from vision-comparison.json
  applyVisionFixes(inputPath);
} else if (inputPath) {
  // Precision mode: read diffs[] from structural-diff.json
  applyStructuralDiff(inputPath);
} else {
  // Legacy mode: read comparison.json
  applyComparisonFixes();
}
