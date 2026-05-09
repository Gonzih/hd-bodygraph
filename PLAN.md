# PLAN: @gonzih/hd-bodygraph

## Task Restatement
Build an npm library that renders Human Design bodygraphs as SVG. The library must:
1. Export `renderToSVG(chartData)` returning valid SVG string
2. Export a React `<BodyGraph chart={chartData} />` component
3. Include an autonomous visual refinement loop using Puppeteer + Claude vision
4. Match the canonical Jovian Archive standard for HD bodygraph rendering
5. Be published as `@gonzih/hd-bodygraph` on npm

## Approaches Considered

### Approach A: Pure geometry from scratch (chosen)
- Build all center positions, gate coordinates, and channel bezier paths from the spec
- No external dependencies for geometry data
- Full control over rendering quality
- Trade-off: more initial work, but result is clean and maintainable

### Approach B: Wrap an existing library
- Look for existing HD bodygraph npm packages and wrap them
- Trade-off: faster if good library exists; but most are incomplete or proprietary
- Research shows no quality open-source npm library for this

### Approach C: Generate from a template SVG
- Take a reference SVG and parameterize it
- Trade-off: fragile, hard to update gate activation state dynamically

**Chosen: Approach A** — spec-driven from the provided geometry data. The prompt supplies exact coordinates for all 64 gates and 9 centers, which is sufficient to build from scratch.

## Architecture

```
src/
  types.ts       — ChartData, CenterName, GateColoring, ChannelPath types
  geometry.ts    — CENTER_POSITIONS, GATE_POSITIONS, CHANNEL_PATHS constants
  renderer.ts    — SVG generation: centers, gates, channels, coloring logic
  index.ts       — exports renderToSVG, BodyGraph React component
  react/
    BodyGraph.tsx — React component (renders SVG in div)
scripts/
  render-png.js   — Puppeteer: renders SVG to PNG at output/current.png
  compare.js      — Claude vision: score render vs reference standard
  apply-fixes.js  — Parse comparison.json and patch geometry.ts coordinates
  refine-loop.sh  — Orchestrate: build → render → compare → fix → repeat
reference/
  target.png      — Reference HD bodygraph image
output/
  current.png     — Latest rendered PNG
  comparison.json — Latest vision comparison result
```

## Files to Touch
- `package.json` — project config, scripts, exports
- `tsconfig.json` — TypeScript config
- `src/types.ts`
- `src/geometry.ts`
- `src/renderer.ts`
- `src/index.ts`
- `src/react/BodyGraph.tsx`
- `scripts/render-png.js`
- `scripts/compare.js`
- `scripts/apply-fixes.js`
- `scripts/refine-loop.sh`
- `research/findings.md`

## Risks & Unknowns
1. Reference image download may fail — will fall back to text-based comparison standard
2. Puppeteer install can be slow — pin version, use --no-sandbox
3. Claude vision scores may be inconsistent — use average of 2 runs if needed
4. Gate coordinate precision — use the spec coordinates as baseline, refinement loop corrects
5. npm publish requires auth — user must be logged into npm as @gonzih
