/**
 * Shared geometry helpers for every RVCMG adapter-piece derivation
 * (triangleToRdH.ts, squareToRdH.ts, and the rest of the family in
 * docs/rvcmg-adapter-pieces-spec.md) — factored out once a second piece
 * needed the exact same logic, not built ahead of need.
 */
/**
 * Assigns each group (by index) a target angle, evenly spaced
 * (`2*pi/n` apart) around the shared centroid, in TWO steps:
 *
 * 1. Rank the groups by their own real angle (in the hex interface's
 *    own planar frame) to read off the hexagon's actual winding order
 *    — this alone is what prevents an inverted (mirrored) result, and
 *    was already done before this helper existed.
 * 2. Choose the whole assignment's rotational PHASE (which absolute
 *    angle rank 0 lands on) to minimize the total twist between each
 *    group's own real angle and its assigned target angle, rather than
 *    an arbitrary fixed start (e.g. "rank 0 = 0 degrees"). Direct user
 *    instruction: "always use closest corresponding corners of group to
 *    match square or other shape" — a piece whose target corners sit as
 *    close as possible to where each corresponding source group already
 *    was makes a more natural, less twisted taper than an arbitrarily
 *    rotated one that happens to have the same shape.
 *
 * The best-fit phase is the circular mean (not a plain average — angles
 * wrap) of each group's own `angle - rank*step`, computed via the
 * standard sum-of-unit-vectors method (`atan2` of the summed sines and
 * cosines), which is exactly the phase minimizing the sum of squared
 * angular deviations on a circle.
 */
export declare function assignTargetAngles(groupAngles: number[]): number[];
export interface AngleFitGroup {
  angle: number;
  /** Actual current distance from centroid — used for cost weighting, not display. */
  radius: number;
}
export interface TargetCorner {
  /** This corner's own angle relative to the target shape's own fixed reference orientation (NOT assumed uniform — a kite's 4 corners are not evenly spaced). */
  relativeAngle: number;
  radius: number;
}
/**
 * Generalizes `assignTargetAngles` for a target polygon whose corners
 * are NOT interchangeable (different radii and/or non-uniform angular
 * spacing — a kite's own shape, first needed once the family's first
 * asymmetric-beyond-a-rhombus piece came up). `assignTargetAngles`
 * alone can't handle this: it assumes every rank's target sits at a
 * shared, uniform radius, so rotating which hex group is "rank 0"
 * never changes the result. Once target corners genuinely differ from
 * each other, WHICH hex group plays which corner role is a real,
 * separate choice (`n` possible cyclic assignments, all winding-
 * preserving) on top of the continuous rotational phase — tries all
 * `n`, scores each by real 2D squared position error after its own
 * best-fit phase (a weighted circular mean — weighting by
 * `sourceRadius * targetRadius` is exactly what minimizes true squared
 * Euclidean error, not just angular error, for a fixed correspondence),
 * and returns the lowest-cost assignment. Reduces to the same
 * uniform-radius, uniform-spacing case `assignTargetAngles` handles
 * when given a regular target (every shift then scores identically).
 */
export declare function fitTargetPolygon(groups: AngleFitGroup[], targetCorners: TargetCorner[]): {
  targetAngles: number[];
  targetRadii: number[];
  cornerIndexForGroup: number[];
};
