/**
 * Shared test-only fixtures for RVCMG's own test files (not part of the
 * public export surface — never re-exported from index.ts). Gives every
 * stage's tests the SAME concrete "S_6" state instead of each inventing
 * its own, and ties it to Stage 1's real geometry rather than an
 * arbitrary hexagon.
 */
import type { RvcmgState } from './types.js';
/**
 * The canonical 6-vertex starting state: the real hemi-RD interface's
 * own 6 ordered vertices (Stage 1), each wrapped as a primitive
 * (never-yet-coalesced) RvcmgVertex — ids `v1`..`v6`, matching the
 * spec's own `V = (v1..v6)` naming, `sourceIds: []` (nothing has merged
 * into an original vertex yet).
 */
export declare function initialState(): RvcmgState;
