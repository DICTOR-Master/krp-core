import { buildConnectors } from './core.js';
const PHI = (1 + Math.sqrt(5)) / 2;
const K = PHI / 2; // cube edge 2 -> rhombus edge 1
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const signs = [1, -1];
function specOf(id, name, verts, faces) {
  // Wind every face outward: consistently across shared edges (neighbours run a shared edge in
  // opposite directions), then all flipped together if the enclosed volume came out negative.
  // (These solids are concave, so no face can be tested against the centre on its own.)
  const out = faces.map((f) => [...f]);
  const done = new Array(out.length).fill(false);
  const byEdge = new Map();
  out.forEach((f, i) => f.forEach((a, j) => { const b = f[(j + 1) % f.length]; const k = a < b ? `${a}-${b}` : `${b}-${a}`; byEdge.set(k, [...(byEdge.get(k) ?? []), i]); }));
  const queue = [0];
  done[0] = true;
  while (queue.length) {
    const i = queue.shift();
    const f = out[i];
    f.forEach((a, j) => {
      const b = f[(j + 1) % f.length];
      for (const o of byEdge.get(a < b ? `${a}-${b}` : `${b}-${a}`) ?? []) {
        if (o === i || done[o])
          continue;
        const g = out[o];
        const sameWay = g.some((c, m) => c === a && g[(m + 1) % g.length] === b);
        if (sameWay)
          g.reverse();
        done[o] = true;
        queue.push(o);
      }
    });
  }
  const volume = out.reduce((t, f) => { for (let m = 1; m + 1 < f.length; m++)
    t += dot(verts[f[0]], cross(verts[f[m]], verts[f[m + 1]])); return t; }, 0) / 6;
  if (volume < 0)
    out.forEach((f) => f.reverse());
  const scaled = verts.map((v) => v.map((c) => c * K));
  const edgeSet = new Map();
  out.forEach((f) => f.forEach((a, j) => { const b = f[(j + 1) % f.length]; edgeSet.set(a < b ? `${a}-${b}` : `${b}-${a}`, a < b ? [a, b] : [b, a]); }));
  const edges = [...edgeSet.values()];
  return { id, name, faceCount: out.length, vertices: scaled, edges, faces: out, connectors: buildConnectors(scaled, edges), attachableFaceIndices: out.map((_, i) => i) };
}
function dragonJewelRaw() {
  const verts = [];
  const at = (p) => {
    let i = verts.findIndex((q) => Math.hypot(...sub(p, q)) < 1e-9);
    if (i < 0) {
      verts.push(p);
      i = verts.length - 1;
    }
    return i;
  };
  // The dodecahedron's roof vertices: (0, +-1/phi, +-phi) and its cyclic turns.
  const roofs = [];
  for (const a of signs)
    for (const b of signs)
      roofs.push([0, a / PHI, b * PHI], [a / PHI, b * PHI, 0], [b * PHI, 0, a / PHI]);
  const faces = [];
  // Each cube edge AB: its window rhombus A Z B X, Z the roof vertex 2/phi from both ends, X = A + B - Z.
  const corners = [];
  for (const x of signs)
    for (const y of signs)
      for (const z of signs)
        corners.push([x, y, z]);
  for (let i = 0; i < 8; i++)
    for (let j = i + 1; j < 8; j++) {
      const A = corners[i], B = corners[j];
      if (Math.hypot(...sub(A, B)) !== 2)
        continue;
      const Z = roofs.find((r) => [A, B].every((c) => Math.abs(Math.hypot(...sub(r, c)) - 2 / PHI) < 1e-9));
      const X = sub(add(A, B), Z);
      faces.push([at(A), at(Z), at(B), at(X)]);
      // The walls: over each of the two cube faces at this edge, two triangles to that face's centre,
      // through Z on the face its roof stands over, through X on the other.
      const m = add(A, B).map((c) => c / 2);
      for (let axis = 0; axis < 3; axis++) {
        if (Math.abs(A[axis] - B[axis]) > 1e-9)
          continue; // the edge runs along this axis
        const F = [0, 0, 0];
        F[axis] = A[axis];
        const e = F;
        const P = dot(sub(Z, m), e) > 0 ? Z : X;
        faces.push([at(A), at(P), at(F)], [at(P), at(B), at(F)]);
      }
    }
  return { verts, faces };
}
function dragonJewel() {
  const { verts, faces } = dragonJewelRaw();
  return specOf('DRAGON_JEWEL', 'DICTO Jewel', verts, faces);
}
function stellaOctangula() {
  // The two tetrahedra's union: 8 spikes, each three triangles from a cube corner to the three
  // octahedron vertices (cube-face centres) beside it. Each triangle is split in two along the
  // seam where two DICTO Jewels meet on it in the lattice (DICTO, 2026-10-08: "they can't attach
  // to each other"): from the spike's tip to the DICTO Jewel corner on its far edge. Each half is
  // then exactly one DICTO Jewel wall, so the two attach face to face.
  const dj = dragonJewelRaw().verts;
  const neighbourCorners = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]].flatMap((e) => dj.map((v) => add(v, e.map((c) => 2 * c))));
  const seamPoint = (a, b) => {
    const ab = sub(b, a), L = Math.hypot(...ab);
    return neighbourCorners.find((q) => { const t = dot(sub(q, a), ab) / (L * L); return t > 1e-6 && t < 1 - 1e-6 && Math.hypot(...sub(q, add(a, ab.map((c) => c * t)))) < 1e-9; });
  };
  const verts = [];
  const faces = [];
  const at = (p) => {
    let i = verts.findIndex((q) => Math.hypot(...sub(p, q)) < 1e-9);
    if (i < 0) {
      verts.push(p);
      i = verts.length - 1;
    }
    return i;
  };
  for (const x of signs)
    for (const y of signs)
      for (const z of signs) {
        const c = [x, y, z];
        const F = [[x, 0, 0], [0, y, 0], [0, 0, z]];
        for (let k = 0; k < 3; k++) {
          const P = seamPoint(F[k], F[(k + 1) % 3]);
          faces.push([at(c), at(F[k]), at(P)], [at(c), at(P), at(F[(k + 1) % 3])]);
        }
      }
  return specOf('STELLA_OCTANGULA', 'Stella octangula', verts, faces);
}
export const STELLA_JEWEL_ADDITIONS = {
  DRAGON_JEWEL: dragonJewel(),
  STELLA_OCTANGULA: stellaOctangula(),
};
export const STELLA_JEWEL_ADDITION_IDS = Object.keys(STELLA_JEWEL_ADDITIONS);
