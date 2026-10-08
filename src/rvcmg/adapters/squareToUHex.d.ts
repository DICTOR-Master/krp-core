/**
 * RVCMG v2 — Square-to-U-Hex: the new universal hex interface
 * (`universalHexInterface.ts`) collapsed to a real unit square, matching
 * a unit-edge cube face. Same 2-merge structure as v1's `squareToRdH.ts`
 * (6 -> 5 -> 4, `v1`/`v4` untouched by any single `coalesce()` call,
 * repositioned via the second merge's own deformation).
 *
 * Dropped entirely from v1: the "rotate so the hex's own longest edges
 * land parallel to the square's sides" alignment hack. That existed
 * only because RD's native hex had distinguishable long/short (D2h)
 * edges to align to — the new universal hex has full 6-fold symmetry,
 * so every edge is identical and there is nothing to align. This piece
 * just uses `assignTargetAngles`'s own default least-twist phase
 * directly, unmodified.
 */
import type { AdapterPieceResult } from './triangleToUHex.js';
export declare function deriveSquareToUHex(): AdapterPieceResult;
