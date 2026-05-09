import type { ChartData, CenterShape, GateColoring, GateActivation, Activations } from './types';
import { CENTER_SHAPES, GATE_POSITIONS, CHANNEL_PATHS, VIEWBOX, SPINE_Y } from './geometry';

// ─── COLORS ────────────────────────────────────────────────────────────────────
const COLORS = {
  background: '#f5ead8',
  definedCenter: '#c8a882',
  undefinedCenter: '#ede0cc',
  centerStroke: '#5a3e28',
  centerStrokeWidth: 2.5,
  // Gate pills
  designFill: '#c87860',      // reddish-salmon for Design (unconscious)
  personalityFill: '#2a2a2a', // dark for Personality (conscious)
  bothFill: '#8b5cf6',        // purple for both
  inactiveFill: '#e8d8c0',    // light tan for inactive gate slots
  pillText: '#ffffff',
  inactiveText: '#888888',
  pillStroke: '#3a2810',
  // Channels
  definedChannelStroke: '#3a2810',
  definedChannelWidth: 5,
  potentialChannelStroke: '#bbbbbb',
  potentialChannelWidth: 1.5,
  potentialChannelDash: '5,4',
  // Spine
  spineStroke: '#3d2b1a',
  spineOpacity: '0.7',
  // Activation columns
  designText: '#c87860',
  personalityText: '#2a2a2a',
};

// ─── INPUT NORMALIZATION ───────────────────────────────────────────────────────

interface NormalizedChart {
  gates: GateActivation[];
  definedCenters: string[];       // already normalized center names
  channels: [number, number][];
  activations?: ChartData['activations'];
}

function parseChannel(ch: string | [number, number]): [number, number] {
  if (typeof ch === 'string') {
    const parts = ch.split('-').map(Number);
    return [parts[0], parts[1]] as [number, number];
  }
  return ch;
}

function normalizeCenterName(name: string): string {
  return name === 'Solar Plexus' ? 'SolarPlexus' : name;
}

function normalizeChart(chartData: ChartData): NormalizedChart {
  const channels = chartData.channels.map(parseChannel);

  let gates: GateActivation[];
  if (chartData.gates && chartData.gates.length > 0) {
    gates = chartData.gates;
  } else {
    const map = new Map<number, GateColoring>();
    for (const g of chartData.designGates ?? [])     map.set(g, 'design');
    for (const g of chartData.personalityGates ?? []) {
      map.set(g, map.has(g) ? 'both' : 'personality');
    }
    for (const g of chartData.bothGates ?? [])        map.set(g, 'both');
    gates = Array.from(map.entries()).map(([gate, coloring]) => ({ gate, coloring }));
  }

  const definedCenters = (chartData.definedCenters ?? []).map(normalizeCenterName);

  return { gates, definedCenters, channels, activations: chartData.activations };
}

// ─── HELPERS ───────────────────────────────────────────────────────────────────

function gateColoringOf(gate: number, chart: NormalizedChart): GateColoring {
  for (const g of chart.gates) {
    if (g.gate === gate) return g.coloring;
  }
  return 'inactive';
}

function isCenterDefined(name: string, chart: NormalizedChart): boolean {
  return chart.definedCenters.includes(name);
}

function isChannelActive(gates: [number, number], chart: NormalizedChart): boolean {
  return chart.channels.some(
    ([a, b]) => (a === gates[0] && b === gates[1]) || (a === gates[1] && b === gates[0])
  );
}

// ─── MULTI-LINE SPINE ──────────────────────────────────────────────────────────
// 7 parallel vertical lines centered at x=410, from HEAD base to ROOT top.
// x positions: [398, 402, 406, 410, 414, 418, 422] (4px spacing, canonical HD)
// Centers render on top, masking the interior sections.

function renderSpine(): string {
  const numLines = 7;
  const spacing = 4;
  const startX = 410 - ((numLines - 1) / 2) * spacing; // 398
  const { top, bottom } = SPINE_Y;
  const lines: string[] = [];
  for (let i = 0; i < numLines; i++) {
    const x = startX + i * spacing;
    lines.push(
      `<line data-spine-line="${i + 1}" x1="${x}" y1="${top}" x2="${x}" y2="${bottom}" stroke="${COLORS.spineStroke}" stroke-width="2" opacity="${COLORS.spineOpacity}"/>`
    );
  }
  return `<g id="spine-bg">${lines.join('')}</g>`;
}

// ─── CENTER SVG GENERATORS ─────────────────────────────────────────────────────

function renderCenter(shape: CenterShape, defined: boolean): string {
  const fill = defined ? COLORS.definedCenter : COLORS.undefinedCenter;
  const stroke = COLORS.centerStroke;
  const sw = COLORS.centerStrokeWidth;
  const { cx, cy, w, h } = shape;

  switch (shape.type) {
    case 'triangle-up': {
      // HEAD: apex at top, flat base at bottom
      // M cx,cy-h*0.6  L cx-w/2,cy+h*0.4  L cx+w/2,cy+h*0.4  Z
      const ax = cx, ay = cy - h * 0.6;
      const bx = cx - w / 2, by = cy + h * 0.4;
      const dx = cx + w / 2, dy = cy + h * 0.4;
      return `<path d="M ${ax},${ay} L ${bx},${by} L ${dx},${dy} Z" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
    }
    case 'diamond': {
      // AJNA, G, EGO: rotated square — points at top/bottom/left/right
      const hw = w / 2;
      const hh = h / 2;
      return `<polygon points="${cx},${cy - hh} ${cx + hw},${cy} ${cx},${cy + hh} ${cx - hw},${cy}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
    }
    case 'rectangle': {
      // THROAT, SACRAL, ROOT
      return `<rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" rx="6"/>`;
    }
    case 'triangle-right': {
      // SPLEEN: points to the right
      // M cx-w*0.4,cy-h/2  L cx+w*0.6,cy  L cx-w*0.4,cy+h/2  Z
      const lx = cx - w * 0.4;
      const rx = cx + w * 0.6;
      return `<path d="M ${lx},${cy - h / 2} L ${rx},${cy} L ${lx},${cy + h / 2} Z" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
    }
    case 'triangle-left': {
      // SOLAR PLEXUS: points to the left
      // M cx+w*0.4,cy-h/2  L cx-w*0.6,cy  L cx+w*0.4,cy+h/2  Z
      const rx2 = cx + w * 0.4;
      const lx2 = cx - w * 0.6;
      return `<path d="M ${rx2},${cy - h / 2} L ${lx2},${cy} L ${rx2},${cy + h / 2} Z" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
    }
  }
}

function centerLabel(shape: CenterShape): string {
  const { cx, cy, w, h } = shape;
  const stroke = COLORS.centerStroke;
  const font = `font-family="Arial,sans-serif" font-weight="bold" fill="${stroke}" opacity="0.85"`;

  switch (shape.name) {
    case 'Head': {
      // triangle-up: centroid y ≈ cy + 0.067*h (lower third, more space)
      const labelY = cy + Math.round(h * 0.1);
      return `<text x="${cx}" y="${labelY}" text-anchor="middle" dominant-baseline="middle" ${font} font-size="10">HEAD</text>`;
    }
    case 'SolarPlexus': {
      // triangle-left: centroid x slightly right of cx, centroid y = cy
      const labelX = cx + Math.round(w * 0.05);
      return `<text text-anchor="middle" ${font} font-size="9"><tspan x="${labelX}" y="${cy - 5}">SOLAR</tspan><tspan x="${labelX}" dy="11">PLEXUS</tspan></text>`;
    }
    case 'Spleen': {
      // triangle-right: centroid x slightly left of cx
      const labelX = cx - Math.round(w * 0.05);
      return `<text x="${labelX}" y="${cy}" text-anchor="middle" dominant-baseline="middle" ${font} font-size="9">SPLEEN</text>`;
    }
    case 'G': {
      // diamond: label at center
      return `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" ${font} font-size="10">G</text>`;
    }
    case 'Ego': {
      return `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" ${font} font-size="9">EGO</text>`;
    }
    case 'Sacral': {
      return `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" ${font} font-size="10">SACRAL</text>`;
    }
    case 'Root': {
      return `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" ${font} font-size="10">ROOT</text>`;
    }
    case 'Throat': {
      return `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" ${font} font-size="10">THROAT</text>`;
    }
    case 'Ajna': {
      return `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" ${font} font-size="10">AJNA</text>`;
    }
  }
}

// ─── GATE PILL RENDERER ────────────────────────────────────────────────────────

function renderGatePill(gate: number, x: number, y: number, coloring: GateColoring): string {
  const pw = 22;
  const ph = 14;
  const rx = 7;

  let fill: string;
  let textFill: string;

  switch (coloring) {
    case 'design':
      fill = COLORS.designFill;
      textFill = COLORS.pillText;
      break;
    case 'personality':
      fill = COLORS.personalityFill;
      textFill = COLORS.pillText;
      break;
    case 'both':
      fill = COLORS.bothFill;
      textFill = COLORS.pillText;
      break;
    default:
      fill = COLORS.inactiveFill;
      textFill = COLORS.inactiveText;
  }

  return `<g data-gate="${gate}" data-coloring="${coloring}">
    <rect x="${x - pw / 2}" y="${y - ph / 2}" width="${pw}" height="${ph}" rx="${rx}" fill="${fill}" stroke="${COLORS.pillStroke}" stroke-width="0.8" stroke-opacity="${coloring === 'inactive' ? '0.4' : '1'}"/>
    <text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-family="Arial,sans-serif" font-size="9" font-weight="bold" fill="${textFill}">${gate}</text>
  </g>`;
}

// ─── CHANNEL RENDERER ──────────────────────────────────────────────────────────

function renderChannel(path: string, active: boolean): string {
  if (active) {
    // Shadow + main line for a bold, layered look
    return [
      `<path d="${path}" fill="none" stroke="${COLORS.definedChannelStroke}" stroke-width="9" stroke-opacity="0.18" stroke-linecap="round" stroke-linejoin="round"/>`,
      `<path d="${path}" fill="none" stroke="${COLORS.definedChannelStroke}" stroke-width="${COLORS.definedChannelWidth}" stroke-linecap="round" stroke-linejoin="round"/>`,
    ].join('\n');
  }
  return `<path d="${path}" fill="none" stroke="${COLORS.potentialChannelStroke}" stroke-width="${COLORS.potentialChannelWidth}" stroke-dasharray="${COLORS.potentialChannelDash}" stroke-linecap="round"/>`;
}

// ─── ACTIVATION COLUMNS ────────────────────────────────────────────────────────

const PLANETS: { key: keyof Activations; symbol: string }[] = [
  { key: 'sun',       symbol: '☉' },
  { key: 'earth',     symbol: '♁' },
  { key: 'northNode', symbol: '☊' },
  { key: 'southNode', symbol: '☋' },
  { key: 'moon',      symbol: '☽' },
  { key: 'mercury',   symbol: '☿' },
  { key: 'venus',     symbol: '♀' },
  { key: 'mars',      symbol: '♂' },
  { key: 'jupiter',   symbol: '♃' },
  { key: 'saturn',    symbol: '♄' },
  { key: 'uranus',    symbol: '♅' },
  { key: 'neptune',   symbol: '♆' },
  { key: 'pluto',     symbol: '♇' },
];

function renderActivationColumns(activations: ChartData['activations']): string {
  if (!activations) return '';

  const rowH = 42;
  const startY = 100;

  const designParts: string[] = [];
  const persParts: string[] = [];

  // ── DESIGN column (left) ─────────────────────────────
  const designCX = 65;
  designParts.push(`<text x="${designCX}" y="${startY - 18}" text-anchor="middle" font-family="Arial,sans-serif" font-size="10" font-weight="bold" letter-spacing="1" fill="${COLORS.designText}">DESIGN</text>`);

  for (let i = 0; i < PLANETS.length; i++) {
    const { key, symbol } = PLANETS[i];
    const value = activations.design[key];
    if (!value) continue;
    const y = startY + i * rowH;
    designParts.push(`<text x="${designCX - 18}" y="${y + 1}" text-anchor="middle" dominant-baseline="central" font-family="serif" font-size="14" fill="${COLORS.designText}">${symbol}</text>`);
    designParts.push(`<text x="${designCX + 16}" y="${y + 1}" text-anchor="middle" dominant-baseline="central" font-family="Arial,sans-serif" font-size="11" fill="${COLORS.designText}">${value}</text>`);
  }

  // ── PERSONALITY column (right) ───────────────────────
  const persCX = 755;
  persParts.push(`<text x="${persCX}" y="${startY - 18}" text-anchor="middle" font-family="Arial,sans-serif" font-size="9" font-weight="bold" letter-spacing="0.5" fill="${COLORS.personalityText}">PERSONALITY</text>`);

  for (let i = 0; i < PLANETS.length; i++) {
    const { key, symbol } = PLANETS[i];
    const value = activations.personality[key];
    if (!value) continue;
    const y = startY + i * rowH;
    persParts.push(`<text x="${persCX - 18}" y="${y + 1}" text-anchor="middle" dominant-baseline="central" font-family="serif" font-size="14" fill="${COLORS.personalityText}">${symbol}</text>`);
    persParts.push(`<text x="${persCX + 16}" y="${y + 1}" text-anchor="middle" dominant-baseline="central" font-family="Arial,sans-serif" font-size="11" fill="${COLORS.personalityText}">${value}</text>`);
  }

  // Vertical separator lines between columns and bodygraph
  const sepTop = 40;
  const sepBot = VIEWBOX.height - 30;
  const sepLines = [
    `<line x1="130" y1="${sepTop}" x2="130" y2="${sepBot}" stroke="#c8a882" stroke-width="0.8" opacity="0.5"/>`,
    `<line x1="690" y1="${sepTop}" x2="690" y2="${sepBot}" stroke="#c8a882" stroke-width="0.8" opacity="0.5"/>`,
  ];

  return `<g id="activation-columns">` +
    `<g data-column="design">${designParts.join('\n')}</g>` +
    `<g data-column="personality">${persParts.join('\n')}</g>` +
    sepLines.join('') +
    `</g>`;
}

// ─── MAIN SVG RENDERER ─────────────────────────────────────────────────────────

export function renderToSVG(chartData: ChartData): string {
  const chart = normalizeChart(chartData);
  const { width, height } = VIEWBOX;
  const parts: string[] = [];

  // Background
  parts.push(`<rect width="${width}" height="${height}" fill="${COLORS.background}"/>`);

  // ── Body silhouette (human torso outline)
  parts.push(
    `<path d="M 410,25 C 375,25 335,55 315,95 C 290,145 285,200 265,260 C 240,325 150,375 140,445 C 130,515 165,585 195,630 C 225,670 270,700 310,715 L 410,720 L 510,715 C 550,700 595,670 625,630 C 655,585 690,515 680,445 C 670,375 580,325 555,260 C 535,200 530,145 505,95 C 485,55 445,25 410,25 Z" fill="#f0e0c8" opacity="0.25"/>`
  );

  // ── Multi-line spine background (6 lines, x=[400…420])
  parts.push(renderSpine());

  // ── Active channels only (solid, layered shadow+main)
  for (const cp of CHANNEL_PATHS) {
    if (isChannelActive(cp.gates, chart)) {
      parts.push(renderChannel(cp.path, true));
    }
  }

  // ── Centers (drawn over spine and channels)
  for (const shape of CENTER_SHAPES) {
    const defined = isCenterDefined(shape.name, chart);
    parts.push(`<g data-center="${shape.name}">${renderCenter(shape, defined)}${centerLabel(shape)}</g>`);
  }

  // ── Gate pills (deduplicated by gate number — first occurrence wins)
  const seen = new Set<number>();
  for (const gp of GATE_POSITIONS) {
    if (seen.has(gp.gate)) continue;
    seen.add(gp.gate);
    const coloring = gateColoringOf(gp.gate, chart);
    parts.push(renderGatePill(gp.gate, gp.x, gp.y, coloring));
  }

  // ── Planetary activation columns (last, renders over background)
  parts.push(renderActivationColumns(chart.activations));

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" style="max-width:${width}px;height:auto;display:block;">\n${parts.join('\n')}\n</svg>`;
}
