// Verifies the DICTO Icosa family (geometry-extensions/icosa.js, DICTO 2026-10-10; Kaleidohedra DISCOVERIES #19,
// #20), at icosahedron edge 1:
//   - every closed solid closed (face area vectors sum to zero), wound outward, Euler 2, with its exact volume;
//   - every parts view: each part closed and outward, convex parts never overlapping (separating axes), the role
//     counts as studied, and the closed clusters' views adding up to the solid exactly (the Diadem's 'filled'
//     view adds the 120 Shark Teeth);
//   - the open clusters (DESHI, 12-Star voids, KEPLER MACE) without overlaps.
import { ICOSA_SOLIDS, ICOSA_PARTS, ICOSA_NAMES, ICOSA_PIECE_KEYS, ICOSA_CLUSTER_KEYS } from '../src/geometry-extensions/icosa.js';

let failures = 0;
const check = (label, ok) => { console.log(`${ok ? 'OK  ' : 'FAIL'} ${label}`); if (!ok) failures++; };
const S5 = Math.sqrt(5);
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a) => Math.hypot(...a);
const unit = (a) => { const l = len(a); return a.map((x) => x / l); };
function measure({ vertices: V, faces: F }) {
  let vol = 0; const area = [0, 0, 0];
  for (const f of F) for (let m = 1; m + 1 < f.length; m++) {
    const a = V[f[0]], b = V[f[m]], c = V[f[m + 1]];
    vol += dot(a, cross(b, c)) / 6; const n = cross(sub(b, a), sub(c, a)); area[0] += n[0]; area[1] += n[1]; area[2] += n[2];
  }
  const E = new Map(); for (const f of F) f.forEach((a, i) => { const b = f[(i + 1) % f.length]; const k = a < b ? `${a}-${b}` : `${b}-${a}`; E.set(k, (E.get(k) ?? 0) + 1); });
  return { vol, open: len(area), euler: new Set(F.flat()).size - E.size + F.length, closed: [...E.values()].every((n) => n === 2) };
}
const planes = (P) => P.faces.map((f) => { const a = P.vertices[f[0]]; let n = [0, 0, 0]; for (let m = 1; m + 1 < f.length; m++) n = add(n, cross(sub(P.vertices[f[m]], a), sub(P.vertices[f[m + 1]], a))); n = unit(n); return { n, d: dot(n, a) }; });
const convex = (P) => planes(P).every(({ n, d }) => P.vertices.every((v) => dot(n, v) <= d + 1e-5));
function overlap(A, B) {
  const axes = [...planes(A).map((p) => p.n), ...planes(B).map((p) => p.n)];
  const edges = (P) => P.faces.flatMap((f) => f.map((a, i) => unit(sub(P.vertices[f[(i + 1) % f.length]], P.vertices[a]))));
  for (const x of edges(A)) for (const y of edges(B)) { const c = cross(x, y); if (len(c) > 1e-6) axes.push(unit(c)); }
  for (const ax of axes) {
    let a0 = Infinity, a1 = -Infinity, b0 = Infinity, b1 = -Infinity;
    for (const v of A.vertices) { const t = dot(v, ax); a0 = Math.min(a0, t); a1 = Math.max(a1, t); }
    for (const v of B.vertices) { const t = dot(v, ax); b0 = Math.min(b0, t); b1 = Math.max(b1, t); }
    if (a1 <= b0 + 1e-5 || b1 <= a0 + 1e-5) return false;
  }
  return true;
}
// Shared faces cancel; what is left is the outer surface (used where parts are not convex).
function union(parts) {
  const key = (p) => p.map((x) => (Math.round(x * 1e5) / 1e5 + 0).toFixed(5)).join(',');
  const V = [], idx = new Map(); const at = (p) => { const k = key(p); if (!idx.has(k)) { idx.set(k, V.length); V.push(p); } return idx.get(k); };
  const all = parts.flatMap((P) => P.faces.map((f) => f.map((i) => at(P.vertices[i]))));
  const fk = (f) => [...f].sort((a, b) => a - b).join(',');
  const count = new Map(); for (const f of all) count.set(fk(f), (count.get(fk(f)) ?? 0) + 1);
  return { vertices: V, faces: all.filter((f) => count.get(fk(f)) === 1) };
}
function overlaps(parts) {
  const S = parts.map((P) => { const c = P.vertices.reduce(add, [0, 0, 0]).map((x) => x / P.vertices.length); return { c, r: Math.max(...P.vertices.map((v) => len(sub(v, c)))) }; });
  let n = 0;
  for (let i = 0; i < parts.length; i++) for (let j = i + 1; j < parts.length; j++) {
    if (len(sub(S[i].c, S[j].c)) >= S[i].r + S[j].r - 1e-6) continue;
    if (overlap(parts[i], parts[j])) n++;
  }
  return n;
}
const WANT = {
  AXE: 1 / 12, FUJI: (1 + 3 * S5) / 24, CLEO: (S5 - 1) / 24, TRISKELION: (5 + S5) / 24, TRISKELION_HEX: (7 + 3 * S5) / 24,
  INNER_EYE: (5 + 5 * S5) / 4, HASU: (60 + 25 * S5) / 36, VAJRA: (45 + 27 * S5) / 200, HMV: (5 + 3 * S5) / 12,
  FIVE_OF_CUPS: (5 + 9 * S5) / 24, KING_OF_PENTACLES: (5 + 3 * S5) / 8, HOUND_TOOTH: (3 - S5) / 24, TRICAP: (3 - S5) / 24,
  KEPLER_STAR: (15 + 14 * S5) / 12, SHARK_TOOTH: S5 / 60, BERMUDA_PYRAMID: S5 / 20,
  LOTUS_SEED: (235 + 105 * S5) / 12, UNITY: (60 + 22 * S5) / 3, VENUS: (735 + 301 * S5) / 30, STELLA_CORONA: (120 + 47 * S5) / 3,
  KEPLER_STAR_DIADEM: (165 + 89 * S5) / 3,
};
check('every solid named and checked', Object.keys(ICOSA_SOLIDS).every((k) => ICOSA_NAMES[k] && WANT[k]) && ICOSA_PIECE_KEYS.every((k) => ICOSA_SOLIDS[k]));
for (const [k, S] of Object.entries(ICOSA_SOLIDS)) {
  const m = measure(S);
  check(`${ICOSA_NAMES[k]}: closed (${m.open.toExponential(1)}), outward, Euler ${m.euler}, volume ${m.vol.toFixed(6)} (want ${WANT[k].toFixed(6)})`, m.closed && m.open < 1e-4 && m.euler === 2 && Math.abs(m.vol - WANT[k]) < 1e-6 * Math.max(1, WANT[k]));
}
const COUNTS = {
  LOTUS_SEED: { pieces: { ico: 13, axe: 60, fuji: 20, cleo: 20 }, build: { dodeca: 1, j11: 12, axe: 30, fuji: 20 }, units: { ico: 1, hasu: 12 } },
  UNITY: { pieces: { idd: 1, j11: 12 } },
  VENUS: { pieces: { idd: 1, j11: 12, vajra: 20 } },
  STELLA_CORONA: { pieces: { idd: 1, ico: 20, cap: 24, axe: 120, cleo: 60 } },
  KEPLER_STAR_DIADEM: { pieces: { idd: 1, ico: 20, cap: 24, axe: 120, cleo: 60, dodeca: 12, spike: 132 }, filled: { idd: 1, ico: 20, cap: 24, axe: 120, cleo: 60, dodeca: 12, spike: 132, shark: 120 } },
  DESHI: { pieces: { ico: 13 } }, TWELVE_STAR_VOIDS: { pieces: { idd: 1, ico: 20 } },
  KEPLER_MACE: { pieces: { idd: 2, ico: 40, cap: 48, axe: 240, cleo: 120, dodeca: 1, spike: 10 } },
};
const VIEW_TOTAL = (k, view) => k === 'KEPLER_STAR_DIADEM' && view === 'filled' ? WANT.KEPLER_STAR_DIADEM + 120 * WANT.SHARK_TOOTH : WANT[k];
check('every cluster has its views', ICOSA_CLUSTER_KEYS.every((k) => ICOSA_PARTS[k] && Object.keys(COUNTS[k]).every((v) => ICOSA_PARTS[k][v])));
for (const k of ICOSA_CLUSTER_KEYS) for (const [view, want] of Object.entries(COUNTS[k])) {
  const parts = ICOSA_PARTS[k][view];
  const got = {}; for (const p of parts) got[p.role] = (got[p.role] ?? 0) + 1;
  const sorted = (o) => JSON.stringify(Object.keys(o).sort().map((r) => [r, o[r]]));
  const each = parts.every((p) => { const m = measure(p); return m.closed && m.open < 1e-4 && m.vol > 0; });
  const allConvex = parts.every(convex);
  // convex parts: separating axes; otherwise the parts' outer surface must close up with exactly their total volume
  const n = allConvex ? overlaps(parts) : (() => { const u = measure(union(parts)); return u.closed && Math.abs(u.vol - parts.reduce((t, p) => t + measure(p).vol, 0)) < 1e-4 ? 0 : 1; })();
  const vol = parts.reduce((t, p) => t + measure(p).vol, 0);
  const total = VIEW_TOTAL(k, view);
  const sumOk = total === undefined || Math.abs(vol - total) < 1e-4;
  check(`${ICOSA_NAMES[k]} / ${view}: ${parts.length} parts ${sorted(got)}, each closed and outward, ${allConvex ? 'convex, overlapping pairs' : 'not all convex, surface-and-volume check failures'} ${n}, total ${vol.toFixed(6)}${total === undefined ? ' (open cluster)' : ` (want ${total.toFixed(6)})`}`, sorted(got) === sorted(want) && each && n === 0 && sumOk);
}
{ // the edge roof, in Polyhedraverse: 6 on an icosahedron make the octahedron
  const { POLYHEDRA } = await import('../src/polyhedra/index.js'); const R = POLYHEDRA.DICTO_EDGE_ROOF; const m = measure(R);
  const eq = R.faces.filter((f) => f.length === 3 && f.every((a, i) => Math.abs(len(sub(R.vertices[a], R.vertices[f[(i + 1) % 3]])) - 1) < 1e-6)).length;
  check(`Edge roof (Polyhedraverse): closed, outward, Euler ${m.euler}, volume ${m.vol.toFixed(6)} (want phi/12 = ${((1 + S5) / 24).toFixed(6)}), unit equilateral faces ${eq} (want 2)`, m.closed && m.euler === 2 && Math.abs(m.vol - (1 + S5) / 24) < 1e-6 && eq === 2);
}
console.log(failures ? `${failures} failures.` : 'All checks passed (0 failures).');
process.exit(failures ? 1 : 0);
