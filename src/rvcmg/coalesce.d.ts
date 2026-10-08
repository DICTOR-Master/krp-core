/**
 * RVCMG's one primitive transformation (spec §3, §4, §16): merge two
 * ADJACENT boundary vertices to a single target position, deform every
 * other vertex by a supplied map, then dedupe. Every higher-level
 * operation (composite paths, the state graph, interpolation) is built
 * from this single primitive — it must never special-case a particular
 * vertex count or a particular pair (V9, spec §10): no `3->4->5->6`
 * ladder anywhere in this file.
 */
import type { Vec3 } from '../polyhedra/core.js';
import type { RvcmgState } from './types.js';
export declare function coalesce(state: RvcmgState, vertexIdA: string, vertexIdB: string, targetPos: Vec3, deformation?: (v: Vec3) => Vec3): RvcmgState;
