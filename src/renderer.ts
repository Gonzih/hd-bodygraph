import type { ChartData, CenterShape, GateColoring } from './types';
import { CENTER_SHAPES, GATE_POSITIONS, CHANNEL_PATHS, VIEWBOX } from './geometry';

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
};

// ─── HELPERS ───────────────────────────────────────────────────────────────────

function gateColoringOf(gate: number, chartData: ChartData): GateColoring {
  for (const g of chartData.gates) {
    if (g.gate === gate) return g.coloring;
  }
  return 'inactive';
}

function isCenterDefined(name: string, chartData: ChartData): boolean {
  return chartData.definedCenters.includes(name as any);
}

function isChannelActive(gates: [number, number], chartData: ChartData): boolean {
  return chartData.channels.some(
    ([a, b]) => (a === gates[0] && b === gates[1]) || (a === gates[1] && b === gates[0])
  );
}

// ─── CENTER SVG GENERATORS ─────────────────────────────────────────────────────

function renderCenter(shape: CenterShape, defined: boolean): string {
  const fill = defined ? COLORS.definedCenter : COLORS.undefinedCenter;
  const stroke = COLORS.centerStroke;
  const sw = COLORS.centerStrokeWidth;
  const { cx, cy, w, h } = shape;

  switch (shape.type) {
    case 'pointed-diamond': {
      const hw = w / 2;
      const hh = h / 2;
      return `<polygon points="${cx},${cy - hh} ${cx + hw},${cy + hh * 0.3} ${cx},${cy + hh} ${cx - hw},${cy + hh * 0.3}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
    }
    case 'triangle': {
      const hw = w / 2;
      const hh = h / 2;
      return `<polygon points="${cx - hw},${cy - hh} ${cx + hw},${cy - hh} ${cx},${cy + hh}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
    }
    case 'rectangle': {
      return `<rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" rx="4"/>`;
    }
    case 'diamond': {
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
  const { cx, cy } = shape;
  const stroke = COLORS.centerStroke;
  const font = `font-family="Arial,sans-serif" font-weight="bold" fill="${stroke}" opacity="0.85"`;

  // Centers with two-line labels
  if (shape.name === 'SolarPlexus') {
    return `<text text-anchor="middle" ${font} font-size="9">
      <tspan x="${cx}" y="${cy - 5}">SOLAR</tspan>
      <tspan x="${cx}" dy="11">PLEXUS</tspan>
    </text>`;
  }

  const labels: Record<string, string> = {
    Head: 'HEAD',
    Ajna: 'AJNA',
    Throat: 'THROAT',
    G: 'G',
    Ego: 'EGO',
    Sacral: 'SACRAL',
    Spleen: 'SPLEEN',
    Root: 'ROOT',
  };

  // y-offset to avoid gate pills inside the center
  const labelYOffset: Record<string, number> = {
    Sacral: 28,
    Root: 7,
    Throat: 18,
    G: 8,
  };

  const label = labels[shape.name] ?? shape.name;
  const yOff = labelYOffset[shape.name] ?? 4;
  return `<text x="${cx}" y="${cy + yOff}" text-anchor="middle" dominant-baseline="middle" ${font} font-size="10">${label}</text>`;
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

function renderChannel(path: string): string {
  return `<path d="${path}" fill="none" stroke="${COLORS.definedChannelStroke}" stroke-width="${COLORS.definedChannelWidth}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

// ─── MAIN SVG RENDERER ─────────────────────────────────────────────────────────

export function renderToSVG(chartData: ChartData): string {
  const { width, height } = VIEWBOX;
  const parts: string[] = [];

  // Background
  parts.push(`<rect width="${width}" height="${height}" fill="${COLORS.background}"/>`);

  // ── Body silhouette — wide teardrop behind all elements ──
  // Widest at Sacral level (~y=430-470), comfortably wrapping side centers.
  // Left edge ≈ x=84, right edge ≈ x=516 at widest point.
  parts.push(`<path d="M 300,25 C 375,25 505,110 516,340 C 524,450 500,535 440,565 C 400,582 355,588 300,590 C 245,588 200,582 160,565 C 100,535 76,450 84,340 C 95,110 225,25 300,25 Z" fill="#e8d5c0" opacity="0.25"/>`);

  // ── Active channels only (no inactive dashes — visual noise) ──
  for (const cp of CHANNEL_PATHS) {
    if (isChannelActive(cp.gates, chartData)) {
      parts.push(renderChannel(cp.path));
    }
  }

  // ── Centers ──
  for (const shape of CENTER_SHAPES) {
    const defined = isCenterDefined(shape.name, chartData);
    parts.push(renderCenter(shape, defined));
    parts.push(centerLabel(shape));
  }

  // ── Gate pills ──
  // Deduplicate gate positions by gate number
  const seen = new Set<number>();
  for (const gp of GATE_POSITIONS) {
    if (seen.has(gp.gate)) continue;
    seen.add(gp.gate);
    const coloring = gateColoringOf(gp.gate, chartData);
    parts.push(renderGatePill(gp.gate, gp.x, gp.y, coloring));
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" style="max-width:${width}px;height:auto;display:block;">\n${parts.join('\n')}\n</svg>`;
}
