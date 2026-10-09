/**
 * Whether two placed solids pass through each other (DICTO 2026-10-09: attached Hexas "merging").
 * Works for concave closed solids, where a face can be flush and the piece still go through the
 * rest: sample points just inside every face of one solid (each triangle's centre and points towards
 * its corners, set in from the face by a small margin) are tested against the other solid by its
 * winding number (the solid angle its faces make round the point / 4 pi: 1 inside, 0 outside), both
 * ways. Each sample is checked to be inside its own solid first (thin points are tried nearer the
 * face, then left out), so a sharp tip never counts as the other solid's inside. Pieces that only touch, face to face, edge or corner, never overlap: every sample stays on
 * its own side by the margin.
 */
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

/** A spec's corners moved to a placement: position [x, y, z] and quaternion [x, y, z, w]. */
export function placeVertices(vertices, position, quaternion) {
  const [qx, qy, qz, qw] = quaternion;
  return vertices.map(([x, y, z]) => {
    // v + 2w (q x v) + 2 q x (q x v)
    const tx = 2 * (qy * z - qz * y), ty = 2 * (qz * x - qx * z), tz = 2 * (qx * y - qy * x);
    return [x + qw * tx + (qy * tz - qz * ty) + position[0], y + qw * ty + (qz * tx - qx * tz) + position[1], z + qw * tz + (qx * ty - qy * tx) + position[2]];
  });
}

const triangles = ({ vertices: V, faces: F }) => F.flatMap((f) => f.slice(1, -1).map((_, i) => [V[f[0]], V[f[i + 1]], V[f[i + 2]]]));

// The solid angle of a triangle seen from p (Van Oosterom and Strackee).
function solidAngle(p, [a, b, c]) {
  const A = sub(a, p), B = sub(b, p), C = sub(c, p);
  const la = Math.hypot(...A), lb = Math.hypot(...B), lc = Math.hypot(...C);
  return 2 * Math.atan2(dot(A, cross(B, C)), la * lb * lc + dot(A, B) * lc + dot(A, C) * lb + dot(B, C) * la);
}
const winding = (p, tris) => tris.reduce((t, tri) => t + solidAngle(p, tri), 0) / (4 * Math.PI);

// Points just inside every face of a solid: each triangle's centre and towards its corners, set in
// by the margin. A sample that is not inside its own solid (a sharp point thinner than the margin,
// such as a stella's tip) is tried nearer the face, then dropped.
function samples(tris, margin) {
  const out = [];
  for (const [a, b, c] of tris) {
    const n = cross(sub(b, a), sub(c, a)), l = Math.hypot(...n);
    if (l < 1e-12) continue;
    for (const w of [[1 / 3, 1 / 3, 1 / 3], [0.6, 0.2, 0.2], [0.2, 0.6, 0.2], [0.2, 0.2, 0.6]]) {
      const onFace = [0, 1, 2].map((k) => w[0] * a[k] + w[1] * b[k] + w[2] * c[k]);
      for (const d of [margin, margin / 4]) {
        const p = onFace.map((x, k) => x - (n[k] / l) * d);
        if (Math.abs(winding(p, tris) - 1) < 0.25) { out.push(p); break; }
      }
    }
  }
  return out;
}
const bounds = (V) => [0, 1, 2].map((k) => [Math.min(...V.map((v) => v[k])), Math.max(...V.map((v) => v[k]))]);

// Each shape's samples, in its own frame, worked out once (the self-check is the slow part).
const sampleCache = new WeakMap();
function ownSamples(spec, margin) {
  let byMargin = sampleCache.get(spec);
  if (!byMargin) sampleCache.set(spec, (byMargin = new Map()));
  if (!byMargin.has(margin)) byMargin.set(margin, samples(triangles(spec), margin));
  return byMargin.get(margin);
}
const edgeOf = (s) => { const f = s.faces[0]; return Math.hypot(...sub(s.vertices[f[0]], s.vertices[f[1]])); };

/**
 * A spec placed for overlap tests: { vertices, faces, samples } in world space. position [x, y, z],
 * quaternion [x, y, z, w]; margin defaults to 2% of the spec's edge.
 */
export function placedSolid(spec, position = [0, 0, 0], quaternion = [0, 0, 0, 1], margin = 0.02 * edgeOf(spec)) {
  return { vertices: placeVertices(spec.vertices, position, quaternion), faces: spec.faces, samples: placeVertices(ownSamples(spec, margin), position, quaternion) };
}

/**
 * True when the two solids' insides overlap by more than the margin. a, b: from placedSolid, or plain
 * { vertices, faces } already placed (then sampled here, more slowly), faces wound outward.
 */
export function solidsOverlap(a, b, margin) {
  const ba = bounds(a.vertices), bb = bounds(b.vertices);
  if (ba.some(([lo, hi], k) => hi <= bb[k][0] + 1e-9 || bb[k][1] <= lo + 1e-9)) return false;
  const m = margin ?? 0.02 * Math.min(edgeOf(a), edgeOf(b));
  const ta = triangles(a), tb = triangles(b);
  const inBox = (p, bx) => bx.every(([lo, hi], k) => p[k] > lo && p[k] < hi);
  for (const [own, ownTris, other, otherBox] of [[b, tb, ta, ba], [a, ta, tb, bb]]) {
    for (const p of own.samples ?? samples(ownTris, m)) if (inBox(p, otherBox) && Math.abs(winding(p, other)) > 0.5) return true;
  }
  return false;
}

/** Whether point p is inside a solid ({ vertices, faces }, placed, wound outward). */
export function insideSolid(solid, p) {
  const bx = bounds(solid.vertices);
  if (!bx.every(([lo, hi], k) => p[k] > lo && p[k] < hi)) return false;
  return Math.abs(winding(p, triangles(solid))) > 0.5;
}
