const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export function centred(vertices) {
  const c = vertices.reduce((s, v) => [s[0] + v[0] / vertices.length, s[1] + v[1] / vertices.length, s[2] + v[2] / vertices.length], [0, 0, 0]);
  return vertices.map((v) => sub(v, c));
}
/** Faces (each a cycle of corner indices, either way round) wound outward,
 *  for a convex solid centred on the origin. A face that needs turning
 *  keeps its first corner (face attach lines faces up from it; golden
 *  rhombi start at an acute corner). */
export function outward(vertices, faces) {
  return faces.map((f) => {
    const n = cross(sub(vertices[f[1]], vertices[f[0]]), sub(vertices[f[2]], vertices[f[1]]));
    const mid = f.reduce((s, i) => [s[0] + vertices[i][0], s[1] + vertices[i][1], s[2] + vertices[i][2]], [0, 0, 0]);
    return dot(n, mid) > 0 ? f : [f[0], ...f.slice(1).reverse()];
  });
}
export function edgesOf(faces) {
  const seen = new Set();
  const out = [];
  for (const f of faces)
    for (let i = 0; i < f.length; i++) {
      const a = Math.min(f[i], f[(i + 1) % f.length]), b = Math.max(f[i], f[(i + 1) % f.length]);
      if (!seen.has(`${a},${b}`)) {
        seen.add(`${a},${b}`);
        out.push([a, b]);
      }
    }
  return out;
}
/** A zonohedron: every face spans the generators in one plane and sits
 *  where the others push it (each generator counted +-1/2 by which side of
 *  the face plane it points). Two generators make a rhombus; three or more
 *  in one plane make a hexagon (or larger zonogon), started at its
 *  sharpest corner so face attach lines it up from a mirror line. */
export function zonohedron(gens) {
  const vertices = [];
  const index = (p) => {
    const key = p.map((x) => x.toFixed(9)).join();
    let i = vertices.findIndex((v) => v.map((x) => x.toFixed(9)).join() === key);
    if (i < 0) {
      vertices.push(p);
      i = vertices.length - 1;
    }
    return i;
  };
  const faces = [];
  const flat = (n, g) => Math.abs(dot(n, g)) < 1e-9 * Math.sqrt(dot(n, n) * dot(g, g));
  for (let i = 0; i < gens.length; i++)
    for (let j = i + 1; j < gens.length; j++) {
      const n0 = cross(gens[i], gens[j]);
      const inPlane = gens.map((g, k) => k).filter((k) => k === i || k === j || flat(n0, gens[k]));
      if (inPlane.length > 2) {
        // A zonogon face; made once, from the plane's first pair.
        if (inPlane[0] !== i || inPlane[1] !== j)
          continue;
        for (const s of [1, -1])
          faces.push(zonogon(gens, inPlane, n0.map((x) => x * s), index));
        continue;
      }
      for (const s of [1, -1]) {
        const n = cross(gens[i], gens[j]).map((x) => x * s);
        const c = gens.reduce((acc, g, k) => {
          if (k === i || k === j)
            return acc;
          const t = Math.sign(dot(n, g)) / 2;
          return [acc[0] + g[0] * t, acc[1] + g[1] * t, acc[2] + g[2] * t];
        }, [0, 0, 0]);
        const at = (a, b) => [0, 1, 2].map((d) => c[d] + (a * gens[i][d] + b * gens[j][d]) / 2);
        // Start at an acute corner: -gi-gj when gi.gj > 0, else +gi-gj.
        const cycle = dot(gens[i], gens[j]) > 0 ? [at(-1, -1), at(1, -1), at(1, 1), at(-1, 1)] : [at(1, -1), at(1, 1), at(-1, 1), at(-1, -1)];
        faces.push(cycle.map(index));
      }
    }
  return { vertices, faces: outward(vertices, faces) };
}
/** One zonogon face of a zonohedron: the generators `ks` all lie in the
 *  plane with normal n; the others push it out as in zonohedron(). */
function zonogon(gens, ks, n, index) {
  const c = gens.reduce((acc, g, k) => {
    if (ks.includes(k))
      return acc;
    const t = Math.sign(dot(n, g)) / 2;
    return [acc[0] + g[0] * t, acc[1] + g[1] * t, acc[2] + g[2] * t];
  }, [0, 0, 0]);
  // Orient the in-plane generators into one half-plane, sorted by angle.
  const e1 = gens[ks[0]];
  const e2 = cross(n, e1);
  const ang = (g) => Math.atan2(dot(g, e2), dot(g, e1));
  const half = ks.map((k) => { const g = gens[k]; return ang(g) < -1e-12 || Math.abs(ang(g) - Math.PI) < 1e-12 ? g.map((x) => -x) : g; })
    .sort((a, b) => ang(a) - ang(b));
  const sum = half.reduce((a, g) => [a[0] + g[0], a[1] + g[1], a[2] + g[2]], [0, 0, 0]);
  let p = [c[0] - sum[0] / 2, c[1] - sum[1] / 2, c[2] - sum[2] / 2];
  const pts = [];
  for (const g of [...half, ...half.map((h) => h.map((x) => -x))]) {
    pts.push(p);
    p = [p[0] + g[0], p[1] + g[1], p[2] + g[2]];
  }
  // Start at the sharpest corner (a mirror line runs through it).
  const m = pts.length;
  const corner = (q) => { const a = sub(pts[(q + m - 1) % m], pts[q]), b = sub(pts[(q + 1) % m], pts[q]); return dot(a, b) / Math.sqrt(dot(a, a) * dot(b, b)); };
  let start = 0;
  for (let q = 1; q < m; q++)
    if (corner(q) > corner(start) + 1e-9)
      start = q;
  return [...pts.slice(start), ...pts.slice(0, start)].map(index);
}
