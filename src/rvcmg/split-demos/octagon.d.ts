/**
 * Proof-of-concept, not a physical adapter piece — see heptagon.ts's
 * own header for the full rationale. This one exercises TWO sequential
 * `splitVertex()` calls (6 -> 7 -> 8), splitting `v1` and its exact
 * central-symmetry partner `v4` (confirmed by the adapter pieces
 * already), mirroring squareToRdH.ts's own 2-step pattern in the
 * opposite (multiplying) direction: step 1 places the first split's two
 * new corners directly and leaves everyone else untouched; step 2
 * places the second split's two new corners directly AND deforms the
 * remaining 4 untouched vertices to their own final corners.
 */
import type { SplitDemoResult } from './heptagon.js';
export declare function deriveOctagonBySplitting(): SplitDemoResult;
