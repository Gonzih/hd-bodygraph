'use strict';

/**
 * extract-reference.js
 * One-time script: calls Claude vision API with the reference image and asks
 * for structured JSON extraction of geometry measurements as % of image dims.
 * Saves output to output/reference-structure.json.
 *
 * Usage: node scripts/extract-reference.js
 * Requires: ANTHROPIC_API_KEY env var, reference/target.png or reference/target.jpg
 */

const fs = require('fs');
const path = require('path');

async function extractStructure(imageBase64, mediaType, client) {
  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: { type: 'base64', media_type: mediaType, data: imageBase64 },
        },
        {
          type: 'text',
          text: `You are a precise SVG geometry extractor. Analyze this Human Design bodygraph image and extract exact structural measurements as percentages of the total image dimensions (0-100 scale, where 0,0 is top-left).

Output ONLY valid JSON matching this schema exactly — no markdown fences, no commentary:

{
  "image_dims": { "width_px": number, "height_px": number },
  "centers": {
    "Head":        { "cx_pct": number, "cy_pct": number, "w_pct": number, "h_pct": number, "shape": "pointed-diamond|triangle|rectangle|diamond|square" },
    "Ajna":        { "cx_pct": number, "cy_pct": number, "w_pct": number, "h_pct": number, "shape": "pointed-diamond|triangle|rectangle|diamond|square" },
    "Throat":      { "cx_pct": number, "cy_pct": number, "w_pct": number, "h_pct": number, "shape": "pointed-diamond|triangle|rectangle|diamond|square" },
    "G":           { "cx_pct": number, "cy_pct": number, "w_pct": number, "h_pct": number, "shape": "pointed-diamond|triangle|rectangle|diamond|square" },
    "Ego":         { "cx_pct": number, "cy_pct": number, "w_pct": number, "h_pct": number, "shape": "pointed-diamond|triangle|rectangle|diamond|square" },
    "Sacral":      { "cx_pct": number, "cy_pct": number, "w_pct": number, "h_pct": number, "shape": "pointed-diamond|triangle|rectangle|diamond|square" },
    "SolarPlexus": { "cx_pct": number, "cy_pct": number, "w_pct": number, "h_pct": number, "shape": "pointed-diamond|triangle|rectangle|diamond|square" },
    "Spleen":      { "cx_pct": number, "cy_pct": number, "w_pct": number, "h_pct": number, "shape": "pointed-diamond|triangle|rectangle|diamond|square" },
    "Root":        { "cx_pct": number, "cy_pct": number, "w_pct": number, "h_pct": number, "shape": "pointed-diamond|triangle|rectangle|diamond|square" }
  },
  "spine": {
    "line_count": number,
    "x_start_pct": number,
    "x_end_pct": number,
    "y_top_pct": number,
    "y_bottom_pct": number,
    "stroke_width_estimate": "thin|medium|thick"
  },
  "channels": {
    "active": ["10-57", "18-58"],
    "arc_extent": {
      "left_arcs":  { "leftmost_x_pct": number, "y_center_pct": number },
      "right_arcs": { "rightmost_x_pct": number, "y_center_pct": number }
    }
  },
  "gate_badges": {
    "GATE_NUM": { "cx_pct": number, "cy_pct": number, "parent_center": "CENTER_NAME", "coloring": "personality|design|both|inactive" }
  },
  "activation_columns": {
    "design":      { "present": boolean, "x_pct": number, "width_pct": number },
    "personality": { "present": boolean, "x_pct": number, "width_pct": number }
  },
  "body_silhouette": {
    "present": boolean,
    "top_y_pct": number,
    "bottom_y_pct": number,
    "max_width_pct": number,
    "max_width_y_pct": number
  }
}

Be as precise as possible. Measure from the image boundaries (not any white border). For gate badges, measure the center of each pill badge. For channels, list only the ones visually rendered as solid/active lines.`,
        },
      ],
    }],
  });

  const raw = response.content[0].text.trim();
  // Strip markdown fences if present
  const cleaned = raw.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '').trim();
  return JSON.parse(cleaned);
}

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY env var is required');
    process.exit(1);
  }

  // Dynamic import for ESM SDK
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const client = new Anthropic({ apiKey });

  let imageBase64, mediaType;

  if (fs.existsSync('reference/target.png')) {
    imageBase64 = fs.readFileSync('reference/target.png').toString('base64');
    mediaType = 'image/png';
  } else if (fs.existsSync('reference/target.jpg')) {
    imageBase64 = fs.readFileSync('reference/target.jpg').toString('base64');
    mediaType = 'image/jpeg';
  } else if (fs.existsSync('reference/target.jpeg')) {
    imageBase64 = fs.readFileSync('reference/target.jpeg').toString('base64');
    mediaType = 'image/jpeg';
  } else {
    console.error('No reference image found. Expected: reference/target.png or reference/target.jpg');
    console.error('Place a canonical HD bodygraph image there and re-run.');
    process.exit(1);
  }

  console.log(`Extracting reference structure from ${mediaType}...`);
  const structure = await extractStructure(imageBase64, mediaType, client);

  fs.mkdirSync('output', { recursive: true });
  fs.writeFileSync('output/reference-structure.json', JSON.stringify(structure, null, 2));
  console.log('Saved to output/reference-structure.json');
  console.log(JSON.stringify(structure, null, 2));
}

main().catch((err) => {
  console.error('extract-reference.js failed:', err.message || err);
  process.exit(1);
});
