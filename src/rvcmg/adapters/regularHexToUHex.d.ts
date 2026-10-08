/**
 * RVCMG v2 — Regular-Hexagon-to-U-Hex: the new universal hex interface
 * reshaped to a genuine unit-edge (circumradius 1) regular hexagon,
 * matching any unit-edge Archimedean solid with real regular hexagonal
 * faces. Direct port of v1's `regularHexToRdH.ts` — same coalesce+
 * splitVertex composite (RVCMG has no single primitive for "reshape
 * without changing vertex count").
 *
 * A genuinely simpler case than v1's version: v1's SOURCE hex was
 * non-regular (D2h, 2 long + 4 short edges), so that piece was a real
 * asymmetric reshape. This piece's source (the universal hex) is
 * ALREADY a regular hexagon — just at circumradius sqrt(2)/2 instead of
 * 1 — so this is close to a uniform radial dilation, not a symmetry
 * correction. Still routed through the same composite as v1 for
 * consistency (and so the existing reversibility machinery applies
 * unchanged), rather than special-cased into a bare scale multiply.
 */
import type { AdapterPieceResult } from './triangleToUHex.js';
export declare function deriveRegularHexToUHex(): AdapterPieceResult;
