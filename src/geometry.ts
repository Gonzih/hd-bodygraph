import type { CenterShape, GatePosition, ChannelPath } from './types';

// ViewBox: 0 0 600 820
export const VIEWBOX = { width: 600, height: 820 };

// ─── CENTER SHAPES ─────────────────────────────────────────────────────────────
// type: 'pointed-diamond' = Head (teardrop/upward diamond with pointed top)
//       'triangle' = Ajna (downward-pointing triangle)
//       'rectangle' = Throat, Sacral, Root
//       'diamond' = G Center (rotated square)
//       'square' = Ego, SolarPlexus, Spleen

export const CENTER_SHAPES: CenterShape[] = [
  { name: 'Head',        type: 'pointed-diamond', cx: 300, cy: 55,  w: 70,  h: 60  },
  { name: 'Ajna',        type: 'triangle',         cx: 300, cy: 135, w: 90,  h: 60  },
  { name: 'Throat',      type: 'rectangle',        cx: 300, cy: 220, w: 130, h: 60  },
  { name: 'G',           type: 'diamond',          cx: 300, cy: 315, w: 100, h: 100 },
  { name: 'Ego',         type: 'square',           cx: 415, cy: 270, w: 70,  h: 70  },
  { name: 'Sacral',      type: 'rectangle',        cx: 300, cy: 430, w: 130, h: 70  },
  { name: 'SolarPlexus', type: 'square',           cx: 435, cy: 400, w: 90,  h: 90  },
  { name: 'Spleen',      type: 'square',           cx: 165, cy: 400, w: 90,  h: 90  },
  { name: 'Root',        type: 'rectangle',        cx: 300, cy: 520, w: 100, h: 50  },
];

// ─── GATE POSITIONS ────────────────────────────────────────────────────────────
// Each gate badge positioned along its channel path

export const GATE_POSITIONS: GatePosition[] = [
  // Head center bottom → Ajna top  (Head-Ajna spine)
  { gate: 64, x: 282, y: 88 },
  { gate: 61, x: 300, y: 88 },
  { gate: 63, x: 318, y: 88 },

  // Ajna top (mirror of Head bottom)
  { gate: 47, x: 282, y: 112 },
  { gate: 24, x: 300, y: 112 },
  { gate: 4,  x: 318, y: 112 },

  // Ajna bottom → Throat top
  { gate: 17, x: 275, y: 162 },
  { gate: 43, x: 300, y: 162 },
  { gate: 23, x: 325, y: 162 },

  // Throat top row
  { gate: 62, x: 258, y: 195 },
  { gate: 56, x: 275, y: 195 },
  { gate: 35, x: 300, y: 195 },
  { gate: 12, x: 325, y: 195 },
  { gate: 45, x: 342, y: 195 },

  // Throat bottom row
  { gate: 31, x: 258, y: 213 },
  { gate: 8,  x: 275, y: 213 },
  { gate: 33, x: 300, y: 213 },
  { gate: 20, x: 325, y: 213 },

  // Throat bottom → G top (Throat-G channel)
  { gate: 7,  x: 282, y: 258 },
  { gate: 1,  x: 300, y: 258 },
  { gate: 13, x: 318, y: 258 },

  // G center gates
  { gate: 2,  x: 282, y: 310 },
  { gate: 46, x: 300, y: 310 },
  { gate: 15, x: 318, y: 310 },

  // G center bottom → Sacral top (G-Sacral)
  { gate: 5,  x: 275, y: 375 },
  { gate: 14, x: 300, y: 375 },
  { gate: 29, x: 325, y: 375 },

  // Sacral top row
  { gate: 34, x: 258, y: 415 },
  { gate: 27, x: 275, y: 415 },
  { gate: 59, x: 300, y: 415 },
  { gate: 9,  x: 325, y: 415 },
  { gate: 3,  x: 342, y: 415 },

  // Sacral bottom row
  { gate: 42, x: 270, y: 443 },
  { gate: 53, x: 300, y: 443 },
  { gate: 60, x: 330, y: 443 },

  // Sacral bottom → Root (Sacral-Root)
  { gate: 58, x: 262, y: 508 },
  { gate: 38, x: 278, y: 508 },
  { gate: 54, x: 294, y: 508 },
  { gate: 53, x: 310, y: 508 }, // note: 53 appears twice in spec, keeping both
  { gate: 19, x: 326, y: 508 },
  { gate: 39, x: 342, y: 508 },
  { gate: 41, x: 300, y: 555 },

  // Root gates
  { gate: 52, x: 300, y: 508 },

  // Ego/Heart center (right side, gates positioned LEFT of Ego box boundary x=380)
  { gate: 26, x: 368, y: 248 },
  { gate: 51, x: 368, y: 268 },
  { gate: 21, x: 368, y: 288 },
  { gate: 40, x: 390, y: 322 },

  // Solar Plexus (right lower, gates RIGHT of SP center right edge x=455, canonical position)
  { gate: 36, x: 472, y: 368 },
  { gate: 22, x: 472, y: 383 },
  { gate: 37, x: 472, y: 398 },
  { gate: 6,  x: 472, y: 413 },
  { gate: 49, x: 472, y: 428 },
  { gate: 30, x: 472, y: 443 },
  { gate: 55, x: 472, y: 458 },

  // Spleen (left lower, gates LEFT of Spleen center left edge x=145, canonical position)
  { gate: 48, x: 128, y: 368 },
  { gate: 57, x: 128, y: 383 },
  { gate: 44, x: 128, y: 398 },
  { gate: 50, x: 128, y: 413 },
  { gate: 32, x: 128, y: 428 },
  { gate: 28, x: 128, y: 443 },
  { gate: 18, x: 128, y: 458 },

  // G center left port → Spleen (G-Spleen)
  { gate: 10, x: 225, y: 335 },
  { gate: 25, x: 220, y: 353 },

  // Gate 16 belongs to Throat center (channel 16-48 Throat↔Spleen), right end of 2nd row
  { gate: 16, x: 342, y: 213 },
];

// ─── CHANNEL PATHS ─────────────────────────────────────────────────────────────
// SVG path data for each channel pair

export const CHANNEL_PATHS: ChannelPath[] = [
  // Spine channels (vertical)
  {
    gates: [64, 47],
    path: 'M 282,88 L 282,112 M 300,88 L 300,112 M 318,88 L 318,112',
  },
  {
    gates: [61, 24],
    path: 'M 300,88 L 300,112',
  },
  {
    gates: [63, 4],
    path: 'M 318,88 L 318,112',
  },
  {
    gates: [17, 62],
    path: 'M 275,162 L 275,195',
  },
  {
    gates: [43, 23],
    path: 'M 300,162 L 300,195',
  },
  {
    gates: [20, 57],
    // Throat→Spleen — wider arc going lower-left
    path: 'M 325,250 C 300,285 230,300 185,320 C 150,338 130,362 152,390',
  },
  {
    gates: [34, 20],
    path: 'M 258,415 C 245,385 245,350 235,320 C 225,295 235,270 280,250 L 325,250',
  },
  {
    gates: [7, 31],
    path: 'M 258,258 L 258,213 M 282,258 L 282,213',
  },
  // G→Throat (1-8 or 7-1 channel)
  {
    gates: [7, 1],
    path: 'M 282,258 L 282,310 M 300,258 L 300,310 M 318,258 L 318,310',
  },
  // G→Sacral (2-14, 46-29, 15-5)
  {
    gates: [2, 14],
    path: 'M 282,310 L 282,375 M 300,310 L 300,375 M 318,310 L 318,375',
  },
  // Sacral→Root spine
  {
    gates: [42, 53],
    path: 'M 270,443 L 270,508 M 300,443 L 300,508 M 330,443 L 330,508',
  },
  // Root lateral
  {
    gates: [38, 28],
    path: 'M 128,443 C 88,468 92,508 278,508',
  },
  {
    gates: [54, 32],
    path: 'M 152,428 C 112,455 115,506 294,506',
  },
  // 10-57 (G↔Spleen): arc from G gate 10 (x=225,y=335) to Spleen gate 57 (x=128,y=383), wider left sweep
  {
    gates: [10, 57],
    path: 'M 225,335 C 185,320 100,330 128,383',
  },
  // 18-58 (Spleen↔Root): arc from Spleen gate 18 (x=128,y=458) to Root gate 58 (x=262,y=508), wider sweep
  {
    gates: [18, 58],
    path: 'M 128,458 C 75,478 80,510 262,510',
  },
  // 26-44 (Ego↔Spleen): huge outer arc: Ego gate 26 (x=368,y=248) sweeps far RIGHT then DOWN and LEFT to Spleen gate 44 (x=128,y=398)
  {
    gates: [26, 44],
    path: 'M 368,248 C 520,190 575,380 520,455 C 480,510 380,515 280,505 C 210,495 160,465 128,398',
  },
  // 37-40 (SolarPlexus↔Ego): arc right side connecting SP gate 37 (x=472,y=398) to Ego gate 40 (x=390,y=322), wider right sweep
  {
    gates: [37, 40],
    path: 'M 472,398 C 555,375 550,305 390,322',
  },
  // 9-52 (Sacral↔Root): vertical path slightly right of center spine
  {
    gates: [9, 52],
    path: 'M 325,415 L 325,510',
  },
  // 16-48 (Throat↔Spleen): long arc from gate 16 (x=342,y=213) sweeping left down to gate 48 (x=128,y=368)
  {
    gates: [16, 48],
    path: 'M 342,213 C 290,240 140,290 128,368',
  },
  // 11-56 (Ajna↔Throat)
  {
    gates: [11, 56],
    path: 'M 275,162 L 275,195',
  },
];
