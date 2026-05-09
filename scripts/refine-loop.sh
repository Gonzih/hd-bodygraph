#!/bin/bash
set -e

MAX_ITERATIONS=8
ITERATION=0

echo "=== HD Bodygraph Precision Refinement Loop ==="
echo "Target score: 8/10 (structural match)"
echo ""

# ── One-time: extract reference structure ─────────────────────────────────────
if [ ! -f output/reference-structure.json ]; then
  if [ -f reference/target.png ] || [ -f reference/target.jpg ] || [ -f reference/target.jpeg ]; then
    echo "=== Extracting reference structure (one-time) ==="
    node scripts/extract-reference.js
    echo ""
  else
    echo "⚠ No reference image found in reference/ (target.png/jpg). Skipping reference extraction."
    echo "  Structural diff will compare rendered output against itself — useful for DOM extraction smoke test."
    echo "  Place reference/target.png for full comparison."
    echo ""
  fi
fi

# ── Initial build ─────────────────────────────────────────────────────────────
echo "Building library..."
npm run build
echo ""

while [ $ITERATION -lt $MAX_ITERATIONS ]; do
  ITERATION=$((ITERATION + 1))
  echo "=== Structural refinement iteration $ITERATION / $MAX_ITERATIONS ==="

  # Render SVG from test chart
  echo "Rendering SVG..."
  node -e "
const { renderToSVG } = require('./dist/index.js');
const fs = require('fs');
const chart = JSON.parse(fs.readFileSync('reference/test-chart.json', 'utf8'));
fs.mkdirSync('output', { recursive: true });
fs.writeFileSync('output/current.svg', renderToSVG(chart));
console.log('SVG written to output/current.svg');
"

  # Also render PNG for optional visual comparison
  node scripts/render-png.js 2>/dev/null || echo "(PNG render skipped)"

  # Extract rendered structure via Puppeteer DOM
  echo "Extracting rendered structure via DOM..."
  node scripts/extract-rendered.js output/current.svg

  # If no reference, copy rendered as reference for this run (smoke-test mode)
  if [ ! -f output/reference-structure.json ]; then
    cp output/rendered-structure.json output/reference-structure.json
    echo "ℹ Using rendered structure as reference (smoke-test mode)"
  fi

  # Structural diff — exact numbers
  echo "Running structural diff..."
  if node scripts/diff-structures.js; then
    echo ""
    echo "✓ Score >= 8. Structural match achieved after $ITERATION iteration(s)!"
    break
  fi

  # Also run vision comparison for qualitative feedback (non-fatal)
  if [ -f output/current.png ] && [ -n "$ANTHROPIC_API_KEY" ]; then
    echo "Running vision comparison (supplementary)..."
    node scripts/compare.js 2>/dev/null || true
  fi

  # Apply fixes based on structural diff
  if [ $ITERATION -lt $MAX_ITERATIONS ]; then
    echo "Applying structural fixes..."
    node scripts/apply-fixes.js output/structural-diff.json

    echo "Rebuilding..."
    npm run build
  fi

  echo ""
done

echo ""
echo "=== Final structural diff summary ==="
if [ -f output/structural-diff.json ]; then
  node -e "
const d = JSON.parse(require('fs').readFileSync('output/structural-diff.json', 'utf8'));
console.log('Score:', d.score + '/10', '| Critical:', d.critical_count, '| Minor:', d.minor_count);
if (d.diffs && d.diffs.length > 0) {
  const critical = d.diffs.filter(x => x.severity === 'critical');
  const minor    = d.diffs.filter(x => x.severity === 'minor');
  if (critical.length) { console.log('\\nCritical issues:'); critical.forEach(x => console.log(' -', x.element + ':', x.issue)); }
  if (minor.length)    { console.log('\\nMinor issues:');   minor.forEach(x => console.log(' -', x.element + ':', x.issue)); }
}
"
fi
