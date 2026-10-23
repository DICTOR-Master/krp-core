/**
 * The octet family and the Delian bond (DICTO's idea, 2026-10-23; Kaleidohedra study 2026-10-23-shadow-forms/octet, exact): in the
 * octet (fcc corners: the integer points of even sum; octahedra centred on the odd ones, one tetrahedron in every unit cube), cut every
 * tetrahedron–octahedron double cone (tetrahedron centre → shared face → octahedron centre) by the plane parallel to the face at
 * fraction t from the tetrahedron centre. Every t fills space with two convex pieces (a power diagram):
 *   t ≤ 1/3: the tetrahedron scaled 3t, and the rhombic dodecahedron with its 8 three-fold corners cut (t = 0: rhombic dodecahedra);
 *   t ≥ 1/3, a = 3(1 − t)/2: the unit cube with its 4 corners on octahedron centres cut at leg a, and the octahedron scaled a
 *   (t = 1/3: the octet; t = 1: cubes).
 * Volumes (cube of side 2 = 8 tetrahedron pieces + 4 octahedron pieces): t ≤ 1/3: 9t³ and 2 − 18t³; t ≥ 1/3: 1 − (2/3)a³ and (4/3)a³.
 * The Delian bond (names by DICTO): a = 2^(−1/3), t = 1 − (2/3)·2^(−1/3): Samson (the cut cube) and Delilah (the octahedron), equal
 * volume 2/3 each there; Samson is twice the octet tetrahedron, Delilah half the octet octahedron (the octet octahedron shrunk by 1/∛2).
 * As Polyhedraverse pieces they are shown at octet edge 1: Delilah's edge 2^(−1/3), Samson's 2^(−1/3) and (1 − 2^(−1/3))/√2, volume
 * √2/6 each. Prior art: Knoll & Morgan, Bridges 2003 (cube, octet and rhombic dodecahedron linked by separate steps); power diagrams
 * make such families in general; the one-slider family, its equilateral members and the Delian bond were not found (study README).
 * Checked in tests/unit/delian-bond.test.mjs.
 */
import { specOf } from './stellaJewel.js';
import { convexPolygons } from './golden-split.js';

const AXES = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
const add = (a, b) => a.map((x, i) => x + b[i]);
const sub = (a, b) => a.map((x, i) => x - b[i]);
const mul = (k, a) => a.map((x) => k * x);
const odd = (p) => ((((p[0] + p[1] + p[2]) % 2) + 2) % 2) === 1;
/** The tetrahedron piece of the unit cube with lowest corner k (integers), cut at t, as corner points (cube of side 2 units). */
export function tetPiece(k, t) {
  const C = [0, 1].flatMap((x) => [0, 1].flatMap((y) => [0, 1].map((z) => add(k, [x, y, z]))));
  const even = C.filter((p) => !odd(p)), octs = C.filter(odd), q = add(k, [0.5, 0.5, 0.5]);
  if (t <= 1 / 3) return even.map((v) => add(q, mul(3 * t, sub(v, q))));
  const a = 1.5 * (1 - t);
  return [...even, ...octs.flatMap((o) => even.filter((v) => Math.hypot(...sub(v, o)) < 1.0001).map((v) => add(o, mul(a, sub(v, o)))))];
}
/** The octahedron piece about the odd integer point c, cut at t, as corner points. */
export function octPiece(c, t) {
  const tips = AXES.flatMap((e) => [add(c, e), sub(c, e)]);
  if (t >= 1 / 3) { const a = 1.5 * (1 - t); return AXES.flatMap((e) => [add(c, mul(a, e)), sub(c, mul(a, e))]); }
  const s = 3 * t, out = [...tips];
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
    const q = add(c, [sx / 2, sy / 2, sz / 2]), near = [add(c, [sx, 0, 0]), add(c, [0, sy, 0]), add(c, [0, 0, sz])];
    near.forEach((v) => out.push(add(q, mul(s, sub(v, q)))));
  }
  return out;
}
/** Volumes of the two pieces at t (cube of side 2 units). */
export const octetFamilyVolumes = (t) => (t <= 1 / 3 ? [9 * t ** 3, 2 - 18 * t ** 3] : (([a]) => [1 - (2 / 3) * a ** 3, (4 / 3) * a ** 3])([1.5 * (1 - t)]));
/** Special cuts (study 2026-10-23-shadow-forms/octet, exact). */
export const OCTET_FAMILY_STOPS = {
  rd: 0, equilateralRd: (2 * Math.sqrt(6) - 3) / 15, octet: 1 / 3, half: 1 - Math.cbrt(6) / 3, delian: 1 - (2 / 3) * 2 ** (-1 / 3),
  equilateralCube: 5 / 3 - (2 / 3) * Math.SQRT2, cube: 1,
};
const T = OCTET_FAMILY_STOPS.delian, R2 = Math.SQRT1_2;
const piece = (id, name, P) => {
  const c = P.reduce((s, p) => add(s, mul(1 / P.length, p)), [0, 0, 0]);
  const { vertices, faces } = convexPolygons(P.map((p) => mul(R2, sub(p, c))));
  return specOf(id, name, vertices, faces, true, 1);
};
export const DELIAN_BOND_ADDITIONS = {
  DICTO_SAMSON: piece('DICTO_SAMSON', 'Samson', tetPiece([0, 0, 0], T)),
  DICTO_DELILAH: piece('DICTO_DELILAH', 'Delilah', octPiece([1, 0, 0], T)),
};
export const DELIAN_BOND_ADDITION_IDS = Object.keys(DELIAN_BOND_ADDITIONS);
