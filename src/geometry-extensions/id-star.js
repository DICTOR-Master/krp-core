// DICTO-Star (Kaleidohedra's DISCOVERIES.md #14, 2026-10-09; DICTO built it first, from PET bottle
// caps and security rings): an icosidodecahedron with a regular dodecahedron on each of its 12
// pentagons and a tridiminished icosahedron (Johnson J63) on each of its 20 triangles, by J63's one
// triangle bordered only by pentagons. Every contact is a whole face, nothing overlaps and no filler is
// needed: at each of the icosidodecahedron's 60 edges 142.6226 + 116.5651 + 100.8123 = 360 degrees, and
// the dodecahedron's face there is exactly a pentagon of the J63. With whole icosahedra on the triangles
// (Robert Austin's 2014 Stella model) the three pentagonal pyramids of each icosahedron would overlap
// the dodecahedra; J63 is the icosahedron with exactly those removed. Edge 1. Checked in
// scripts/verify-id-star.mjs.
import { PHI, convexHullFaces } from './roof-fold.js';

const sub = (a, b) => a.map((x, i) => x - b[i]);
const add = (a, b) => a.map((x, i) => x + b[i]);
const scale = (a, s) => a.map((x) => x * s);
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a) => Math.hypot(...a);
const unit = (a) => scale(a, 1 / len(a));
const centroid = (P) => scale(P.reduce(add, [0, 0, 0]), 1 / P.length);
const same = (p, q) => len(sub(p, q)) < 1e-9;
const has = (P, p) => P.some((q) => same(p, q));

/** The regular icosahedron, edge 1, centred on the origin. */
export function icosahedron() {
  const out = [];
  for (const a of [-0.5, 0.5]) for (const b of [-0.5, 0.5]) out.push([0, a, b * PHI], [a, b * PHI, 0], [a * PHI, 0, b]);
  return out;
}
/** The icosidodecahedron, edge 1: the icosahedron's edge midpoints, scaled by 2. */
export function icosidodecahedron() {
  const I = icosahedron(), out = [];
  for (let i = 0; i < 12; i++) for (let j = i + 1; j < 12; j++) if (Math.abs(len(sub(I[i], I[j])) - 1) < 1e-9) out.push(scale(add(I[i], I[j]), 1));
  return out;
}
/** The regular dodecahedron, edge 1. */
export function dodecahedronUnit() {
  const s = PHI / 2, out = [];
  for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) out.push([x * s, y * s, z * s]);
  for (const a of [-1, 1]) for (const b of [-1, 1]) out.push([0, a * s / PHI, b * s * PHI], [a * s / PHI, b * s * PHI, 0], [a * s * PHI, 0, b * s / PHI]);
  return out;
}
/** The tridiminished icosahedron J63, edge 1: the icosahedron without three mutually non-adjacent,
 *  non-opposite vertices. */
export function tridiminishedIcosahedron() {
  const I = icosahedron();
  for (let a = 0; a < 12; a++) for (let b = a + 1; b < 12; b++) for (let c = b + 1; c < 12; c++) {
    const ok = [[a, b], [a, c], [b, c]].every(([x, y]) => Math.abs(len(sub(I[x], I[y])) - 1) > 1e-9 && !same(I[x], scale(I[y], -1)));
    if (ok) return I.filter((_, k) => k !== a && k !== b && k !== c);
  }
  return null;
}

// Outward polygon faces, each ordered round its centre.
function facesOf(P) {
  const c = centroid(P);
  return convexHullFaces(P).map((f) => {
    let n = unit(cross(sub(f[1], f[0]), sub(f[2], f[0])));
    if (dot(n, sub(centroid(f), c)) < 0) n = scale(n, -1);
    return { pts: f, n };
  });
}
// Rotation (3x3, rows) taking the orthonormal frame (u1, v1, w1) to (u2, v2, w2).
const frame = (pts, n) => { const c = centroid(pts); const u = unit(sub(pts[0], c)); return { c, u, v: cross(n, u), w: n }; };
function placeOn(src, srcFace, dst) {
  // srcFace sits on dst (same polygon), src on the far side: src's outward face normal onto -dst.n.
  const k = dst.pts.length;
  for (let s = 0; s < k; s++) {
    const A = frame(srcFace.pts, srcFace.n);
    const rolled = [...dst.pts.slice(s), ...dst.pts.slice(0, s)];
    const nB = scale(dst.n, -1);
    const B = { c: centroid(rolled), u: unit(sub(rolled[0], centroid(rolled))) };
    B.w = nB; B.v = cross(nB, B.u);
    const map = (p) => { const q = sub(p, A.c); const x = dot(q, A.u), y = dot(q, A.v), z = dot(q, A.w); return add(B.c, add(add(scale(B.u, x), scale(B.v, y)), scale(B.w, z))); };
    const img = srcFace.pts.map(map);
    if (img.every((p) => has(dst.pts, p))) return src.map(map);
  }
  return null;
}

/** DICTO-Star: { centre, dodecahedra[12], caps[20] } (vertex lists, edge 1). */
export function idStar() {
  const centre = icosidodecahedron();
  const Dv = dodecahedronUnit(), Jv = tridiminishedIcosahedron();
  const dFace = facesOf(Dv).find((f) => f.pts.length === 5);
  const jFaces = facesOf(Jv);
  // J63's one triangle whose three neighbours are all pentagons.
  const top = jFaces.find((f) => f.pts.length === 3 && jFaces.filter((g) => g !== f && f.pts.filter((p) => has(g.pts, p)).length === 2).every((g) => g.pts.length === 5));
  const dodecahedra = [], caps = [];
  for (const f of facesOf(centre)) {
    if (f.pts.length === 5) dodecahedra.push(placeOn(Dv, dFace, f));
    else caps.push(placeOn(Jv, top, f));
  }
  return { centre, dodecahedra, caps };
}

// Exact volumes (edge 1).
export const ICOSIDODECAHEDRON_VOLUME = (45 + 17 * Math.sqrt(5)) / 6;
export const J63_VOLUME = (5 * (3 + Math.sqrt(5))) / 12 - (5 + Math.sqrt(5)) / 8;
export const ID_STAR_VOLUME = (195 + 89 * Math.sqrt(5)) / 3;
