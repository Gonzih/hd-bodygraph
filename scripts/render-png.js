'use strict';

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Maksim's chart data (from humandesignapi.nl)
const MAKSIM_CHART = {
  gates: [
    // Design (unconscious/red)
    { gate: 40, coloring: 'both' },
    { gate: 37, coloring: 'design' },
    { gate: 30, coloring: 'design' },
    { gate: 29, coloring: 'design' },
    { gate: 6,  coloring: 'design' },
    { gate: 18, coloring: 'design' },
    { gate: 57, coloring: 'design' },
    { gate: 47, coloring: 'design' },
    { gate: 52, coloring: 'both' },
    { gate: 58, coloring: 'design' },
    { gate: 10, coloring: 'both' },
    { gate: 38, coloring: 'both' },
    { gate: 44, coloring: 'design' },
    // Personality (conscious/black)
    { gate: 9,  coloring: 'personality' },
    { gate: 16, coloring: 'personality' },
    { gate: 49, coloring: 'personality' },
    { gate: 4,  coloring: 'personality' },
    { gate: 26, coloring: 'personality' },
    { gate: 61, coloring: 'personality' },
    { gate: 1,  coloring: 'personality' },
  ],
  definedCenters: ['Ego', 'G', 'Root', 'Sacral', 'SolarPlexus', 'Spleen'],
  channels: [
    [10, 57],
    [18, 58],
    [26, 44],
    [37, 40],
    [9, 52],
  ],
};

async function main() {
  // Load the built module
  let renderToSVG;
  try {
    const mod = require('../dist/index.js');
    renderToSVG = mod.renderToSVG;
  } catch (e) {
    console.error('Failed to load dist/index.cjs — run npm run build first');
    console.error(e.message);
    process.exit(1);
  }

  const svg = renderToSVG(MAKSIM_CHART);
  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #f5ead8; display: flex; justify-content: center; align-items: center; }
</style>
</head>
<body>${svg}</body>
</html>`;

  // Also save SVG for inspection
  fs.mkdirSync('output', { recursive: true });
  fs.writeFileSync('output/current.svg', svg, 'utf8');
  console.log('SVG written to output/current.svg');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 600, height: 780, deviceScaleFactor: 2 });
    await page.setContent(html, { waitUntil: 'domcontentloaded' });

    await page.screenshot({
      path: 'output/current.png',
      clip: { x: 0, y: 0, width: 600, height: 780 },
      omitBackground: false,
    });

    console.log('PNG rendered to output/current.png');
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error('render-png failed:', err);
  process.exit(1);
});
