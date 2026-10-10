// The DICTO Icosa family (DICTO, 2026-10-10; names by DICTO; Kaleidohedra DISCOVERIES #19 and #20), shown in
// Kaleidohedra's DICTO Icosa world. Icosahedron edge 1 throughout.
// #19, the DICTO Icosa-13: the regular icosahedron of edge phi^2 (Lotus seed) cut exactly into 12 icosahedra, one
// of edge 1/phi and 100 gap pieces (60 AXE, 20 FUJI, 20 CLEO); DICTO's own build makes it from a dodecahedron +
// 12 J11 + 30 AXE + 20 FUJI. UNITY is an icosidodecahedron + 12 J11; VAJRA closes each of its 20 dimples
// (Venus (Fly Trap)). #20, the DICTO Stella-Corona: an icosidodecahedron + 20 icosahedra + 12 King of Pentacles
// (Tarot); a Kepler Star on each pentagram makes the Kepler Star Diadem, whose thin gaps take 120 Shark Teeth
// (60 mirror pairs). DESHI, the 12-Star voids and the KEPLER MACE meet only at edges or corners: no single solid.
// Credited prior art: AXE, CLEO, Hound Tooth and Tricap are the Mosseri-Sadoc tiles t6, t4, t2 and t3 at scale
// 1/tau (Mosseri & Sadoc 1982); DESHI's arrangement is R. W. Gray's (2002); the Kepler Star's spikes are
// Kepler's small stellated dodecahedron's (1619).
// Checked in scripts/verify-icosa.mjs.
import DATA from './icosa-data.js';
import OPEN from './icosa-clusters-data.js';

/** DICTO's names, by key. */
export const ICOSA_NAMES = {
  LOTUS_SEED: 'Lotus seed', UNITY: 'UNITY', VENUS: 'Venus (Fly Trap)', STELLA_CORONA: 'DICTO Stella-Corona',
  KEPLER_STAR_DIADEM: 'Kepler Star Diadem', DESHI: 'DESHI', TWELVE_STAR_VOIDS: '12-Star voids', KEPLER_MACE: 'KEPLER MACE',
  AXE: 'AXE', FUJI: 'FUJI', CLEO: 'CLEO', TRISKELION: 'Triskelion', TRISKELION_HEX: 'Triskelion Hex', INNER_EYE: 'Inner Eye',
  HASU: 'Hasu (lotus)', VAJRA: 'VAJRA', HMV: 'HMV (Gramophone)', FIVE_OF_CUPS: 'Five of Cups (Tarot)',
  KING_OF_PENTACLES: 'King of Pentacles (Tarot)', HOUND_TOOTH: 'Hound Tooth', TRICAP: 'Tricap', KEPLER_STAR: 'Kepler Star',
  SHARK_TOOTH: 'Shark Tooth', BERMUDA_PYRAMID: 'Bermuda Pyramid',
};
/** Closed solids: { key: { vertices, faces (wound outward), volume } }. */
export const ICOSA_SOLIDS = DATA.SOLIDS;
/** Parts views of the clusters: { key: { view: [{ role, vertices, faces }] } }; the open clusters have one view,
 *  'pieces'. Roles: ico, idd, dodeca, j11, axe, fuji, cleo, cap (pentagonal pyramid), spike (Kepler Star),
 *  vajra, hasu, shark. */
export const ICOSA_PARTS = { ...DATA.PARTS, ...Object.fromEntries(Object.entries(OPEN).map(([k, v]) => [k, { pieces: v }])) };
/** The single pieces, then the clusters (closed, then open). */
export const ICOSA_PIECE_KEYS = ['AXE', 'FUJI', 'CLEO', 'TRISKELION', 'TRISKELION_HEX', 'INNER_EYE', 'HASU', 'VAJRA', 'HMV', 'FIVE_OF_CUPS', 'KING_OF_PENTACLES', 'HOUND_TOOTH', 'TRICAP', 'KEPLER_STAR', 'SHARK_TOOTH', 'BERMUDA_PYRAMID'];
export const ICOSA_CLUSTER_KEYS = ['LOTUS_SEED', 'UNITY', 'VENUS', 'STELLA_CORONA', 'KEPLER_STAR_DIADEM', 'DESHI', 'TWELVE_STAR_VOIDS', 'KEPLER_MACE'];
