/**
 * The golden split (DICTO's idea, 2026-10-23; Kaleidohedra study 2026-10-23-shadow-forms, exact in Q(√5)): in the simple cubic lattice
 * of unit icosahedra (spacing phi) with an Unborn in every void and 6 AXE per cell, cone every AXE from the point p = m1 + (1/phi)(m2 - m1)
 * on its axis (m1 the midpoint of its long edge, on two icosahedra; m2 the midpoint of its short edge, on two Unborns) into 4 pyramids,
 * each joining the piece whose face it sits on. Then
 *   icosahedron + 12 pyramids = Icosaxes (the big truncated octahedron): all permutations of (0, ±1/2, ±phi/2), volume 1 + 2√5/3;
 *   Unborn + 12 pyramids      = Unborn Axes (the small one): all permutations of (0, ±1/(2phi), ±phi/2), volume 1 + √5/3;
 * both convex, 8 congruent equiangular hexagons (sides 1/√2 and 1/(phi√2)) and 6 squares (1/√2, 1/(phi√2)); the 12 pyramid tips are the
 * mirror image's corners. Big ones at the lattice points and small ones at the cube centres fill space (body-centred).
 * The Lotus Jewel network: the 8 Tricaps (icosahedron ∩ dodecahedron, on the 8 hexagons) go to the dodecahedra: Lotus Jewel
 * Axes = Lotus Jewel + 12 pyramids, volume √5; Dodecaxes = dodecahedron + 12 pyramids, volume 2. Any choice per
 * hexagon fills; so does a key the other way (the Tricap mirrored in the hexagon's plane lies inside the Unborn), used by Kaleidohedra's
 * Golden split world.
 * Prior art (study README): the shapes are known (Koca et al. 2015, arXiv 1506.04600 §4.3: a pseudoicosahedron ∪ its mirror image is
 * the non-regular truncated octahedron of orbit (1, x, 0), here x = τ (the icosahedron) and x = 1/τ (the Unborn)), and unequal truncated octahedra on a body-centred lattice are
 * weighted Voronoi (Laguerre) cells; this fill from icosahedra + Unborns + split AXE, and the keyed √5 / 2 pair, were not found.
 * Names by DICTO. Checked in tests/unit/golden-split.test.mjs.
 */
import { specOf } from './stellaJewel.js';

export const PHI = (1 + Math.sqrt(5)) / 2;
const H = PHI / 2;
const sub = (a, b) => a.map((x, i) => x - b[i]);
const add = (a, b) => a.map((x, i) => x + b[i]);
const mul = (k, a) => a.map((x) => k * x);
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (u, w) => [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
const cyc = (p) => [p, [p[2], p[0], p[1]], [p[1], p[2], p[0]]];
const anti = (p) => [[p[0], p[2], p[1]], [p[2], p[1], p[0]], [p[1], p[0], p[2]]];
const signed = (p) => [1, -1].flatMap((s) => [1, -1].map((t) => [p[0], s * p[1], t * p[2]]));

/** The 8 hexagon directions (sign triples), in a fixed order: hexagon i of a piece faces SIGNS[i]. */
export const SIGNS = [1, -1].flatMap((x) => [1, -1].flatMap((y) => [1, -1].map((z) => [x, y, z])));
/** The icosahedron (edge 1) at the origin: cyclic (0, ±1/2, ±phi/2); the Unborn about its own centre: cyclic (±phi/2, ±1/(2phi), 0). */
export const ICO = signed([0, 0.5, H]).flatMap(cyc);
export const UNBORN = signed([0, H, 1 / (2 * PHI)]).flatMap((p) => cyc([p[1], p[2], p[0]]));
/** The tips of the 12 pyramids: the mirror image's corners (anticyclic). */
const ICO_TIPS = signed([0, 0.5, H]).flatMap(anti);
const UNBORN_TIPS = signed([0, H, 1 / (2 * PHI)]).flatMap((p) => anti([p[1], p[2], p[0]]));

const centroid = (P) => P.reduce((t, p) => add(t, mul(1 / P.length, p)), [0, 0, 0]);
// a tetrahedron [a, b, c, d] as 4 triangles wound outward
function tet(P) {
  const c = centroid(P), F = [[0, 1, 2], [0, 1, 3], [0, 2, 3], [1, 2, 3]];
  return F.map((f) => { const [a, b, d] = f.map((i) => P[i]); return dot(cross(sub(b, a), sub(d, a)), sub(a, c)) > 0 ? [a, b, d] : [a, d, b]; });
}
// a convex body's triangles wound outward, from its corners (all its faces are triangles)
function convexTris(P) {
  const c = centroid(P), out = [];
  for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) for (let k = j + 1; k < P.length; k++) {
    const n = cross(sub(P[j], P[i]), sub(P[k], P[i])), d = P.map((q) => dot(n, sub(q, P[i])));
    if (Math.hypot(...n) < 1e-9) continue;
    if (d.every((x) => x < 1e-9) || d.every((x) => x > -1e-9)) out.push(dot(n, sub(P[i], c)) > 0 ? [P[i], P[j], P[k]] : [P[i], P[k], P[j]]);
  }
  return out;
}
const nearest = (P, q, k) => [...P].sort((a, b) => Math.hypot(...sub(a, q)) - Math.hypot(...sub(b, q))).slice(0, k);
/** The 12 pyramids of a piece (each: 3 base corners on the core, then the tip), about the piece's own centre. */
export const pyramids = (big) => (big ? ICO_TIPS : UNBORN_TIPS).map((tip) => [...nearest(big ? ICO : UNBORN, tip, 3), tip]);
/** Tricap i of the icosahedron (its base the icosahedron's face towards SIGNS[i], its tip the dodecahedron's corner (1/(2phi)) SIGNS[i])
 *  and its mirror image in that face's plane; both in the icosahedron's frame. */
export function tricap(i, mirror = false) {
  const s = SIGNS[i], base = nearest(ICO, mul(10, s), 3), tip = mul(1 / (2 * PHI), s);
  if (!mirror) return [...base, tip];
  const n = mul(1 / Math.sqrt(3), s), d = dot(n, base[0]) - dot(n, tip);
  return [...base, add(tip, mul(2 * d, n))];
}
/** Key states of a hexagon: FLAT (the Tricap stays in the big piece), INTO_BIG (it goes to the small piece: a key into the big one's
 *  dent), INTO_SMALL (the mirrored Tricap goes from the small piece to the big one: a key into the small one's dent). */
export const FLAT = 0, INTO_BIG = 1, INTO_SMALL = 2;

// ---- surfaces: oriented triangles added and taken away, shared faces cancelled ----
const vkey = (p) => p.map((x) => Math.round(x * 1e6)).join(',');
function cancel(tris) {
  const m = new Map();
  for (const t of tris) {
    const ks = t.map(vkey), key = [...ks].sort().join('|'), have = m.get(key);
    if (!have) { m.set(key, t); continue; }
    const hk = have.map(vkey), i = hk.indexOf(ks[0]);
    if (hk[(i + 1) % 3] === ks[1]) throw new Error('golden-split: a face twice the same way');
    m.delete(key);
  }
  return [...m.values()];
}
const flip = (tris) => tris.map(([a, b, c]) => [a, c, b]);
const move = (tris, t) => tris.map((f) => f.map((p) => add(p, t)));
/**
 * The parts of a piece, about its own centre: { core, pyramids, keys } as lists of outward triangles, and `role` of the core.
 * big: the piece on a lattice point (else the one on a cube centre); states[i]: the key state of its hexagon i (facing SIGNS[i]).
 * The small piece's hexagon i faces the big piece at (phi/2) SIGNS[i], whose hexagon facing back is the one towards -SIGNS[i].
 */
export function pieceParts(big, states) {
  const pyr = pyramids(big).map((P) => tet(P));
  let core = convexTris(big ? ICO : UNBORN), keys = [];
  SIGNS.forEach((s, i) => {
    const st = states[i];
    if (st === FLAT) return;
    if (big) {
      if (st === INTO_BIG) core = core.concat(flip(tet(tricap(i))));       // dent: the Tricap taken out
      else keys.push(tet(tricap(i, true)));                                // key: the mirrored Tricap added
    } else {
      const j = SIGNS.findIndex((q) => q.every((x, k) => x === -s[k])), t = mul(H, s);
      if (st === INTO_BIG) core = core.concat(move(tet(tricap(j)), t));   // key: the Tricap added
      else core = core.concat(flip(move(tet(tricap(j, true)), t)));       // dent: the mirrored Tricap taken out
    }
  });
  return { core: cancel(core), pyramids: pyr, keys };
}
/** The whole piece's surface (all parts joined), as outward triangles. */
export function pieceSurface(big, states) {
  const p = pieceParts(big, states);
  return cancel([...p.core, ...p.pyramids.flat(), ...p.keys.flat()]);
}
/** The convex hull of points as flat faces: { vertices, faces } (faces wound outward; points repeated or inside dropped). */
export function convexPolygons(points) {
  const P = [];
  for (const p of points) if (!P.some((q) => Math.hypot(...sub(p, q)) < 1e-9)) P.push(p);
  const c = centroid(P), size = Math.max(...P.map((p) => Math.hypot(...sub(p, c)))), eps = 1e-9 * size * size;
  const seen = new Set(), faces = [];
  for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) for (let k = j + 1; k < P.length; k++) {
    let n = cross(sub(P[j], P[i]), sub(P[k], P[i]));
    if (Math.hypot(...n) < eps) continue;
    const d = P.map((q) => dot(n, sub(q, P[i])));
    if (!d.every((x) => x < eps) && !d.every((x) => x > -eps)) continue;
    if (d.some((x) => x > eps)) n = mul(-1, n);
    const on = P.map((_, m) => m).filter((m) => Math.abs(d[m]) <= eps), key = on.join(',');
    if (seen.has(key)) continue;
    seen.add(key);
    const fc = centroid(on.map((m) => P[m])), u = sub(P[on[0]], fc), w = cross(n, u);
    faces.push(on.sort((a, b) => Math.atan2(dot(sub(P[a], fc), w), dot(sub(P[a], fc), u)) - Math.atan2(dot(sub(P[b], fc), w), dot(sub(P[b], fc), u))));
  }
  const used = [...new Set(faces.flat())].sort((a, b) => a - b), map = new Map(used.map((m, i) => [m, i]));
  return { vertices: used.map((m) => P[m]), faces: faces.map((f) => f.map((m) => map.get(m))) };
}
/** Triangles joined into flat faces where neighbours lie in one plane: { vertices, faces } (faces wound outward), plus `tag(face)`. */
export function toPolygons(tris) {
  const V = [], idx = new Map();
  const at = (p) => { const k = vkey(p); if (!idx.has(k)) { idx.set(k, V.length); V.push(p); } return idx.get(k); };
  const T = tris.map((t) => t.map(at));
  const normal = (t) => { const n = cross(sub(V[t[1]], V[t[0]]), sub(V[t[2]], V[t[0]])), l = Math.hypot(...n); return n.map((x) => x / l); };
  const N = T.map(normal), parent = T.map((_, i) => i);
  const find = (i) => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  const byEdge = new Map();
  T.forEach((t, i) => t.forEach((a, j) => { const b = t[(j + 1) % 3]; byEdge.set(`${a}>${b}`, i); }));
  T.forEach((t, i) => t.forEach((a, j) => {
    const o = byEdge.get(`${t[(j + 1) % 3]}>${a}`);
    if (o !== undefined && dot(N[i], N[o]) > 1 - 1e-9) parent[find(i)] = find(o);
  }));
  const groups = new Map();
  T.forEach((_, i) => { const r = find(i); if (!groups.has(r)) groups.set(r, []); groups.get(r).push(i); });
  const faces = [];
  for (const g of groups.values()) {
    if (g.length === 1) { faces.push(T[g[0]]); continue; }
    const dir = new Set(g.flatMap((i) => T[i].map((a, j) => `${a}>${T[i][(j + 1) % 3]}`)));
    const next = new Map();
    for (const e of dir) { const [a, b] = e.split('>'); if (!dir.has(`${b}>${a}`)) next.set(Number(a), Number(b)); }
    const loop = [next.keys().next().value];
    while (loop.length <= next.size) { const n = next.get(loop[loop.length - 1]); if (n === loop[0]) break; loop.push(n); }
    if (loop.length === next.size) faces.push(loop); else g.forEach((i) => faces.push(T[i])); // not one simple loop: keep the triangles
  }
  return { vertices: V, faces };
}
const ALL = (st) => Array(8).fill(st);
const shape = (id, name, big, st) => { const { vertices, faces } = toPolygons(pieceSurface(big, ALL(st))); return specOf(id, name, vertices, faces, true, 1); };
export const GOLDEN_SPLIT_ADDITIONS = {
  DICTO_ICOSAXES: shape('DICTO_ICOSAXES', 'Icosaxes', true, FLAT),
  DICTO_UNBORN_AXES: shape('DICTO_UNBORN_AXES', 'Unborn Axes', false, FLAT),
  DICTO_LOTUS_JEWEL_AXES: shape('DICTO_LOTUS_JEWEL_AXES', 'Lotus Jewel Axes', true, INTO_BIG),
  DICTO_DODECAXES: shape('DICTO_DODECAXES', 'Dodecaxes', false, INTO_BIG),
};
export const GOLDEN_SPLIT_ADDITION_IDS = Object.keys(GOLDEN_SPLIT_ADDITIONS);
