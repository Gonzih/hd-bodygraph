#!/bin/bash
set -e

MAX_ITERATIONS=5
ITERATION=0
SCORE=0

echo "=== HD Bodygraph Refinement Loop ==="
echo "Target score: 8/10"
echo ""

# Initial build
echo "Building library..."
npm run build

while [ $ITERATION -lt $MAX_ITERATIONS ]; do
  ITERATION=$((ITERATION + 1))
  echo ""
  echo "=== Refinement Iteration $ITERATION / $MAX_ITERATIONS ==="

  # Render PNG
  echo "Rendering PNG..."
  node scripts/render-png.js

  # Run comparison
  echo "Running vision comparison..."
  if node scripts/compare.js; then
    SCORE=$(node -e "const r=require('./output/comparison.json'); console.log(r.scores.overall)")
    echo ""
    echo "✓ Score >= 8 ($SCORE/10). Refinement complete after $ITERATION iteration(s)!"
    exit 0
  fi

  SCORE=$(node -e "const r=require('./output/comparison.json'); console.log(r.scores.overall)" 2>/dev/null || echo "0")
  echo "Current score: $SCORE/10"

  if [ $ITERATION -lt $MAX_ITERATIONS ]; then
    echo "Applying fixes from comparison.json..."
    node scripts/apply-fixes.js

    echo "Rebuilding..."
    npm run build
  fi
done

FINAL_SCORE=$(node -e "const r=require('./output/comparison.json'); console.log(r.scores.overall)" 2>/dev/null || echo "0")
echo ""
echo "=== Refinement loop completed after $MAX_ITERATIONS iterations ==="
echo "Final score: $FINAL_SCORE/10"

if [ "$FINAL_SCORE" -lt 8 ]; then
  echo "⚠ Score below 8. Review output/comparison.json for remaining issues."
  exit 1
fi
