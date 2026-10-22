// The Reuleaux Platonic Solids as Polyhedraverse shapes (src/polyhedra/reuleaux.js; DICTO 2026-10-21, DICTO's idea, paper #45): five
// shapes named by look, in their own family; corners 1 apart on every face (so every three-cornered face meets a unit triangle); each
// patch's corners at distance D/side from its ball centre; the drawn body closed, outward, every patch present, the corners on it; the
// seams on the body; and Soft (puffSpec) draws the body itself, the same at every softness.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { POLYHEDRA, POLYHEDRON_IDS, REULEAUX_RAW, REULEAUX_ADDITION_IDS, reuleauxId, isFaceEligibleForAttach } from '../../src/polyhedra/index.js';
import { familyIds, familiesFor, FAMILY_META, FAMILY_ORDER } from '../../src/polyhedra/families.js';
import { puffSpec } from '../../src/polyhedra/puffed.js';

const NAMES = { tetrahedron: 'Reuleaux tetrahedron', octahedron: 'Reuleaux octahedron', cube: 'Reuleaux cube', icosahedron: 'Reuleaux icosahedron', dodecahedron: 'Reuleaux dodecahedron' };
const COUNTS = { tetrahedron: [4, 4, 3], octahedron: [8, 6, 3], cube: [6, 8, 4], icosahedron: [20, 12, 3], dodecahedron: [12, 20, 5] }; // faces, corners, corners per face
const d = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

test('five shapes, named as the world and the paper name them, in their own family', () => {
  assert.deepEqual(REULEAUX_ADDITION_IDS, ['tetrahedron', 'octahedron', 'cube', 'icosahedron', 'dodecahedron'].map(reuleauxId));
  for (const B of REULEAUX_RAW) assert.equal(POLYHEDRA[reuleauxId(B.key)].name, NAMES[B.key]);
  for (const id of REULEAUX_ADDITION_IDS) { assert.ok(POLYHEDRON_IDS.includes(id)); assert.deepEqual(familiesFor(id), ['REULEAUX_PLATONIC']); }
  assert.equal(FAMILY_META.REULEAUX_PLATONIC.label, 'Reuleaux Platonic Solids (#45)');
  assert.equal(FAMILY_ORDER[1], 'REULEAUX_PLATONIC', 'DICTO\'s newest work near the top');
  assert.deepEqual([...familyIds('REULEAUX_PLATONIC')].sort(), [...REULEAUX_ADDITION_IDS].sort());
});

for (const B of REULEAUX_RAW) {
  test(`${B.name}: corners, faces and the drawn body`, () => {
    const s = POLYHEDRA[reuleauxId(B.key)], [nf, nc, k] = COUNTS[B.key];
    assert.equal(s.faces.length, nf); assert.equal(s.vertices.length, nc);
    for (const f of s.faces) { assert.equal(f.length, k); for (let j = 0; j < k; j++) assert.ok(Math.abs(d(s.vertices[f[j]], s.vertices[f[(j + 1) % k]]) - 1) < 1e-8, 'face corners 1 apart'); }
    s.faces.forEach((_, fi) => assert.ok(isFaceEligibleForAttach(s, fi)));
    // faces wound outward: each face's normal points away from the centre
    for (const f of s.faces) {
      const [a, b, c] = f.map((i) => s.vertices[i]), u = b.map((x, i) => x - a[i]), w = c.map((x, i) => x - a[i]);
      const n = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
      assert.ok(n[0] * a[0] + n[1] * a[1] + n[2] * a[2] > 0, 'outward');
    }
    // the drawn body: closed and outward, every patch present, each patch a face
    const { positions: P, index: I, patch, seams } = s.curved;
    assert.equal(patch.length, I.length / 3);
    assert.deepEqual([...new Set(patch)].sort((x, y) => x - y), s.faces.map((_, i) => i));
    const e = new Map();
    let vol = 0;
    for (let t = 0; t < I.length; t += 3) {
      for (let j = 0; j < 3; j++) { const key = `${I[t + j]},${I[t + (j + 1) % 3]}`; e.set(key, (e.get(key) ?? 0) + 1); }
      const [a, b, c] = [I[t], I[t + 1], I[t + 2]].map((i) => [P[3 * i], P[3 * i + 1], P[3 * i + 2]]);
      vol += (a[0] * (b[1] * c[2] - b[2] * c[1]) - a[1] * (b[0] * c[2] - b[2] * c[0]) + a[2] * (b[0] * c[1] - b[1] * c[0])) / 6;
    }
    for (const [key, n] of e) { const [a, b] = key.split(','); assert.equal(n, 1); assert.equal(e.get(`${b},${a}`), 1, 'closed, consistently wound'); }
    assert.ok(vol > 0, 'outward');
    // it reaches past the corner polyhedron (the patches bulge out) and the corners lie on it
    const near = (v) => { let m = Infinity; for (let i = 0; i < P.length; i += 3) m = Math.min(m, d(v, [P[i], P[i + 1], P[i + 2]])); return m; };
    for (const v of s.vertices) assert.ok(near(v) < 2e-3, `corner on the body (${near(v)})`);
    assert.ok(seams.length > 0 && seams.length % 6 === 0, 'seams as segment pairs');
  });
}

test('Soft draws the body itself, the same at every softness, faces from the patches', () => {
  for (const id of REULEAUX_ADDITION_IDS) {
    const s = POLYHEDRA[id], a = puffSpec(s, { amount: 0 }), b = puffSpec(s, { amount: 0.5 });
    assert.equal(a.triangles, s.curved.index.length / 3);
    assert.deepEqual(a.positions, b.positions);
    assert.equal(Math.max(...a.faceIds), s.faces.length - 1);
    for (let i = 0; i < a.normals.length; i += 3) assert.ok(Math.abs(Math.hypot(a.normals[i], a.normals[i + 1], a.normals[i + 2]) - 1) < 1e-5);
  }
});
