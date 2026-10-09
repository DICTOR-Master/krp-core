// Verifies the DICTO Dodeca-13 family (polyhedra/dodeca13.js, DICTO 2026-10-09), at dodecahedron edge 1:
//   - each solid closed (its face area vectors sum to zero), wound outward, Euler 2, with its exact
//     volume: wedge phi^3/20, needle (45 - 19 sqrt 5)/600, star = 3 wedges + needle, unit = a
//     dodecahedron + 5 half-wedges + 5 needle-thirds, the cluster = 13 dodecahedra + 30 wedges + 20 needles;
//   - the cluster's 72 pentagons are regular at edge 1 and match the dodecahedron's;
//   - the pieces and units views add up to the cluster exactly (no overlap, nothing missing); the stars
//     view overlaps (each wedge in two stars); each with the right counts.
import { POLYHEDRA, DODECA13_ADDITION_IDS, DODECA13_PARTS } from '../src/polyhedra/index.js';
import { facesCongruent } from '../src/polyhedra/core.js';

let failures = 0;
const check = (label, ok) => { console.log(`${ok ? 'OK  ' : 'FAIL'} ${label}`); if (!ok) failures++; };
const PHI = (1 + Math.sqrt(5)) / 2, S5 = Math.sqrt(5);
const sub = (a, b) => a.map((x, i) => x - b[i]);
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
function measure({ vertices: V, faces: F }) {
  let vol = 0; const area = [0, 0, 0];
  for (const f of F) for (let m = 1; m + 1 < f.length; m++) {
    const a = V[f[0]], b = V[f[m]], c = V[f[m + 1]];
    vol += (a[0] * (b[1] * c[2] - b[2] * c[1]) - a[1] * (b[0] * c[2] - b[2] * c[0]) + a[2] * (b[0] * c[1] - b[1] * c[0])) / 6;
    const n = cross(sub(b, a), sub(c, a)); area[0] += n[0]; area[1] += n[1]; area[2] += n[2];
  }
  const E = new Set(); for (const f of F) f.forEach((a, i) => { const b = f[(i + 1) % f.length]; E.add(a < b ? `${a}-${b}` : `${b}-${a}`); });
  return { vol, open: Math.hypot(...area), euler: V.length - E.size + F.length };
}
const DODECA = (15 + 7 * S5) / 4, WEDGE = PHI ** 3 / 20, NEEDLE = (45 - 19 * S5) / 600;
const WANT = {
  DICTO_DODECA13: 13 * DODECA + 30 * WEDGE + 20 * NEEDLE,
  DICTO_DODECA13_STAR: 3 * WEDGE + NEEDLE,
  DICTO_DODECA13_UNIT: DODECA + 5 * WEDGE / 2 + 5 * NEEDLE / 3,
  DICTO_DODECA13_WEDGE: WEDGE,
  DICTO_DODECA13_NEEDLE: NEEDLE,
};
check('all five registered', DODECA13_ADDITION_IDS.length === 5 && DODECA13_ADDITION_IDS.every((id) => POLYHEDRA[id]));
for (const id of DODECA13_ADDITION_IDS) {
  const { vol, open, euler } = measure(POLYHEDRA[id]);
  check(`${POLYHEDRA[id].name}: closed (${open.toExponential(1)}), outward, Euler ${euler}, volume ${vol.toFixed(6)} (want ${WANT[id].toFixed(6)})`, open < 1e-6 && euler === 2 && Math.abs(vol - WANT[id]) < 1e-6);
}
{
  const C = POLYHEDRA.DICTO_DODECA13, D = POLYHEDRA.DODECAHEDRON;
  const pent = C.faces.filter((f) => f.length === 5 && facesCongruent(D.vertices, D.faces[0], C.vertices, f)).length;
  check(`the cluster's pentagons: ${pent} regular at edge 1, matching the dodecahedron (want 72)`, pent === 72);
}
// The stars overlap (20 stars x 3 wedges: each of the 30 wedges is in two stars), so that view adds up to
// 13 dodecahedra + 20 stars; the other two split the cluster exactly.
const COUNTS = { pieces: { dodeca: 13, wedge: 30, needle: 20 }, units: { centre: 1, unit: 12 }, stars: { dodeca: 13, star: 20 } };
const VIEW_TOTAL = { pieces: WANT.DICTO_DODECA13, units: WANT.DICTO_DODECA13, stars: 13 * DODECA + 20 * WANT.DICTO_DODECA13_STAR };
for (const [view, want] of Object.entries(COUNTS)) {
  const parts = DODECA13_PARTS.DICTO_DODECA13[view];
  const got = {}; for (const p of parts) got[p.role] = (got[p.role] ?? 0) + 1;
  const vol = parts.reduce((t, p) => t + measure(p).vol, 0);
  const closed = parts.every((p) => measure(p).open < 1e-6 && measure(p).vol > 0);
  check(`parts view ${view}: ${JSON.stringify(got)}, each closed and outward, total ${vol.toFixed(6)} (want ${VIEW_TOTAL[view].toFixed(6)})`, JSON.stringify(got) === JSON.stringify(want) && closed && Math.abs(vol - VIEW_TOTAL[view]) < 1e-6);
}
console.log(failures ? `${failures} failures.` : 'All checks passed (0 failures).');
process.exit(failures ? 1 : 0);
