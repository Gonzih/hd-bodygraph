'use strict';

/**
 * screenshot.js
 * Renders the HD bodygraph SVG to a PNG using Playwright.
 * More reliable than Puppeteer for SVG: screenshots the <svg> element directly
 * at its natural bounding box dimensions.
 *
 * Usage:
 *   node scripts/screenshot.js [output/current.png]
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function screenshot(outputPath) {
  let renderToSVG;
  try {
    const mod = require('../dist/index.js');
    renderToSVG = mod.renderToSVG;
  } catch (e) {
    console.error('Failed to load dist/index.js — run npm run build first');
    console.error(e.message);
    process.exit(1);
  }

  const chartPath = path.join(__dirname, '..', 'reference', 'test-chart.json');
  const chart = JSON.parse(fs.readFileSync(chartPath, 'utf8'));
  const svg = renderToSVG(chart);

  // Write SVG for inspection
  fs.mkdirSync('output', { recursive: true });
  fs.writeFileSync('output/current.svg', svg, 'utf8');

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #f5ead8; display: flex; justify-content: flex-start; align-items: flex-start; }
  svg { display: block; }
</style>
</head>
<body>${svg}</body>
</html>`;

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.setContent(html, { waitUntil: 'networkidle' });

    const svgEl = await page.$('svg');
    if (!svgEl) {
      console.error('No <svg> element found in rendered HTML');
      process.exit(1);
    }

    const box = await svgEl.boundingBox();
    const w = Math.ceil(box.width);
    const h = Math.ceil(box.height);

    // Set viewport to exact SVG dimensions so nothing gets clipped
    await page.setViewportSize({ width: w, height: h });

    await svgEl.screenshot({ path: outputPath });
    console.log(`Screenshot saved: ${outputPath} (${w}x${h})`);
  } finally {
    await browser.close();
  }
}

const outputPath = process.argv[2] || 'output/current.png';
screenshot(outputPath).catch((err) => {
  console.error('screenshot.js failed:', err);
  process.exit(1);
});
