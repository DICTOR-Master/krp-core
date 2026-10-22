// Puffed render geometry (src/polyhedra/puffed.js): the caps rise outward by the asked amount, stay pinned
// at the corners, close up (no cracks) and keep every piece's own data untouched.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { puffSpec, specFromTriangles } from '../../src/polyhedra/puffed.js';
import { POLYHEDRA } from '../../src/polyhedra/index.js';

const centroid = (V) => V.reduce((a, v) => [a[0] + v[0] / V.length, a[1] + v[1] / V.length, a[2] + v[2] / V.length], [0, 0, 0]);

test('cube: spherical caps of height amount x inradius, pinned at the corners', () => {
  const s = POLYHEDRA.CUBE, before = JSON.stringify(s);
  const g = puffSpec(s, { amount: 0.25 });
  assert.equal(JSON.stringify(s), before, 'the real piece is untouched');
  assert.equal(g.cyclic, 6);
  const c = centroid(s.vertices);
  const edge = Math.hypot(...[0, 1, 2].map((i) => s.vertices[s.edges[0][0]][i] - s.vertices[s.edges[0][1]][i]));
  const half = edge / 2;
  let far = 0;
  for (let i = 0; i < g.positions.length; i += 3) far = Math.max(far, Math.max(...[0, 1, 2].map((k) => Math.abs(g.positions[i + k] - c[k]))));
  assert.ok(Math.abs(far - half * 1.25) < 1e-6 * edge, `cap top at inradius x 1.25 (${far} vs ${half * 1.25})`);
  // every corner is still a vertex of the puffed mesh
  for (const v of s.vertices) {
    let best = Infinity;
    for (let i = 0; i < g.positions.length; i += 3) best = Math.min(best, Math.hypot(g.positions[i] - v[0], g.positions[i + 1] - v[1], g.positions[i + 2] - v[2]));
    assert.ok(best < 1e-6, 'corner kept');
  }
});

test('closed surface: every triangle edge is shared by exactly two triangles (welded)', () => {
  for (const id of ['CUBE', 'DODECAHEDRON', 'RHOMBIC_DODECAHEDRON', 'TRUNCATED_OCTAHEDRON']) {
    const s = POLYHEDRA[id];
    if (!s) continue;
    const g = puffSpec(s, { amount: 0.3 });
    const key = (i) => [0, 1, 2].map((k) => Math.round(g.positions[3 * i + k] * 1e5)).join(',');
    const count = new Map();
    for (let t = 0; t < g.triangles; t++) for (let e = 0; e < 3; e++) {
      const a = key(3 * t + e), b = key(3 * t + ((e + 1) % 3));
      if (a === b) continue;
      const k = a < b ? a + '|' + b : b + '|' + a;
      count.set(k, (count.get(k) ?? 0) + 1);
    }
    const open = [...count.values()].filter((n) => n !== 2).length;
    assert.equal(open, 0, `${id}: ${open} unmatched edges`);
  }
});

test('outward normals, and the rhombus (non-cyclic) faces stay flat on their boundary', () => {
  const s = POLYHEDRA.RHOMBIC_DODECAHEDRON;
  const g = puffSpec(s, { amount: 0.25 }), c = centroid(s.vertices);
  assert.equal(g.cyclic, 0, 'rhombi are not cyclic');
  for (const [name, spec, gg] of [['RD', s, g], ['cube (welts)', POLYHEDRA.CUBE, puffSpec(POLYHEDRA.CUBE)]]) {
    const cc = name === 'RD' ? c : centroid(spec.vertices);
    let out = 0;
    for (let i = 0; i < gg.positions.length; i += 3) {
      const d = [0, 1, 2].map((k) => gg.positions[i + k] - cc[k]);
      if (d[0] * gg.normals[i] + d[1] * gg.normals[i + 1] + d[2] * gg.normals[i + 2] > 0) out++;
    }
    assert.ok(out / (gg.positions.length / 3) > 0.99, `${name}: normals point outward`);
    // triangle winding agrees with the normals
    let agree = 0;
    for (let t = 0; t < gg.triangles; t++) {
      const p = (k) => [0, 1, 2].map((j) => gg.positions[9 * t + 3 * k + j]);
      const [a, b, q] = [p(0), p(1), p(2)];
      const u = b.map((x, j) => x - a[j]), v = q.map((x, j) => x - a[j]);
      const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
      if (n[0] * gg.normals[9 * t] + n[1] * gg.normals[9 * t + 1] + n[2] * gg.normals[9 * t + 2] > 0) agree++;
    }
    assert.ok(agree / gg.triangles > 0.99, `${name}: winding outward (${agree}/${gg.triangles})`);
  }
  assert.ok(g.seams.length > 0);
});

test('amount 0 is the flat piece; triangle counts stay modest', () => {
  const flat = puffSpec(POLYHEDRA.CUBE, { amount: 0 });
  assert.equal(flat.triangles, 12);
  for (const id of ['CUBE', 'DODECAHEDRON', 'RHOMBIC_DODECAHEDRON']) assert.ok(puffSpec(POLYHEDRA[id]).triangles < 3000, id);
});

test('specFromTriangles rebuilds the polygon faces of a triangulated piece', () => {
  const s = POLYHEDRA.RHOMBIC_DODECAHEDRON, pos = [];
  for (const f of s.faces) for (let i = 1; i + 1 < f.length; i++) for (const k of [f[0], f[i], f[i + 1]]) pos.push(...s.vertices[k]);
  const r = specFromTriangles(pos);
  assert.equal(r.vertices.length, 14);
  assert.equal(r.faces.length, 12);
  assert.ok(r.faces.every((f) => f.length === 4));
});
