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
