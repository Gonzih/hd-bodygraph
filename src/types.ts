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
