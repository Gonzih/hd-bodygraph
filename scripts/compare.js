'use strict';

const fs = require('fs');
const path = require('path');

async function compare() {
  // Dynamic import for ESM SDK
  const { default: Anthropic } = await import('@anthropic-ai/sdk');

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY env var is required');
    process.exit(1);
  }

  const client = new Anthropic({ apiKey });

  let currentPngB64;
  try {
    currentPngB64 = fs.readFileSync('output/current.png').toString('base64');
  } catch (e) {
    console.error('output/current.png not found — run npm run render-png first');
    process.exit(1);
  }

  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `You are reviewing a Human Design bodygraph SVG renderer.

A correct HD bodygraph has these properties:
1. CENTER SHAPES:
   - Head: pointed-top diamond (teardrop shape, pointed at top)
   - Ajna: downward-pointing triangle
   - Throat: rectangle (horizontally wide)
   - G Center: diamond (rotated square, diamond orientation)
   - Ego/Heart: small square, positioned RIGHT of G center between Throat and G
   - Sacral: rectangle below G
   - Solar Plexus: square on RIGHT lower side
   - Spleen: square on LEFT lower side
   - Root: rectangle at bottom

2. GATE BADGES: Small rounded pill shapes (≈22×14px) positioned ALONG channel paths, NOT floating disconnected dots. Each pill shows the gate number. Active gates have colored fills (red for Design, dark for Personality, purple for Both). Inactive gates have light tan fill.

3. CHANNEL ROUTING:
   - Spine channels are vertical connections between centers (Head→Ajna→Throat→G→Sacral→Root)
   - Solar Plexus and Spleen connect via SWEEPING ARCS that go OUTSIDE the central body
   - The Ego channel arcs on the right side
   - Channel 26-44 is a LARGE outer arc that sweeps far to the left around the body
   - Active channels are THICK SOLID LINES (width ≈5-6px)
   - Inactive channel paths are thin dashed gray lines

4. COLORS:
   - Background: warm parchment (#f5ead8 or similar)
   - Defined centers: filled amber/tan
   - Undefined centers: outline only
   - Design gates: reddish-salmon pill
   - Personality gates: dark/black pill
   - Both: purple pill

Please analyze the rendered image and score it 0-10 on each dimension. Be specific about what's wrong.

Output ONLY valid JSON (no markdown, no explanation outside JSON):
{
  "scores": {
    "centers": <0-10 integer>,
    "gates": <0-10 integer>,
    "channels": <0-10 integer>,
    "overall": <0-10 integer>
  },
  "critical_issues": ["issue1", "issue2"],
  "specific_fixes": [
    "Fix description with specifics (e.g. Gate 57 pill is 30px too far left at x=105, should be x=135)",
    "..."
  ]
}`,
          },
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/png',
              data: currentPngB64,
            },
          },
        ],
      },
    ],
  });

  const raw = response.content[0].text.trim();

  let result;
  try {
    // Strip any markdown fences if present
    const cleaned = raw.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '').trim();
    result = JSON.parse(cleaned);
  } catch (e) {
    console.error('Failed to parse Claude response as JSON:');
    console.error(raw);
    process.exit(1);
  }

  fs.mkdirSync('output', { recursive: true });
  fs.writeFileSync('output/comparison.json', JSON.stringify(result, null, 2), 'utf8');

  console.log('=== Comparison Result ===');
  console.log(JSON.stringify(result, null, 2));
  console.log('========================');
  console.log(`Overall score: ${result.scores.overall}/10`);

  if (result.scores.overall >= 8) {
    console.log('✓ Score >= 8! Refinement complete.');
    process.exit(0);
  } else {
    console.log(`✗ Score < 8 (${result.scores.overall}). More refinement needed.`);
    process.exit(1);
  }
}

compare().catch((err) => {
  console.error('compare.js failed:', err);
  process.exit(1);
});
