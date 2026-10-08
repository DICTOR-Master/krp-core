/**
 * The Golden-rhombus-to-RD-H adapter piece: the same hemi-RD hexagonal
 * interface as the other pieces, collapsed instead to a real rhombus
 * matching the rhombic triacontahedron's own face (diagonal ratio
 * exactly φ:1 — the golden ratio, confirmed computationally from the
 * registry below, not assumed). The first NON-regular target polygon in
 * the family: a rhombus has 2-fold, not 4-fold, symmetry, so its final-
 * shape check and its per-corner radius are genuinely different from
 * the square piece's, not just a parameter swap.
 *
 * Structurally identical to squareToRdH.ts otherwise: same 2-merge
 * sequence (6 -> 5 -> 4), same untouched-vertex-pair
 * (`v1`/`v4`, exact central-symmetry partners) repositioned via the
 * second merge's own deformation.
 */
import type { AdapterPieceResult } from './triangleToRdH.js';
export declare const GOLDEN_RATIO_MEASURED: number;
export declare const RHOMBIC_TRIACONTAHEDRON_EDGE_MEASURED: number;
/**
 * Derives the Golden-rhombus-to-RD-H piece. Same merge pairing as the
 * square piece — `(v2,v3)` and `(v5,v6)`, leaving `v1`/`v4` untouched —
 * but the two roles (the untouched-vertex pair vs. the two merged
 * pairs) are no longer interchangeable the way a square's 4 equal
 * corners are: one role sits on the LONG diagonal, the other on the
 * SHORT one. Assigned by least distortion (measured, not guessed): `v1`
 * (and its central-symmetry partner `v4`) already sit at radius 1 from
 * the hex's own centroid in this scale, which is closer to the long
 * half-diagonal (`~0.851`) than the short one (`~0.526`) — so `v1`/`v4`
 * get the long diagonal, `(v2,v3)`/`(v5,v6)` get the short one.
 */
export declare function deriveGoldenRhombusToRdH(): AdapterPieceResult;
