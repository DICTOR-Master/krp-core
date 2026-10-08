// DICTO's 13-dodecahedron cluster (2026-10-08): a regular dodecahedron with a regular dodecahedron on
// each of its 12 faces. A face-sharing neighbour is always the mirror image across the shared face, so
// the 12 touch each other only along the centre's 30 edges, where three dodecahedra leave
// 360 - 3 x 116.565 = 10.305 degrees. The gaps are exactly two kinds of piece (Kaleidohedra's
// DISCOVERIES.md #13): 30 wedges, one on each edge of the centre, and 20 needles, one at each corner.
// Edge 1 throughout. Checked in scripts/verify-dodeca-cluster.mjs.
import { PHI, convexHullFaces } from './roof-fold.js';

const sub = (a, b) => a.map((x, i) => x - b[i]);
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const same = (p, q) => Math.hypot(...sub(p, q)) < 1e-9;
const has = (P, p) => P.some((q) => same(p, q));

/** The regular dodecahedron, edge 1, centred on the origin. */
export function dodecahedron() {
  const s = PHI / 2, out = [];
  for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) out.push([x * s, y * s, z * s]);
  for (const a of [-1, 1]) for (const b of [-1, 1]) {
    out.push([0, a * s / PHI, b * s * PHI], [a * s / PHI, b * s * PHI, 0], [a * s * PHI, 0, b * s / PHI]);
  }
  return out;
}

/** The polygon's plane: unit normal pointing away from `inside`, and offset. */
function plane(poly, inside) {
  let n = cross(sub(poly[1], poly[0]), sub(poly[2], poly[0]));
  const l = Math.hypot(...n); n = n.map((c) => c / l);
  const d = dot(n, poly[0]);
  return dot(n, inside) > d ? { n: n.map((c) => -c), d: -d } : { n, d };
}
const centroid = (P) => P.reduce((a, p) => a.map((c, i) => c + p[i] / P.length), [0, 0, 0]);
const mirror = (P, { n, d }) => P.map((p) => { const t = 2 * (dot(n, p) - d); return p.map((c, i) => c - t * n[i]); });

/** The cluster: { centre, neighbours } (vertex lists; neighbours[i] is on the centre's face i). */
export function dodecaCluster() {
  const centre = dodecahedron();
  const faces = convexHullFaces(centre);
  return { centre, faces, neighbours: faces.map((f) => mirror(centre, plane(f, [0, 0, 0]))) };
}

/** The 30 wedges: on each edge of the centre, the hull of the two neighbours' faces through that edge. */
export function clusterWedges({ centre, neighbours } = dodecaCluster()) {
  const edges = [];
  for (let i = 0; i < 20; i++) for (let j = i + 1; j < 20; j++) {
    if (Math.abs(Math.hypot(...sub(centre[i], centre[j])) - 1) < 1e-9) edges.push([centre[i], centre[j]]);
  }
  return edges.map(([v, w]) => {
    const pts = [];
    for (const N of neighbours.filter((P) => has(P, v) && has(P, w))) {
      const f = convexHullFaces(N).find((F) => has(F, v) && has(F, w) && !F.every((p) => has(centre, p)));
      for (const p of f) if (!has(pts, p)) pts.push(p);
    }
    return pts;
  });
}

/** The 20 needles: at each corner of the centre, the corner and the three neighbours' outer edges' ends. */
export function clusterNeedles({ centre, neighbours } = dodecaCluster()) {
  return centre.map((v) => [v, ...neighbours.filter((P) => has(P, v))
    .map((P) => P.find((p) => Math.abs(Math.hypot(...sub(p, v)) - 1) < 1e-9 && !has(centre, p)))]);
}

/** Volume of a convex solid given by its points. */
export function hullVolume(points) {
  const c = centroid(points);
  let v = 0;
  for (const f of convexHullFaces(points)) {
    for (let i = 1; i < f.length - 1; i++) v += Math.abs(dot(sub(f[0], c), cross(sub(f[i], c), sub(f[i + 1], c)))) / 6;
  }
  return v;
}

// Exact values (edge 1): the dodecahedron (15 + 7 sqrt5)/4, a wedge phi^3/20, a needle (45 - 19 sqrt5)/600.
export const DODECA_VOLUME = (15 + 7 * Math.sqrt(5)) / 4;
export const WEDGE_VOLUME = PHI ** 3 / 20;
export const NEEDLE_VOLUME = (45 - 19 * Math.sqrt(5)) / 600;
export const CLUSTER_WEDGE_ANGLE = 360 - 3 * (180 - Math.acos(1 / Math.sqrt(5)) * 180 / Math.PI);
