/**
 * RVCMG's reversibility primitive (spec §9, V6): every coalescence must
 * have a geometrically defined inverse. Splits a previously-coalesced
 * vertex back into its two source vertices at caller-supplied positions,
 * restoring the exact pre-merge boundary topology.
 *
 * Scope note (2026-09-15, worth remembering): the full mathematical
 * duality is `coalesce` (division: two adjacent vertices -> one) and
 * `splitVertex` (multiplication: one vertex -> two, at any two
 * positions, whether or not it was ever a coalesce product) as general
 * inverse operations, uncapped in either direction (6 -> 12 by repeated
 * splitting is as valid as 6 -> 3 by repeated merging) — this is the
 * pure meaning of "Reversible" in RVCMG's own name. THIS function only
 * implements the narrower "undo a specific `coalesce()` call" case — it
 * requires `sourceIds.length === 2` and refuses anything else. The
 * fully general split (any vertex, merged-before or not) lives in
 * `splitVertex.ts` instead, as a separate, more primitive operation —
 * see docs/rvcmg-adapter-pieces-spec.md for the full record.
 */
import type { Vec3 } from '../polyhedra/core.js';
import type { RvcmgState } from './types.js';
export declare function separate(state: RvcmgState, coalescedVertexId: string, toPositions: [Vec3, Vec3], inverseDeformation?: (v: Vec3) => Vec3): RvcmgState;
