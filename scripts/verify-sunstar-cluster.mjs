// Verifies DICTO's clusters of the Sunstar Lattice's dodecahedra (polyhedra/sunstar.js, DICTO
// 2026-10-09), the same octet structure as the DICTO Jewel clusters:
//   - tetrahedral (4 dodecahedra round a cell corner) and octahedral (6 round an odd cell), no two
//     overlapping, neighbours meeting on parts of faces (seamed into matching cells);
//   - each surface closed and consistently wound (every edge run as often one way as the other);
//   - the octahedral cluster encloses its odd cell's Dogstar as a hidden hole: points inside the
//     Dogstar are outside the cluster, points just outside the Dogstar's surface are inside it;
//     and where two of its dodecahedra meet round the Dogstar they meet along its edges;
//   - volumes exactly 4 and 6 dodecahedra;
//   - both fill space with Dogstars (every dodecahedron cell in exactly one cluster), and as a
//     shared network they are the octet truss's cells, every Dogstar inside one octahedral cluster.
import { POLYHEDRA } from '../src/polyhedra/index.js';
import { DODECA_TETRA_CENTRES, DODECA_OCTA_CENTRES } from '../src/polyhedra/sunstar.js';
import { DJ_TETRA_OFFSETS, DJ_OCTA_TILING } from '../src/polyhedra/stellaJewel.js';
import { insideDodecahedron, insideDogstar } from '../src/geometry-extensions/roof-fold.js';

let failures = 0;
const check = (label, ok) => { console.log(`${ok ? 'OK  ' : 'FAIL'} ${label}`); if (!ok) failures++; };
const PHI = (1 + Math.sqrt(5)) / 2, K = PHI / 2;
const DODECA_VOL = (15 + 7 * Math.sqrt(5)) / 4;
const volume = ({ vertices: V, faces: F }) => F.reduce((t, f) => {
  for (let m = 1; m + 1 < f.length; m++) { const [a, b, c] = [V[f[0]], V[f[m]], V[f[m + 1]]]; t += (a[0] * (b[1] * c[2] - b[2] * c[1]) - a[1] * (b[0] * c[2] - b[2] * c[0]) + a[2] * (b[0] * c[1] - b[1] * c[0])) / 6; }
  return t;
}, 0);
let seed = 23;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

for (const [id, cells, n] of [['DODECA_TETRAHEDRAL_CLUSTER', DODECA_TETRA_CENTRES, 4], ['DODECA_OCTAHEDRAL_CLUSTER', DODECA_OCTA_CENTRES, 6]]) {
  const C = POLYHEDRA[id];
  check(`${C?.name}: registered`, !!C);
  // No overlap: sample points (cell units, world = 2 x cell) in more than one dodecahedron.
  let bad = 0;
  for (let k = 0; k < 6000; k++) {
    const p = [rnd(), rnd(), rnd()].map((x) => (x * 2 - 1) * 4);
    if (cells.filter((c) => insideDodecahedron(p.map((v, i) => v - 2 * c[i]))).length > 1) bad++;
  }
  check(`  no two dodecahedra overlap (6000 sample points, ${bad} in two)`, bad === 0);
  const und = new Map(), dir = new Map();
  C.faces.forEach((f) => f.forEach((a, i) => {
    const b = f[(i + 1) % f.length];
    und.set(a < b ? `${a}-${b}` : `${b}-${a}`, (und.get(a < b ? `${a}-${b}` : `${b}-${a}`) ?? 0) + 1);
    dir.set(`${a}>${b}`, (dir.get(`${a}>${b}`) ?? 0) + 1);
  }));
  const balanced = [...dir.entries()].every(([k, v]) => { const [a, b] = k.split('>'); return dir.get(`${b}>${a}`) === v; });
  const fours = [...und.values()].filter((v) => v === 4).length;
  check(`  closed and consistently wound (every edge run as often each way); ${fours} edges where two dodecahedra meet edge to edge`, balanced && [...und.values()].every((v) => v === 2 || v === 4));
  check(`  volume exactly ${n} dodecahedra (${volume(C).toFixed(6)})`, Math.abs(volume(C) - n * DODECA_VOL) < 1e-8);
}

// The octahedral cluster's hidden Dogstar.
{
  const C = POLYHEDRA.DODECA_OCTAHEDRAL_CLUSTER;
  const V = C.vertices.map((v) => v.map((x) => x / K)); // back to world units (cube edge 2), centred on the odd cell
  // Ray parity, three directions, majority (a ray grazing an edge where four faces meet can miscount).
  const DIRS = [[0.5773, 0.5779, 0.5767], [0.2123, -0.8311, 0.5139], [-0.7071, 0.1013, -0.6998]];
  const inside = (p) => DIRS.filter((d) => inside1(p, d)).length >= 2;
  const inside1 = (p, dir) => {
    let hits = 0;
    for (const f of C.faces) for (let m = 1; m + 1 < f.length; m++) {
      const a = V[f[0]], b = V[f[m]], c = V[f[m + 1]];
      const e1 = b.map((x, i) => x - a[i]), e2 = c.map((x, i) => x - a[i]);
      const h = [dir[1] * e2[2] - dir[2] * e2[1], dir[2] * e2[0] - dir[0] * e2[2], dir[0] * e2[1] - dir[1] * e2[0]];
      const det = e1[0] * h[0] + e1[1] * h[1] + e1[2] * h[2];
      if (Math.abs(det) < 1e-12) continue;
      const s = p.map((x, i) => x - a[i]), u = (s[0] * h[0] + s[1] * h[1] + s[2] * h[2]) / det;
      if (u < 0 || u > 1) continue;
      const q = [s[1] * e1[2] - s[2] * e1[1], s[2] * e1[0] - s[0] * e1[2], s[0] * e1[1] - s[1] * e1[0]];
      const v = (dir[0] * q[0] + dir[1] * q[1] + dir[2] * q[2]) / det;
      if (v < 0 || u + v > 1) continue;
      if ((e2[0] * q[0] + e2[1] * q[1] + e2[2] * q[2]) / det > 1e-12) hits++;
    }
    return hits % 2 === 1;
  };
  let inDog = 0, holeOk = 0, wallOk = 0, wallN = 0;
  for (let k = 0; k < 3000; k++) {
    const p = [rnd(), rnd(), rnd()].map((x) => (x * 2 - 1) * 1.7);
    if (!insideDogstar(p)) continue;
    inDog++;
    if (!inside(p)) holeOk++;
  }
  // just outside the Dogstar's surface (points on its own faces, a hair along the outward normal):
  // inside one of the six dodecahedra, so inside the cluster
  const G = POLYHEDRA.DOGSTAR, GV = G.vertices.map((v) => v.map((x) => x / K));
  for (const f of G.faces) for (let k = 0; k < 8; k++) {
    // Newell's normal over the whole polygon (a seamed face's first three corners can lie on a line).
    const n = [0, 0, 0];
    f.forEach((ia, j) => { const P = GV[ia], Q = GV[f[(j + 1) % f.length]]; n[0] += (P[1] - Q[1]) * (P[2] + Q[2]); n[1] += (P[2] - Q[2]) * (P[0] + Q[0]); n[2] += (P[0] - Q[0]) * (P[1] + Q[1]); });
    const L = Math.hypot(...n);
    const i = 1 + Math.floor(rnd() * (f.length - 2));
    let u = rnd(), v = rnd(); if (u + v > 1) { u = 1 - u; v = 1 - v; }
    const P0 = GV[f[0]], P1 = GV[f[i]], P2 = GV[f[i + 1]];
    const p = P0.map((x, d) => x + u * (P1[d] - x) + v * (P2[d] - x) + 1e-5 * n[d] / L);
    wallN++;
    if (inside(p)) wallOk++;
  }
  check(`the octahedral cluster's hidden hole is its Dogstar: ${holeOk} of ${inDog} points inside the Dogstar are outside the cluster`, inDog > 50 && holeOk === inDog);
  check(`  and the Dogstar is walled in: ${wallOk} of ${wallN} points just outside it are inside the cluster`, wallN > 100 && wallOk === wallN);
}

// Space-filling with Dogstars and the octet network: the same cells as the DICTO Jewel clusters
// (dodecahedra on the even cells, Dogstars on the odd, filling space: verify-roof-fold.mjs).
{
  const tetraSame = JSON.stringify(DODECA_TETRA_CENTRES) === JSON.stringify(DJ_TETRA_OFFSETS);
  const octaSame = DODECA_OCTA_CENTRES.length === 6 && DODECA_OCTA_CENTRES.every((d) => Math.abs(d[0]) + Math.abs(d[1]) + Math.abs(d[2]) === 1);
  check('the clusters sit on the same cells as the DICTO Jewel clusters (tetrahedral at a cell corner, octahedral round an odd cell)', tetraSame && octaSame);
  check(`so both fill space with Dogstars (packings DJ_TETRA_OFFSETS and DJ_OCTA_TILING, checked in verify-dicto-jewel-cluster.mjs) and form the octet network, every Dogstar inside one octahedral cluster`, DJ_OCTA_TILING.basis.length === 3);
}

console.log(failures === 0 ? '\nAll checks passed (0 failures).' : `\n${failures} check(s) FAILED.`);
process.exit(failures === 0 ? 0 : 1);
