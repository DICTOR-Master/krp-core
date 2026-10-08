/**
 * Composite-Seed RCP investigation, Stage 3 — Proposition P2
 * (microscopic orientational closure): `ε_ang(L) =
 * max_{ν∈N_i} arccos(|ν·n_i| / (|ν||n_i|))` per hypothesis.md §6 and
 * Appendix A item 9, for the cube and octahedron selections.
 *
 * The `|·|` around `ν·n_i` is in the hypothesis's own formula (§6) —
 * taken here exactly as written, not omitted: it identifies a facet
 * normal with its own antipode for this purpose ("the absolute value is
 * appropriate only if the application identifies opposite normals as
 * equivalent" — true here, since a facet's outward-normal SIGN is a
 * bookkeeping artifact of which of two adjacent cells "owns" it, not a
 * property of the underlying mirror direction being measured against).
 */
import { sCube, sOct, CUBE_BOUNDARY_CLASSES, OCT_BOUNDARY_CLASSES, buildEffectiveSeed } from './rcpMap.js';
function unitVec(v) {
  const n = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / n, v[1] / n, v[2] / n];
}
function dot3(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
function angleDeg(a, b) {
  const cos = Math.min(1, Math.max(-1, Math.abs(dot3(a, b))));
  return (Math.acos(cos) * 180) / Math.PI;
}
const EXACT_TOL_DEG = 1e-6;
export function angularResidualAtL(selectFn, classes, L) {
  const aggregate = selectFn(L);
  const seed = buildEffectiveSeed(aggregate, classes, L);
  const classResults = seed.classes.map((cls) => {
    if (cls.normals.length === 0) {
      return { name: cls.name, count: 0, minDeg: NaN, maxDeg: NaN, meanDeg: NaN, constant: true };
    }
    const n = unitVec(cls.direction);
    const angles = cls.normals.map((ν) => angleDeg(ν, n));
    const minDeg = Math.min(...angles);
    const maxDeg = Math.max(...angles);
    const meanDeg = angles.reduce((a, b) => a + b, 0) / angles.length;
    return { name: cls.name, count: angles.length, minDeg, maxDeg, meanDeg, constant: maxDeg - minDeg < EXACT_TOL_DEG };
  });
  const epsAngDeg = Math.max(...classResults.map((c) => c.maxDeg).filter((v) => !Number.isNaN(v)));
  return { L, classes: classResults, epsAngDeg, allConstant: classResults.every((c) => c.constant) };
}
export function sweepAngularResidual(shape, maxL) {
  const selectFn = shape === 'cube' ? sCube : sOct;
  const classes = shape === 'cube' ? CUBE_BOUNDARY_CLASSES : OCT_BOUNDARY_CLASSES;
  const results = [];
  for (let L = 1; L <= maxL; L++)
    results.push(angularResidualAtL(selectFn, classes, L));
  return results;
}
/**
 * Closed-form theta values, derived (see angularDerivation.md for the
 * full proof) from the fixed direction-family geometry alone -- NOT
 * fitted from the numeric sweep above. `Math.SQRT1_2` = 1/sqrt(2);
 * `Math.asin(1/Math.sqrt(3))` is the same closed form the hypothesis
 * doc itself reports for the octahedron, re-derived independently here
 * from the actual RD facet-normal / target-direction vectors rather
 * than accepted on the hypothesis doc's word.
 */
export const THETA_CUBE_DEG = (Math.acos(Math.SQRT1_2) * 180) / Math.PI; // = 45 exactly
export const THETA_OCT_DEG = (Math.asin(1 / Math.sqrt(3)) * 180) / Math.PI; // ~= 35.2643896828...
