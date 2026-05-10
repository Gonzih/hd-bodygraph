export type CenterName =
  | 'Head'
  | 'Ajna'
  | 'Throat'
  | 'G'
  | 'Ego'
  | 'Sacral'
  | 'SolarPlexus'
  | 'Spleen'
  | 'Root';

export type GateColoring = 'design' | 'personality' | 'both' | 'inactive';

export interface GateActivation {
  /** Gate number 1–64 */
  gate: number;
  coloring: GateColoring;
}

/** Planetary activation — value is "gate.line" e.g. "40.4" */
export interface Activations {
  sun?: string;
  earth?: string;
  northNode?: string;
  southNode?: string;
  moon?: string;
  mercury?: string;
  venus?: string;
  mars?: string;
  jupiter?: string;
  saturn?: string;
  uranus?: string;
  neptune?: string;
  pluto?: string;
}

export interface ChartData {
  /**
   * Gate activations — provide EITHER this array OR the three separate arrays below.
   */
  gates?: GateActivation[];

  /** Personality (conscious) gate numbers */
  personalityGates?: number[];
  /** Design (unconscious) gate numbers */
  designGates?: number[];
  /** Gates active in both streams */
  bothGates?: number[];

  /**
   * Which centers are defined (filled).
   * Accepts both 'SolarPlexus' and 'Solar Plexus'.
   */
  definedCenters: string[];

  /**
   * Active channel pairs.
   * Accepts string notation '10-57' or tuple [10, 57].
   */
  channels: (string | [number, number])[];

  /** Optional chart metadata */
  type?: string;
  profile?: string;
  definition?: string;
  authority?: string;
  strategy?: string;

  /** Planetary activation columns (Design left, Personality right) */
  activations?: {
    design: Activations;
    personality: Activations;
  };
}

export interface Point {
  x: number;
  y: number;
}

export interface CenterShape {
  name: CenterName;
  type: 'diamond' | 'triangle-up' | 'triangle-left' | 'triangle-right' | 'rectangle';
  cx: number;
  cy: number;
  w: number;
  h: number;
}

export interface GatePosition {
  gate: number;
  x: number;
  y: number;
}

export interface ChannelPath {
  gates: [number, number];
  path: string;
}

// ─── CUSTOMIZATION ─────────────────────────────────────────────────────────────

/**
 * Built-in visual theme presets.
 *
 * - `'default'`    — warm amber centers, dark brown channels (v1.3 style)
 * - `'canonical'`  — per-center colors matching HD.OS reference image, circuitry channel colors
 * - `'minimal'`    — outlines only, no center fills, thin grey channels
 * - `'dark'`       — dark background, bright center fills
 * - `'light'`      — white background, muted fills, subtle channels
 */
export type ThemePreset = 'default' | 'canonical' | 'minimal' | 'dark' | 'light';

/**
 * Full customization options for `renderToSVG`.
 * All fields are optional — omit any field to use the theme/default value.
 */
export interface BodyGraphOptions {
  /**
   * Visual theme preset. Applied first; individual overrides take precedence.
   * @default 'default'
   */
  theme?: ThemePreset;

  /**
   * Per-center fill colors (overrides theme).
   * Key = CenterName, value = CSS color string.
   * Only applies to defined (filled) centers; undefined centers are always outlined.
   */
  centerColors?: Partial<Record<CenterName, string>>;

  /**
   * Per-channel stroke colors (overrides theme).
   * Key = canonical channel string e.g. `"10-57"` (lower gate first).
   * Value = CSS color string.
   */
  channelColors?: Partial<Record<string, string>>;

  /**
   * Opacity for defined (filled) centers. 0–1.
   * @default 1
   */
  definedOpacity?: number;

  /**
   * Opacity for undefined (outlined) centers. 0–1.
   * @default 1
   */
  undefinedOpacity?: number;

  /** Show gate number badges. @default true */
  showGateNumbers?: boolean;

  /** Show center name labels. @default true */
  showCenterLabels?: boolean;

  /** Show DESIGN and PERSONALITY planetary activation columns. @default true */
  showActivationColumns?: boolean;

  /** Show the human body silhouette behind the bodygraph. @default true */
  showBodySilhouette?: boolean;

  /** Show the multi-line spine. @default true */
  showSpine?: boolean;

  /**
   * Number of parallel spine lines. 1–13.
   * @default 7
   */
  spineLineCount?: number;

  /**
   * SVG max-width in pixels (sets the `style="max-width:Xpx"` attribute).
   * @default 820
   */
  width?: number;
}
