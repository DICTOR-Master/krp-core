// Verifies DICTO-Star (geometry-extensions/id-star.js), Kaleidohedra's DISCOVERIES.md #14:
//   - 1 icosidodecahedron, 12 dodecahedra on its pentagons, 20 J63 on its triangles, edge 1;
//   - no two of the 33 solids overlap (separating axis);
//   - every one of the icosidodecahedron's 60 edges is closed: the dodecahedron's face there is exactly a
//     pentagon of the J63 beside it (142.6226 + 116.5651 + 100.8123 = 360 degrees);
//   - every corner of the icosidodecahedron is filled (points round it all lie in some piece);
//   - exact volumes, the star (195 + 89 sqrt5)/3;
//   - with whole icosahedra in place of the J63 (Robert Austin's 2014 model) the pieces overlap.
import { convexHullFaces } from '../src/geometry-extensions/roof-fold.js';
import { idStar, icosahedron, ICOSIDODECAHEDRON_VOLUME, J63_VOLUME, ID_STAR_VOLUME } from '../src/geometry-extensions/id-star.js';
import { hullVolume, DODECA_VOLUME } from '../src/geometry-extensions/dodeca-cluster.js';

let failures = 0;
const check = (label, ok) => { console.log(`${ok ? 'OK  ' : 'FAIL'} ${label}`); if (!ok) failures++; };
const sub = (a, b) => a.map((x, i) => x - b[i]);
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a) => Math.hypot(...a);
const close = (p, q, t = 1e-7) => len(sub(p, q)) < t;
const has = (P, p) => P.some((q) => close(p, q));
const centroid = (P) => P.reduce((a, p) => a.map((x, i) => x + p[i] / P.length), [0, 0, 0]);

const { centre, dodecahedra, caps } = idStar();
check('1 icosidodecahedron, 12 dodecahedra, 20 J63 caps, all placed', centre.length === 30 && dodecahedra.length === 12 && caps.length === 20 && [...dodecahedra, ...caps].every(Boolean));
const solids = [centre, ...dodecahedra, ...caps];

// Separating axis test for convex solids.
const prep = (P) => {
  const F = convexHullFaces(P), E = [];
  const nrm = (f) => { const n = cross(sub(f[1], f[0]), sub(f[2], f[0])); return n.map((x) => x / len(n)); };
  for (const f of F) for (let i = 0; i < f.length; i++) { const e = sub(f[(i + 1) % f.length], f[i]); E.push(e.map((x) => x / len(e))); }
  return { P, N: F.map(nrm), E };
};
const data = solids.map(prep);
const separated = (A, B) => {
  const axes = [...A.N, ...B.N];
  for (const e of A.E) for (const f of B.E) { const c = cross(e, f); if (len(c) > 1e-9) axes.push(c.map((x) => x / len(c))); }
  return axes.some((ax) => {
    const pa = A.P.map((p) => dot(p, ax)), pb = B.P.map((p) => dot(p, ax));
    return Math.max(...pa) <= Math.min(...pb) + 1e-9 || Math.max(...pb) <= Math.min(...pa) + 1e-9;
  });
};
let bad = 0;
for (let i = 0; i < data.length; i++) for (let j = i + 1; j < data.length; j++) {
  if (len(sub(centroid(data[i].P), centroid(data[j].P))) > 7) continue;
  if (!separated(data[i], data[j])) bad++;
}
check('no two of the 33 solids overlap', bad === 0);

// Each icosidodecahedron edge: its dodecahedron and its J63 share a whole pentagon.
let edges = 0, closed = 0;
for (let i = 0; i < 30; i++) for (let j = i + 1; j < 30; j++) {
  if (Math.abs(len(sub(centre[i], centre[j])) - 1) > 1e-9) continue;
  edges++;
  const owners = (list) => list.filter((P) => has(P, centre[i]) && has(P, centre[j]));
  const d = owners(dodecahedra)[0], c = owners(caps)[0];
  if (!d || !c) continue;
  const shared = convexHullFaces(d).some((f) => f.length === 5 && f.every((p) => has(c, p)) && has(f, centre[i]) && has(f, centre[j]));
  if (shared) closed++;
}
check(`all ${edges} icosidodecahedron edges closed (dodecahedron face = J63 pentagon): ${closed}`, edges === 60 && closed === 60);

// Corners: small spheres of points round each icosidodecahedron corner lie in some piece.
const eqs = solids.map((P) => {
  const c = centroid(P);
  return convexHullFaces(P).map((f) => { let n = cross(sub(f[1], f[0]), sub(f[2], f[0])); n = n.map((x) => x / len(n)); if (dot(n, sub(c, f[0])) > 0) n = n.map((x) => -x); return [n, dot(n, f[0])]; });
});
const inAny = (p) => eqs.some((E) => E.every(([n, d]) => dot(n, p) <= d + 1e-9));
let gaps = 0, seed = 7;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
for (const v of centre) for (let k = 0; k < 400; k++) {
  const u = [rnd() - 0.5, rnd() - 0.5, rnd() - 0.5], l = len(u);
  if (!inAny(v.map((x, i) => x + (0.05 * u[i]) / l))) gaps++;
}
check('every corner of the icosidodecahedron filled (12 000 points round them)', gaps === 0);

check(`volumes: icosidodecahedron (45 + 17√5)/6, J63 ${J63_VOLUME.toFixed(6)}`, Math.abs(hullVolume(centre) - ICOSIDODECAHEDRON_VOLUME) < 1e-9 && caps.every((c) => Math.abs(hullVolume(c) - J63_VOLUME) < 1e-9));
const total = solids.reduce((s, P) => s + hullVolume(P), 0);
check(`the star: (195 + 89√5)/3 = ${ID_STAR_VOLUME.toFixed(6)} (${total.toFixed(6)})`, Math.abs(total - ID_STAR_VOLUME) < 1e-8 && Math.abs(ICOSIDODECAHEDRON_VOLUME + 12 * DODECA_VOLUME + 20 * J63_VOLUME - ID_STAR_VOLUME) < 1e-9);

// Whole icosahedra on the triangles (Austin 2014): each J63 completed by its three pentagonal pyramids.
const I = icosahedron();
const whole = caps.map((c) => {
  // the icosahedron through the cap's 9 vertices: the cap's own centre-of-icosahedron is the point at
  // distance circumradius from all 9; build it from the cap's vertex mean of the 9 plus the 3 apexes.
  const R = len(I[0]);
  const cc = centroid(c);
  // solve for the centre o with |o - p| = R for all p (least squares by iteration)
  let o = cc;
  for (let it = 0; it < 200; it++) {
    const g = c.reduce((a, p) => { const d = sub(o, p), l = len(d); return a.map((x, i) => x + (l - R) * d[i] / l); }, [0, 0, 0]);
    o = o.map((x, i) => x - 0.5 * g[i] / c.length);
  }
  return [...c, ...c.map((p) => o.map((x, i) => 2 * x - p[i])).filter((q) => !has(c, q))];
});
const overlapsWhole = whole.some((W) => dodecahedra.some((Dd) => !separated(prep(W), prep(Dd))));
check('with whole icosahedra instead (Austin 2014) the pieces overlap', overlapsWhole);

console.log(failures === 0 ? '\nAll checks passed (0 failures).' : `\n${failures} check(s) FAILED.`);
process.exit(failures === 0 ? 0 : 1);
