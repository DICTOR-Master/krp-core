// Verifies DICTO's 13-dodecahedron cluster (geometry-extensions/dodeca-cluster.js), Kaleidohedra's
// DISCOVERIES.md #13:
//   - each of the 12 neighbours is the centre mirrored across one face and shares exactly that face;
//   - at each of the centre's 30 edges the two neighbours open a wedge of 360 - 3 x dihedral = 10.3048 deg;
//   - the 30 wedges are congruent: two regular pentagons hinged on the centre's edge, two end triangles
//     and two outer trapezoids, volume exactly phi^3/20;
//   - the 20 needles are congruent tetrahedra, three edges 1 (the neighbours' outer edges) and an
//     equilateral base of 1/(phi^2 sqrt5), volume exactly (45 - 19 sqrt5)/600;
//   - no two of the 63 solids overlap (separating axis), and every face of a gap piece lies on a
//     dodecahedron, on another gap piece, or faces outward: the pieces fill the cluster's gaps;
//   - separable once built: wedges halve by their mirror planes, needles split in thirds, so each outer
//     dodecahedron carries 5 half-wedges and 5 needle-thirds and lifts straight out.
import { PHI, convexHullFaces } from '../src/geometry-extensions/roof-fold.js';
import { dodecaCluster, clusterWedges, clusterNeedles, hullVolume, DODECA_VOLUME, WEDGE_VOLUME, NEEDLE_VOLUME, CLUSTER_WEDGE_ANGLE } from '../src/geometry-extensions/dodeca-cluster.js';

let failures = 0;
const check = (label, ok) => { console.log(`${ok ? 'OK  ' : 'FAIL'} ${label}`); if (!ok) failures++; };
const sub = (a, b) => a.map((x, i) => x - b[i]);
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a) => Math.hypot(...a);
const same = (p, q) => len(sub(p, q)) < 1e-9;
const has = (P, p) => P.some((q) => same(p, q));

const C = dodecaCluster();
const { centre, faces, neighbours } = C;
const wedges = clusterWedges(C), needles = clusterNeedles(C);

check('12 neighbours, each sharing exactly one whole face with the centre',
  neighbours.length === 12 && neighbours.every((N, i) => faces[i].every((p) => has(N, p)) && N.filter((p) => has(centre, p)).length === 5));
check(`the centre is a dodecahedron of edge 1, volume (15 + 7√5)/4 (${hullVolume(centre).toFixed(9)})`, Math.abs(hullVolume(centre) - DODECA_VOLUME) < 1e-9);

// The angle between the two neighbours' faces at a centre edge.
const w0 = wedges[0];
const pents = convexHullFaces(w0).filter((f) => f.length === 5);
const nrm = (f) => { const n = cross(sub(f[1], f[0]), sub(f[2], f[0])); return n.map((c) => c / len(n)); };
const ang = Math.acos(Math.abs(dot(nrm(pents[0]), nrm(pents[1])))) * 180 / Math.PI;
check(`a wedge opens at 360 - 3 × 116.565 = ${CLUSTER_WEDGE_ANGLE.toFixed(4)}° (${ang.toFixed(4)}°)`, Math.abs(ang - CLUSTER_WEDGE_ANGLE) < 1e-7);
check(`30 wedges, each two regular pentagons + two triangles + two trapezoids`,
  wedges.length === 30 && wedges.every((w) => w.length === 8 && convexHullFaces(w).map((f) => f.length).sort().join() === '3,3,4,4,5,5'));
check(`every wedge has volume φ³/20 = ${WEDGE_VOLUME.toFixed(9)}`, wedges.every((w) => Math.abs(hullVolume(w) - WEDGE_VOLUME) < 1e-9));
const base = 1 / (PHI ** 2 * Math.sqrt(5));
check(`20 needles, each three edges 1 and an equilateral base of 1/(φ²√5) = ${base.toFixed(6)}`,
  needles.length === 20 && needles.every((n) => [1, 2, 3].every((i) => Math.abs(len(sub(n[i], n[0])) - 1) < 1e-9)
    && [[1, 2], [1, 3], [2, 3]].every(([i, j]) => Math.abs(len(sub(n[i], n[j])) - base) < 1e-9)));
check(`every needle has volume (45 − 19√5)/600 = ${NEEDLE_VOLUME.toFixed(9)}`, needles.every((n) => Math.abs(hullVolume(n) - NEEDLE_VOLUME) < 1e-12));

// No overlaps: separating axis test (face normals of both, and edge-direction cross products).
const solids = [centre, ...neighbours, ...wedges, ...needles];
const data = solids.map((P) => {
  const F = convexHullFaces(P), E = [];
  for (const f of F) for (let i = 0; i < f.length; i++) { const e = sub(f[(i + 1) % f.length], f[i]); E.push(e.map((c) => c / len(e))); }
  return { P, normals: F.map(nrm), edges: E };
});
const separated = (A, B) => {
  const axes = [...A.normals, ...B.normals];
  for (const e of A.edges) for (const f of B.edges) { const c = cross(e, f); if (len(c) > 1e-9) axes.push(c.map((x) => x / len(c))); }
  return axes.some((ax) => {
    const pa = A.P.map((p) => dot(p, ax)), pb = B.P.map((p) => dot(p, ax));
    return Math.max(...pa) <= Math.min(...pb) + 1e-9 || Math.max(...pb) <= Math.min(...pa) + 1e-9;
  });
};
let bad = 0;
for (let i = 0; i < data.length; i++) for (let j = i + 1; j < data.length; j++) {
  if (len(sub(data[i].P[0], data[j].P[0])) > 6) continue;
  if (!separated(data[i], data[j])) bad++;
}
check('no two of the 63 solids (13 dodecahedra, 30 wedges, 20 needles) overlap', bad === 0);

// Every gap-piece face lies on a dodecahedron face, matches another gap piece's face, or faces outward.
const polys = (P) => convexHullFaces(P);
const onFace = (f, P) => polys(P).some((g) => f.every((p) => has(g, p)) || g.every((p) => has(f, p)));
const dodecas = [centre, ...neighbours];
let inner = 0, outward = 0, unmatched = 0;
for (const piece of [...wedges, ...needles]) for (const f of polys(piece)) {
  if (dodecas.some((D) => onFace(f, D))) { inner++; continue; }
  if ([...wedges, ...needles].some((Q) => Q !== piece && onFace(f, Q))) { inner++; continue; }
  // outward: no solid lies beyond it
  const n = nrm(f), c = f.reduce((a, p) => a.map((x, i) => x + p[i] / f.length), [0, 0, 0]);
  const out = dot(n, sub(c, piece.reduce((a, p) => a.map((x, i) => x + p[i] / piece.length), [0, 0, 0]))) > 0 ? n : n.map((x) => -x);
  const probe = c.map((x, i) => x + 1e-6 * out[i]);
  const insideAny = solids.some((S) => polys(S).every((g) => { const m = nrm(g); const k = dot(m, g[0]); const s = Math.sign(dot(m, S.reduce((a, p) => a.map((x, i) => x + p[i] / S.length), [0, 0, 0])) - k); return s * (dot(m, probe) - k) > 1e-12; }));
  if (insideAny) unmatched++; else outward++;
}
check(`gap pieces' faces: ${inner} against a dodecahedron or another piece, ${outward} outward, none loose`, unmatched === 0 && outward === 30 * 2 + 20);
// Separable once built: each wedge is symmetric across the plane through the centre's edge that bisects
// it (so it halves onto its two neighbours), and each needle is 3-fold symmetric about its axis (thirds).
const wedgeHalves = wedges.every((w) => {
  const e = w.filter((p) => has(centre, p));                       // the centre's edge (centre at the origin)
  const m = cross(e[0], e[1]), n = m.map((x) => x / len(m));         // the mirror plane through it and the centre
  return e.length === 2 && w.every((p) => { const t = 2 * dot(n, p); return has(w, p.map((c, i) => c - t * n[i])); });
});
const needleThirds = needles.every((nd) => {
  const u = nd[0].map((x) => x / len(nd[0]));                      // the axis from the centre through the corner
  const c = Math.cos(2 * Math.PI / 3), s3 = Math.sin(2 * Math.PI / 3);
  const rot = (p) => { const par = u.map((x) => x * dot(p, u)), perp = sub(p, par), wv = cross(u, perp); return par.map((x, i) => x + c * perp[i] + s3 * wv[i]); };
  return nd.every((p) => has(nd, rot(p)));
});
check('separable: every wedge halves by its mirror plane onto its two neighbours, every needle splits in congruent thirds', wedgeHalves && needleThirds);
const total = 13 * DODECA_VOLUME + 30 * WEDGE_VOLUME + 20 * NEEDLE_VOLUME;
check(`the filled cluster: 13 dodecahedra + 30 wedges + 20 needles, volume ${total.toFixed(6)}`, Math.abs(solids.reduce((s, P) => s + hullVolume(P), 0) - total) < 1e-8);

console.log(failures === 0 ? '\nAll checks passed (0 failures).' : `\n${failures} check(s) FAILED.`);
process.exit(failures === 0 ? 0 : 1);
