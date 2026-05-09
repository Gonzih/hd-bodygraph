# PLAN: HD Bodygraph v1.1 Structural Rebuild

## Task Restatement
Add the three major visual features missing from the canonical HD bodygraph:
1. Multi-line spine (7 parallel background lines through the central column)
2. Design/Personality planetary activation columns flanking the chart
3. Widen viewBox to 820×800 to fit activation columns (center bodygraph at x=410)

Plus: accept flexible input (string channels, personalityGates/designGates/bothGates arrays, 'Solar Plexus' with space).

## Current State
- v1.0.1 already has centers, gates inside centers, body silhouette, channel arcs
- Gates are well-positioned with correct coloring (design/personality/both)
- Bodygraph center is at x=300, viewBox 600×820 — too narrow for activation columns
- Score 8/10 with minor issues only (ROOT label overlap, dashed channel through Ajna)

## Approach

### Approach A (chosen): Incremental coordinate shift + additive features
- Shift all x coordinates by +110 (center 300→410) in geometry.ts
- Add renderSpine() in renderer.ts for background multi-line spine
- Add renderActivationColumns() in renderer.ts
- Update types.ts for flexible input + Activations interface
- Update body silhouette path coordinates
- **Trade-off**: Minimal risk, preserves existing quality

### Approach B: Full coordinate redesign
- Redesign all center positions from scratch with larger sizes
- **Trade-off**: Higher risk of breaking what works; not needed given current quality

### Approach C: Separate SVG fragments
- Keep current SVG, compose activation columns as separate panels
- **Trade-off**: Fragile layout, scaling issues

## Files to Touch
- `src/types.ts` — Add Activations interface, expand ChartData
- `src/geometry.ts` — VIEWBOX 820×800, +110 x-shift, add spine y-ranges
- `src/renderer.ts` — renderSpine(), renderActivationColumns(), input normalization

## Risks & Unknowns
1. The +110 x-shift may push some gate pills or arc endpoints out of bounds — need to verify
2. Unicode planet symbols may not render in all SVG environments — use text abbreviations as fallback
3. Activation column row count (13 planets) × row height must fit within chart y-range
