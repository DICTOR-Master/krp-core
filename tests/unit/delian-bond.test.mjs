// The octet family and the Delian bond (src/polyhedra/delian-bond.js; DICTO's idea 2026-10-23, study 2026-10-23-shadow-forms/octet,
// exact): Samson and Delilah registered under DICTO's names with flat faces, at octet edge 1: Samson 16 corners (4 triangles, 6
// hexagons), edges 2^(−1/3) and (1 − 2^(−1/3))/√2; Delilah a regular octahedron of edge 2^(−1/3); equal volume √2/6 = twice the octet
// tetrahedron = half the octet octahedron. The family: piece volumes match the formulas, and the pieces fill space (point test, 0 gaps,
// 0 overlaps) at every special cut and between them.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { POLYHEDRA, POLYHEDRON_IDS, DELIAN_BOND_ADDITION_IDS } from '../../src/polyhedra/index.js';
import { tetPiece, octPiece, octetFamilyVolumes, OCTET_FAMILY_STOPS } from '../../src/polyhedra/delian-bond.js';
import { convexPolygons } from '../../src/polyhedra/golden-split.js';

const sub = (a, b) => a.map((x, i) => x - b[i]);
const dot = (u, w) => u[0] * w[0] + u[1] * w[1] + u[2] * w[2];
const cross = (u, w) => [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
const d = (a, b) => Math.hypot(...sub(a, b));
const volume = ({ vertices: V, faces: F }) => F.reduce((t, f) => { for (let m = 1; m + 1 < f.length; m++) t += dot(V[f[0]], cross(V[f[m]], V[f[m + 1]])); return t; }, 0) / 6;
const C = 2 ** (-1 / 3);

test('Samson and Delilah registered under DICTO\'s names', () => {
  assert.deepEqual(DELIAN_BOND_ADDITION_IDS, ['DICTO_SAMSON', 'DICTO_DELILAH']);
  assert.equal(POLYHEDRA.DICTO_SAMSON.name, 'Samson'); assert.equal(POLYHEDRA.DICTO_DELILAH.name, 'Delilah');
  for (const id of DELIAN_BOND_ADDITION_IDS) assert.ok(POLYHEDRON_IDS.includes(id));
});

test('counts, edges, closed and outward, equal volumes √2/6 (2 × the octet tetrahedron, ½ × the octet octahedron)', () => {
  const S = POLYHEDRA.DICTO_SAMSON, D = POLYHEDRA.DICTO_DELILAH;
  assert.equal(S.vertices.length, 16); assert.equal(S.faces.filter((f) => f.length === 3).length, 4); assert.equal(S.faces.filter((f) => f.length === 6).length, 6); assert.equal(S.faces.length, 10);
  assert.equal(D.vertices.length, 6); assert.equal(D.faces.length, 8); assert.ok(D.faces.every((f) => f.length === 3));
  for (const [a, b] of D.edges) assert.ok(Math.abs(d(D.vertices[a], D.vertices[b]) - C) < 1e-12, 'Delilah edge 2^(-1/3)');
  for (const [a, b] of S.edges) { const L = d(S.vertices[a], S.vertices[b]); assert.ok(Math.abs(L - C) < 1e-12 || Math.abs(L - (1 - C) / Math.SQRT2) < 1e-12, `Samson edge ${L}`); }
  for (const P of [S, D]) {
    const E = new Set();
    for (const f of P.faces) f.forEach((a, i) => { const k = `${a}>${f[(i + 1) % f.length]}`; assert.ok(!E.has(k)); E.add(k); });
    for (const k of E) { const [a, b] = k.split('>'); assert.ok(E.has(`${b}>${a}`)); }
    assert.equal(P.vertices.length - P.edges.length + P.faces.length, 2);
  }
  const vS = volume(S), vD = volume(D);
  assert.ok(Math.abs(vS - Math.SQRT2 / 6) < 1e-12 && Math.abs(vD - Math.SQRT2 / 6) < 1e-12, `${vS} ${vD}`);
  assert.ok(Math.abs(vS - 2 * Math.SQRT2 / 12) < 1e-12 && Math.abs(vD - Math.SQRT2 / 3 / 2) < 1e-12);
});

const TS = [...Object.values(OCTET_FAMILY_STOPS), 0.05, 0.25, 0.4, 0.6, 0.9];
test('piece volumes match the formulas, and 8 tetrahedron pieces + 4 octahedron pieces = the cube of side 2', () => {
  for (const t of TS) {
    const [vt, vo] = octetFamilyVolumes(t);
    if (vt > 1e-12) assert.ok(Math.abs(volume(convexPolygons(tetPiece([0, 0, 0], t))) - vt) < 1e-12, `tet ${t}`);
    if (vo > 1e-12) assert.ok(Math.abs(volume(convexPolygons(octPiece([1, 0, 0], t))) - vo) < 1e-12, `oct ${t}`);
    assert.ok(Math.abs(8 * vt + 4 * vo - 8) < 1e-12);
  }
});

test('the equilateral cuts: every edge of both pieces the same length', () => {
  for (const t of [OCTET_FAMILY_STOPS.equilateralRd, OCTET_FAMILY_STOPS.equilateralCube]) {
    const L = [tetPiece([0, 0, 0], t), octPiece([1, 0, 0], t)].flatMap((P) => { const H = convexPolygons(P); return H.faces.flatMap((f) => f.map((a, i) => d(H.vertices[a], H.vertices[f[(i + 1) % f.length]]))); });
    assert.ok(Math.max(...L) - Math.min(...L) < 1e-12, `t ${t}: ${Math.min(...L)}..${Math.max(...L)}`);
  }
});

// point test: inside a convex hull = on the inner side of every face plane
const inside = ({ vertices: V, faces: F }, p) => F.every((f) => dot(cross(sub(V[f[1]], V[f[0]]), sub(V[f[2]], V[f[0]])), sub(p, V[f[0]])) < 0);
for (const t of TS) {
  test(`fills space at t = ${t.toFixed(6)} (3000 points, 0 gaps, 0 overlaps)`, () => {
    const pieces = [];
    for (let x = -1; x <= 2; x++) for (let y = -1; y <= 2; y++) for (let z = -1; z <= 2; z++) {
      if (t > 0) pieces.push(convexPolygons(tetPiece([x, y, z], t)));
      if (t < 1 && (x + y + z) % 2 !== 0) pieces.push(convexPolygons(octPiece([x, y, z], t)));
    }
    let seed = 5, gaps = 0, doubled = 0;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let k = 0; k < 3000; k++) {
      const p = [rnd(), rnd(), rnd()].map((q) => q * 2), n = pieces.filter((P) => inside(P, p)).length;
      if (n === 0) gaps++; else if (n > 1) doubled++;
    }
    assert.deepEqual({ gaps, doubled }, { gaps: 0, doubled: 0 });
  });
}
