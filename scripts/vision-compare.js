'use strict';

/**
 * vision-compare.js
 * Sends up to 3 images to Claude vision (reference, current, diff) and gets
 * structured JSON with coordinate patch suggestions.
 *
 * Usage:
 *   node scripts/vision-compare.js
 *
 * Reads:
 *   output/current.png       — required
 *   reference/target.png     — optional (used if present)
 *   output/diff.png          — optional (used if present)
 *   output/diff-stats.json   — optional metadata
 *
 * Writes:
 *   output/vision-comparison.json
 *
 * Exit code: 0 if score >= 8, 1 otherwise.
 */

const fs = require('fs');

async function visionCompare() {
  const { default: Anthropic } = await import('@anthropic-ai/sdk');

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY env var is required');
    process.exit(1);
  }

  const client = new Anthropic({ apiKey });

  // ── Load images ──────────────────────────────────────────────────────────────

  const currentExists = fs.existsSync('output/current.png');
  const refExists     = fs.existsSync('reference/target.png');
  const diffExists    = fs.existsSync('output/diff.png');

  if (!currentExists) {
    console.error('output/current.png not found — run npm run screenshot first');
    process.exit(1);
  }

  const currentB64 = fs.readFileSync('output/current.png').toString('base64');
  const refB64     = refExists    ? fs.readFileSync('reference/target.png').toString('base64') : null;
  const diffB64    = diffExists   ? fs.readFileSync('output/diff.png').toString('base64')    : null;

  const diffStats = fs.existsSync('output/diff-stats.json')
    ? JSON.parse(fs.readFileSync('output/diff-stats.json', 'utf8'))
    : null;

  // ── Build message content ─────────────────────────────────────────────────────

  const content = [];

  let imageIndex = 1;

  // System context first
  content.push({
    type: 'text',
    text: `You are analyzing a Human Design bodygraph SVG renderer. ${
      diffExists
        ? `You will see ${refExists ? 3 : 2} images: ${refExists ? '(1) reference/target, (2) current render, (3) pixel diff where RED = wrong pixels.' : '(1) current render, (2) pixel diff where RED = wrong pixels.'}`
        : refExists
          ? 'You will see 2 images: (1) reference/target, (2) current render.'
          : 'You will see 1 image: the current render to evaluate.'
    }`,
  });

  if (refB64) {
    content.push({
      type: 'image',
      source: { type: 'base64', media_type: 'image/png', data: refB64 },
    });
    content.push({ type: 'text', text: `Image ${imageIndex++}: REFERENCE (target — what we want)` });
  }

  content.push({
    type: 'image',
    source: { type: 'base64', media_type: 'image/png', data: currentB64 },
  });
  content.push({ type: 'text', text: `Image ${imageIndex++}: CURRENT render` });

  if (diffB64) {
    content.push({
      type: 'image',
      source: { type: 'base64', media_type: 'image/png', data: diffB64 },
    });
    content.push({ type: 'text', text: `Image ${imageIndex++}: PIXEL DIFF (red = wrong pixels, black = correct)` });
  }

  // Analysis prompt
  content.push({
    type: 'text',
    text: `${diffStats ? `Overall pixel diff: ${diffStats.diffPct}% of pixels differ (${diffStats.numDiffPixels} / ${diffStats.totalPixels}).` : ''}

Analyze the differences between the reference and current render. Focus on:
1. Red regions in the pixel diff image — these are exact pixel-level errors
2. Center shapes — are HEAD/AJNA/THROAT/G/EGO/SACRAL/SOLAR_PLEXUS/SPLEEN/ROOT in the right position and shape?
3. Gate badges — are the numbered pills in the right positions along channel paths?
4. Channel routing — do the connecting lines between centers follow correct paths?
5. Colors — defined centers amber, undefined centers outline only, channels correct colors?

For each problem found, give a specific actionable fix as a geometry constant change.
Fix format examples:
  - "shift gate N: x+=P% y+=Q%"  (where P,Q are % of viewbox width/height, can be negative)
  - "adjust CENTER_Name cx by P%"
  - "adjust CENTER_Name cy by P%"

Output ONLY valid JSON (no markdown fences, no text outside JSON):
{
  "diff_pct": ${diffStats?.diffPct ?? 0},
  "score": <integer 0-10, where 10=perfect pixel match>,
  "issues": [
    {
      "element": "GATE_44",
      "description": "Gate 44 pill is 25px too far right, 10px too low",
      "fix": "shift gate 44: x+=-3.0% y+=1.1%"
    }
  ],
  "critical_issues": ["<issue description>"],
  "summary": "<one line summary of the overall state>"
}`,
  });

  // ── Call Claude ───────────────────────────────────────────────────────────────

  console.log(`Sending ${imageIndex - 1} image(s) to Claude vision...`);

  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 3000,
    messages: [{ role: 'user', content }],
  });

  const raw = response.content[0].text.trim();

  let result;
  try {
    // Strip markdown fences if present
    const cleaned = raw.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '').trim();
    result = JSON.parse(cleaned);
  } catch (e) {
    console.error('Failed to parse Claude response as JSON:');
    console.error(raw);
    process.exit(1);
  }

  fs.mkdirSync('output', { recursive: true });
  fs.writeFileSync('output/vision-comparison.json', JSON.stringify(result, null, 2), 'utf8');

  console.log('=== Vision Comparison Result ===');
  console.log(`Score: ${result.score}/10`);
  console.log(`Diff:  ${result.diff_pct}%`);
  console.log(`Issues: ${result.issues?.length ?? 0}`);
  if (result.critical_issues?.length) {
    console.log('Critical:');
    result.critical_issues.forEach((i) => console.log('  -', i));
  }
  console.log(`Summary: ${result.summary}`);
  console.log('================================');
  console.log('Full result: output/vision-comparison.json');

  return result;
}

visionCompare()
  .then((r) => process.exit(r.score >= 8 ? 0 : 1))
  .catch((err) => {
    console.error('vision-compare.js failed:', err);
    process.exit(1);
  });
