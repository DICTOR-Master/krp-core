/**
 * RVCMG's general "multiply" primitive — the true dual of `coalesce()`
 * ("divide": two adjacent vertices -> one). Splits ANY single vertex
 * (original or previously-coalesced, doesn't matter) into two new ones
 * at caller-supplied positions, connected by a new edge, with every
 * other vertex transformed by a supplied deformation — exactly
 * mirroring `coalesce()`'s own shape, one level up in vertex count.
 *
 * This is a genuinely more general operation than `separate()`
 * (separate.ts): `separate` only undoes a SPECIFIC prior `coalesce()`
 * call (requires the target vertex to carry `sourceIds` recorded by
 * that exact call). `splitVertex` has no such requirement — it can
 * split an ORIGINAL vertex that was never merged at all, which is what
 * lets the vertex count go UP past its starting value (6 -> 7 -> 8 ->
 * ... -> 12, or any other count), not just back down to where it
 * started. Direct user statement this implements: "you can reduce six
 * points to 3 but you can also split it to 12 or any other corner
 * count" — the multiply/divide duality is symmetric and uncapped in
 * both directions, per spec V6/§9's reversibility rule.
 *
 * The two new vertices get `sourceIds: []` — from this operation's own
 * perspective they are fresh vertices (their identity/history is
 * whatever the caller's chosen ids mean), not a record of "undoing a
 * merge." A split vertex's own inverse is a plain `coalesce()` call on
 * the two new ids (see splitVertex.test.ts) — reversibility here is
 * demonstrated via that composition, not via `separate()`.
 */
import type { Vec3 } from '../polyhedra/core.js';
import type { RvcmgState } from './types.js';
export declare function splitVertex(state: RvcmgState, vertexId: string, newIdA: string, newIdB: string, posA: Vec3, posB: Vec3, deformation?: (v: Vec3) => Vec3): RvcmgState;
