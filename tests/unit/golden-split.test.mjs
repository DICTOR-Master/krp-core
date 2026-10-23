// The golden split (src/polyhedra/golden-split.js; DICTO's idea 2026-10-23, study 2026-10-23-shadow-forms, exact in Q(√5)): the four
// pieces registered under DICTO's names with real flat faces; the two smooth ones convex truncated octahedra (24 corners, 8 hexagons,
// 6 squares) with all 16 hexagons congruent, volumes 1 + 2√5/3 and 1 + √5/3; the keyed pair √5 and 2; and a point test: big pieces on
// the lattice points (spacing phi) and small ones on the cube centres cover every point once, smooth, all keyed either way, and with
// random keys (the mirrored key included).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { POLYHEDRA, POLYHEDRON_IDS, GOLDEN_SPLIT_ADDITION_IDS } from '../../src/polyhedra/index.js';
import { PHI, SIGNS, UNBORN, tricap, pieceSurface, FLAT, INTO_BIG, INTO_SMALL } from '../../src/polyhedra/golden-split.js';

const S5 = Math.sqrt(5);
const sub = (a, b) => a.map((x, i) => x - b[i]);
const dot = (u, w) => u[0] * w[0] + u[1] * w[1] + u[2] * w[2];
const cross = (u, w) => [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
const d = (a, b) => Math.hypot(...sub(a, b));
const NAMES = { DICTO_ICOSAXES: 'Icosaxes', DICTO_UNBORN_AXES: 'Unborn Axes',
  DICTO_LOTUS_JEWEL_AXES: 'Lotus Jewel Axes', DICTO_DODECAXES: 'Dodecaxes' };
const volume = (P) => P.faces.reduce((t, f) => { for (let m = 1; m + 1 < f.length; m++) t += dot(P.vertices[f[0]], cross(P.vertices[f[m]], P.vertices[f[m + 1]])); return t; }, 0) / 6;
const perms = (a) => { const out = []; for (const p of [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]]) for (const s of [1, -1]) for (const t of [1, -1]) out.push([0, s * a, t * PHI / 2].map((_, i, q) => q[p[i]])); return out; };

test('registered under DICTO\'s names', () => {
  assert.deepEqual(GOLDEN_SPLIT_ADDITION_IDS, Object.keys(NAMES));
  for (const [id, name] of Object.entries(NAMES)) { assert.ok(POLYHEDRON_IDS.includes(id)); assert.equal(POLYHEDRA[id].name, name); }
});

test('closed and wound outward, Euler 2, volumes 1 + 2√5/3, 1 + √5/3, √5 and 2', () => {
  const want = { DICTO_ICOSAXES: 1 + 2 * S5 / 3, DICTO_UNBORN_AXES: 1 + S5 / 3, DICTO_LOTUS_JEWEL_AXES: S5, DICTO_DODECAXES: 2 };
  for (const [id, v] of Object.entries(want)) {
    const P = POLYHEDRA[id], E = new Set();
    for (const f of P.faces) f.forEach((a, i) => { const k = `${a}>${f[(i + 1) % f.length]}`; assert.ok(!E.has(k)); E.add(k); });
    for (const k of E) { const [a, b] = k.split('>'); assert.ok(E.has(`${b}>${a}`), `${id}: every edge in two faces`); }
    assert.equal(P.vertices.length - P.edges.length + P.faces.length, 2, id);
    assert.ok(Math.abs(volume(P) - v) < 1e-12, `${id} volume ${volume(P)}`);
  }
  assert.ok(Math.abs(volume(POLYHEDRA.DICTO_ICOSAXES) + volume(POLYHEDRA.DICTO_UNBORN_AXES) - PHI ** 3) < 1e-12, 'sum phi^3');
});

test('the smooth pieces: convex truncated octahedra, corners all permutations of (0, ±a, ±phi/2), a = 1/2 and 1/(2phi)', () => {
  for (const [id, a, sq] of [['DICTO_ICOSAXES', 0.5, 1 / Math.SQRT2], ['DICTO_UNBORN_AXES', 1 / (2 * PHI), 1 / (PHI * Math.SQRT2)]]) {
    const P = POLYHEDRA[id];
    assert.equal(P.vertices.length, 24); assert.equal(P.faces.length, 14);
    assert.equal(P.faces.filter((f) => f.length === 6).length, 8); assert.equal(P.faces.filter((f) => f.length === 4).length, 6);
    for (const w of perms(a)) assert.ok(P.vertices.some((v) => d(v, w) < 1e-12), `${id} corner ${w}`);
    for (const f of P.faces) {
      const n = cross(sub(P.vertices[f[1]], P.vertices[f[0]]), sub(P.vertices[f[2]], P.vertices[f[0]]));
      for (const v of P.vertices) assert.ok(dot(n, sub(v, P.vertices[f[0]])) < 1e-12, `${id} convex`);
      const sides = f.map((x, i) => d(P.vertices[x], P.vertices[f[(i + 1) % f.length]]));
      if (f.length === 4) sides.forEach((s) => assert.ok(Math.abs(s - sq) < 1e-12, `${id} square side ${s}`));
      else sides.forEach((s, i) => assert.ok(Math.abs(s - (Math.abs(s - sides[0]) < 1e-12 ? sides[0] : sides[1])) < 1e-12 && Math.abs(s - sides[i % 2]) < 1e-12, 'alternating'));
    }
  }
});

test('all 16 hexagons congruent (15 corner distances), sides 1/√2 and 1/(phi√2)', () => {
  const sig = [];
  for (const id of ['DICTO_ICOSAXES', 'DICTO_UNBORN_AXES']) {
    const P = POLYHEDRA[id];
    for (const f of P.faces.filter((g) => g.length === 6)) {
      const ds = []; for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) ds.push(d(P.vertices[f[i]], P.vertices[f[j]]));
      sig.push(ds.sort((x, y) => x - y));
      const sides = f.map((x, i) => d(P.vertices[x], P.vertices[f[(i + 1) % 6]])).sort((x, y) => x - y);
      assert.ok(Math.abs(sides[0] - 1 / (PHI * Math.SQRT2)) < 1e-12 && Math.abs(sides[5] - 1 / Math.SQRT2) < 1e-12);
    }
  }
  assert.equal(sig.length, 16);
  for (const s of sig) s.forEach((x, i) => assert.ok(Math.abs(x - sig[0][i]) < 1e-12, 'congruent'));
});

test('the mirrored Tricap lies inside the Unborn next door (so a key either way fills)', () => {
  const C = [PHI / 2, PHI / 2, PHI / 2];
  const faces = []; // the Unborn's 20 planes (convex)
  for (let i = 0; i < 12; i++) for (let j = i + 1; j < 12; j++) for (let k = j + 1; k < 12; k++) {
    const [a, b, c] = [UNBORN[i], UNBORN[j], UNBORN[k]], n = cross(sub(b, a), sub(c, a));
    const s = UNBORN.map((q) => dot(n, sub(q, a)));
    if (s.every((x) => x < 1e-9)) faces.push([n, a]); else if (s.every((x) => x > -1e-9)) faces.push([n.map((x) => -x), a]);
  }
  const i = SIGNS.findIndex((s) => s.every((x) => x === 1)), tip = tricap(i, true)[3].map((x, k) => x - C[k]);
  for (const [n, a] of faces) assert.ok(dot(n, sub(tip, a)) < -1e-3, 'tip strictly inside the Unborn');
});

// winding number of a closed outward triangle surface about a point (0 outside, 1 inside)
function winding(tris, p) {
  let w = 0;
  for (const t of tris) {
    const [a, b, c] = t.map((q) => sub(q, p)), la = Math.hypot(...a), lb = Math.hypot(...b), lc = Math.hypot(...c);
    w += 2 * Math.atan2(dot(a, cross(b, c)), la * lb * lc + dot(a, b) * lc + dot(a, c) * lb + dot(b, c) * la);
  }
  return Math.round(w / (4 * Math.PI));
}
// keys by hexagon: the hexagon between the small piece at odd n and the big one at n + s (units phi/2)
function fills(stateOf, samples = 4000) {
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const cache = new Map();
  const surf = (big, st) => { const k = `${big}${st}`; if (!cache.has(k)) cache.set(k, pieceSurface(big, st)); return cache.get(k); };
  const pieces = [];
  for (let x = -2; x <= 3; x++) for (let y = -2; y <= 3; y++) for (let z = -2; z <= 3; z++) {
    const n = [x, y, z], par = n.map((c) => Math.abs(c) % 2);
    if (par.some((c) => c !== par[0])) continue;
    const big = par[0] === 0;
    const st = SIGNS.map((s) => (big ? stateOf(n.map((c, i) => c + s[i]), s.map((c) => -c)) : stateOf(n, s)));
    pieces.push({ c: n.map((q) => q * PHI / 2), T: surf(big, st) });
  }
  let gaps = 0, doubled = 0;
  for (let k = 0; k < samples; k++) {
    const p = [rnd(), rnd(), rnd()].map((q) => q * PHI);
    const cover = pieces.reduce((t, { c, T }) => (d(p, c) < 1.2 ? t + winding(T, sub(p, c)) : t), 0);
    if (cover === 0) gaps++; else if (cover > 1) doubled++;
  }
  return { gaps, doubled };
}
const hash = (n, s) => { let h = 2166136261; for (const x of [...n, ...s]) h = Math.imul(h ^ (x + 9), 16777619); return (h >>> 0) % 3; };
for (const [label, f] of [['smooth', () => FLAT], ['all keyed into the big', () => INTO_BIG], ['all keyed into the small', () => INTO_SMALL], ['random keys, both ways', hash]]) {
  test(`fills space: ${label} (4000 points, 0 gaps, 0 overlaps)`, () => assert.deepEqual(fills(f), { gaps: 0, doubled: 0 }));
}
