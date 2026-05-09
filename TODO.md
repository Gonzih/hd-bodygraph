# TODO: @gonzih/hd-bodygraph

## Phase 1: Research
- [x] Write PLAN.md and TODO.md
- [ ] Research open source HD SVG implementations
- [ ] Save findings to research/findings.md

## Phase 2: Reference
- [ ] Download/create reference bodygraph image
- [ ] Try humandesignapi.nl for a real SVG

## Phase 3: Project Setup
- [ ] git checkout -b feat/bodygraph-library
- [ ] Initialize package.json (npm init)
- [ ] Set up tsconfig.json
- [ ] Install dependencies (typescript, react, etc.)
- [ ] Install dev deps (puppeteer, @anthropic-ai/sdk, tsup)
- [ ] Create directory structure

## Phase 4: Core Library
- [ ] Implement src/types.ts
- [ ] Implement src/geometry.ts (center positions, gate positions, channel paths)
- [ ] Implement src/renderer.ts (SVG generation)
- [ ] Implement src/index.ts (exports)
- [ ] Implement src/react/BodyGraph.tsx

## Phase 5: Scripts
- [ ] Implement scripts/render-png.js
- [ ] Implement scripts/compare.js
- [ ] Implement scripts/apply-fixes.js
- [ ] Implement scripts/refine-loop.sh

## Phase 6: Build & Refine
- [ ] Run npm run build (smoke check)
- [ ] Run render-png to generate initial output
- [ ] Run refinement loop until score >= 8

## Phase 7: Publish & PR
- [ ] npm version 1.0.0 && npm publish --access public
- [ ] git add -A && git commit
- [ ] git push origin feat/bodygraph-library
- [ ] gh pr create
- [ ] gh pr merge --squash --auto
