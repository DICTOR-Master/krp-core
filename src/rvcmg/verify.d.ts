/**
 * RVCMG's standing verification suite — a direct implementation of spec
 * §25.1-25.8, runnable against any real state/transition (not just
 * hand-picked examples), mirroring `validateShape`'s own style
 * (core.ts): a list of problem strings, empty = valid.
 *
 * Scope note: `verifyTransition` validates a genuine SINGLE coalesce
 * step (`before` has exactly one more vertex than `after`) — it is not
 * meant to be run against a skip-transition (a `5<->3` edge, which the
 * spec itself says needs "an additional transformation" coalesce()
 * doesn't perform, per Stage 3's own V2 comment) or against a state
 * graph's auto-registered INVERSE edge (Stage 5's `addTransition`
 * synthesizes those as bookkeeping metadata, not a validated geometric
 * operation in their own right — their validity is `separate()`'s own
 * job, checked here via 25.6 instead).
 *
 * Deviation from the plan's literal `verifyTransition(op, before,
 * after)` signature, noted: 25.5 ("matches an independently specified
 * target state, WHEN ONE IS SUPPLIED") and 25.7 ("if two paths are
 * claimed equivalent, diff their geometry") both need something
 * supplied/claimed that a bare 3-argument signature has no room for —
 * an optional 4th `options` argument carries them.
 */
import { type Vec3 } from '../polyhedra/core.js';
import type { RvcmgState, CoalescenceOp } from './types.js';
export interface VerifyTransitionOptions {
  /** 25.5: an independently-specified expected result to check `after` against. */
  expectedAfter?: RvcmgState;
  /** 25.7: a claimed-equivalent alternate route (states + the ops connecting them) from `before` to the same endpoint as `after`. */
  equivalentPath?: {
    states: RvcmgState[];
    ops: CoalescenceOp[];
  };
  /**
     * 25.6: the real inverse of `op.deformation`, when it isn't its own
     * inverse (identity always is, so this defaults to it) — e.g. a
     * deformation that moved OTHER vertices to specific final positions
     * (spec §16's Φ used for real, not as an identity pass-through) needs
     * an explicit inverse to check reversibility correctly; without one,
     * `separate()`'s own default identity would incorrectly leave those
     * vertices at their post-deformation positions and this check would
     * report a false failure.
     */
  inverseDeformation?: (v: Vec3) => Vec3;
  tol?: number;
}
export declare function verifyTransition(op: CoalescenceOp, before: RvcmgState, after: RvcmgState, options?: VerifyTransitionOptions): string[];
/**
 * 25.8 (equal vertex count does not imply equal state) is enforced
 * structurally, not by a per-call runtime check here: `statesApproximatelyEqual`
 * (types.ts) always compares coordinates + connectivity, never count
 * alone, and types.test.ts's own static scan flags any code that
 * compares two states by `vertices.length` alone. See verify.test.ts for
 * a direct, concrete demonstration (two same-count, different-topology
 * states correctly reported as NOT equal).
 */
export declare const SPEC_25_8_NOTE = "enforced by statesApproximatelyEqual (never count-alone) + types.test.ts's static scan; see verify.test.ts for a direct demonstration";
