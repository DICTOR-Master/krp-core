// Unborn (src/polyhedra/unborn.js; DICTO's name; Koca et al. 2015's pseudoicosahedron, x = 1/tau): registered in POLYHEDRA, 12 corners
// at cyclic (±phi/2, ±1/(2phi), 0), 20 faces wound outward (8 equilateral of edge 1, 12 isosceles 1/phi, 1, 1), 30 edges (6 of 1/phi),
// closed with Euler 2, volume (3 + 7√5)/12; and with the unit icosahedron at the origin and the Unborn at (phi/2)(1, 1, 1), its 8
// equilateral faces are the 8 icosahedra's corner faces round the void.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { POLYHEDRA, POLYHEDRON_IDS, UNBORN_ADDITION_IDS } from '../../src/polyhedra/index.js';

const PHI = (1 + Math.sqrt(5)) / 2;
const d = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const sub = (a, b) => a.map((x, i) => x - b[i]);
const cross = (u, w) => [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
const dot = (u, w) => u[0] * w[0] + u[1] * w[1] + u[2] * w[2];
const U = POLYHEDRA.DICTO_UNBORN;

test('registered as Unborn', () => {
  assert.deepEqual(UNBORN_ADDITION_IDS, ['DICTO_UNBORN']);
  assert.ok(POLYHEDRON_IDS.includes('DICTO_UNBORN'));
  assert.equal(U.name, 'Unborn');
});

test('corners, faces and edges', () => {
  assert.equal(U.vertices.length, 12);
  const want = [];
  for (const s of [1, -1]) for (const t of [1, -1]) { const p = [s * PHI / 2, t / (2 * PHI), 0]; want.push(p, [p[2], p[0], p[1]], [p[1], p[2], p[0]]); }
  for (const w of want) assert.ok(U.vertices.some((v) => d(v, w) < 1e-12), `corner ${w}`);
  assert.equal(U.faces.length, 20);
  const sides = (f) => f.map((a, i) => d(U.vertices[a], U.vertices[f[(i + 1) % 3]]));
  assert.equal(U.faces.filter((f) => sides(f).every((x) => Math.abs(x - 1) < 1e-12)).length, 8);
  assert.equal(U.faces.filter((f) => { const s = sides(f).sort(); return Math.abs(s[0] - 1 / PHI) < 1e-12 && Math.abs(s[1] - 1) < 1e-12 && Math.abs(s[2] - 1) < 1e-12; }).length, 12);
  assert.equal(U.edges.length, 30);
  assert.equal(U.edges.filter(([a, b]) => Math.abs(d(U.vertices[a], U.vertices[b]) - 1 / PHI) < 1e-12).length, 6);
});

test('closed, outward, Euler 2, volume (3 + 7√5)/12', () => {
  const E = new Map();
  for (const f of U.faces) f.forEach((a, i) => { const k = `${a}>${f[(i + 1) % f.length]}`; assert.ok(!E.has(k), 'each directed edge once'); E.set(k, 1); });
  for (const k of E.keys()) { const [a, b] = k.split('>'); assert.ok(E.has(`${b}>${a}`), 'every edge in two faces, opposite ways'); }
  assert.equal(U.vertices.length - U.edges.length + U.faces.length, 2);
  let vol = 0;
  for (const f of U.faces) {
    const [a, b, c] = f.map((i) => U.vertices[i]);
    const n = cross(sub(b, a), sub(c, a));
    assert.ok(dot(n, a) > 0, 'outward');
    vol += dot(a, cross(b, c)) / 6;
  }
  assert.ok(Math.abs(vol - (3 + 7 * Math.sqrt(5)) / 12) < 1e-12, `volume ${vol}`);
});

test('its equilateral faces are the corner faces of the 8 icosahedra round the void', () => {
  const ico = [];
  for (const s of [1, -1]) for (const t of [1, -1]) ico.push([0, s / 2, t * PHI / 2], [s / 2, t * PHI / 2, 0], [t * PHI / 2, 0, s / 2]);
  const C = [PHI / 2, PHI / 2, PHI / 2];
  let found = 0;
  for (const f of U.faces) {
    const P = f.map((i) => U.vertices[i].map((x, k) => x + C[k]));
    if (!P.every((p, i) => Math.abs(d(p, P[(i + 1) % 3]) - 1) < 1e-12)) continue;
    // the icosahedron on the lattice point nearest this face's middle has all three corners
    const m = P.reduce((t, p) => t.map((x, k) => x + p[k] / 3), [0, 0, 0]), o = m.map((x) => Math.round(x / PHI) * PHI);
    if (P.every((p) => ico.some((q) => d(p, q.map((x, k) => x + o[k])) < 1e-12))) found++;
  }
  assert.equal(found, 8);
});
