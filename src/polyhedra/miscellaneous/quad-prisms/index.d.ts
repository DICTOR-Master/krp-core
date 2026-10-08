/**
 * The "quad-prisms" sub-group of the "Miscellaneous" family: 4 prism-
 * like "extender" pieces (direct user request, 2026-09-17) — a real
 * Catalan-solid rhombus/kite face, extruded into a right prism whose
 * lateral faces are squares (rhombus bases) or 2 squares + 2 rectangles
 * (kite bases). See `polygonPrismSolid.ts` (one level up) for the
 * construction and why that split is geometrically forced, not a
 * design choice.
 *
 * Two rhombus prisms (RD-native, golden-ratio) and two kite prisms
 * (DI, DH) — one per irregular-quadrilateral-faced Catalan solid this
 * project's RVCMG family already targets (`app/lib/rvcmg/adapters/
 * rhombusToUHex.ts`/`kiteToUHex.ts`), reusing those same measurement
 * helpers so the numbers can never drift from what RVCMG already
 * verified. Geometry itself comes from the shared, n-agnostic
 * `polygonPrismSolid.ts` (one level up — also used by the U-Hex spacer
 * piece in `rvcmg-connectors-v2/`, n=6, whose own 6 lateral faces are
 * ALSO all attachable, all genuine squares, same as this file's own
 * rhombus prisms).
 *
 * Every face is a real attach port (direct user request, 2026-09-17:
 * "add that please for branching possibilities") — the lateral
 * squares/rectangles are genuine, planar, right-angled faces, not
 * construction artifacts, so a cube (or another matching prism) can
 * attach sideways too, not just end-to-end. EXCEPTION: a kite prism's 2
 * non-square rectangle lateral faces stay excluded — a real, structural
 * gap in the app's own face-attach placement algorithm for polygons
 * whose only mirror axis passes through an edge midpoint rather than a
 * vertex (see `polygonPrismSolid.ts`'s own header for the full finding),
 * found while wiring this up, not a design choice. The rhombus prisms
 * are unaffected (all 6 faces are squares, all placeable, all open).
 */
import { type PolyhedronSpec } from '../../core.js';
export declare const QUAD_PRISM_ADDITIONS: Record<string, PolyhedronSpec>;
export declare const QUAD_PRISM_ADDITION_IDS: string[];
