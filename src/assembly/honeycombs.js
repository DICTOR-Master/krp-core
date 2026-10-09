/**
 * The space-filling pairs' honeycombs as neighbour rules for the "what comes next" hints (hints.js).
 * Each honeycomb is generated in its own convenient coordinates (edge 1); every cell is then matched
 * to its catalogue shape (all centred at the origin) by the rotation that carries the shape's corners
 * onto the cell's, so the catalogue's own orientation does not matter. A piece's neighbours are the
 * cells sharing a face with a cell of its shape near the middle, in that cell's frame.
 * Checked by scripts/verify-hints.mjs (every slot, grown rounds deep, never overlaps).
 */
const S2 = Math.SQRT2, S3 = Math.sqrt(3);
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const scale = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a) => Math.hypot(a[0], a[1], a[2]);
const unit = (a) => scale(a, 1 / norm(a));
const centroid = (V) => scale(V.reduce(add, [0, 0, 0]), 1 / V.length);
const R = 5; // patch radius (in cells' centre distance), enough for a full neighbourhood at the middle
const near = (c) => norm(c) <= R + 1e-9;

// ---- the honeycombs: [{ shape, vertices }] ----
function octet() { // D4 + D8 (alternated cubic): FCC points a = sqrt 2
  const a = S2, cells = [];
  for (let i = -4; i <= 4; i++) for (let j = -4; j <= 4; j++) for (let k = -4; k <= 4; k++) {
    if ((i + j + k) % 2 !== 0) { const c = scale([i, j, k], a / 2); if (near(c)) cells.push({ shape: 'D8', vertices: [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]].map((e) => add(c, scale(e, a / 2))) }); }
  }
  const isFcc = (p) => { const q = p.map((x) => Math.round(x / (a / 2))); return q.every((x, n) => Math.abs(x * (a / 2) - p[n]) < 1e-9) && (q[0] + q[1] + q[2]) % 2 === 0; };
  const T1 = [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]];
  for (let i = -4; i <= 3; i++) for (let j = -4; j <= 3; j++) for (let k = -4; k <= 3; k++) {
    const c = scale([2 * i + 1, 2 * j + 1, 2 * k + 1], a / 4);
    if (!near(c)) continue;
    const set = [T1, T1.map((s) => scale(s, -1))].find((T) => T.every((s) => isFcc(add(c, scale(s, a / 4)))));
    cells.push({ shape: 'D4', vertices: set.map((s) => add(c, scale(s, a / 4))) });
  }
  return cells;
}
function quarterCubic() { // TRUNCATED_TETRAHEDRON + D4: truncated tetrahedra on the diamond sites
  const a = 2 * S2, Rt = (3 * Math.sqrt(6)) / 4, cells = [], small = new Map();
  const N = [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]].map(unit);
  for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) for (let k = -3; k <= 3; k++) {
    if ((i + j + k) % 2 !== 0) continue;
    for (const [off, sgn] of [[[0, 0, 0], -1], [[1, 1, 1], 1]]) {
      const c = add(scale([i, j, k], a / 2), scale(off, a / 4));
      if (!near(c)) continue;
      const big = N.map((n) => add(c, scale(n, sgn * Rt)));
      const V = [];
      for (let p = 0; p < 4; p++) for (let q = 0; q < 4; q++) if (p !== q) V.push(add(big[p], scale(sub(big[q], big[p]), 1 / 3)));
      cells.push({ shape: 'TRUNCATED_TETRAHEDRON', vertices: V });
      // each cut-off corner is a small tetrahedron of the honeycomb
      for (let p = 0; p < 4; p++) {
        const T = [big[p], ...[0, 1, 2, 3].filter((q) => q !== p).map((q) => add(big[p], scale(sub(big[q], big[p]), 1 / 3)))];
        const key = centroid(T).map((x) => x.toFixed(5)).join();
        if (!small.has(key)) small.set(key, T);
      }
    }
  }
  for (const T of small.values()) if (near(centroid(T))) cells.push({ shape: 'D4', vertices: T });
  return cells;
}
function rectifiedCubic() { // D8 + CUBOCTAHEDRON
  const s = S2, cells = [];
  for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) for (let k = -3; k <= 3; k++) {
    const c = scale([i, j, k], s);
    if (near(c)) { const V = []; for (const [x, y] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) V.push(add(c, [x * s / 2, y * s / 2, 0]), add(c, [x * s / 2, 0, y * s / 2]), add(c, [0, x * s / 2, y * s / 2])); cells.push({ shape: 'CUBOCTAHEDRON', vertices: V }); }
    const o = add(c, [s / 2, s / 2, s / 2]);
    if (near(o)) cells.push({ shape: 'D8', vertices: [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]].map((e) => add(o, scale(e, s / 2))) });
  }
  return cells;
}
function truncatedCubic() { // D8 + TRUNCATED_CUBE
  const s = 1 + S2, h = s / 2, cells = [];
  for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) for (let k = -2; k <= 2; k++) {
    const c = scale([i, j, k], s);
    if (near(c)) {
      const V = [];
      for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) V.push(add(c, [x * h, y * h, z * 0.5]), add(c, [x * h, y * 0.5, z * h]), add(c, [x * 0.5, y * h, z * h]));
      cells.push({ shape: 'TRUNCATED_CUBE', vertices: V });
    }
    const o = add(c, [h, h, h]);
    if (near(o)) cells.push({ shape: 'D8', vertices: [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]].map((e) => add(o, scale(e, 1 / S2))) });
  }
  return cells;
}
// Prismatic honeycombs: a plane tiling (polygons, each { shape, points }) extruded by 1 and stacked.
function prismatic(tiles) {
  const cells = [];
  for (const { shape, points } of tiles) for (let z = -2; z <= 2; z++) {
    const V = [...points.map(([x, y]) => [x, y, z - 0.5]), ...points.map(([x, y]) => [x, y, z + 0.5])];
    if (near(centroid(V))) cells.push({ shape, vertices: V });
  }
  return cells;
}
function elongatedTriangular() { // CUBE + PRISM_3: rows of squares and of triangles
  const h = S3 / 2, tiles = [];
  for (let row = -3; row <= 3; row++) {
    const y0 = row * (1 + h), sh = (row % 2 === 0 ? 0 : 0.5);
    for (let n = -6; n <= 6; n++) {
      const x = n + sh;
      tiles.push({ shape: 'CUBE', points: [[x, y0], [x + 1, y0], [x + 1, y0 + 1], [x, y0 + 1]] });
      tiles.push({ shape: 'PRISM_3', points: [[x, y0 + 1], [x + 1, y0 + 1], [x + 0.5, y0 + 1 + h]] });
      tiles.push({ shape: 'PRISM_3', points: [[x + 0.5, y0 + 1 + h], [x + 1, y0 + 1], [x + 1.5, y0 + 1 + h]] });
    }
  }
  return prismatic(tiles);
}
function trihexagonal() { // PRISM_3 + PRISM_6: the kagome tiling
  const tiles = [], poly = (c, r, a0, n) => Array.from({ length: n }, (_, k) => [c[0] + r * Math.cos(a0 + (2 * Math.PI * k) / n), c[1] + r * Math.sin(a0 + (2 * Math.PI * k) / n)]);
  for (let i = -5; i <= 5; i++) for (let j = -5; j <= 5; j++) {
    const c = [2 * i + j, S3 * j];
    tiles.push({ shape: 'PRISM_6', points: poly(c, 1, 0, 6) });
    tiles.push({ shape: 'PRISM_3', points: poly([c[0] + 1, c[1] + 1 / S3], 1 / S3, -Math.PI / 2, 3) });
    tiles.push({ shape: 'PRISM_3', points: poly([c[0] + 1, c[1] - 1 / S3], 1 / S3, Math.PI / 2, 3) });
  }
  return prismatic(tiles);
}
function truncatedSquare() { // CUBE + PRISM_8: octagons and squares
  const s = 1 + S2, ro = 1 / (2 * Math.sin(Math.PI / 8)), tiles = [];
  const poly = (c, r, a0, n) => Array.from({ length: n }, (_, k) => [c[0] + r * Math.cos(a0 + (2 * Math.PI * k) / n), c[1] + r * Math.sin(a0 + (2 * Math.PI * k) / n)]);
  for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) {
    tiles.push({ shape: 'PRISM_8', points: poly([i * s, j * s], ro, Math.PI / 8, 8) });
    tiles.push({ shape: 'CUBE', points: poly([i * s + s / 2, j * s + s / 2], 1 / S2, 0, 4) });
  }
  return prismatic(tiles);
}
export const HONEYCOMBS = {
  'Octet truss (tetrahedral-octahedral)': octet,
  'Pyrochlore (quarter cubic)': quarterCubic,
  'Rectified cubic': rectifiedCubic,
  'Truncated cubic': truncatedCubic,
  'Elongated triangular prismatic': elongatedTriangular,
  'Trihexagonal prismatic': trihexagonal,
  'Truncated square prismatic': truncatedSquare,
};

// ---- matching a catalogue shape to a cell: the rotation carrying its corners onto the cell's ----
const quatFromMatrix = (m) => { // rows m[r][c]
  const tr = m[0][0] + m[1][1] + m[2][2];
  let x, y, z, w;
  if (tr > 0) { const s = Math.sqrt(tr + 1) * 2; w = s / 4; x = (m[2][1] - m[1][2]) / s; y = (m[0][2] - m[2][0]) / s; z = (m[1][0] - m[0][1]) / s; }
  else if (m[0][0] > m[1][1] && m[0][0] > m[2][2]) { const s = Math.sqrt(1 + m[0][0] - m[1][1] - m[2][2]) * 2; w = (m[2][1] - m[1][2]) / s; x = s / 4; y = (m[0][1] + m[1][0]) / s; z = (m[0][2] + m[2][0]) / s; }
  else if (m[1][1] > m[2][2]) { const s = Math.sqrt(1 + m[1][1] - m[0][0] - m[2][2]) * 2; w = (m[0][2] - m[2][0]) / s; x = (m[0][1] + m[1][0]) / s; y = s / 4; z = (m[1][2] + m[2][1]) / s; }
  else { const s = Math.sqrt(1 + m[2][2] - m[0][0] - m[1][1]) * 2; w = (m[1][0] - m[0][1]) / s; x = (m[0][2] + m[2][0]) / s; y = (m[1][2] + m[2][1]) / s; z = s / 4; }
  return [x, y, z, w];
};
const frame = (a, b) => { const e1 = unit(a), e3 = unit(cross(a, b)), e2 = cross(e3, e1); return [e1, e2, e3]; };
/** The pose { position, quaternion } that puts `spec` (centred at the origin) on the cell's corners. */
export function matchPose(spec, cellVertices) {
  const c = centroid(cellVertices), Q = cellVertices.map((v) => sub(v, c));
  const V = spec.vertices;
  if (V.length !== Q.length) return null;
  const a = V[0], b = V.find((v) => norm(cross(a, v)) > 1e-6 * norm(a) * norm(v) && norm(v) > 1e-9);
  if (!b) return null;
  const Fs = frame(a, b);
  for (const p of Q) {
    if (Math.abs(norm(p) - norm(a)) > 1e-6) continue;
    for (const q of Q) {
      if (Math.abs(norm(q) - norm(b)) > 1e-6 || Math.abs(norm(sub(p, q)) - norm(sub(a, b))) > 1e-6) continue;
      if (norm(cross(p, q)) < 1e-9) continue;
      const Ft = frame(p, q);
      // R = Ft^T Fs (rows): R v = sum_k (Fs_k . v) Ft_k
      const rot = (v) => Fs.reduce((t, e, k) => add(t, scale(Ft[k], dot(e, v))), [0, 0, 0]);
      if (V.every((v) => { const w = rot(v); return Q.some((x) => norm(sub(x, w)) < 1e-6); })) {
        const m = [0, 1, 2].map((r) => [0, 1, 2].map((col) => rot([0, 1, 2].map((k) => (k === col ? 1 : 0)))[r]));
        return { position: c, quaternion: quatFromMatrix(m) };
      }
    }
  }
  return null;
}

const qconj = ([x, y, z, w]) => [-x, -y, -z, w];
const qmul = ([ax, ay, az, aw], [bx, by, bz, bw]) => [aw * bx + ax * bw + ay * bz - az * by, aw * by - ax * bz + ay * bw + az * bx, aw * bz + ax * by - ay * bx + az * bw, aw * bw - ax * bx - ay * by - az * bz];
const qrot = (q, v) => { const [x, y, z, w] = q, t = scale(cross([x, y, z], v), 2); return add(add(v, scale(t, w)), cross([x, y, z], t)); };

/** Neighbour rules of one honeycomb: { shape: [{ shape, offset, quaternion }] }. */
export function honeycombRules(name, specs) {
  const cells = HONEYCOMBS[name]().map((cl) => ({ ...cl, pose: matchPose(specs[cl.shape], cl.vertices), key: new Set(cl.vertices.map((v) => v.map((x) => x.toFixed(5)).join())) }));
  const bad = cells.filter((cl) => !cl.pose);
  if (bad.length) throw new Error(`${name}: ${bad.length} cells match no catalogue shape (${bad[0].shape})`);
  const rules = {};
  for (const shape of new Set(cells.map((cl) => cl.shape))) {
    const mine = cells.filter((cl) => cl.shape === shape).sort((x, y) => norm(x.pose.position) - norm(y.pose.position))[0];
    const inv = qconj(mine.pose.quaternion);
    rules[shape] = cells.filter((o) => o !== mine && [...o.key].filter((k) => mine.key.has(k)).length >= 3).map((o) => ({
      shape: o.shape,
      offset: qrot(inv, sub(o.pose.position, mine.pose.position)),
      quaternion: qmul(inv, o.pose.quaternion),
    }));
  }
  return rules;
}
