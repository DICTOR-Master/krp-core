// Verifies the DICTO Jewel tetrahedral cluster (polyhedra/stellaJewel.js, DICTO 2026-10-09):
//   - four DICTO Jewels at the corners of a regular tetrahedron of cells, each pair meeting face to
//     face on a whole rhombus (6 shared rhombi), no two overlapping;
//   - its surface: 228 faces (192 triangles, 36 rhombi), every edge on exactly two faces;
//   - one pinch point only, the cell corner at the centre, where the four lobes touch; with it
//     split, the surface is a sphere (Euler characteristic 2);
//   - volume exactly four DICTO Jewels.
import { POLYHEDRA } from '../src/polyhedra/index.js';
import { DJ_TETRA_CENTRES } from '../src/polyhedra/stellaJewel.js';

let failures = 0;
const check = (label, ok) => { console.log(`${ok ? 'OK  ' : 'FAIL'} ${label}`); if (!ok) failures++; };
const PHI = (1 + Math.sqrt(5)) / 2, K = PHI / 2;
const sub = (a, b) => a.map((x, i) => x - b[i]);
const len = (a) => Math.hypot(...a);
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const volume = ({ vertices: V, faces: F }) => Math.abs(F.reduce((t, f) => {
  for (let m = 1; m + 1 < f.length; m++) { const [a, b, c] = [V[f[0]], V[f[m]], V[f[m + 1]]]; t += (a[0] * (b[1] * c[2] - b[2] * c[1]) - a[1] * (b[0] * c[2] - b[2] * c[0]) + a[2] * (b[0] * c[1] - b[1] * c[0])) / 6; }
  return t;
}, 0));

const DJ = POLYHEDRA.DRAGON_JEWEL, C = POLYHEDRA.DJ_TETRAHEDRAL_CLUSTER;
check('the cluster is registered', !!C);

// The four centres: a regular tetrahedron, each pair of cells a face diagonal apart (DICTO Jewel
// neighbours across a rhombus in the lattice).
const d = DJ_TETRA_CENTRES.flatMap((a, i) => DJ_TETRA_CENTRES.slice(i + 1).map((b) => len(sub(a, b))));
check('the four cells form a regular tetrahedron (all six centre distances equal)', d.every((x) => Math.abs(x - d[0]) < 1e-12));

// Pieces, in the cluster's own frame (centred on the four cells' centre).
const mid = DJ_TETRA_CENTRES.reduce((t, p) => t.map((x, i) => x + p[i] / 4), [0, 0, 0]);
const pieces = DJ_TETRA_CENTRES.map((c) => DJ.vertices.map((v) => v.map((x, i) => x + (c[i] - mid[i]) * K)));
const faceKey = (pts) => pts.map((p) => p.map((x) => x.toFixed(6)).join(',')).sort().join('|');
const faceSets = pieces.map((P) => new Set(DJ.faces.map((f) => faceKey(f.map((i) => P[i])))));
let sharedPairs = 0, sharedRhombi = 0;
for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) {
  const s = DJ.faces.filter((f) => f.length === 4 && faceSets[j].has(faceKey(f.map((k) => pieces[i][k])))).length;
  if (s === 1) sharedPairs++;
  sharedRhombi += s;
}
check(`every pair of Jewels shares exactly one whole rhombus (${sharedRhombi} shared)`, sharedPairs === 6 && sharedRhombi === 6);

// No overlap: points inside one Jewel lie in no other (Jewels are not convex: test against the
// Jewel's own point-in-solid by ray parity).
function inside(P, F, p) {
  const dir = [0.5773, 0.5779, 0.5767];
  let hits = 0;
  for (const f of F) for (let m = 1; m + 1 < f.length; m++) {
    const a = P[f[0]], b = P[f[m]], c = P[f[m + 1]];
    const e1 = sub(b, a), e2 = sub(c, a), h = cross(dir, e2), det = e1[0] * h[0] + e1[1] * h[1] + e1[2] * h[2];
    if (Math.abs(det) < 1e-12) continue;
    const s = sub(p, a), u = (s[0] * h[0] + s[1] * h[1] + s[2] * h[2]) / det; if (u < 0 || u > 1) continue;
    const q = cross(s, e1), v = (dir[0] * q[0] + dir[1] * q[1] + dir[2] * q[2]) / det; if (v < 0 || u + v > 1) continue;
    if ((e2[0] * q[0] + e2[1] * q[1] + e2[2] * q[2]) / det > 1e-12) hits++;
  }
  return hits % 2 === 1;
}
let seed = 11, bad = 0;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
for (let n = 0; n < 4000; n++) {
  const p = [rnd(), rnd(), rnd()].map((x) => (x * 2 - 1) * 2.2 * K * 2);
  const inn = pieces.filter((P) => inside(P, DJ.faces, p)).length;
  if (inn > 1) bad++;
}
check(`no two Jewels overlap (4000 sample points, ${bad} in two)`, bad === 0);

// The surface.
const tri = C.faces.filter((f) => f.length === 3).length, rh = C.faces.filter((f) => f.length === 4).length;
check(`surface: ${C.faces.length} faces (${tri} triangles, ${rh} rhombi)`, C.faces.length === 228 && tri === 192 && rh === 36);
const edgeUse = new Map();
C.faces.forEach((f) => f.forEach((a, i) => { const b = f[(i + 1) % f.length]; const k = a < b ? `${a}-${b}` : `${b}-${a}`; edgeUse.set(k, (edgeUse.get(k) ?? 0) + 1); }));
check('closed: every edge on exactly two faces', [...edgeUse.values()].every((n) => n === 2));
// Pinch points: vertices whose faces form more than one fan.
const pinch = [];
C.vertices.forEach((_, v) => {
  const inc = C.faces.filter((f) => f.includes(v)).map((f) => { const i = f.indexOf(v); return [f[(i + f.length - 1) % f.length], f[(i + 1) % f.length]]; });
  const parent = inc.map((_, i) => i), find = (i) => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  for (let a = 0; a < inc.length; a++) for (let b = a + 1; b < inc.length; b++) if (inc[a].some((x) => inc[b].includes(x))) parent[find(a)] = find(b);
  const fans = new Set(inc.map((_, i) => find(i))).size;
  if (fans > 1) pinch.push({ v, fans });
});
const chi = C.vertices.length - edgeUse.size + C.faces.length;
const atCentre = pinch.length === 1 && len(C.vertices[pinch[0].v]) < 1e-9;
check(`one pinch point, at the centre, where the four lobes touch (${pinch.length} found)`, atCentre && pinch[0].fans === 4);
check(`with it split the surface is a sphere (Euler ${chi} + ${atCentre ? pinch[0].fans - 1 : '?'} = 2)`, atCentre && chi + pinch[0].fans - 1 === 2);
check(`volume = 4 DICTO Jewels (${volume(C).toFixed(6)} = 4 x ${volume(DJ).toFixed(6)})`, Math.abs(volume(C) - 4 * volume(DJ)) < 1e-9);

console.log(failures === 0 ? '\nAll checks passed (0 failures).' : `\n${failures} check(s) FAILED.`);
process.exit(failures === 0 ? 0 : 1);
