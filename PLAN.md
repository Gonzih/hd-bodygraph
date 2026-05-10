# PLAN: Canonical Colors + BodyGraphOptions Customization (DONE)
# (Previous plan preserved below)
# PLAN: Complete Geometry Rebuild — Correct Center Shapes

## Task Restatement
Replace the existing DOM-extraction + percentage-comparison refinement loop with a pixel-level
diff approach using pixelmatch. The new pipeline:

  render SVG → Playwright screenshot → pixelmatch(current, reference) → diff.png
  → Claude vision sees all 3 images → outputs JSON coordinate patches
  → apply-fixes.js patches geometry.ts → rebuild → repeat

The old approach (Puppeteer DOM extraction + SVG data- attributes + percentage comparison) is
unreliable because SVG data-* attributes aren't reliably present and percentages are imprecise.

## Approaches Considered

### A) Keep Puppeteer, add pixelmatch
Reuse existing render-png.js (Puppeteer) but add pixelmatch step.
- Pro: Less to change
- Con: Puppeteer is heavier, hardcoded 820x650 viewport, SVG scaling is unreliable

### B) Switch to Playwright + pixelmatch (CHOSEN)
Playwright is more reliable for SVG rendering (better CSS/layout engine), can screenshot
individual SVG element with correct bounding box.
- Pro: Accurate dimensions, modern API, better SVG support
- Con: New dependency, need `npx playwright install chromium`

### C) Server-side rendering (no browser)
Use @resvg/resvg-js or sharp to render SVG to PNG.
- Pro: No browser needed
- Con: Requires native binaries, different rendering engine than browser (may not match)

## Chosen Approach: B (Playwright + pixelmatch)

## Files to Touch
- scripts/screenshot.js — NEW: Playwright-based SVG renderer
- scripts/pixeldiff.js — NEW: pixelmatch diff script
- scripts/vision-compare.js — NEW: 3-image Claude vision (replaces compare.js)
- scripts/apply-fixes.js — UPDATE: handle vision-compare.js JSON format
- scripts/refine-loop.sh — REWRITE: pixel-diff pipeline
- package.json — UPDATE: add new npm scripts, add devDependencies

## Risks
- Playwright chromium install may require network; handle gracefully
- If no reference/target.png exists, bootstrap by saving current render as reference
- pixelmatch needs images to be same size; crop to min(w,h) if sizes differ
- Claude vision JSON parse may fail; add error handling
