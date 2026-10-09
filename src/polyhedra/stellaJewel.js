import { buildConnectors } from './core.js';
const PHI = (1 + Math.sqrt(5)) / 2;
const K = PHI / 2; // cube edge 2 -> rhombus edge 1
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const signs = [1, -1];
export function specOf(id, name, verts, faces, oriented = false) {
  // Wind every face outward: consistently across shared edges (neighbours run a shared edge in
  // opposite directions), then all flipped together if the enclosed volume came out negative.
  // (These solids are concave, so no face can be tested against the centre on its own.)
  const out = faces.map((f) => [...f]);
  const done = new Array(out.length).fill(false);
  const byEdge = new Map();
  out.forEach((f, i) => f.forEach((a, j) => { const b = f[(j + 1) % f.length]; const k = a < b ? `${a}-${b}` : `${b}-${a}`; byEdge.set(k, [...(byEdge.get(k) ?? []), i]); }));
  // Faces already wound outward (a cluster keeps each Jewel's own winding, so its hidden hole's wall,
  // which shares no edge with the outside, points into the hole) need no walk.
  const queue = oriented ? [] : [0];
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
// DICTO's clusters of DICTO Jewels (DICTO, 2026-10-09), each a shape of its own, built from whole
// Jewels on even cells of the Stella–Jewel Lattice, each touching pair meeting face to face on a
// rhombus; the shared rhombi are inside, the rest is the surface. Checked in
// scripts/verify-dicto-jewel-cluster.mjs.
// - Tetrahedral (DICTO built it in the app): four Jewels at the corners of a tetrahedron of cells,
//   6 shared rhombi; 228 faces (192 triangles, 36 rhombi); its four lobes also touch at one point,
//   the cell corner at the centre. Volume 4 Jewels.
// - Octahedral: the six Jewels round one odd cell, at the corners of an octahedron, 12 shared rhombi,
//   and that cell's stella octangula, which they enclose exactly (sealed but for its 8 spike tips,
//   where it touches the outside at a point): a solid piece (DICTO). Surface 288 faces. Volume 6
//   Jewels and a stella.
export const DJ_TETRA_CENTRES = [[0, 0, 0], [2, 2, 0], [2, 0, 2], [0, 2, 2]]; // raw cube-edge-2 units
export const DJ_OCTA_CENTRES = [[2, 0, 0], [-2, 0, 0], [0, 2, 0], [0, -2, 0], [0, 0, 2], [0, 0, -2]];
// Both clusters fill space with stella octangulas (DICTO, 2026-10-09), in cell units (a cell = cube
// edge 2 raw; even cells hold Jewels, odd cells stellas):
// - tetrahedral clusters at every all-even cell (offsets 0, (1,1,0), (1,0,1), (0,1,1)): every Jewel
//   in exactly one cluster;
// - octahedral clusters round the odd cells (1,0,0) + this lattice (one of 12 such lattices, found
//   by exact cover): every Jewel in exactly one cluster, 5 more stellas per cluster between them.
export const DJ_TETRA_OFFSETS = [[0, 0, 0], [1, 1, 0], [1, 0, 1], [0, 1, 1]];
export const DJ_OCTA_TILING = { origin: [1, 0, 0], basis: [[2, 1, -1], [2, -1, 1], [1, 2, 1]] };
// The Kagome (pyrochlore) network of tetrahedral clusters (DICTO, 2026-10-09: "Kagome-style
// reversing tetrahedrons"): 'up' clusters at the all-even anchors whose coordinates sum to a multiple
// of 4 (a face-centred cubic arrangement of clusters); the 'down' clusters, the other way round, form
// between them. Every Jewel it holds is in one up and one down cluster, neighbouring clusters share a
// single Jewel (a corner, as Kagome triangles do), and it holds half the Jewel cells; the other half
// take single Jewels, and stellas fill the odd cells as always.
export const isKagomeAnchor = (a) => a.every((v) => v % 2 === 0) && (((a[0] + a[1] + a[2]) % 4) + 4) % 4 === 0;
function djCluster(id, name, centres, filling = null) {
  // Each Jewel's faces as the DICTO Jewel spec winds them (outward), on the same raw corners.
  const { verts: dv } = dragonJewelRaw();
  const df = STELLA_JEWEL_DJ.faces;
  const verts = [];
  const at = (p) => {
    let i = verts.findIndex((q) => Math.hypot(...sub(p, q)) < 1e-9);
    if (i < 0) {
      verts.push(p);
      i = verts.length - 1;
    }
    return i;
  };
  const all = centres.flatMap((c) => df.map((f) => f.map((i) => at(add(dv[i], c)))));
  // A solid cluster (DICTO, 2026-10-09: "the stella-shaped hole could have a stella in it, it's a
  // solid"): the centre piece's faces go in too, each meeting a Jewel's face and cancelling with it.
  const fill = filling ? filling.faces.map((f) => f.map((i) => at(filling.vertices[i].map((x) => x / K)))) : [];
  const key = (f) => [...f].sort((x, y) => x - y).join(',');
  const count = new Map();
  for (const f of [...all, ...fill]) count.set(key(f), (count.get(key(f)) ?? 0) + 1);
  if (fill.some((f) => count.get(key(f)) !== 2))
    throw new Error(`${id}: the centre piece does not fit the Jewels round it face for face`);
  const faces = all.filter((f) => count.get(key(f)) === 1);
  const c = centres.reduce((t, p) => add(t, p.map((x) => x / centres.length)), [0, 0, 0]);
  return specOf(id, name, verts.map((v) => sub(v, c)), faces, true);
}
const STELLA_JEWEL_DJ = dragonJewel();
const STELLA_JEWEL_STELLA = stellaOctangula();
export const STELLA_JEWEL_ADDITIONS = {
  DRAGON_JEWEL: STELLA_JEWEL_DJ,
  STELLA_OCTANGULA: STELLA_JEWEL_STELLA,
  DJ_TETRAHEDRAL_CLUSTER: djCluster('DJ_TETRAHEDRAL_CLUSTER', 'DICTO Jewel tetrahedral cluster', DJ_TETRA_CENTRES),
  DJ_OCTAHEDRAL_CLUSTER: djCluster('DJ_OCTAHEDRAL_CLUSTER', 'DICTO Jewel octahedral cluster', DJ_OCTA_CENTRES, STELLA_JEWEL_STELLA),
};
export const STELLA_JEWEL_ADDITION_IDS = Object.keys(STELLA_JEWEL_ADDITIONS);
