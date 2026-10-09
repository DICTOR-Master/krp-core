/**
 * The Kagome hulls (DISCOVERIES #17, DICTO 2026-10-09): six cluster hulls of DICTO Jewels (or the
 * Sunstar Lattice's dodecahedra) whose clusters share single pieces corner to corner, Kagome style,
 * in both lattices (even cells hold the Jewel or dodecahedron, odd cells the stella or Dogstar).
 * A hull with n corners sits on a network where each cluster has n neighbours.
 *
 * Each hull: its cells relative to its anchor (the even pieces, the odd pieces it encloses, and for
 * the rhombic dodecahedron the odd pieces at its corners) and the rule for its anchors. The solids
 * (one per lattice, raw units, centred on the mean of the even cells) are large, so they load on
 * demand: await kagomeHullSolids(). scripts/verify-kagome-hulls.mjs checks them.
 */
const mod4 = (v) => ((v % 4) + 4) % 4;
const allEven = (a) => a.every((v) => v % 2 === 0);
export const KAGOME_HULLS = {
  octa6: { name: 'Octahedral Kagome network', hull: 'octahedron', neighbours: 6,
    // odd cells with x odd, y and z even: a simple cubic pattern (the perovskite net)
    isAnchor: (a) => Math.abs(a[0] % 2) === 1 && a[1] % 2 === 0 && a[2] % 2 === 0 },
  rhombo8: { name: 'Rhombohedral Kagome network', hull: 'rhombohedron', neighbours: 8,
    // even cells n1 (1,1,0) + n2 (1,0,1) + n3 (0,1,1) with n1, n2, n3 all even or all odd (BCC in block coordinates)
    isAnchor: (a) => { if ((a[0] + a[1] + a[2]) % 2 !== 0) return false; const n = [(a[0] + a[1] - a[2]) / 2, (a[0] - a[1] + a[2]) / 2, (-a[0] + a[1] + a[2]) / 2].map((v) => Math.abs(v % 2)); return n[0] === n[1] && n[1] === n[2]; } },
  cubocta12: { name: 'Cuboctahedral Kagome network (hollow)', hull: 'cuboctahedron', neighbours: 12,
    isAnchor: (a) => allEven(a) && mod4(a[0] + a[1] + a[2]) === 0 },
  cubocta13: { name: 'Cuboctahedral Kagome network (solid)', hull: 'cuboctahedron', neighbours: 12,
    isAnchor: (a) => allEven(a) && mod4(a[0] + a[1] + a[2]) === 0 },
  cube14: { name: 'Cubic Kagome network', hull: 'cube', neighbours: 8,
    // odd cells (1,0,0) + 4Z^3 and (3,2,2) + 4Z^3: BCC of edge 4
    isAnchor: (a) => { const m = a.map(mod4).join(','); return m === '1,0,0' || m === '3,2,2'; } },
  rd33: { name: 'Rhombic dodecahedral Kagome network', hull: 'rhombic dodecahedron', neighbours: 14,
    // even cells 4Z^3 and (2,2,2) + 4Z^3: BCC of edge 4
    isAnchor: (a) => { const m = a.map(mod4).join(','); return m === '0,0,0' || m === '2,2,2'; } },
};
export const KAGOME_HULL_IDS = Object.keys(KAGOME_HULLS);

let loaded = null;
/** The hulls' cells and solids: { id: { evenCells, enclosedOddCells, cornerOddCells, centre, jewel, sunstar } },
 *  each solid { vertices (raw, centred), faces }. Loaded once, on demand. */
export async function kagomeHullSolids() {
  loaded ??= (await import('./kagomeHullsData.js')).default;
  return loaded;
}
/** Every cell of the hull at anchor a (even pieces, enclosed odd, corner odd). The anchor itself is one
 *  of them except for the hollow cuboctahedron, whose centre stays empty. */
export function hullCells(data, id, a) {
  const h = data[id];
  return [...h.evenCells, ...h.enclosedOddCells, ...h.cornerOddCells].map((o) => a.map((v, i) => v + o[i]));
}
