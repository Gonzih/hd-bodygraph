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

export interface ChartData {
  /** Gates activated in this chart with their coloring */
  gates: GateActivation[];
  /** Which centers are defined (filled) */
  definedCenters: CenterName[];
  /** Active channel pairs, e.g. [[10,57],[18,58]] */
  channels: [number, number][];
}

export interface Point {
  x: number;
  y: number;
}

export interface CenterShape {
  name: CenterName;
  type: 'diamond' | 'triangle' | 'rectangle' | 'square' | 'pointed-diamond';
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
