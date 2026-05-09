import type { CenterShape, GatePosition, ChannelPath } from './types';

// ViewBox: 0 0 820 900
export const VIEWBOX = { width: 820, height: 900 };

// Spine y-extents: HEAD base → ROOT top
// HEAD triangle-up: base y = cy + h*0.4 = 85 + 34 = 119
// ROOT rect: top y = cy - h/2 = 720 - 32.5 = 688
export const SPINE_Y = { top: 119, bottom: 688 };

// ─── CENTER SHAPES ─────────────────────────────────────────────────────────────
// Positions derived from canonical reference image structure (scaled to 820×900).
// Reference was 820×650; we preserve the same proportional positions.
//
// Shape formulas:
//   triangle-up    (HEAD):   apex top, flat base. M cx,cy-h*0.6  L cx-w/2,cy+h*0.4  L cx+w/2,cy+h*0.4  Z
//   diamond        (AJNA,G,EGO): rotated square. M cx,cy-h/2 L cx+w/2,cy L cx,cy+h/2 L cx-w/2,cy Z
//   rectangle      (THROAT,SACRAL,ROOT): <rect x=cx-w/2 y=cy-h/2 w h/>
//   triangle-right (SPLEEN — points right): M cx-w*0.4,cy-h/2 L cx+w*0.6,cy L cx-w*0.4,cy+h/2 Z
//   triangle-left  (SP — points left):      M cx+w*0.4,cy-h/2 L cx-w*0.6,cy L cx+w*0.4,cy+h/2 Z

export const CENTER_SHAPES: CenterShape[] = [
  // cy for triangle-up: bbox_center = cy - 0.1*h; ref bbox_cy = 8.5% of 900 = 76.5 → cy = 76.5 + 8.5 = 85
  { name: 'Head',        type: 'triangle-up',    cx: 410, cy:  85, w:  70, h:  85 },
  // diamond: bbox_cy = cy; ref = 20.8% of 900 = 187
  { name: 'Ajna',        type: 'diamond',         cx: 410, cy: 187, w:  95, h:  75 },
  // rect: bbox_cy = cy; ref = 33.8% of 900 = 304; ref w = 15.9% of 820 = 130
  { name: 'Throat',      type: 'rectangle',       cx: 410, cy: 304, w: 130, h:  70 },
  // diamond: ref cy = 48.5% of 900 = 437; ref w = 12.2% of 820 = 100
  { name: 'G',           type: 'diamond',         cx: 410, cy: 437, w: 100, h: 120 },
  // diamond: ref cx = 64% of 820 = 525; ref cy = 41.5% of 900 = 374; ref h = 10.8% of 900 = 97
  { name: 'Ego',         type: 'diamond',         cx: 525, cy: 374, w:  80, h:  97 },
  // rect: ref cy = 66.2% of 900 = 596; ref w = 15.9% of 820 = 130
  { name: 'Sacral',      type: 'rectangle',       cx: 410, cy: 596, w: 130, h:  75 },
  // triangle-left: ref cx = 66.5% of 820 = 545; ref cy = 61.5% of 900 = 554
  { name: 'SolarPlexus', type: 'triangle-left',  cx: 545, cy: 554, w: 110, h: 120 },
  // triangle-right: ref cx = 33.5% of 820 = 275; ref cy = 61.5% of 900 = 554
  { name: 'Spleen',      type: 'triangle-right', cx: 275, cy: 554, w: 110, h: 120 },
  // rect: ref cy = 80% of 900 = 720; ref w = 12.2% of 820 = 100
  { name: 'Root',        type: 'rectangle',       cx: 410, cy: 720, w: 100, h:  65 },
];

// ─── GATE POSITIONS ────────────────────────────────────────────────────────────
// All positions derived from canonical reference (cx_pct * 820, cy_pct * 900).
// Gate pills render on top of centers; positions may overlap center boundaries.

export const GATE_POSITIONS: GatePosition[] = [
  // ── HEAD → AJNA interface (y≈122 = 13.5% of 900) ──
  { gate: 64, x: 392, y: 122 },
  { gate: 61, x: 410, y: 122 },
  { gate: 63, x: 428, y: 122 },

  // ── AJNA top row (y≈155 = 17.2% of 900) — Head gates pair ──
  { gate: 47, x: 392, y: 155 },
  { gate: 24, x: 410, y: 155 },
  { gate:  4, x: 428, y: 155 },

  // ── AJNA bottom row (y≈224 = 24.9% of 900) — Throat gate pairs ──
  { gate: 17, x: 385, y: 224 },
  { gate: 11, x: 397, y: 224 },
  { gate: 43, x: 410, y: 224 },
  { gate: 23, x: 435, y: 224 },

  // ── THROAT top row (y≈270 = 30% of 900) ──
  { gate: 62, x: 368, y: 270 },
  { gate: 56, x: 385, y: 270 },
  { gate: 35, x: 410, y: 270 },
  { gate: 12, x: 435, y: 270 },
  { gate: 45, x: 452, y: 270 },

  // ── THROAT bottom row (y≈295 = 32.8% of 900) ──
  { gate: 31, x: 368, y: 295 },
  { gate:  8, x: 385, y: 295 },
  { gate: 33, x: 410, y: 295 },
  { gate: 20, x: 435, y: 295 },
  { gate: 16, x: 452, y: 295 },

  // ── G CENTER top (y≈357 = 39.7% of 900) — Throat gate pairs ──
  { gate:  7, x: 392, y: 357 },
  { gate:  1, x: 410, y: 357 },
  { gate: 13, x: 428, y: 357 },

  // ── G CENTER sides and bottom ──
  { gate: 10, x: 335, y: 464 },  // 40.9% x, 51.5% y
  { gate: 25, x: 330, y: 489 },  // 40.2% x, 54.3% y (left — G↔Ego)
  { gate: 15, x: 428, y: 429 },  // 52.2% x, 47.7% y
  { gate:  2, x: 392, y: 429 },  // 47.8% x, 47.7% y
  { gate: 46, x: 410, y: 429 },  // 50% x,   47.7% y

  // ── EGO / HEART (diamond cx=525, cy=374) ──
  { gate: 26, x: 478, y: 344 },  // 58.3% x, 38.2% y — left edge EGO
  { gate: 51, x: 478, y: 371 },  // 58.3% x, 41.2% y — left edge EGO
  { gate: 21, x: 478, y: 399 },  // 58.3% x, 44.3% y — left edge EGO
  { gate: 40, x: 500, y: 446 },  // 61% x,   49.5% y — below EGO

  // ── SACRAL top area (y≈519 = 57.7% of 900) — G gate pairs ──
  { gate:  5, x: 385, y: 519 },
  { gate: 14, x: 410, y: 519 },
  { gate: 29, x: 435, y: 519 },

  // ── SACRAL center (y≈574 = 63.8% of 900) ──
  { gate: 34, x: 368, y: 574 },
  { gate: 27, x: 385, y: 574 },
  { gate: 59, x: 410, y: 574 },
  { gate:  9, x: 435, y: 574 },
  { gate:  3, x: 452, y: 574 },

  // ── SACRAL bottom / Root interface (y≈614 = 68.2% of 900) ──
  { gate: 42, x: 380, y: 614 },
  { gate: 53, x: 410, y: 614 },
  { gate: 60, x: 440, y: 614 },

  // ── SOLAR PLEXUS (triangle-left, cx=545, cy=554) ──
  // Right edge of triangle at cx+w*0.4=589; gates outside right edge
  { gate: 36, x: 582, y: 509 },  // 71% x, 56.6% y
  { gate: 22, x: 582, y: 530 },  // 71% x, 58.9% y
  { gate: 37, x: 582, y: 551 },  // 71% x, 61.2% y
  { gate:  6, x: 582, y: 572 },  // 71% x, 63.5% y
  { gate: 49, x: 582, y: 592 },  // 71% x, 65.8% y
  { gate: 30, x: 582, y: 614 },  // 71% x, 68.2% y
  { gate: 55, x: 582, y: 635 },  // 71% x, 70.5% y

  // ── SPLEEN (triangle-right, cx=275, cy=554) ──
  // Left edge of triangle at cx-w*0.4=231; gates outside left edge
  { gate: 48, x: 238, y: 509 },  // 29% x, 56.6% y
  { gate: 57, x: 238, y: 530 },  // 29% x, 58.9% y
  { gate: 44, x: 238, y: 551 },  // 29% x, 61.2% y
  { gate: 50, x: 238, y: 572 },  // 29% x, 63.5% y
  { gate: 32, x: 238, y: 592 },  // 29% x, 65.8% y
  { gate: 28, x: 238, y: 614 },  // 29% x, 68.2% y
  { gate: 18, x: 238, y: 635 },  // 29% x, 70.5% y

  // ── ROOT top row (y≈704 = 78.2% of 900) — Sacral gate pairs ──
  { gate: 58, x: 372, y: 704 },  // 45.4% x
  { gate: 38, x: 388, y: 704 },  // 47.3% x
  { gate: 54, x: 404, y: 704 },  // 49.3% x
  { gate: 52, x: 410, y: 704 },  // 50% x
  { gate: 19, x: 436, y: 704 },  // 53.2% x
  { gate: 39, x: 452, y: 704 },  // 55.1% x

  // ── ROOT bottom / below Root ──
  { gate: 41, x: 410, y: 769 },  // 50% x, 85.4% y — below Root
];

// ─── CHANNEL PATHS ─────────────────────────────────────────────────────────────
// All 36 standard HD channels (each listed once, both directions handled by isChannelActive).
// Paths use gate positions from GATE_POSITIONS above.

export const CHANNEL_PATHS: ChannelPath[] = [
  // ── HEAD ↔ AJNA (3 channels) ────────────────────────────────────────────────
  { gates: [64, 47], path: 'M 392,122 L 392,155' },
  { gates: [61, 24], path: 'M 410,122 L 410,155' },
  { gates: [63,  4], path: 'M 428,122 L 428,155' },

  // ── AJNA ↔ THROAT (3 channels) ──────────────────────────────────────────────
  { gates: [17, 62], path: 'M 385,224 C 378,244 374,258 368,270' },
  { gates: [43, 23], path: 'M 410,224 L 435,224' },
  { gates: [11, 56], path: 'M 397,224 C 392,240 388,257 385,270' },

  // ── THROAT ↔ G CENTER (5 channels) ──────────────────────────────────────────
  { gates: [ 7, 31], path: 'M 392,357 C 382,338 376,320 368,295' },
  { gates: [ 1,  8], path: 'M 410,357 C 400,338 393,318 385,295' },
  { gates: [13, 33], path: 'M 428,357 C 420,336 415,318 410,295' },
  { gates: [10, 20], path: 'M 335,464 C 358,410 388,355 435,295' },
  { gates: [34, 20], path: 'M 368,574 C 345,490 370,400 435,295' },

  // ── THROAT ↔ SPLEEN (2 channels) ────────────────────────────────────────────
  { gates: [16, 48], path: 'M 452,295 C 385,348 300,420 238,509' },
  { gates: [20, 57], path: 'M 435,295 C 368,355 290,428 238,530' },

  // ── THROAT ↔ SOLAR PLEXUS (2 channels) ──────────────────────────────────────
  { gates: [12, 22], path: 'M 435,270 C 496,270 550,360 582,530' },
  { gates: [35, 36], path: 'M 410,270 C 475,268 535,355 582,509' },

  // ── THROAT ↔ EGO (1 channel) ────────────────────────────────────────────────
  { gates: [45, 21], path: 'M 452,270 C 464,296 470,340 478,399' },

  // ── G CENTER ↔ SACRAL (3 channels) ──────────────────────────────────────────
  { gates: [ 2, 14], path: 'M 392,429 C 400,462 406,492 410,519' },
  { gates: [15,  5], path: 'M 428,429 C 418,462 406,492 385,519' },
  { gates: [46, 29], path: 'M 410,429 C 416,462 424,492 435,519' },

  // ── G CENTER ↔ EGO (1 channel) ──────────────────────────────────────────────
  { gates: [25, 51], path: 'M 330,489 C 370,460 424,432 478,371' },

  // ── G CENTER ↔ SPLEEN (1 channel) ───────────────────────────────────────────
  { gates: [10, 57], path: 'M 335,464 C 294,482 260,506 238,530' },

  // ── EGO ↔ SPLEEN (1 channel — massive outer arc) ────────────────────────────
  { gates: [26, 44], path: 'M 478,344 C 580,600 80,620 238,551' },

  // ── EGO ↔ SOLAR PLEXUS (1 channel — right-side arc) ─────────────────────────
  { gates: [37, 40], path: 'M 582,551 C 720,580 720,440 500,446' },

  // ── SACRAL ↔ SOLAR PLEXUS (1 channel) ───────────────────────────────────────
  { gates: [ 6, 59], path: 'M 582,572 C 554,572 490,574 410,574' },

  // ── SACRAL ↔ SPLEEN (2 channels) ────────────────────────────────────────────
  { gates: [27, 50], path: 'M 385,574 C 322,573 280,572 238,572' },
  { gates: [34, 57], path: 'M 368,574 C 310,562 268,546 238,530' },

  // ── SACRAL ↔ ROOT (3 channels) ──────────────────────────────────────────────
  { gates: [ 9, 52], path: 'M 435,574 C 428,618 420,665 410,704' },
  { gates: [42, 53], path: 'M 380,614 L 410,614' },
  { gates: [ 3, 60], path: 'M 452,574 C 448,592 444,604 440,614' },

  // ── SPLEEN ↔ ROOT (3 channels — outer left arcs) ────────────────────────────
  { gates: [18, 58], path: 'M 238,635 C 130,655 110,700 372,704' },
  { gates: [28, 38], path: 'M 238,614 C 115,632 118,695 388,704' },
  { gates: [32, 54], path: 'M 238,592 C 125,612 126,690 404,704' },

  // ── ROOT ↔ SOLAR PLEXUS (3 channels — outer right arcs) ─────────────────────
  { gates: [19, 49], path: 'M 436,704 C 498,695 548,660 582,592' },
  { gates: [39, 55], path: 'M 452,704 C 510,698 552,674 582,635' },
  { gates: [41, 30], path: 'M 410,769 C 500,756 570,700 582,614' },
];
