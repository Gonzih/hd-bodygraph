'use strict';

/**
 * Reads output/comparison.json and attempts to apply coordinate fixes
 * to src/geometry.ts based on the specific_fixes descriptions.
 *
 * Pattern matching rules:
 * - "Gate N ... too far left ... should be x=X" → adjust gate N x to X
 * - "Gate N ... too far right ... should be x=X" → adjust gate N x to X
 * - "Gate N ... too high ... should be y=Y" → adjust gate N y to Y
 * - "Gate N ... too low ... should be y=Y" → adjust gate N y to Y
 * - "move gate N to x=X, y=Y" → set gate N position to X, Y
 * - "center X ... cx=N, cy=N" → update center cx/cy
 */

const fs = require('fs');

function applyFixes() {
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

  let geometry = fs.readFileSync('src/geometry.ts', 'utf8');
  let fixCount = 0;

  for (const fix of fixes) {
    console.log(`\nFix: ${fix}`);

    // Pattern: gate N x coordinate adjustment
    // e.g. "Gate 57 is too far left (x=105), move to x=135"
    // e.g. "Gate 44 x should be 152, currently 145"
    const gateXPattern = /[Gg]ate\s+(\d+).*?x[=\s]+(\d+(?:\.\d+)?)/;
    const gateYPattern = /[Gg]ate\s+(\d+).*?y[=\s]+(\d+(?:\.\d+)?)/;
    const gateXYPattern = /[Gg]ate\s+(\d+).*?x[=\s]+(\d+(?:\.\d+)?)[,\s]+y[=\s]+(\d+(?:\.\d+)?)/;

    let matched = false;

    // Try x,y pattern first
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
      // Try x-only patterns: "should be x=135" or "move to x=135"
      const shouldBeX = fix.match(/should be x[=\s]+(\d+(?:\.\d+)?)/i);
      const gateNum = fix.match(/[Gg]ate\s+(\d+)/);
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
      // Try y-only patterns
      const shouldBeY = fix.match(/should be y[=\s]+(\d+(?:\.\d+)?)/i);
      const gateNum = fix.match(/[Gg]ate\s+(\d+)/);
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
    fs.writeFileSync('src/geometry.ts', geometry, 'utf8');
    console.log(`\n✓ Applied ${fixCount} coordinate fix(es) to src/geometry.ts`);
  } else {
    console.log('\n⚠ No coordinate fixes could be parsed and applied automatically.');
    console.log('Review the fixes manually and update src/geometry.ts');
  }
}

function adjustGatePosition(src, gate, newX, newY) {
  // Match the gate entry: { gate: N, x: ..., y: ... }
  const re = new RegExp(`(\\{\\s*gate:\\s*${gate}\\s*,\\s*x:\\s*)\\d+(\\.\\d+)?([^}]*?y:\\s*)\\d+(\\.\\d+)?`, 'g');
  return src.replace(re, (m, pre, _xd, mid, _yd) => `${pre}${newX}${mid}${newY}`);
}

function adjustGateX(src, gate, newX) {
  const re = new RegExp(`(\\{\\s*gate:\\s*${gate}\\s*,\\s*x:\\s*)\\d+(\\.\\d+)?`, 'g');
  return src.replace(re, (m, pre) => `${pre}${newX}`);
}

function adjustGateY(src, gate, newY) {
  // gate: N, x: ..., y: OLD
  const re = new RegExp(`(\\{\\s*gate:\\s*${gate}\\s*,\\s*x:\\s*\\d+(?:\\.\\d+)?\\s*,\\s*y:\\s*)\\d+(\\.\\d+)?`, 'g');
  return src.replace(re, (m, pre) => `${pre}${newY}`);
}

applyFixes();
