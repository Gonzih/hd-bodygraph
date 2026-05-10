'use strict';

/**
 * pixeldiff.js
 * Compares two PNG images using pixelmatch and outputs a diff PNG.
 * Red pixels = differ, black pixels = match.
 *
 * Usage:
 *   node scripts/pixeldiff.js [img1] [img2] [diffOut]
 *   node scripts/pixeldiff.js output/current.png reference/target.png output/diff.png
 *
 * Exit code: 0 if diffPct < 5%, 1 otherwise.
 * Writes output/diff-stats.json with { numDiffPixels, totalPixels, diffPct }.
 */

const { PNG } = require('pngjs');
const _pm = require('pixelmatch');
// pixelmatch v7 is ESM-compiled; CJS interop exposes default under .default
const pixelmatch = _pm.default || _pm;
const fs = require('fs');

function readPNG(filePath) {
  const buf = fs.readFileSync(filePath);
  return PNG.sync.read(buf);
}

/**
 * Crop image data to (width x height) from top-left corner.
 * Returns a Buffer suitable for pixelmatch.
 */
function cropImageData(png, width, height) {
  const data = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * png.width + x) * 4;
      const dstIdx = (y * width + x) * 4;
      data[dstIdx]     = png.data[srcIdx];
      data[dstIdx + 1] = png.data[srcIdx + 1];
      data[dstIdx + 2] = png.data[srcIdx + 2];
      data[dstIdx + 3] = png.data[srcIdx + 3];
    }
  }
  return data;
}

function diff(img1Path, img2Path, diffPath) {
  const img1 = readPNG(img1Path);
  const img2 = readPNG(img2Path);

  // Use the smaller dimensions to avoid out-of-bounds reads
  const width  = Math.min(img1.width, img2.width);
  const height = Math.min(img1.height, img2.height);

  const data1 = cropImageData(img1, width, height);
  const data2 = cropImageData(img2, width, height);

  const diffPNG = new PNG({ width, height });

  const numDiffPixels = pixelmatch(data1, data2, diffPNG.data, width, height, {
    threshold: 0.15,    // color distance threshold (0–1)
    includeAA: false,   // ignore anti-aliased pixels
    alpha: 0.3,         // alpha for unchanged pixels in diff image
    diffColor: [255, 0, 0],      // red for differing pixels
    diffColorAlt: [0, 255, 0],   // green for AA-only diffs (when includeAA=true)
  });

  fs.mkdirSync('output', { recursive: true });
  fs.writeFileSync(diffPath, PNG.sync.write(diffPNG));

  const totalPixels = width * height;
  const diffPct = parseFloat(((numDiffPixels / totalPixels) * 100).toFixed(2));

  const stats = { numDiffPixels, totalPixels, diffPct };
  fs.writeFileSync('output/diff-stats.json', JSON.stringify(stats, null, 2));

  console.log(`Compared: ${img1Path} vs ${img2Path}`);
  console.log(`Dimensions: ${width}x${height} (img1: ${img1.width}x${img1.height}, img2: ${img2.width}x${img2.height})`);
  console.log(`Diff pixels: ${numDiffPixels} / ${totalPixels} (${diffPct}%)`);
  console.log(`Diff image: ${diffPath}`);
  console.log(`Stats: output/diff-stats.json`);

  return stats;
}

const [,, img1, img2, diffOut] = process.argv;
const stats = diff(
  img1    || 'output/current.png',
  img2    || 'reference/target.png',
  diffOut || 'output/diff.png'
);

process.exit(stats.diffPct < 5 ? 0 : 1);
