import type { ChartData, CenterShape, GateColoring, GateActivation, Activations, BodyGraphOptions, CenterName, ThemePreset } from './types';
import { CENTER_SHAPES, GATE_POSITIONS, CHANNEL_PATHS, VIEWBOX, SPINE_Y } from './geometry';

// ─── DEFAULT COLORS ────────────────────────────────────────────────────────────
const DEFAULT_COLORS = {
  background: '#f5ead8',
  definedCenter: '#C9956A',
  undefinedCenterStroke: '#9e8570',
  centerStroke: '#5a3e28',
  centerStrokeWidth: 2.5,
  designFill: '#c87860',
  personalityFill: '#2a2a2a',
  bothFill: '#8b5cf6',
  inactiveFill: '#e8d8c0',
  pillText: '#ffffff',
  inactiveText: '#888888',
  pillStroke: '#3a2810',
  definedChannelStroke: '#3a2810',
  definedChannelWidth: 5,
  potentialChannelStroke: '#bbbbbb',
  potentialChannelWidth: 1.5,
  potentialChannelDash: '5,4',
  spineStroke: '#3d2b1a',
  spineOpacity: '0.7',
  designText: '#c87860',
  personalityText: '#2a2a2a',
};

// ─── CANONICAL THEME — per-center colors matching HD.OS reference ──────────────
const CANONICAL_CENTER_COLORS: Record<CenterName, string> = {
  Head:        '#f48fb1',  // pink/magenta
  Ajna:        '#d32f2f',  // deep red
  Throat:      '#1565c0',  // royal blue
  G:           '#388e3c',  // green
  Ego:         '#43a047',  // lighter green
  Sacral:      '#e65100',  // deep orange
  SolarPlexus: '#f9a825',  // golden amber
  Spleen:      '#f9a825',  // golden amber (teal border applied separately)
  Root:        '#c62828',  // dark red
};

// ─── CIRCUIT COLORS ────────────────────────────────────────────────────────────
const CIRCUIT_COLORS: Record<string, string> = {
  integration:       '#26c6da',  // teal
  individual:        '#8d6e63',  // warm brown/olive
  tribal:            '#bcaaa4',  // warm tan/copper
  collectiveLogic:   '#283593',  // dark navy
  collectiveSensing: '#6a1b9a',  // dark purple/maroon
};

/**
 * HD channel-to-circuit mapping (canonical).
 * Keys are canonical "lower-higher" format, e.g. "10-20".
 */
const CHANNEL_CIRCUIT: Record<string, string> = {
  // Integration (self-empowerment) — connects Sacral/G/Spleen to Throat
  '10-20': 'integration',
  '20-34': 'integration',
  '10-57': 'integration',
  '34-57': 'integration',
  '20-57': 'integration',

  // Individual — Knowing Circuit
  '1-8':   'individual',
  '2-14':  'individual',
  '7-31':  'individual',
  '13-33': 'individual',
  '24-61': 'individual',
  '47-64': 'individual',
  '25-51': 'individual',

  // Individual — Centering/Mutation Circuit
  '3-60':  'individual',
  '9-52':  'individual',
  '18-58': 'individual',
  '28-38': 'individual',
  '39-55': 'individual',

  // Tribal — Ego/Will Circuit
  '21-45': 'tribal',
  '26-44': 'tribal',
  '37-40': 'tribal',

  // Tribal — Support Circuit
  '6-59':  'tribal',
  '27-50': 'tribal',
  '32-54': 'tribal',
  '42-53': 'tribal',
  '19-49': 'tribal',

  // Collective Logic (Understanding Circuit)
  '16-48': 'collectiveLogic',
  '11-56': 'collectiveLogic',
  '4-63':  'collectiveLogic',
  '17-62': 'collectiveLogic',
  '23-43': 'collectiveLogic',
  '5-15':  'collectiveLogic',
  '29-46': 'collectiveLogic',

  // Collective Sensing (Abstract/Sensing Circuit)
  '12-22': 'collectiveSensing',
  '35-36': 'collectiveSensing',
  '30-41': 'collectiveSensing',
};

// ─── THEME DEFINITIONS ─────────────────────────────────────────────────────────

interface ResolvedTheme {
  background: string;
  definedCenter: string;                    // fallback when no per-center color
  centerColors: Record<CenterName, string>; // per-center, falls back to definedCenter
  undefinedCenterStroke: string;
  centerStroke: string;
  centerStrokeWidth: number;
  spreenBorder?: string;                    // special Spleen border color in canonical
  designFill: string;
  personalityFill: string;
  bothFill: string;
  inactiveFill: string;
  pillText: string;
  inactiveText: string;
  pillStroke: string;
  channelColor: (channelKey: string) => string; // per-channel or fallback
  channelWidth: number;
  potentialChannelStroke: string;
  potentialChannelWidth: number;
  potentialChannelDash: string;
  spineStroke: string;
  spineOpacity: string;
  designText: string;
  personalityText: string;
}

function buildTheme(preset: ThemePreset, opts: BodyGraphOptions): ResolvedTheme {
  // Start from base defaults, override by preset, then by per-option overrides
  const noop = (k: string) => DEFAULT_COLORS.definedChannelStroke;

  const defaultCenterColors = Object.fromEntries(
    (['Head','Ajna','Throat','G','Ego','Sacral','SolarPlexus','Spleen','Root'] as CenterName[])
      .map(n => [n, DEFAULT_COLORS.definedCenter])
  ) as Record<CenterName, string>;

  let base: ResolvedTheme = {
    background:            DEFAULT_COLORS.background,
    definedCenter:         DEFAULT_COLORS.definedCenter,
    centerColors:          defaultCenterColors,
    undefinedCenterStroke: DEFAULT_COLORS.undefinedCenterStroke,
    centerStroke:          DEFAULT_COLORS.centerStroke,
    centerStrokeWidth:     DEFAULT_COLORS.centerStrokeWidth,
    designFill:            DEFAULT_COLORS.designFill,
    personalityFill:       DEFAULT_COLORS.personalityFill,
    bothFill:              DEFAULT_COLORS.bothFill,
    inactiveFill:          DEFAULT_COLORS.inactiveFill,
    pillText:              DEFAULT_COLORS.pillText,
    inactiveText:          DEFAULT_COLORS.inactiveText,
    pillStroke:            DEFAULT_COLORS.pillStroke,
    channelColor:          (_k) => DEFAULT_COLORS.definedChannelStroke,
    channelWidth:          DEFAULT_COLORS.definedChannelWidth,
    potentialChannelStroke: DEFAULT_COLORS.potentialChannelStroke,
    potentialChannelWidth:  DEFAULT_COLORS.potentialChannelWidth,
    potentialChannelDash:   DEFAULT_COLORS.potentialChannelDash,
    spineStroke:           DEFAULT_COLORS.spineStroke,
    spineOpacity:          DEFAULT_COLORS.spineOpacity,
    designText:            DEFAULT_COLORS.designText,
    personalityText:       DEFAULT_COLORS.personalityText,
  };

  if (preset === 'canonical') {
    base = {
      ...base,
      centerColors:      { ...CANONICAL_CENTER_COLORS },
      spreenBorder:      '#00838f', // teal border for Spleen
      channelColor: (k) => {
        const circuit = CHANNEL_CIRCUIT[k];
        return circuit ? CIRCUIT_COLORS[circuit] : DEFAULT_COLORS.definedChannelStroke;
      },
      channelWidth: 4,
    };
  } else if (preset === 'minimal') {
    base = {
      ...base,
      background:            '#ffffff',
      definedCenter:         'none',
      centerColors:          defaultCenterColors, // overridden below
      centerStroke:          '#888888',
      centerStrokeWidth:     1.5,
      undefinedCenterStroke: '#cccccc',
      channelColor:          (_k) => '#999999',
      channelWidth:          2,
      potentialChannelStroke: '#dddddd',
      spineStroke:           '#dddddd',
      spineOpacity:          '0.5',
      designFill:            '#c87860',
      personalityFill:       '#555555',
    };
    // minimal: defined centers outlined only (no fill)
    const minimalCenterColors = Object.fromEntries(
      (['Head','Ajna','Throat','G','Ego','Sacral','SolarPlexus','Spleen','Root'] as CenterName[])
        .map(n => [n, 'none'])
    ) as Record<CenterName, string>;
    base.centerColors = minimalCenterColors;
    base.definedCenter = 'none';
  } else if (preset === 'dark') {
    base = {
      ...base,
      background:            '#1a1a2e',
      centerColors:          { ...CANONICAL_CENTER_COLORS },
      undefinedCenterStroke: '#555577',
      centerStroke:          '#ccccdd',
      spineStroke:           '#888899',
      spineOpacity:          '0.5',
      designFill:            '#ef5350',
      personalityFill:       '#90caf9',
      bothFill:              '#ce93d8',
      inactiveFill:          '#333344',
      inactiveText:          '#666688',
      pillStroke:            '#ccccdd',
      potentialChannelStroke: '#444466',
      channelColor: (k) => {
        const circuit = CHANNEL_CIRCUIT[k];
        return circuit ? CIRCUIT_COLORS[circuit] : '#8888aa';
      },
      channelWidth: 4,
      designText:    '#ef5350',
      personalityText: '#90caf9',
    };
  } else if (preset === 'light') {
    base = {
      ...base,
      background:            '#fafafa',
      definedCenter:         '#e0d0c0',
      centerColors:          defaultCenterColors, // muted
      centerStroke:          '#888888',
      centerStrokeWidth:     1.5,
      undefinedCenterStroke: '#dddddd',
      channelColor:          (_k) => '#aaaaaa',
      channelWidth:          3,
      potentialChannelStroke: '#eeeeee',
      spineStroke:           '#cccccc',
      spineOpacity:          '0.4',
      designFill:            '#e57373',
      personalityFill:       '#78909c',
      bothFill:              '#ba68c8',
      inactiveFill:          '#eeeeee',
      inactiveText:          '#aaaaaa',
      designText:            '#c62828',
      personalityText:       '#37474f',
    };
    const lightCenterColors = Object.fromEntries(
      (['Head','Ajna','Throat','G','Ego','Sacral','SolarPlexus','Spleen','Root'] as CenterName[])
        .map(n => [n, '#e0d0c0'])
    ) as Record<CenterName, string>;
    base.centerColors = lightCenterColors;
  }

  // Apply per-option overrides on top of theme
  if (opts.centerColors) {
    base.centerColors = { ...base.centerColors, ...opts.centerColors };
  }
  if (opts.channelColors) {
    const userChannelColors = opts.channelColors;
    const prevChannelColor = base.channelColor;
    base.channelColor = (k) => userChannelColors[k] ?? prevChannelColor(k);
  }

  return base;
}

/** Normalize a channel key to "lower-higher" canonical form */
function channelKey(a: number, b: number): string {
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  return `${lo}-${hi}`;
}

// ─── INPUT NORMALIZATION ───────────────────────────────────────────────────────

interface NormalizedChart {
  gates: GateActivation[];
  definedCenters: string[];
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

function renderSpine(theme: ResolvedTheme, lineCount: number): string {
  const n = Math.max(1, Math.min(13, lineCount));
  const spacing = 4;
  const startX = 410 - ((n - 1) / 2) * spacing;
  const { top, bottom } = SPINE_Y;
  const lines: string[] = [];
  for (let i = 0; i < n; i++) {
    const x = Math.round(startX + i * spacing);
    lines.push(
      `<line data-spine-line="${i + 1}" x1="${x}" y1="${top}" x2="${x}" y2="${bottom}" stroke="${theme.spineStroke}" stroke-width="2" opacity="${theme.spineOpacity}"/>`
    );
  }
  return `<g id="spine-bg">${lines.join('')}</g>`;
}

// ─── CENTER SVG GENERATORS ─────────────────────────────────────────────────────

function renderCenter(shape: CenterShape, defined: boolean, theme: ResolvedTheme): string {
  const centerFill = theme.centerColors[shape.name as CenterName] ?? theme.definedCenter;
  const fill = defined ? centerFill : 'none';
  // Spleen gets a special teal border in canonical theme when defined
  const isSpleen = shape.name === 'Spleen';
  const stroke = defined
    ? (isSpleen && theme.spreenBorder ? theme.spreenBorder : theme.centerStroke)
    : theme.undefinedCenterStroke;
  const sw = defined ? theme.centerStrokeWidth : 1.5;
  const { cx, cy, w, h } = shape;

  switch (shape.type) {
    case 'triangle-up': {
      const ax = cx, ay = cy - h * 0.6;
      const bx = cx - w / 2, by = cy + h * 0.4;
      const dx = cx + w / 2, dy = cy + h * 0.4;
      return `<path d="M ${ax},${ay} L ${bx},${by} L ${dx},${dy} Z" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
    }
    case 'diamond': {
      const hw = w / 2, hh = h / 2;
      return `<polygon points="${cx},${cy - hh} ${cx + hw},${cy} ${cx},${cy + hh} ${cx - hw},${cy}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
    }
    case 'rectangle': {
      return `<rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" rx="6"/>`;
    }
    case 'triangle-right': {
      const lx = cx - w * 0.4, rx = cx + w * 0.6;
      return `<path d="M ${lx},${cy - h / 2} L ${rx},${cy} L ${lx},${cy + h / 2} Z" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
    }
    case 'triangle-left': {
      const rx2 = cx + w * 0.4, lx2 = cx - w * 0.6;
      return `<path d="M ${rx2},${cy - h / 2} L ${lx2},${cy} L ${rx2},${cy + h / 2} Z" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
    }
  }
}

function centerLabel(shape: CenterShape, theme: ResolvedTheme): string {
  const { cx, cy, w, h } = shape;
  const stroke = theme.centerStroke;
  const font = `font-family="Arial,sans-serif" font-weight="bold" fill="${stroke}" opacity="0.85"`;

  switch (shape.name) {
    case 'Head': {
      const labelY = cy + Math.round(h * 0.1);
      return `<text x="${cx}" y="${labelY}" text-anchor="middle" dominant-baseline="middle" ${font} font-size="10">HEAD</text>`;
    }
    case 'SolarPlexus': {
      const labelX = cx + Math.round(w * 0.05);
      return `<text text-anchor="middle" ${font} font-size="9"><tspan x="${labelX}" y="${cy - 5}">SOLAR</tspan><tspan x="${labelX}" dy="11">PLEXUS</tspan></text>`;
    }
    case 'Spleen': {
      const labelX = cx - Math.round(w * 0.05);
      return `<text x="${labelX}" y="${cy}" text-anchor="middle" dominant-baseline="middle" ${font} font-size="9">SPLEEN</text>`;
    }
    case 'G': {
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

function renderGatePill(gate: number, x: number, y: number, coloring: GateColoring, theme: ResolvedTheme): string {
  const pw = 22, ph = 14, rx = 7;

  let fill: string, textFill: string;
  switch (coloring) {
    case 'design':
      fill = theme.designFill; textFill = theme.pillText; break;
    case 'personality':
      fill = theme.personalityFill; textFill = theme.pillText; break;
    case 'both':
      fill = theme.bothFill; textFill = theme.pillText; break;
    default:
      fill = theme.inactiveFill; textFill = theme.inactiveText;
  }

  return `<g data-gate="${gate}" data-coloring="${coloring}">
    <rect x="${x - pw / 2}" y="${y - ph / 2}" width="${pw}" height="${ph}" rx="${rx}" fill="${fill}" stroke="${theme.pillStroke}" stroke-width="0.8" stroke-opacity="${coloring === 'inactive' ? '0.4' : '1'}"/>
    <text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-family="Arial,sans-serif" font-size="9" font-weight="bold" fill="${textFill}">${gate}</text>
  </g>`;
}

// ─── CHANNEL RENDERER ──────────────────────────────────────────────────────────

function renderChannel(path: string, active: boolean, color: string, width: number, theme: ResolvedTheme): string {
  if (active) {
    return [
      `<path d="${path}" fill="none" stroke="${color}" stroke-width="${width + 4}" stroke-opacity="0.18" stroke-linecap="round" stroke-linejoin="round"/>`,
      `<path d="${path}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`,
    ].join('\n');
  }
  return `<path d="${path}" fill="none" stroke="${theme.potentialChannelStroke}" stroke-width="${theme.potentialChannelWidth}" stroke-dasharray="${theme.potentialChannelDash}" stroke-linecap="round"/>`;
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

function renderActivationColumns(activations: ChartData['activations'], theme: ResolvedTheme): string {
  if (!activations) return '';

  const rowH = 42, startY = 100;
  const designParts: string[] = [], persParts: string[] = [];

  const designCX = 65;
  designParts.push(`<text x="${designCX}" y="${startY - 18}" text-anchor="middle" font-family="Arial,sans-serif" font-size="10" font-weight="bold" letter-spacing="1" fill="${theme.designText}">DESIGN</text>`);
  for (let i = 0; i < PLANETS.length; i++) {
    const { key, symbol } = PLANETS[i];
    const value = activations.design[key];
    if (!value) continue;
    const y = startY + i * rowH;
    designParts.push(`<text x="${designCX - 18}" y="${y + 1}" text-anchor="middle" dominant-baseline="central" font-family="serif" font-size="14" fill="${theme.designText}">${symbol}</text>`);
    designParts.push(`<text x="${designCX + 16}" y="${y + 1}" text-anchor="middle" dominant-baseline="central" font-family="Arial,sans-serif" font-size="11" fill="${theme.designText}">${value}</text>`);
  }

  const persCX = 755;
  persParts.push(`<text x="${persCX}" y="${startY - 18}" text-anchor="middle" font-family="Arial,sans-serif" font-size="9" font-weight="bold" letter-spacing="0.5" fill="${theme.personalityText}">PERSONALITY</text>`);
  for (let i = 0; i < PLANETS.length; i++) {
    const { key, symbol } = PLANETS[i];
    const value = activations.personality[key];
    if (!value) continue;
    const y = startY + i * rowH;
    persParts.push(`<text x="${persCX - 18}" y="${y + 1}" text-anchor="middle" dominant-baseline="central" font-family="serif" font-size="14" fill="${theme.personalityText}">${symbol}</text>`);
    persParts.push(`<text x="${persCX + 16}" y="${y + 1}" text-anchor="middle" dominant-baseline="central" font-family="Arial,sans-serif" font-size="11" fill="${theme.personalityText}">${value}</text>`);
  }

  const sepTop = 40, sepBot = VIEWBOX.height - 30;
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

/**
 * Render a Human Design bodygraph as an SVG string.
 *
 * @param chartData  Chart data (gates, centers, channels, activations)
 * @param options    Optional display/theme customization
 * @returns          Complete SVG markup string
 */
export function renderToSVG(chartData: ChartData, options: BodyGraphOptions = {}): string {
  const chart = normalizeChart(chartData);
  const { width, height } = VIEWBOX;
  const maxWidth = options.width ?? width;

  const preset: ThemePreset = options.theme ?? 'default';
  const theme = buildTheme(preset, options);

  const showGateNumbers      = options.showGateNumbers      ?? true;
  const showCenterLabels     = options.showCenterLabels     ?? true;
  const showActivationCols   = options.showActivationColumns ?? true;
  const showBodySilhouette   = options.showBodySilhouette   ?? true;
  const showSpine            = options.showSpine            ?? true;
  const spineLineCount       = options.spineLineCount       ?? 7;

  const parts: string[] = [];

  // Background
  parts.push(`<rect width="${width}" height="${height}" fill="${theme.background}"/>`);

  // Body silhouette
  if (showBodySilhouette) {
    parts.push(
      `<path d="M 410,25 C 375,25 335,55 315,95 C 290,145 285,200 265,260 C 240,325 130,375 120,445 C 110,515 145,585 175,630 C 210,670 262,700 300,715 L 410,720 L 520,715 C 558,700 610,670 645,630 C 665,585 710,515 700,445 C 690,375 590,325 555,260 C 535,200 530,145 505,95 C 485,55 445,25 410,25 Z" fill="#f0e0c8" opacity="0.25"/>`
    );
  }

  // Spine
  if (showSpine) {
    parts.push(renderSpine(theme, spineLineCount));
  }

  // Active channels
  for (const cp of CHANNEL_PATHS) {
    if (isChannelActive(cp.gates, chart)) {
      const key = channelKey(cp.gates[0], cp.gates[1]);
      const color = theme.channelColor(key);
      parts.push(renderChannel(cp.path, true, color, theme.channelWidth, theme));
    }
  }

  // Centers
  for (const shape of CENTER_SHAPES) {
    const defined = isCenterDefined(shape.name, chart);
    const centerId = `data-center="${shape.name}"`;
    const shapeEl = renderCenter(shape, defined, theme);
    const labelEl = showCenterLabels ? centerLabel(shape, theme) : '';
    parts.push(`<g ${centerId}>${shapeEl}${labelEl}</g>`);
  }

  // Gate pills
  if (showGateNumbers) {
    const seen = new Set<number>();
    for (const gp of GATE_POSITIONS) {
      if (seen.has(gp.gate)) continue;
      seen.add(gp.gate);
      const coloring = gateColoringOf(gp.gate, chart);
      parts.push(renderGatePill(gp.gate, gp.x, gp.y, coloring, theme));
    }
  }

  // Activation columns
  if (showActivationCols) {
    parts.push(renderActivationColumns(chart.activations, theme));
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" style="max-width:${maxWidth}px;height:auto;display:block;">\n${parts.join('\n')}\n</svg>`;
}
