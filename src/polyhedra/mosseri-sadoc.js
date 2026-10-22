// The Mosseri–Sadoc tiles (Mosseri & Sadoc 1982): six golden tetrahedra, edges 1 and tau, numbered t1–t6 as tabulated by
// Koca, Koc, Koca & Al-Siyabi (2020), arXiv 2009.07048, Table 1 (their letters and Kramer's in MOSSERI_SADOC_TILES).
// Four were already here under DICTO's names, at scale 1/tau: AXE = t6 and CLEO = t4 (the DICTO Icosa-13 kit pieces,
// kits13.js), Hound Tooth = t2 and Tricap = t3 (the DICTO Icosa world, geometry-extensions/icosa.js). This file adds
// t1 and t5 at the same scale 1/tau (edges 1/tau and 1), named by their Mosseri–Sadoc numbers, and lists the six
// together. Koca et al.: the icosahedron = 7 t1 + 6 t2 + 2 t5 + t6.
// Each tile is built exactly from its edge table (the reference library's shapes/mosseri-sadoc-tiles.json), in the
// library's frame (corner 0 at the origin, corner 1 on +x, corner 2 in the xy-plane, corner 3 above it), then moved
// so its centroid is at the origin, as the other kit pieces. Volumes 1/12 tau^-3 (t1) and tau^2/12 tau^-3 (t5).
import { specOf } from './stellaJewel.js';

const TAU = (1 + Math.sqrt(5)) / 2;
// Edge lengths at the Mosseri–Sadoc scale, 'S' = 1 and 'L' = tau, for the pairs 01, 02, 03, 12, 13, 23.
const EDGES = { MS_T1: 'LSSSSS', MS_T5: 'LLSLSL' };
const FACES = [[0, 2, 1], [0, 1, 3], [1, 2, 3], [0, 3, 2]];

function tetraFromEdges(code, scale) {
  const [d01, d02, d03, d12, d13, d23] = [...code].map((c) => (c === 'L' ? TAU : 1) * scale);
  const x2 = (d01 * d01 + d02 * d02 - d12 * d12) / (2 * d01), y2 = Math.sqrt(d02 * d02 - x2 * x2);
  const x3 = (d01 * d01 + d03 * d03 - d13 * d13) / (2 * d01);
  const y3 = (d03 * d03 + d02 * d02 - d23 * d23 - 2 * x3 * x2) / (2 * y2);
  const z3 = Math.sqrt(d03 * d03 - x3 * x3 - y3 * y3);
  const V = [[0, 0, 0], [d01, 0, 0], [x2, y2, 0], [x3, y3, z3]];
  const c = [0, 1, 2].map((i) => V.reduce((t, v) => t + v[i], 0) / 4);
  return V.map((v) => v.map((x, i) => x - c[i]));
}

/** The six tiles by Mosseri–Sadoc number: their letter, Kramer's, and the id of the shape here (null where it lives
 *  only in a world: Hound Tooth and Tricap, in the DICTO Icosa world). */
export const MOSSERI_SADOC_TILES = [
  { n: 1, letter: 'B', kramer: 'B∥*', id: 'MS_T1' },
  { n: 2, letter: 'G', kramer: 'D∥*', id: null, dictoName: 'Hound Tooth' },
  { n: 3, letter: 'E', kramer: 'G∥*', id: null, dictoName: 'Tricap' },
  { n: 4, letter: 'F', kramer: 'F∥*', id: 'KIT13_ICOSA13_CLEO', dictoName: 'Cleo' },
  { n: 5, letter: 'C', kramer: 'C∥*', id: 'MS_T5' },
  { n: 6, letter: 'D', kramer: 'A∥*', id: 'KIT13_ICOSA13_AXE', dictoName: 'AXE' },
];
/** The tiles that are shapes here, in Mosseri–Sadoc order. */
export const MOSSERI_SADOC_IDS = MOSSERI_SADOC_TILES.filter((x) => x.id).map((x) => x.id);
/** A shape's Mosseri–Sadoc tile, or undefined. */
export const mosseriSadocTile = (id) => MOSSERI_SADOC_TILES.find((x) => x.id === id);

export const MOSSERI_SADOC_ADDITIONS = Object.fromEntries(Object.entries(EDGES).map(([id, code]) =>
  [id, specOf(id, `M-S t${id.slice(-1)}`, tetraFromEdges(code, 1 / TAU), FACES, false, 1)]));
export const MOSSERI_SADOC_ADDITION_IDS = Object.keys(MOSSERI_SADOC_ADDITIONS);
