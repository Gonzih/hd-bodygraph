# PLAN: Precision Structural Comparison Pipeline

## Task Restatement
Replace impression-based vision comparison with an exact number-to-number diff pipeline:
1. Extract reference image structure → JSON (one-time, via Claude vision)
2. Extract rendered SVG structure → JSON (every iteration, via Puppeteer DOM getBoundingClientRect)
3. Diff the two JSONs → exact % deltas per element
4. Apply surgical patches to geometry.ts based on exact deltas

## Approach (chosen)
- Add data-* attributes to renderer.ts SVG elements (foundation for DOM extraction)
- scripts/extract-reference.js: Claude vision → reference-structure.json (one-time)
- scripts/extract-rendered.js: Puppeteer DOM → rendered-structure.json (per iteration)
- scripts/diff-structures.js: exact % diff → structural-diff.json with fix suggestions
- scripts/apply-fixes.js: updated to parse structural-diff.json deltas → patch geometry.ts
- scripts/refine-loop.sh: updated to orchestrate precision loop

## Files to Touch
- reference/test-chart.json (new)
- src/renderer.ts — add data-* attributes
- scripts/extract-reference.js (new)
- scripts/extract-rendered.js (new)
- scripts/diff-structures.js (new)
- scripts/apply-fixes.js — extend for structural-diff.json
- scripts/refine-loop.sh — precision loop

## Risks
- Puppeteer needs Chrome installed
- Reference image may not exist — handle gracefully
- node_modules not installed — npm install needed
