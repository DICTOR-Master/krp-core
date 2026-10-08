/**
 * The Regular-Hexagon-to-RD-H adapter piece: the real (non-regular)
 * hemi-RD hex interface reshaped into a genuine REGULAR hexagon of edge
 * 1 — matching any unit-edge Archimedean solid with real regular
 * hexagonal faces (truncated tetrahedron, truncated octahedron,
 * truncated cuboctahedron, ...). Added "for the moment at least" (direct
 * user request, 2026-09-15) — a real, useful piece in its own right, NOT
 * a return to the earlier "regular hexagon" misunderstanding this
 * project expunged elsewhere (see docs/rvcmg-adapter-pieces-spec.md):
 * this one intentionally targets a genuine regular hexagon as its own
 * distinct destination shape, exactly the way every other piece targets
 * its own distinct destination shape. Which specific hexagon-faced
 * Archimedean solid it's named after is left open for now — every
 * unit-edge-normalized one shares the exact same regular hexagon.
 *
 * Structurally different from every other piece: same vertex count on
 * both ends (6 -> 6), not a reduction. RVCMG has no single primitive
 * for "reshape without changing count" (spec V1: the primitive acts on
 * vertices via coalescence, not free repositioning), so this is built
 * as a real composite transformation (spec §8) — a genuine, non-
 * synthetic demonstration of the "S6(a) <-> S6(b)" same-vertex-count
 * state-graph edge spec §10/Stage 5 names as a first-class case
 * (stateGraph.test.ts only ever exercised that case with a synthetic
 * placeholder op, not a real geometric one): coalesce (v1,v2) together
 * [6 -> 5], immediately split the result back apart at the two REAL
 * target corner positions [5 -> 6], deforming v3..v6 to their own
 * final corners in the first step (they don't need to move again in
 * the second).
 */
import type { AdapterPieceResult } from './triangleToRdH.js';
export declare function deriveRegularHexToRdH(): AdapterPieceResult;
