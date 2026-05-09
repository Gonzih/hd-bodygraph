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
  potentialChannelStroke: '#bbbbbb',
  potentialChannelWidth: 1.5,
  potentialChannelDash: '5,4',
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
      // Head: tall diamond with pointed top, wider bottom — like a raindrop
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
  // For centers with gate pills inside them, shift label to avoid overlap
  const labelYOffset: Record<string, number> = {
    Sacral: 28,   // shift down toward bottom, below top gate row at y=415
    Root: 18,     // shift down below gate row at y=508
    Throat: 18,   // shift down below gate rows at y=195,213
    G: 8,         // slight offset
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
    return `<path d="${path}" fill="none" stroke="${COLORS.definedChannelStroke}" stroke-width="${COLORS.definedChannelWidth}" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  return `<path d="${path}" fill="none" stroke="${COLORS.potentialChannelStroke}" stroke-width="${COLORS.potentialChannelWidth}" stroke-dasharray="${COLORS.potentialChannelDash}" stroke-linecap="round"/>`;
}

// ─── MAIN SVG RENDERER ─────────────────────────────────────────────────────────

export function renderToSVG(chartData: ChartData): string {
  const { width, height } = VIEWBOX;
  const parts: string[] = [];

  // Background
  parts.push(`<rect width="${width}" height="${height}" fill="${COLORS.background}"/>`);

  // ── Body silhouette outline ──
  // Left side body outline: Ajna left → Throat left → G left → Sacral left → Root left
  parts.push(`<path d="M 255,105 L 235,190 L 235,250 C 235,280 250,295 250,315 L 235,395 L 235,465 L 250,510" fill="none" stroke="#b8a090" stroke-width="1.2" stroke-dasharray="5,4" opacity="0.35"/>`);
  // Right side body outline
  parts.push(`<path d="M 345,105 L 365,190 L 365,250 C 365,280 350,295 350,315 L 365,395 L 365,465 L 350,510" fill="none" stroke="#b8a090" stroke-width="1.2" stroke-dasharray="5,4" opacity="0.35"/>`);

  // ── Channels (draw first, under gates and centers) ──
  // Potential channels (all defined channel paths as dashed gray)
  for (const cp of CHANNEL_PATHS) {
    const active = isChannelActive(cp.gates, chartData);
    // Render all as potential first (avoid duplicates via Set)
    if (!active) {
      parts.push(renderChannel(cp.path, false));
    }
  }
  // Active channels on top (solid, thick)
  for (const cp of CHANNEL_PATHS) {
    const active = isChannelActive(cp.gates, chartData);
    if (active) {
      parts.push(renderChannel(cp.path, true));
    }
  }

  // ── Centers ──
  for (const shape of CENTER_SHAPES) {
    const defined = isCenterDefined(shape.name, chartData);
    parts.push(renderCenter(shape, defined));
    parts.push(centerLabel(shape));
  }

  // ── Gate pills ──
  // Deduplicate gate positions by gate number (some gates appear twice in spec)
  const seen = new Set<number>();
  for (const gp of GATE_POSITIONS) {
    if (seen.has(gp.gate)) continue;
    seen.add(gp.gate);
    const coloring = gateColoringOf(gp.gate, chartData);
    parts.push(renderGatePill(gp.gate, gp.x, gp.y, coloring));
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">\n${parts.join('\n')}\n</svg>`;
}
