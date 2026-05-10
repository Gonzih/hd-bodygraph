#!/bin/bash
# refine-loop.sh — Pixel-level visual refinement loop
#
# Pipeline:
#   render SVG → Playwright screenshot → pixelmatch diff → Claude vision (3 images) → apply-fixes → rebuild → repeat
#
# Stop when: pixel diff < 5%  OR  vision score >= 8  OR  max iterations reached
#
# Usage:
#   bash scripts/refine-loop.sh
#   ANTHROPIC_API_KEY=sk-... bash scripts/refine-loop.sh

set -e

MAX_ITERATIONS=6
ITERATION=0

echo "=== HD Bodygraph Pixel-Diff Refinement Loop ==="
echo "Stop conditions: pixel diff < 5%  OR  vision score >= 8  OR  $MAX_ITERATIONS iterations"
echo ""

# ── Initial build ──────────────────────────────────────────────────────────────
echo "Building library..."
npm run build
echo ""

# ── Bootstrap reference image if none exists ──────────────────────────────────
if [ ! -f reference/target.png ]; then
  echo "⚠  No reference/target.png found."
  echo "   Generating a bootstrap reference from the current render."
  echo "   Replace reference/target.png with a real reference image for meaningful comparisons."
  echo ""
  node scripts/screenshot.js output/current.png
  cp output/current.png reference/target.png
  echo "Bootstrap reference saved to reference/target.png"
  echo ""
fi

# ── Refinement loop ───────────────────────────────────────────────────────────
while [ $ITERATION -lt $MAX_ITERATIONS ]; do
  ITERATION=$((ITERATION + 1))
  echo "=== Iteration $ITERATION / $MAX_ITERATIONS ==="

  # Render SVG → PNG via Playwright
  echo "[1/4] Rendering SVG to PNG (Playwright)..."
  node scripts/screenshot.js output/current.png

  # Pixel diff vs reference
  echo "[2/4] Running pixelmatch diff..."
  DIFF_EXIT=0
  node scripts/pixeldiff.js output/current.png reference/target.png output/diff.png || DIFF_EXIT=$?

  DIFF_PCT=$(node -e "const d=require('./output/diff-stats.json'); console.log(d.diffPct);" 2>/dev/null || echo "100")
  echo "      Pixel diff: ${DIFF_PCT}%"

  # Check pixel diff threshold
  BELOW_THRESHOLD=$(node -e "console.log(parseFloat('$DIFF_PCT') < 5 ? 'yes' : 'no')")
  if [ "$BELOW_THRESHOLD" = "yes" ]; then
    echo ""
    echo "✓ Pixel diff < 5%! Visual match achieved after $ITERATION iteration(s)."
    break
  fi

  # Vision compare with 3 images (ref + current + diff)
  if [ -n "$ANTHROPIC_API_KEY" ]; then
    echo "[3/4] Running Claude vision comparison (3-image)..."
    VISION_EXIT=0
    node scripts/vision-compare.js || VISION_EXIT=$?

    SCORE=$(node -e "const d=require('./output/vision-comparison.json'); console.log(d.score);" 2>/dev/null || echo "0")
    echo "      Vision score: ${SCORE}/10"

    if [ "$VISION_EXIT" -eq 0 ]; then
      echo ""
      echo "✓ Vision score >= 8! Quality target achieved after $ITERATION iteration(s)."
      break
    fi

    # Apply coordinate fixes from vision comparison
    if [ $ITERATION -lt $MAX_ITERATIONS ]; then
      echo "[4/4] Applying coordinate fixes..."
      node scripts/apply-fixes.js output/vision-comparison.json || true

      echo "      Rebuilding..."
      npm run build
    fi
  else
    echo "[3/4] ANTHROPIC_API_KEY not set — skipping vision comparison."
    echo "      Set ANTHROPIC_API_KEY to enable Claude vision feedback."
    echo "[4/4] (Skipped — no API key)"
  fi

  echo ""
done

# ── Final summary ──────────────────────────────────────────────────────────────
echo ""
echo "=== Final Summary ==="
FINAL_DIFF=$(node -e "const d=require('./output/diff-stats.json'); console.log(d.diffPct+'%');" 2>/dev/null || echo "N/A")
echo "Pixel diff: $FINAL_DIFF"

if [ -f output/vision-comparison.json ]; then
  node -e "
const d = require('./output/vision-comparison.json');
console.log('Vision score:', d.score + '/10');
console.log('Summary:', d.summary);
if (d.critical_issues && d.critical_issues.length) {
  console.log('Critical issues:');
  d.critical_issues.forEach(i => console.log(' -', i));
}
if (d.issues && d.issues.length) {
  console.log('Remaining issues:', d.issues.length);
  d.issues.forEach(i => console.log(' -', i.element + ':', i.description));
}
" 2>/dev/null || true
fi

echo ""
echo "Output files:"
echo "  output/current.png          — final render"
echo "  output/diff.png             — pixel diff (red = wrong)"
echo "  output/diff-stats.json      — diff statistics"
echo "  output/vision-comparison.json — Claude vision analysis"
