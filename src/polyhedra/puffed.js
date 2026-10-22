// Puffed render geometry (DICTO's "Soft" look, 2026-10-21): a view-only copy of a piece in which every
// flat face bulges outward into a soft cap. The real piece (its vertices, faces, fitting, snapping and
// exact values) is never touched; this only makes triangles to draw.
//
// - A cyclic face (corners on one circle: regular faces, rectangles, isosceles trapezoids...) becomes a
//   true spherical cap through its corners, like a Reuleaux face: its edges lift into arcs.
// - Any other face (kites, irregular, non-convex) becomes a pillow: zero on its boundary, rising inside,
//   height = amount x inradius x t(2 - t), t = a smooth distance to the boundary over its largest value.
// - Where a cap's lifted edge meets its neighbour's, a narrow rounded welt joins the two, so the surface
//   stays closed; the seam is drawn along the middle of the welt (or along the edge where nothing lifts).
// - amount: the bulge height as a fraction of the face's inradius (0 = flat).
//
// Plain arrays in, plain arrays out (no three.js), so every app can use it.

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a) => Math.hypot(a[0], a[1], a[2]);
const norm = (a) => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };

// Newell's normal of a polygon (any winding, non-convex too).
function newell(P) {
  const n = [0, 0, 0];
  for (let i = 0; i < P.length; i++) {
    const a = P[i], b = P[(i + 1) % P.length];
    n[0] += (a[1] - b[1]) * (a[2] + b[2]); n[1] += (a[2] - b[2]) * (a[0] + b[0]); n[2] += (a[0] - b[0]) * (a[1] + b[1]);
  }
  return norm(n);
}

function circumcircle2(a, b, c) {
  const d = 2 * (a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1]));
  if (Math.abs(d) < 1e-14) return null;
  const a2 = a[0] ** 2 + a[1] ** 2, b2 = b[0] ** 2 + b[1] ** 2, c2 = c[0] ** 2 + c[1] ** 2;
  const x = (a2 * (b[1] - c[1]) + b2 * (c[1] - a[1]) + c2 * (a[1] - b[1])) / d;
  const y = (a2 * (c[0] - b[0]) + b2 * (a[0] - c[0]) + c2 * (b[0] - a[0])) / d;
  return { c: [x, y], R: Math.hypot(a[0] - x, a[1] - y) };
}

function segDist2(p, a, b) {
  const ab = [b[0] - a[0], b[1] - a[1]], ap = [p[0] - a[0], p[1] - a[1]];
  const L = ab[0] ** 2 + ab[1] ** 2;
  const t = L > 0 ? Math.max(0, Math.min(1, (ap[0] * ab[0] + ap[1] * ab[1]) / L)) : 0;
  return Math.hypot(ap[0] - t * ab[0], ap[1] - t * ab[1]);
}
const cross2 = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);

// Ear clipping of a simple counter-clockwise 2D polygon: index triples.
function earClip(Q) {
  const idx = Q.map((_, i) => i), out = [];
  let guard = 0;
  while (idx.length > 3 && guard++ < 10000) {
    let cut = false;
    for (let k = 0; k < idx.length; k++) {
      const i0 = idx[(k + idx.length - 1) % idx.length], i1 = idx[k], i2 = idx[(k + 1) % idx.length];
      if (cross2(Q[i0], Q[i1], Q[i2]) <= 1e-14) continue;
      let inside = false;
      for (const j of idx) {
        if (j === i0 || j === i1 || j === i2) continue;
        if (cross2(Q[i0], Q[i1], Q[j]) >= 0 && cross2(Q[i1], Q[i2], Q[j]) >= 0 && cross2(Q[i2], Q[i0], Q[j]) >= 0) { inside = true; break; }
      }
      if (inside) continue;
      out.push([i0, i1, i2]); idx.splice(k, 1); cut = true; break;
    }
    if (!cut) break; // degenerate: fan the rest
  }
  for (let k = 1; k + 1 < idx.length; k++) out.push([idx[0], idx[k], idx[k + 1]]);
  return out;
}

// Red-green refinement of a 2D triangulation: every edge not on the boundary is split at its middle.
function refine(pts, tris, isBoundary) {
  const mid = new Map();
  const key = (a, b) => (a < b ? `${a},${b}` : `${b},${a}`);
  const m = (a, b) => {
    if (isBoundary(a, b)) return -1;
    const k = key(a, b);
    if (!mid.has(k)) { mid.set(k, pts.length); pts.push([(pts[a][0] + pts[b][0]) / 2, (pts[a][1] + pts[b][1]) / 2]); }
    return mid.get(k);
  };
  const out = [];
  for (const [a, b, c] of tris) {
    const ab = m(a, b), bc = m(b, c), ca = m(c, a);
    const n = (ab >= 0) + (bc >= 0) + (ca >= 0);
    if (n === 3) out.push([a, ab, ca], [ab, b, bc], [ca, bc, c], [ab, bc, ca]);
    else if (n === 0) out.push([a, b, c]);
    else {
      // rotate so the split edges come first
      let T = [a, b, c], M = [ab, bc, ca];
      while (M[0] < 0 || (n === 2 && M[1] < 0)) { T = [T[1], T[2], T[0]]; M = [M[1], M[2], M[0]]; }
      const [x, y, z] = T;
      if (n === 1) out.push([x, M[0], z], [M[0], y, z]);
      else out.push([x, M[0], z], [M[0], y, M[1]], [M[0], M[1], z]);
    }
  }
  return out;
}

/**
 * @param {{vertices:number[][], faces:number[][]}} spec  a piece (faces as corner-index loops)
 * @param {{amount?:number, rings?:number, edgeSegments?:number, maxFaces?:number}} [opts]
 * @returns {{positions:Float32Array, normals:Float32Array, faceIds:Uint16Array, seams:Float32Array, triangles:number, cyclic:number}}
 *   non-indexed triangles; faceIds[k] = the spec face each vertex belongs to; seams = line-segment pairs.
 */
export function puffSpec(spec, opts = {}) {
  // An already-curved shape (spec.curved, e.g. the Reuleaux Platonic Solids): its own smooth body, the same at every softness.
  if (spec.curved) return curvedSoup(spec.curved);
  const amount = Math.max(0, opts.amount ?? 0.25), K = opts.rings ?? 3, baseSeg = opts.edgeSegments ?? 4;
  const V = spec.vertices.map((v) => [v[0], v[1], v[2]]);
  const faces = spec.faces.filter((f) => f.length >= 3);
  // Many small faces (an already-curved piece): drawn as it is.
  const flat = amount === 0 || faces.length > (opts.maxFaces ?? 200);
  // Outward: the polyhedron's signed volume decides the winding.
  let vol = 0;
  for (const f of faces) for (let i = 1; i + 1 < f.length; i++) vol += dot(V[f[0]], cross(V[f[i]], V[f[i + 1]]));
  const flip = vol < 0;
  const loops = faces.map((f) => (flip ? [...f].reverse() : f));
  // Edge samples, shared by both faces of an edge (keyed low,high; t from low to high).
  let meanEdge = 0, edgeCount = 0;
  for (const f of loops) f.forEach((a, i) => { meanEdge += len(sub(V[f[(i + 1) % f.length]], V[a])); edgeCount++; });
  meanEdge = meanEdge / Math.max(1, edgeCount) || 1;
  const segOf = new Map();
  const segs = (a, b) => {
    const k = a < b ? `${a},${b}` : `${b},${a}`;
    if (!segOf.has(k)) segOf.set(k, flat ? 1 : Math.max(2, Math.min(8, Math.round(baseSeg * len(sub(V[a], V[b])) / meanEdge))));
    return segOf.get(k);
  };

  const pos = [], nrm = [], fid = [], seams = [];
  const lift = new Map(); // `${a},${b}` (directed, face's own winding) -> { h: number[], n: normal, face }
  let cyclicCount = 0;

  // Emit a patch (local verts + tris) with smooth normals inside it.
  function emitPatch(P, Tall, face) {
    const N = P.map(() => [0, 0, 0]);
    const T = Tall.filter(([a, b, c]) => len(cross(sub(P[b], P[a]), sub(P[c], P[a]))) > 1e-12 * meanEdge * meanEdge);
    for (const [a, b, c] of T) {
      const fn = cross(sub(P[b], P[a]), sub(P[c], P[a]));
      for (const k of [a, b, c]) { N[k][0] += fn[0]; N[k][1] += fn[1]; N[k][2] += fn[2]; }
    }
    for (const [a, b, c] of T) for (const k of [a, b, c]) {
      const n = norm(N[k]);
      pos.push(P[k][0], P[k][1], P[k][2]); nrm.push(n[0], n[1], n[2]); fid.push(face);
    }
  }

  loops.forEach((f, fi) => {
    const C3 = f.map((k) => V[k]);
    const n = newell(C3);
    const o = C3[0];
    const U = norm(sub(C3[1], C3[0])), W = cross(n, U);
    const to2 = (p) => { const d = sub(p, o); return [dot(d, U), dot(d, W)]; };
    const to3 = (q, h) => add(add(add(o, mul(U, q[0])), mul(W, q[1])), mul(n, h));
    // Boundary samples in winding order, each with its edge id and parameter.
    const B = [], bEdge = [];
    f.forEach((a, i) => {
      const b = f[(i + 1) % f.length], m = segs(a, b);
      const fw = a < b, lo = fw ? a : b, hi = fw ? b : a;
      for (let s = 0; s < m; s++) {
        const t = fw ? s / m : 1 - s / m; // parameter from lo to hi
        B.push(to2(add(V[lo], mul(sub(V[hi], V[lo]), t)))); bEdge.push(i);
      }
    });
    const Q = f.map((k) => to2(V[k]));
    // Cyclic? (all corners on one circle)
    let circle = null;
    const scale = Math.max(...Q.map((q) => Math.hypot(q[0] - Q[0][0], q[1] - Q[0][1]))) || 1;
    {
      const c = circumcircle2(Q[0], Q[Math.floor(Q.length / 3)] ?? Q[1], Q[Math.floor((2 * Q.length) / 3)] ?? Q[2]);
      if (c && Q.every((q) => Math.abs(Math.hypot(q[0] - c.c[0], q[1] - c.c[1]) - c.R) < 1e-6 * scale)) circle = c;
    }
    let area = 0, cx = 0, cy = 0;
    for (let i = 0; i < Q.length; i++) {
      const a = Q[i], b = Q[(i + 1) % Q.length], w = a[0] * b[1] - b[0] * a[1];
      area += w; cx += (a[0] + b[0]) * w; cy += (a[1] + b[1]) * w;
    }
    const centre = Math.abs(area) > 1e-14 ? [cx / (3 * area), cy / (3 * area)] : Q[0];
    // Points and triangles of the face (2D).
    let pts, tris;
    const star = B.every((b, i) => cross2(centre, b, B[(i + 1) % B.length]) > 1e-12 * scale * scale);
    if (flat) {
      pts = B.map((b) => [...b]);
      tris = earClip(pts);
    } else if (star) {
      pts = [];
      for (let j = 0; j < K; j++) for (const b of B) { const s = 1 - j / K; pts.push([centre[0] + (b[0] - centre[0]) * s, centre[1] + (b[1] - centre[1]) * s]); }
      const ci = pts.push(centre) - 1, S = B.length;
      tris = [];
      for (let j = 0; j < K; j++) for (let i = 0; i < S; i++) {
        const a = j * S + i, b = j * S + ((i + 1) % S);
        if (j + 1 < K) { const c = (j + 1) * S + i, d = (j + 1) * S + ((i + 1) % S); tris.push([a, b, d], [a, d, c]); }
        else tris.push([a, b, ci]);
      }
    } else {
      pts = B.map((b) => [...b]);
      tris = earClip(pts);
      const S = B.length, onB = (a, b) => a < S && b < S && (Math.abs(a - b) === 1 || Math.abs(a - b) === S - 1);
      for (let r = 0; r < 2; r++) tris = refine(pts, tris, onB);
    }
    // Heights.
    const dSoft = (p) => {
      let s = 0;
      for (let i = 0; i < Q.length; i++) { const d = segDist2(p, Q[i], Q[(i + 1) % Q.length]); if (d < 1e-12) return 0; s += 1 / (d * d); }
      return 1 / Math.sqrt(s);
    };
    const D = pts.map(dSoft), dmax = Math.max(1e-12, ...D);
    let inr = 0;
    for (const p of pts) { let m = Infinity; for (let i = 0; i < Q.length; i++) m = Math.min(m, segDist2(p, Q[i], Q[(i + 1) % Q.length])); inr = Math.max(inr, m); }
    const H = flat ? 0 : amount * inr;
    let height;
    if (circle && H > 0) {
      cyclicCount++;
      const rho = (circle.R * circle.R + H * H) / (2 * H);
      height = (p) => Math.max(0, Math.sqrt(Math.max(0, rho * rho - ((p[0] - circle.c[0]) ** 2 + (p[1] - circle.c[1]) ** 2))) - (rho - H));
    } else height = (p, i) => { const t = Math.min(1, D[i] / dmax); return H * t * (2 - t); };
    const P3 = pts.map((p, i) => to3(p, height(p, i)));
    emitPatch(P3, tris, fi);
    // Record this face's lift along each of its edges (boundary samples are pts[0..B.length)).
    f.forEach((a, i) => {
      const b = f[(i + 1) % f.length], m = segs(a, b);
      const start = bEdge.indexOf(i), hs = [];
      for (let s = 0; s <= m; s++) { const k = (start + s) % B.length; hs.push(s === m ? height(B[(start + m) % B.length], (start + m) % B.length) : height(B[k], k)); }
      lift.set(`${a},${b}`, { h: hs, n, face: fi });
    });
  });

  // Welts and seams, once per edge.
  const done = new Set();
  for (const [k, A] of lift) {
    const [a, b] = k.split(',').map(Number);
    const ek = a < b ? `${a},${b}` : `${b},${a}`;
    if (done.has(ek)) continue;
    done.add(ek);
    const Bf = lift.get(`${b},${a}`), m = A.h.length - 1;
    const E = (s) => add(V[a], mul(sub(V[b], V[a]), s / m));
    const hB = (s) => (Bf ? Bf.h[m - s] : 0);
    const lifted = A.h.some((h) => h > 1e-9) || (Bf && Bf.h.some((h) => h > 1e-9));
    if (!Bf || !lifted) { for (let s = 0; s < m; s++) seams.push(...E(s), ...E(s + 1)); continue; }
    const c = dot(A.n, Bf.n), F = 2;
    const curve = []; // curve[s][v]
    for (let s = 0; s <= m; s++) {
      const e = E(s), ha = A.h[s], hb = hB(s);
      const pa = add(e, mul(A.n, ha)), pb = add(e, mul(Bf.n, hb));
      let M;
      if (c > 0.999 || c < -0.98) M = mul(add(pa, pb), 0.5);
      else {
        const den = 1 - c * c, x = (ha - c * hb) / den, y = (hb - c * ha) / den;
        M = add(e, add(mul(A.n, x), mul(Bf.n, y)));
        const cap = 2 * Math.max(ha, hb);
        const d = sub(M, e);
        if (len(d) > cap) M = add(e, mul(norm(d), cap));
      }
      const row = [];
      for (let v = 0; v <= F; v++) { const t = v / F, u = 1 - t; row.push(add(add(mul(pa, u * u), mul(M, 2 * u * t)), mul(pb, t * t))); }
      curve.push(row);
    }
    const P = curve.flat(), T = [];
    for (let s = 0; s < m; s++) for (let v = 0; v < F; v++) {
      const i0 = s * (F + 1) + v, i1 = i0 + 1, i2 = i0 + F + 1, i3 = i2 + 1;
      T.push([i0, i1, i2], [i1, i3, i2]); // winding: along a->b, across from A to B: outward
    }
    emitPatch(P, T, A.face);
    for (let s = 0; s < m; s++) seams.push(...welMid(curve[s]), ...welMid(curve[s + 1])); // the seam: the welt's middle
  }
  return {
    positions: new Float32Array(pos), normals: new Float32Array(nrm), faceIds: new Uint16Array(fid),
    seams: new Float32Array(seams), triangles: pos.length / 9, cyclic: cyclicCount,
  };
}

/**
 * A curved shape's drawn body as puffSpec's output: { positions, index, patch, seams } (indexed triangles, each triangle's face) to
 * non-indexed triangles with smooth normals (area-weighted over the shared corners, so the creases soften as in the shape's own view),
 * faceIds from the patches, and its seams.
 */
export function curvedSoup(c) {
  const P = c.positions, I = c.index, N = new Float64Array(P.length);
  for (let k = 0; k < I.length; k += 3) {
    const a = 3 * I[k], b = 3 * I[k + 1], d = 3 * I[k + 2];
    const u = [P[b] - P[a], P[b + 1] - P[a + 1], P[b + 2] - P[a + 2]], w = [P[d] - P[a], P[d + 1] - P[a + 1], P[d + 2] - P[a + 2]];
    const n = cross(u, w);
    for (const i of [a, b, d]) { N[i] += n[0]; N[i + 1] += n[1]; N[i + 2] += n[2]; }
  }
  const positions = new Float32Array(I.length * 3), normals = new Float32Array(I.length * 3), faceIds = new Uint16Array(I.length);
  for (let k = 0; k < I.length; k++) {
    const i = 3 * I[k], n = norm([N[i], N[i + 1], N[i + 2]]);
    positions.set([P[i], P[i + 1], P[i + 2]], 3 * k); normals.set(n, 3 * k); faceIds[k] = c.patch[Math.floor(k / 3)];
  }
  return { positions, normals, faceIds, seams: Float32Array.from(c.seams), triangles: I.length / 3, cyclic: 0 };
}

// Middle of a sampled welt row (t = 1/2; rows have an even number of steps).
function welMid(row) {
  return row[(row.length - 1) / 2];
}

/**
 * A piece spec (vertices + polygon faces) from a triangle soup, for drawn shapes that only exist as
 * triangles: corners welded, coplanar neighbouring triangles joined into one face, collinear corners dropped.
 * @param {ArrayLike<number>} positions  xyz triples
 * @param {ArrayLike<number>|null} [index]
 */
export function specFromTriangles(positions, index = null) {
  const n = index ? index.length : positions.length / 3;
  let size = 0;
  for (let i = 0; i < positions.length; i++) size = Math.max(size, Math.abs(positions[i]));
  const tol = (size || 1) * 1e-5;
  const vertices = [], weld = new Map(), id = [];
  for (let k = 0; k < n; k++) {
    const i = index ? index[k] : k, p = [positions[3 * i], positions[3 * i + 1], positions[3 * i + 2]];
    const key = p.map((x) => Math.round(x / tol)).join(',');
    if (!weld.has(key)) { weld.set(key, vertices.length); vertices.push(p); }
    id.push(weld.get(key));
  }
  // Triangles, grouped by plane, then by edge-connectivity within the plane.
  const tris = [];
  for (let k = 0; k + 2 < id.length; k += 3) {
    const [a, b, c] = [id[k], id[k + 1], id[k + 2]];
    if (a === b || b === c || a === c) continue;
    const nn = cross(sub(vertices[b], vertices[a]), sub(vertices[c], vertices[a]));
    if (len(nn) < tol * tol) continue;
    tris.push({ v: [a, b, c], n: norm(nn) });
  }
  const groups = new Map();
  for (const t of tris) {
    const d = dot(t.n, vertices[t.v[0]]);
    const key = [...t.n.map((x) => Math.round(x * 1e4)), Math.round(d / (tol * 10))].join(',');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(t);
  }
  const faces = [];
  for (const list of groups.values()) {
    const count = new Map();
    for (const t of list) t.v.forEach((a, i) => { const b = t.v[(i + 1) % 3], k = a < b ? `${a},${b}` : `${b},${a}`; count.set(k, (count.get(k) ?? 0) + 1); });
    const next = new Map();
    for (const t of list) t.v.forEach((a, i) => { const b = t.v[(i + 1) % 3], k = a < b ? `${a},${b}` : `${b},${a}`; if (count.get(k) === 1) next.set(a, b); });
    const seen = new Set();
    for (const start of next.keys()) {
      if (seen.has(start)) continue;
      const loop = [];
      let v = start, guard = 0;
      while (!seen.has(v) && next.has(v) && guard++ < 10000) { seen.add(v); loop.push(v); v = next.get(v); }
      // drop collinear corners
      const clean = loop.filter((v2, i) => {
        const a = vertices[loop[(i + loop.length - 1) % loop.length]], b = vertices[v2], c = vertices[loop[(i + 1) % loop.length]];
        return len(cross(sub(b, a), sub(c, b))) > tol * len(sub(c, a));
      });
      if (clean.length >= 3) faces.push(clean);
    }
  }
  return { vertices, faces };
}
