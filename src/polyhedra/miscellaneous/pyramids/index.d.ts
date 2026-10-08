/**
 * Graded pyramids, the "pyramids" sub-group of the "Miscellaneous" family
 * (see the family's own index.ts one level up, which combines this
 * sub-group with the sibling "rvcmg-connectors" one) — on the three
 * regular bases already used by an existing standard pyramid elsewhere
 * in the registry (D4/triangular, J1/square, J2/pentagonal). Direct user
 * request: "add scale versions to all standard pyramids existing in
 * registry... duplicate will be in miscellaneous family too." These
 * three ARE every regular-polygon base that can support a regular
 * pyramid at all — a hexagonal base is geometrically impossible (see
 * gradedPyramids.ts's own note: 60° is both the regular-hexagon interior
 * angle and a pyramid's degenerate apex-angle limit at n=6), so there is
 * no fourth base missing here.
 *
 * Grade 2 of each base is DELIBERATELY a geometric duplicate of the
 * existing D4/J1_SQUARE_PYRAMID/J2_PENTAGONAL_PYRAMID entries (confirmed
 * vertex-for-vertex in scripts/validate-graded-pyramids.ts, not just
 * assumed from the shared construction code) — a genuinely different
 * registry id for the same shape, not an error, so the graded family
 * reads as a complete 1-4 set on its own without a gap at "standard."
 *
 * Grades 1/3/4 are NOT unit-edge overall (only the base is; the lateral/
 * slant edges are whatever `apexHeightForAngle` derives for that grade's
 * target apex angle) — `validateShape`'s "every edge is 1" rule doesn't
 * apply here, matching Catalan solids' own precedent for a family that
 * needs a different validator (`validateGradedPyramid` instead).
 */
import type { PolyhedronSpec } from '../../core.js';
export declare const GRADED_PYRAMID_ADDITIONS: Record<string, PolyhedronSpec>;
export declare const GRADED_PYRAMID_ADDITION_IDS: string[];
