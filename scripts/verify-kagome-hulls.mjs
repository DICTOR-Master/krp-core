// Verifies the Kagome hulls (polyhedra/kagomeHulls.js, DISCOVERIES #17, DICTO 2026-10-09):
//   - each solid, in both lattices, closed (face area vectors sum to zero) with its exact volume: the
//     sum of its pieces (raw: DICTO Jewel 12, stella 4; dodecahedron D, Dogstar 16 - D);
//   - each network Kagome style on a window of cells: no two clusters share more than one cell, no
//     even cell is in more than two clusters, and the share of even cells held twice / once / not at
//     all is the design study's.
import { KAGOME_HULLS, KAGOME_HULL_IDS, kagomeHullSolids, hullCells } from '../src/polyhedra/kagomeHulls.js';

let failures = 0;
const check = (label, ok) => { console.log(`${ok ? 'OK  ' : 'FAIL'} ${label}`); if (!ok) failures++; };
const sub = (a, b) => a.map((x, i) => x - b[i]);
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const measure = ({ vertices: V, faces: F }) => {
  let vol = 0; const area = [0, 0, 0];
  for (const f of F) for (let m = 1; m + 1 < f.length; m++) {
    const a = V[f[0]], b = V[f[m]], c = V[f[m + 1]];
    vol += (a[0] * (b[1] * c[2] - b[2] * c[1]) - a[1] * (b[0] * c[2] - b[2] * c[0]) + a[2] * (b[0] * c[1] - b[1] * c[0])) / 6;
    const n = cross(sub(b, a), sub(c, a)); area[0] += n[0]; area[1] += n[1]; area[2] += n[2];
  }
  return { vol, open: Math.hypot(...area) };
};
const DODECA = (15 + 7 * Math.sqrt(5)) / 4 * (2 / ((1 + Math.sqrt(5)) / 2)) ** 3;
const data = await kagomeHullSolids();
// The design study's shares of even cells held twice / once / by no cluster.
const SHARES = { octa6: [0.7656, 0, 0.2344], rhombo8: [1, 0, 0], cubocta12: [0.7033, 0, 0.2967], cubocta13: [0.7033, 0.1486, 0.1481], cube14: [0.2344, 0.3846, 0.381], rd33: [0.2198, 0.7802, 0] };
for (const id of KAGOME_HULL_IDS) {
  const h = data[id], nE = h.evenCells.length, nO = h.enclosedOddCells.length + h.cornerOddCells.length;
  for (const [lat, want] of [['jewel', nE * 12 + nO * 4], ['sunstar', nE * DODECA + nO * (16 - DODECA)]]) {
    const { vol, open } = measure(h[lat]);
    check(`${KAGOME_HULLS[id].name}, ${lat === 'jewel' ? 'DICTO Jewels' : 'Sunstar'}: closed (${open.toExponential(1)}), volume ${vol.toFixed(4)} = ${nE} + ${nO} pieces (${want.toFixed(4)})`, open < 1e-4 && Math.abs(vol - want) < 1e-3);
  }
  // Kagome sharing on a window: anchors within [-12, 12]^3, counted on even cells inside [-6, 6]^3.
  const R = 12, inner = 6, count = new Map(), clusters = [];
  for (let x = -R; x <= R; x++) for (let y = -R; y <= R; y++) for (let z = -R; z <= R; z++) {
    if (!KAGOME_HULLS[id].isAnchor([x, y, z])) continue;
    const cells = hullCells(data, id, [x, y, z]).filter((c) => (c[0] + c[1] + c[2]) % 2 === 0);
    clusters.push(new Set(cells.map((c) => c.join(','))));
    for (const c of cells) count.set(c.join(','), (count.get(c.join(',')) ?? 0) + 1);
  }
  let twice = 0, once = 0, none = 0, over = 0, total = 0;
  for (let x = -inner; x <= inner; x++) for (let y = -inner; y <= inner; y++) for (let z = -inner; z <= inner; z++) {
    if ((x + y + z) % 2 !== 0) continue;
    total++; const n = count.get([x, y, z].join(',')) ?? 0;
    if (n === 2) twice++; else if (n === 1) once++; else if (n === 0) none++; else over++;
  }
  // two clusters share at most one cell (checked between clusters near the centre)
  const near = clusters.filter((s) => [...s].some((k) => k.split(',').every((v) => Math.abs(Number(v)) <= inner)));
  let shareMore = 0;
  for (let i = 0; i < near.length; i++) for (let j = i + 1; j < near.length; j++) { let n = 0; for (const k of near[i]) if (near[j].has(k)) n++; if (n > 1) shareMore++; }
  const got = [twice / total, once / total, none / total], want = SHARES[id];
  check(`  Kagome style: no cell in more than two clusters (${over}), no two clusters sharing more than one cell (${shareMore}); held twice / once / single ${got.map((v) => v.toFixed(3)).join(' / ')} (study ${want.join(' / ')})`, over === 0 && shareMore === 0 && got.every((v, i) => Math.abs(v - want[i]) < 0.02));
}
console.log(failures === 0 ? '\nAll checks passed (0 failures).' : `\n${failures} check(s) FAILED.`);
process.exit(failures === 0 ? 0 : 1);
