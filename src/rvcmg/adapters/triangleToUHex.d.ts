/**
 * RVCMG v2 — Triangle-to-U-Hex: the new universal hex interface
 * (`universalHexInterface.ts`) collapsed to a real equilateral triangle
 * of edge 1, matching a unit-edge tetrahedron/octahedron face. Direct
 * v2 counterpart of `triangleToRdH.ts` — same pipeline (derive a real
 * target polygon -> coalesce() sequence -> Stage 7 verification), same
 * 3-merge alternate-edge matching, but starting from the new small
 * regular hex instead of RD's own D2h-symmetric native one.
 */
import type { RvcmgState, CoalescenceOp } from '../types.js';
/** The starting 6-vertex state for every v2 adapter piece, built directly from `UNIVERSAL_HEX_INTERFACE`. */
export declare function uHexStartState(): RvcmgState;
export interface AdapterPieceResult {
  states: RvcmgState[];
  ops: CoalescenceOp[];
  problems: string[];
}
/**
 * Derives the Triangle-to-U-Hex piece: 3 coalesce() steps merging
 * alternate edges of the hexagon — (v1,v2), (v3,v4), (v5,v6) — the same
 * perfect matching triangleToRdH.ts uses (order-independent since
 * merging one pair never disturbs the others' adjacency).
 */
export declare function deriveTriangleToUHex(): AdapterPieceResult;
