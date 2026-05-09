'use strict';

/**
 * extract-rendered.js
 * Uses Puppeteer to load the rendered SVG and extract exact bounding boxes
 * via getBoundingClientRect() from data-* annotated elements.
 * Saves output to output/rendered-structure.json.
 *
 * Usage: node scripts/extract-rendered.js [svgPath]
 * Default svgPath: output/current.svg
 *
 * Requires data-* attributes on SVG elements (added in renderer.ts):
 *   - data-center="HEAD" etc on each center group
 *   - data-gate="44" data-coloring="design" on each gate pill group
 *   - data-spine-line="1" on each parallel spine line
 *   - data-column="design" / data-column="personality" on column groups
 */

const puppeteer = require('puppeteer');
const fs = require('fs');

async function extractRenderedStructure(svgPath) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();

    const svgContent = fs.readFileSync(svgPath, 'utf8');
    const html = `<!DOCTYPE html><html><head><style>*{margin:0;padding:0;box-sizing:border-box;}body{background:#f5ead8;}</style></head><body>${svgContent}</body></html>`;

    // Viewport must match the SVG viewBox (820x650) for accurate pixel measurements
    await page.setViewport({ width: 820, height: 650, deviceScaleFactor: 1 });
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('svg');

    const structure = await page.evaluate(() => {
      const svg = document.querySelector('svg');
      const svgRect = svg.getBoundingClientRect();
      const W = svgRect.width;
      const H = svgRect.height;

      const pct = (val, total) => Math.round((val / total) * 1000) / 10;

      // ── Centers ───────────────────────────────────────────────────────────────
      const centers = {};
      document.querySelectorAll('[data-center]').forEach((el) => {
        const r = el.getBoundingClientRect();
        const name = el.getAttribute('data-center');
        // Use the shape child element (polygon/rect) for tighter bounds
        const shapeEl = el.querySelector('polygon, rect') || el;
        const sr = shapeEl.getBoundingClientRect();
        centers[name] = {
          cx_pct: pct(sr.left + sr.width / 2 - svgRect.left, W),
          cy_pct: pct(sr.top + sr.height / 2 - svgRect.top, H),
          w_pct:  pct(sr.width, W),
          h_pct:  pct(sr.height, H),
        };
      });

      // ── Gate badges ───────────────────────────────────────────────────────────
      const gateBadges = {};
      document.querySelectorAll('[data-gate]').forEach((el) => {
        const r = el.getBoundingClientRect();
        const gate = el.getAttribute('data-gate');
        gateBadges[gate] = {
          cx_pct:   pct(r.left + r.width / 2 - svgRect.left, W),
          cy_pct:   pct(r.top + r.height / 2 - svgRect.top, H),
          coloring: el.getAttribute('data-coloring') || 'unknown',
        };
      });

      // ── Spine lines ───────────────────────────────────────────────────────────
      const spineLines = document.querySelectorAll('[data-spine-line]');
      const spineLineData = Array.from(spineLines).map((l) => {
        const r = l.getBoundingClientRect();
        return {
          index: parseInt(l.getAttribute('data-spine-line'), 10),
          x_pct: pct(r.left - svgRect.left + r.width / 2, W),
        };
      });
      const spine = {
        line_count: spineLines.length,
        lines: spineLineData,
        x_start_pct: spineLineData.length > 0 ? Math.min(...spineLineData.map((l) => l.x_pct)) : null,
        x_end_pct:   spineLineData.length > 0 ? Math.max(...spineLineData.map((l) => l.x_pct)) : null,
      };

      // ── Activation columns ────────────────────────────────────────────────────
      const designCol = document.querySelector('[data-column="design"]');
      const persCol   = document.querySelector('[data-column="personality"]');

      const colInfo = (el) => {
        if (!el) return { present: false };
        const r = el.getBoundingClientRect();
        return {
          present: true,
          x_pct:     pct(r.left - svgRect.left, W),
          width_pct: pct(r.width, W),
          cx_pct:    pct(r.left + r.width / 2 - svgRect.left, W),
        };
      };

      return {
        image_dims: { width_px: Math.round(W), height_px: Math.round(H) },
        centers,
        gate_badges: gateBadges,
        spine,
        activation_columns: {
          design:      colInfo(designCol),
          personality: colInfo(persCol),
        },
      };
    });

    return structure;
  } finally {
    await browser.close();
  }
}

async function main() {
  const svgPath = process.argv[2] || 'output/current.svg';

  if (!fs.existsSync(svgPath)) {
    console.error(`SVG not found: ${svgPath}`);
    process.exit(1);
  }

  console.log(`Extracting rendered structure from ${svgPath}...`);
  const structure = await extractRenderedStructure(svgPath);

  fs.mkdirSync('output', { recursive: true });
  fs.writeFileSync('output/rendered-structure.json', JSON.stringify(structure, null, 2));
  console.log('Saved to output/rendered-structure.json');
  console.log(JSON.stringify(structure, null, 2));
}

main().catch((err) => {
  console.error('extract-rendered.js failed:', err.message || err);
  process.exit(1);
});
