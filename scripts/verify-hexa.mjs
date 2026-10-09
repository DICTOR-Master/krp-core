// Verifies the DICTO Hexa family (polyhedra/hexa.js, DICTO 2026-10-09):
//   - each solid closed (its face area vectors sum to zero) and wound outward, with its exact volume
//     (raw: Hexa 80, Hexa-Key 48 = 4 Jewels, rhombohedral cluster 688 = 8 Hexas + a Hexa-Key, diamond
//     cluster 556, trimmed Jewel 8, roof 2/3; a DICTO Jewel is 12);
//   - at the DICTO Jewel's scale: the Hexa shows whole Jewel windows and stella-matching walls;
//   - every parts view adds up: the splits to the solid's volume exactly (no overlap), the Jewels
//     view to 8 whole Jewels (96: they overlap by 16), the clusters' Hexas and Hexa-Key to the cluster.
import { POLYHEDRA, HEXA_ADDITION_IDS, HEXA_PARTS } from '../src/polyhedra/index.js';
import { facesCongruent } from '../src/polyhedra/core.js';

let failures = 0;
const check = (label, ok) => { console.log(`${ok ? 'OK  ' : 'FAIL'} ${label}`); if (!ok) failures++; };
const PHI = (1 + Math.sqrt(5)) / 2, K3 = (PHI / 2) ** 3;
const sub = (a, b) => a.map((x, i) => x - b[i]);
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
function measure({ vertices: V, faces: F }) {
  let vol = 0; const area = [0, 0, 0];
  for (const f of F) for (let m = 1; m + 1 < f.length; m++) {
    const a = V[f[0]], b = V[f[m]], c = V[f[m + 1]];
    vol += (a[0] * (b[1] * c[2] - b[2] * c[1]) - a[1] * (b[0] * c[2] - b[2] * c[0]) + a[2] * (b[0] * c[1] - b[1] * c[0])) / 6;
    const n = cross(sub(b, a), sub(c, a)); area[0] += n[0]; area[1] += n[1]; area[2] += n[2];
  }
  return { vol: vol / K3, open: Math.hypot(...area) };
}
const WANT = { DICTO_HEXA: 80, DICTO_HEXA_KEY: 48, DICTO_HEXA_RHOMBO_CLUSTER: 688, DICTO_HEXA_DIAMOND_CLUSTER: 556, DICTO_HEXA_TRIMMED_JEWEL: 8, DICTO_HEXA_ROOF: 2 / 3 };
check('all six registered', HEXA_ADDITION_IDS.length === 6 && HEXA_ADDITION_IDS.every((id) => POLYHEDRA[id]));
for (const id of HEXA_ADDITION_IDS) {
  const { vol, open } = measure(POLYHEDRA[id]);
  check(`${POLYHEDRA[id].name}: closed (area vectors sum ${open.toExponential(1)}), outward, volume ${vol.toFixed(6)} (want ${WANT[id].toFixed(6)})`, open < 1e-6 && Math.abs(vol - WANT[id]) < 1e-6);
}
// Face-matching with the Jewel and the stella: whole Jewel windows on the Hexa, and the Hexa's walls
// congruent to faces of the stella octangula.
{
  const H = POLYHEDRA.DICTO_HEXA, J = POLYHEDRA.DRAGON_JEWEL, S = POLYHEDRA.STELLA_OCTANGULA;
  const jw = J.faces.find((f) => f.length === 4);
  const windows = H.faces.filter((f) => f.length === 4 && facesCongruent(J.vertices, jw, H.vertices, f)).length;
  const walls = H.faces.filter((f) => f.length === 3 && S.faces.some((g) => g.length === 3 && facesCongruent(S.vertices, g, H.vertices, f))).length;
  check(`the Hexa at the Jewel's scale: ${windows} whole Jewel windows, ${walls} walls matching stella faces`, windows > 0 && walls > 0);
}
const vols = (parts) => parts.reduce((t, p) => t + measure(p).vol, 0);
const V = HEXA_PARTS;
check(`Hexa as 8 Jewels: ${V.DICTO_HEXA.jewels.length} parts, ${vols(V.DICTO_HEXA.jewels).toFixed(6)} (8 x 12 = 96, overlapping by 16)`, V.DICTO_HEXA.jewels.length === 8 && Math.abs(vols(V.DICTO_HEXA.jewels) - 96) < 1e-6);
check(`Hexa split A (8 cubes + 24 roofs): ${V.DICTO_HEXA.cubesAndRoofs.length} parts, ${vols(V.DICTO_HEXA.cubesAndRoofs).toFixed(6)} = 80`, V.DICTO_HEXA.cubesAndRoofs.length === 32 && Math.abs(vols(V.DICTO_HEXA.cubesAndRoofs) - 80) < 1e-6);
check(`Hexa split B (4 whole + 4 trimmed Jewels): ${vols(V.DICTO_HEXA.wholeAndTrimmed).toFixed(6)} = 80`, V.DICTO_HEXA.wholeAndTrimmed.length === 8 && Math.abs(vols(V.DICTO_HEXA.wholeAndTrimmed) - 80) < 1e-6);
check(`Hexa-Key split (8 stellas + 24 roofs): ${vols(V.DICTO_HEXA_KEY.stellasAndRoofs).toFixed(6)} = 48`, V.DICTO_HEXA_KEY.stellasAndRoofs.length === 32 && Math.abs(vols(V.DICTO_HEXA_KEY.stellasAndRoofs) - 48) < 1e-6);
check(`rhombohedral cluster as 8 Hexas + a Hexa-Key: ${vols(V.DICTO_HEXA_RHOMBO_CLUSTER.hexas).toFixed(6)} = 688`, Math.abs(vols(V.DICTO_HEXA_RHOMBO_CLUSTER.hexas) - 688) < 1e-6);
check(`rhombohedral cluster as 64 Jewels + a Hexa-Key: ${V.DICTO_HEXA_RHOMBO_CLUSTER.jewels.length} parts`, V.DICTO_HEXA_RHOMBO_CLUSTER.jewels.length === 65);
const dj = V.DICTO_HEXA_DIAMOND_CLUSTER.jewels;
check(`diamond cluster as its Jewels: ${dj.length} (57), ${dj.filter((p) => p.role === 'shared').length} shared by two Hexas (7)`, dj.length === 57 && dj.filter((p) => p.role === 'shared').length === 7);
check(`diamond cluster as 8 Hexas: ${V.DICTO_HEXA_DIAMOND_CLUSTER.hexas.length}`, V.DICTO_HEXA_DIAMOND_CLUSTER.hexas.length === 8);
console.log(failures === 0 ? '\nAll checks passed (0 failures).' : `\n${failures} check(s) FAILED.`);
process.exit(failures === 0 ? 0 : 1);
