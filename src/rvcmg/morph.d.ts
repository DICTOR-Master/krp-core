/**
 * RVCMG's continuous morph (spec §17, §18): the animatable path
 * underlying a discrete coalescence, for UI sliders/previews. The
 * discrete state transition happens exactly at t=1 — at any t<1 the two
 * vertices stay genuinely distinct, even if very close together;
 * `classifyState` is a separate, explicit tolerance-based decision, not
 * something `interpolate` itself decides.
 *
 * Deviation from the plan's literal `interpolate(op, t)` signature,
 * noted rather than silently made: `CoalescenceOp` alone doesn't carry
 * the two coalescing vertices' STARTING positions (only their ids, via
 * `coalescedPair`, plus the single end target `targetPos`) — there is no
 * way to compute a path without them. `interpolate` here also takes
 * `fromState` (the state `op.fromStateId` names) to look those starting
 * positions up, rather than inventing a new field on `CoalescenceOp`
 * that duplicates data the state graph (Stage 5) already stores.
 */
import type { RvcmgState, RvcmgVertex, CoalescenceOp } from './types.js';
/**
 * The two coalescing vertices' positions at parameter `t` (0 = the
 * source state, exactly; 1 = the coalesced target, exactly), per §18:
 * - `'symmetric'`: `v_i(t) = (1-t)*v_i + t*c` for BOTH vertices.
 * - `'one-sided'`: one vertex (`coalescedPair[0]`) stays fixed; the
 *   other moves all the way to `c`. (For this to land on the SAME `c`
 *   both vertices reach at t=1 — coalesce() always sets both to
 *   `targetPos`, spec V3 — a caller choosing 'one-sided' is expected to
 *   set `targetPos` equal to the fixed vertex's own position; that's a
 *   caller convention, not something this function validates.)
 * - a custom `(t) => Vec3` function: BOTH vertices move directly onto
 *   that shared curve at every `t` — a way to replace the default
 *   straight-line meeting path with a curved one when needed. The spec
 *   doesn't define a second, independent curve for "the other side," so
 *   both vertices sharing the one supplied curve is the direct reading.
 */
export declare function interpolate(fromState: RvcmgState, op: CoalescenceOp, t: number): [RvcmgVertex, RvcmgVertex];
/**
 * Decides a discrete vertex count from a continuous vertex array, by
 * connected components under `tolerance` (transitive: if A~B and B~C
 * are both within tolerance, A/B/C count as one group even if A-C alone
 * exceeds it) — order-independent, unlike a naive pairwise-only merge.
 * For hooking a UI morph slider's continuous `t` up to a discrete
 * "N vertices right now" readout. Choosing too loose a `tolerance`
 * relative to the path's own scale will misclassify a near-t=1 sample
 * as already-coalesced before the real discrete transition — that's a
 * property of the chosen tolerance, not something this function can
 * correct for on its own.
 */
export declare function classifyState(vertices: RvcmgVertex[], tolerance: number): number;
