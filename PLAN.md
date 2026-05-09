# PLAN: Complete Geometry Rebuild — Correct Center Shapes

## Task Restatement
Completely rebuild the HD bodygraph geometry with correct canonical center shapes:
- HEAD: triangle pointing UP (▲) — was `pointed-diamond`
- AJNA: diamond (rotated square) — was `triangle` pointing wrong direction
- THROAT: rectangle (unchanged)
- G CENTER: diamond (unchanged)
- EGO/HEART: small diamond — was `square`
- SACRAL: rectangle (unchanged)
- SOLAR PLEXUS: triangle pointing LEFT (◁) — was `square`
- SPLEEN: triangle pointing RIGHT (▷) — was `square`
- ROOT: rectangle (unchanged)

Also: update viewBox to 820×900, update center positions/sizes per spec, rebuild gate positions, rebuild channel paths, update renderer to handle new shape types.

## Approach
Full rebuild of geometry.ts + shape renderer cases in renderer.ts. Update types.ts to add new shape type strings.

## Files to Touch
- src/types.ts — add `triangle-up | triangle-left | triangle-right`, remove `pointed-diamond | square`
- src/geometry.ts — complete rewrite: VIEWBOX(820×900), CENTER_SHAPES, GATE_POSITIONS, CHANNEL_PATHS
- src/renderer.ts — add shape renderers for new types, update spine (6 lines), update body silhouette

## Risks
- Existing consumers of CenterShape type may use `square` or `pointed-diamond` — safe since we're breaking API is in the types
- Channel paths are bezier arcs computed from gate positions — may need visual tuning
- Gate positions in the spec may have gate 53 listed twice (SACRAL and ROOT) — handled by deduplication
