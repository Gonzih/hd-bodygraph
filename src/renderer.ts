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
  spineBackground: '#8a6840',
  spineOpacity: '0.35',
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
// 7 thin parallel vertical lines centered at x=410, running full bodygraph height.
// Centers render on top, masking the interior; the lines appear between centers.

function renderSpine(): string {
  const numLines = 7;
  const spacing = 4;
  const startX = 410 - Math.floor(numLines / 2) * spacing; // 410 - 12 = 398
  const { top, bottom } = SPINE_Y;
  const lines: string[] = [];
  for (let i = 0; i < numLines; i++) {
    const x = startX + i * spacing;
    lines.push(
      `<line x1="${x}" y1="${top}" x2="${x}" y2="${bottom}" stroke="${COLORS.spineBackground}" stroke-width="1.5" opacity="${COLORS.spineOpacity}"/>`
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
    case 'pointed-diamond': {
      // Head: kite/arrowhead — pointed top AND bottom, widest at 30% from bottom
      const hw = w / 2;
      const hh = h / 2;
      return `<polygon points="${cx},${cy - hh} ${cx + hw},${cy + hh * 0.3} ${cx},${cy + hh} ${cx - hw},${cy + hh * 0.3}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
    }
    case 'triangle': {
      // Ajna: downward-pointing triangle
      const hw = w / 2;
      const hh = h / 2;
      return `<polygon points="${cx - hw},${cy - hh} ${cx + hw},${cy - hh} ${cx},${cy + hh}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
    }
    case 'rectangle': {
      return `<rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" rx="4"/>`;
    }
    case 'diamond': {
      // G Center: rotated square (diamond)
      const hw = w / 2;
      const hh = h / 2;
      return `<polygon points="${cx},${cy - hh} ${cx + hw},${cy} ${cx},${cy + hh} ${cx - hw},${cy}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
    }
    case 'square': {
      return `<rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" rx="3"/>`;
    }
  }
}

function centerLabel(shape: CenterShape): string {
  const labels: Record<string, string> = {
    Head: 'HEAD',
    Ajna: 'AJNA',
    Throat: 'THROAT',
    G: 'G',
    Ego: 'EGO',
    Sacral: 'SACRAL',
    SolarPlexus: 'SP',
    Spleen: 'SPLN',
    Root: 'ROOT',
  };
  const labelYOffset: Record<string, number> = {
    Sacral: 28,
    Root: 7,
    Throat: 18,
    G: 8,
  };
  const label = labels[shape.name] ?? shape.name;
  const yOff = labelYOffset[shape.name] ?? 4;
  return `<text x="${shape.cx}" y="${shape.cy + yOff}" text-anchor="middle" dominant-baseline="middle" font-family="Arial,sans-serif" font-size="10" font-weight="bold" fill="${COLORS.centerStroke}" opacity="0.85">${label}</text>`;
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

  return `<g>
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
  { key: 'earth',     symbol: '⊕' },
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

  const rowH = 26;
  // Center 13 rows within y=55 to y=545 (head top to root bottom, 490px)
  const totalH = (PLANETS.length - 1) * rowH;
  const startY = Math.round((55 + 545) / 2 - totalH / 2); // ≈ 143

  const parts: string[] = [];

  // ── DESIGN column (left) ─────────────────────────────
  const designCX = 65;
  parts.push(`<text x="${designCX}" y="${startY - 18}" text-anchor="middle" font-family="Arial,sans-serif" font-size="10" font-weight="bold" letter-spacing="1" fill="${COLORS.designText}">DESIGN</text>`);

  for (let i = 0; i < PLANETS.length; i++) {
    const { key, symbol } = PLANETS[i];
    const value = activations.design[key];
    if (!value) continue;
    const y = startY + i * rowH;
    // symbol left-side, value right-side, both centred on designCX
    parts.push(`<text x="${designCX - 18}" y="${y + 1}" text-anchor="middle" dominant-baseline="central" font-family="serif" font-size="14" fill="${COLORS.designText}">${symbol}</text>`);
    parts.push(`<text x="${designCX + 16}" y="${y + 1}" text-anchor="middle" dominant-baseline="central" font-family="Arial,sans-serif" font-size="11" fill="${COLORS.designText}">${value}</text>`);
  }

  // ── PERSONALITY column (right) ───────────────────────
  const persCX = 755;
  parts.push(`<text x="${persCX}" y="${startY - 18}" text-anchor="middle" font-family="Arial,sans-serif" font-size="9" font-weight="bold" letter-spacing="0.5" fill="${COLORS.personalityText}">PERSONALITY</text>`);

  for (let i = 0; i < PLANETS.length; i++) {
    const { key, symbol } = PLANETS[i];
    const value = activations.personality[key];
    if (!value) continue;
    const y = startY + i * rowH;
    parts.push(`<text x="${persCX - 18}" y="${y + 1}" text-anchor="middle" dominant-baseline="central" font-family="serif" font-size="14" fill="${COLORS.personalityText}">${symbol}</text>`);
    parts.push(`<text x="${persCX + 16}" y="${y + 1}" text-anchor="middle" dominant-baseline="central" font-family="Arial,sans-serif" font-size="11" fill="${COLORS.personalityText}">${value}</text>`);
  }

  // Vertical separator lines between columns and bodygraph
  const sepH = VIEWBOX.height - 30;
  parts.push(`<line x1="130" y1="40" x2="130" y2="${sepH}" stroke="#c8a882" stroke-width="0.8" opacity="0.5"/>`);
  parts.push(`<line x1="690" y1="40" x2="690" y2="${sepH}" stroke="#c8a882" stroke-width="0.8" opacity="0.5"/>`);

  return `<g id="activation-columns">${parts.join('\n')}</g>`;
}

// ─── MAIN SVG RENDERER ─────────────────────────────────────────────────────────

export function renderToSVG(chartData: ChartData): string {
  const chart = normalizeChart(chartData);
  const { width, height } = VIEWBOX;
  const parts: string[] = [];

  // Background
  parts.push(`<rect width="${width}" height="${height}" fill="${COLORS.background}"/>`);

  // ── Body silhouette (centered at x=410, spans Head-to-Root)
  parts.push(
    `<path d="M 410,15 C 460,15 495,65 505,115 C 518,170 528,230 532,285 C 538,335 542,382 538,420 C 532,465 512,510 480,538 C 458,556 436,566 410,566 C 384,566 362,556 340,538 C 308,510 288,465 282,420 C 278,382 282,335 288,285 C 292,230 302,170 315,115 C 325,65 360,15 410,15 Z" fill="#e8d5c0" opacity="0.3"/>`
  );

  // ── Multi-line spine background
  parts.push(renderSpine());

  // ── Channels (inactive/dashed — drawn first, under gates and centers)
  for (const cp of CHANNEL_PATHS) {
    if (!isChannelActive(cp.gates, chart)) {
      parts.push(renderChannel(cp.path, false));
    }
  }
  // ── Active channels on top (solid, layered shadow+main)
  for (const cp of CHANNEL_PATHS) {
    if (isChannelActive(cp.gates, chart)) {
      parts.push(renderChannel(cp.path, true));
    }
  }

  // ── Centers (drawn over spine and channels)
  for (const shape of CENTER_SHAPES) {
    const defined = isCenterDefined(shape.name, chart);
    parts.push(renderCenter(shape, defined));
    parts.push(centerLabel(shape));
  }

  // ── Gate pills (deduplicated by gate number)
  const seen = new Set<number>();
  for (const gp of GATE_POSITIONS) {
    if (seen.has(gp.gate)) continue;
    seen.add(gp.gate);
    const coloring = gateColoringOf(gp.gate, chart);
    parts.push(renderGatePill(gp.gate, gp.x, gp.y, coloring));
  }

  // ── Planetary activation columns (last, so they render over background)
  parts.push(renderActivationColumns(chart.activations));

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" style="max-width:${width}px;height:auto;display:block;">\n${parts.join('\n')}\n</svg>`;
}
