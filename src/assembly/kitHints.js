/**
 * Kit outlines (DICTO 2026-10-13, the 13s, docs/PLAN-13.md stage 3): a kit is a fixed plan, { shape, position, quaternion } for
 * every piece in the kit's own frame (polyhedra/kits13.js). Once any of its pieces is built, the plan is lined up with the build
 * (the turn and place that matches the most built pieces) and its unbuilt pieces become slots, the innermost layer first: the
 * outlines go on from the centre out, nearest the piece placed last first.
 */
import { placeVertices, placedSolid, solidsOverlap } from './overlap.js';

const qmul = ([ax, ay, az, aw], [bx, by, bz, bw]) => [aw * bx + ax * bw + ay * bz - az * by, aw * by - ax * bz + ay * bw + az * bx, aw * bz + ax * by - ay * bx + az * bw, aw * bw - ax * bx - ay * by - az * bz];
const qinv = ([x, y, z, w]) => [-x, -y, -z, w];
const rotate = (q, v) => placeVertices([v], [0, 0, 0], q)[0];
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const centroids = new WeakMap();
const centroidOf = (spec) => {
  if (!centroids.has(spec)) centroids.set(spec, [0, 1, 2].map((k) => spec.vertices.reduce((t, v) => t + v[k], 0) / spec.vertices.length));
  return centroids.get(spec);
};
// Where a piece's middle lands for a placement.
const middle = (spec, position, quaternion) => rotate(quaternion, centroidOf(spec)).map((x, k) => x + position[k]);

/** The kit's plan carried into the build's frame: [{ shape, position, quaternion, r }] (r: distance from the kit's centre). */
function placedPlan(kit, W) {
  return kit.entries.map((e) => ({
    shape: e.shape, quaternion: qmul(W.q, e.quaternion),
    position: rotate(W.q, e.position).map((x, k) => x + W.p[k]), r: Math.hypot(...e.position),
  }));
}

/** How the kit lines up with the build: the frame that matches the most built pieces (null when none of its pieces is built). */
export function kitFrame(nodes, specs, kit) {
  const shapes = new Set(kit.entries.map((e) => e.shape));
  const ours = nodes.filter((n) => shapes.has(n.shape) && specs[n.shape]);
  if (!ours.length) return null;
  let best = null;
  for (const n of ours.slice(0, 3)) {
    for (const e of kit.entries) {
      if (e.shape !== n.shape) continue;
      const q = qmul(n.transform.quaternion, qinv(e.quaternion));
      const p = n.transform.position.map((x, k) => x - rotate(q, e.position)[k]);
      const plan = placedPlan(kit, { q, p });
      const hits = ours.filter((m) => { const c = middle(specs[m.shape], m.transform.position, m.transform.quaternion);
        return plan.some((s) => s.shape === m.shape && dist(middle(specs[s.shape], s.position, s.quaternion), c) < 1e-4); }).length;
      if (!best || hits > best.hits) best = { q, p, hits };
      if (best.hits === ours.length) return best;
    }
  }
  return best;
}

/**
 * The kit's next slots: [{ shape, position, quaternion, from: [] }], the innermost layer still open (pieces within 15% of its
 * distance from the centre), nearest `near` first, at most `cap`. Slots a built piece already fills, or that would pass through a
 * piece outside the kit, are left out.
 */
export function kitSlots(nodes, specs, kit, { near, cap = 12 } = {}) {
  const W = kitFrame(nodes, specs, kit);
  if (!W) return [];
  const built = nodes.filter((n) => specs[n.shape]).map((n) => ({ n, mid: middle(specs[n.shape], n.transform.position, n.transform.quaternion) }));
  const open = placedPlan(kit, W).filter((s) => {
    const c = middle(specs[s.shape], s.position, s.quaternion);
    return !built.some((b) => b.n.shape === s.shape && dist(b.mid, c) < 1e-4);
  });
  if (!open.length) return [];
  const r0 = Math.min(...open.map((s) => s.r));
  const ring = open.filter((s) => s.r <= r0 * 1.15 + 1e-6);
  const hand = near ?? W.p;
  ring.sort((a, b) => dist(a.position, hand) - dist(b.position, hand));
  const planShapes = new Set(kit.entries.map((e) => e.shape));
  const strangers = built.filter((b) => !planShapes.has(b.n.shape));
  const out = [];
  for (const s of ring) {
    if (out.length >= cap) break;
    if (strangers.length) {
      const mine = placedSolid(specs[s.shape], s.position, s.quaternion);
      if (strangers.some((b) => solidsOverlap(placedSolid(specs[b.n.shape], b.n.transform.position, b.n.transform.quaternion), mine))) continue;
    }
    out.push({ shape: s.shape, position: s.position, quaternion: s.quaternion, from: [] });
  }
  return out;
}

/**
 * The 12 corners of the icosahedron a kit fills, in the kit's own frame, or null when the finished kit is not an icosahedron
 * (DICTO 2026-10-14: Pacioli's three golden rectangles shown on every icosahedron kit). Every piece corner must lie inside the
 * icosahedron through the 12 farthest corners.
 */
const icoCache = new WeakMap();
export function kitIcosahedron(kit, specs) {
  if (icoCache.has(kit)) return icoCache.get(kit);
  const pts = kit.entries.flatMap((e) => placeVertices(specs[e.shape]?.vertices ?? [], e.position, e.quaternion));
  const R = Math.max(...pts.map((v) => Math.hypot(...v))), tol = 1e-6 * Math.max(R, 1);
  const far = [];
  for (const v of pts) if (Math.abs(Math.hypot(...v) - R) < tol && far.every((w) => dist(v, w) > tol * 10)) far.push(v);
  let out = null;
  if (far.length === 12) {
    const e = Math.min(...far.flatMap((v, i) => far.slice(i + 1).map((w) => dist(v, w))));
    const nb = far.map((v) => far.map((w, j) => (Math.abs(dist(v, w) - e) < tol * 10 ? j : -1)).filter((j) => j >= 0));
    if (nb.every((n) => n.length === 5)) {
      const faces = [];
      for (let a = 0; a < 12; a++) for (const b of nb[a]) for (const c of nb[a]) if (a < b && b < c && nb[b].includes(c)) faces.push([a, b, c]);
      const inside = faces.length === 20 && faces.every(([a, b, c]) => {
        const [A, B, C] = [far[a], far[b], far[c]], u = B.map((x, k) => x - A[k]), w = C.map((x, k) => x - A[k]);
        let n = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
        const d = n[0] * A[0] + n[1] * A[1] + n[2] * A[2]; const s = d < 0 ? -1 : 1; n = n.map((x) => x * s);
        return pts.every((p) => n[0] * p[0] + n[1] * p[1] + n[2] * p[2] <= Math.abs(d) + tol * 100 * Math.hypot(...n));
      });
      if (inside) out = far;
    }
  }
  icoCache.set(kit, out);
  return out;
}

/**
 * Pacioli's three golden rectangles of an icosahedron given by its 12 corners: [[4 corners] x3], each through the centre with two
 * opposite edges as its short sides.
 */
export function goldenRectangles(corners) {
  const c = [0, 1, 2].map((k) => corners.reduce((t, v) => t + v[k], 0) / corners.length);
  const P = corners.map((v) => v.map((x, k) => x - c[k]));
  const e = Math.min(...P.flatMap((v, i) => P.slice(i + 1).map((w) => dist(v, w))));
  const used = new Set(), rects = [];
  for (let i = 0; i < 12 && rects.length < 3; i++) for (let j = i + 1; j < 12; j++) {
    if (used.has(i) || used.has(j) || Math.abs(dist(P[i], P[j]) - e) > 1e-6 * e) continue;
    const opp = (a) => P.findIndex((w) => dist(w, P[a].map((x) => -x)) < 1e-6 * e);
    const ii = opp(i), jj = opp(j);
    // the rectangle i, j, opp(i), opp(j) is golden only when i, j, opp(i), opp(j) lie in a plane through the centre with no
    // other corner on it: the three rectangles use 12 different corners.
    if ([ii, jj].some((k) => k < 0 || used.has(k))) continue;
    const quad = [i, j, ii, jj];
    rects.push([P[i], P[j], P[ii], P[jj]].map((v) => v.map((x, k) => x + c[k])));
    quad.forEach((k) => used.add(k));
    break;
  }
  return rects.length === 3 ? rects : null;
}
