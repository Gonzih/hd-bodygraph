import type { CenterShape, GatePosition, ChannelPath } from './types';

// ViewBox: 0 0 820 800
// Bodygraph center: x=410 (left col 0-130, bodygraph 130-690, right col 690-820)
export const VIEWBOX = { width: 820, height: 650 };

// Spine y-extents for background rendering
// (the 7 parallel lines run from Head top to Root bottom; centers render over them)
export const SPINE_Y = { top: 25, bottom: 545 };

// ─── CENTER SHAPES ─────────────────────────────────────────────────────────────
// All cx values shifted +110 from previous layout (bodygraph center 300→410)

export const CENTER_SHAPES: CenterShape[] = [
  { name: 'Head',        type: 'ellipse',          cx: 410, cy: 60,  w: 90,  h: 104 },
  { name: 'Ajna',        type: 'triangle',         cx: 410, cy: 135, w: 90,  h: 60  },
  { name: 'Throat',      type: 'rectangle',        cx: 410, cy: 220, w: 130, h: 60  },
  { name: 'G',           type: 'diamond',          cx: 410, cy: 315, w: 100, h: 100 },
  { name: 'Ego',         type: 'square',           cx: 525, cy: 270, w: 70,  h: 70  },
  { name: 'Sacral',      type: 'rectangle',        cx: 410, cy: 430, w: 130, h: 70  },
  { name: 'SolarPlexus', type: 'square',           cx: 545, cy: 400, w: 90,  h: 90  },
  { name: 'Spleen',      type: 'square',           cx: 275, cy: 400, w: 90,  h: 90  },
  { name: 'Root',        type: 'rectangle',        cx: 410, cy: 520, w: 100, h: 50  },
];

// ─── GATE POSITIONS ────────────────────────────────────────────────────────────
// All x values shifted +110 from previous layout

export const GATE_POSITIONS: GatePosition[] = [
  // Head center bottom → Ajna top  (Head-Ajna spine)
  { gate: 64, x: 392, y: 88 },
  { gate: 61, x: 410, y: 88 },
  { gate: 63, x: 428, y: 88 },

  // Ajna top (mirror of Head bottom)
  { gate: 47, x: 392, y: 112 },
  { gate: 24, x: 410, y: 112 },
  { gate: 4,  x: 428, y: 112 },

  // Ajna bottom → Throat top
  { gate: 17, x: 385, y: 162 },
  { gate: 43, x: 410, y: 162 },
  { gate: 23, x: 435, y: 162 },

  // Throat top row
  { gate: 62, x: 368, y: 195 },
  { gate: 56, x: 385, y: 195 },
  { gate: 35, x: 410, y: 195 },
  { gate: 12, x: 435, y: 195 },
  { gate: 45, x: 452, y: 195 },

  // Throat bottom row
  { gate: 31, x: 368, y: 213 },
  { gate: 8,  x: 385, y: 213 },
  { gate: 33, x: 410, y: 213 },
  { gate: 20, x: 435, y: 213 },
  { gate: 16, x: 452, y: 213 },

  // Throat bottom → G top (Throat-G channel)
  { gate: 7,  x: 392, y: 258 },
  { gate: 1,  x: 410, y: 258 },
  { gate: 13, x: 428, y: 258 },

  // G center gates
  { gate: 2,  x: 392, y: 310 },
  { gate: 46, x: 410, y: 310 },
  { gate: 15, x: 428, y: 310 },

  // G center bottom → Sacral top (G-Sacral)
  { gate: 5,  x: 385, y: 375 },
  { gate: 14, x: 410, y: 375 },
  { gate: 29, x: 435, y: 375 },

  // Sacral top row
  { gate: 34, x: 368, y: 415 },
  { gate: 27, x: 385, y: 415 },
  { gate: 59, x: 410, y: 415 },
  { gate: 9,  x: 435, y: 415 },
  { gate: 3,  x: 452, y: 415 },

  // Sacral bottom row
  { gate: 42, x: 380, y: 443 },
  { gate: 53, x: 410, y: 443 },
  { gate: 60, x: 440, y: 443 },

  // Sacral bottom → Root (Sacral-Root)
  { gate: 58, x: 372, y: 508 },
  { gate: 38, x: 388, y: 508 },
  { gate: 54, x: 404, y: 508 },
  { gate: 19, x: 436, y: 508 },
  { gate: 39, x: 452, y: 508 },
  { gate: 41, x: 410, y: 525 },

  // Root center gate (and Sacral-Root spine gate)
  { gate: 52, x: 410, y: 508 },

  // Ego/Heart center — gates to the LEFT of Ego left edge (x=490)
  { gate: 26, x: 478, y: 248 },
  { gate: 51, x: 478, y: 268 },
  { gate: 21, x: 478, y: 288 },
  { gate: 40, x: 500, y: 322 },

  // Solar Plexus — gates to the RIGHT of SP right edge (x=590)
  { gate: 36, x: 582, y: 368 },
  { gate: 22, x: 582, y: 383 },
  { gate: 37, x: 582, y: 398 },
  { gate: 6,  x: 582, y: 413 },
  { gate: 49, x: 582, y: 428 },
  { gate: 30, x: 582, y: 443 },
  { gate: 55, x: 582, y: 458 },

  // Spleen — gates to the LEFT of Spleen left edge (x=230)
  { gate: 48, x: 238, y: 368 },
  { gate: 57, x: 238, y: 383 },
  { gate: 44, x: 238, y: 398 },
  { gate: 50, x: 238, y: 413 },
  { gate: 32, x: 238, y: 428 },
  { gate: 28, x: 238, y: 443 },
  { gate: 18, x: 238, y: 458 },

  // G center left port → Spleen (G-Spleen)
  { gate: 10, x: 335, y: 335 },
  { gate: 25, x: 330, y: 353 },
];

// ─── CHANNEL PATHS ─────────────────────────────────────────────────────────────
// All x values shifted +110 from previous layout.
// Each entry is one unique channel (no duplicate direction pairs).

export const CHANNEL_PATHS: ChannelPath[] = [
  // ── Spine channels (Head-Ajna) — multi-line parallel for visual rope effect
  {
    gates: [64, 47],
    path: 'M 392,88 L 392,112 M 410,88 L 410,112 M 428,88 L 428,112',
  },
  {
    gates: [61, 24],
    path: 'M 410,88 L 410,112',
  },
  {
    gates: [63, 4],
    path: 'M 428,88 L 428,112',
  },
  // ── Spine channels (Ajna-Throat)
  {
    gates: [17, 62],
    path: 'M 385,162 L 385,195',
  },
  {
    gates: [43, 23],
    path: 'M 410,162 L 410,195',
  },
  {
    gates: [11, 56],
    path: 'M 392,162 L 392,195',
  },
  // ── Cross-channel Throat-Spleen (20-57) — long arc left
  {
    gates: [20, 57],
    path: 'M 435,250 C 410,285 340,300 295,320 C 260,338 240,362 262,390',
  },
  // ── Sacral↔Throat arc (34-20)
  {
    gates: [34, 20],
    path: 'M 368,415 C 355,385 355,350 345,320 C 335,295 345,270 390,250 L 435,250',
  },
  // ── Spine channels (Throat-G) — two parallel lines
  {
    gates: [7, 31],
    path: 'M 368,258 L 368,213 M 392,258 L 392,213',
  },
  // ── Spine (G-Throat full) — three lines
  {
    gates: [7, 1],
    path: 'M 392,258 L 392,310 M 410,258 L 410,310 M 428,258 L 428,310',
  },
  // ── Spine (G-Sacral) — three lines
  {
    gates: [2, 14],
    path: 'M 392,310 L 392,375 M 410,310 L 410,375 M 428,310 L 428,375',
  },
  // ── Spine (Sacral-Root) — three lines
  {
    gates: [42, 53],
    path: 'M 380,443 L 380,508 M 410,443 L 410,508 M 440,443 L 440,508',
  },
  // ── Root-Spleen lateral arcs
  {
    gates: [38, 28],
    path: 'M 238,443 C 195,468 200,508 388,508',
  },
  {
    gates: [54, 32],
    path: 'M 262,428 C 220,455 223,506 404,506',
  },
  // ── 10-57 (G↔Spleen) — arc far left (extends to x≈155)
  {
    gates: [10, 57],
    path: 'M 335,335 C 280,310 155,338 238,383',
  },
  // ── 18-58 (Spleen↔Root) — sweep far left and down (extends to x≈155)
  {
    gates: [18, 58],
    path: 'M 238,458 C 155,478 158,510 372,510',
  },
  // ── 26-44 (Ego↔Spleen) — massive outer arc sweeping far right then left
  {
    gates: [26, 44],
    path: 'M 478,248 C 625,185 678,375 625,455 C 585,510 490,515 390,505 C 320,495 268,465 238,398',
  },
  // ── 37-40 (SolarPlexus↔Ego) — right-side arc (extends to x≈665)
  {
    gates: [37, 40],
    path: 'M 582,398 C 665,378 665,305 500,322',
  },
  // ── 9-52 (Sacral↔Root) — slightly right of center spine
  {
    gates: [9, 52],
    path: 'M 435,415 L 435,510',
  },
  // ── 16-48 (Throat↔Spleen) — long arc from Throat right down to Spleen
  {
    gates: [16, 48],
    path: 'M 452,213 C 398,240 248,290 238,368',
  },
];
