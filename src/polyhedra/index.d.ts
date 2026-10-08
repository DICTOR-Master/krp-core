/**
 * The combined registry across every polyhedron family. Individual family
 * files (deltahedra.ts, platonic.ts, archimedean.ts, johnson.ts, catalan.ts,
 * prisms.ts) stay independently importable for family-specific logic (the
 * D10<->D12 rewrite rule only ever needs DELTAHEDRA, for instance) — this
 * file is for anything that should work across all of them, like the shape
 * picker and the assembly graph's validation.
 */
import type { PolyhedronSpec } from './core.js';
export * from './core.js';
export { DELTAHEDRA, DELTAHEDRON_IDS } from './deltahedra.js';
export { PLATONIC_ADDITIONS, PLATONIC_ADDITION_IDS } from './platonic.js';
export { ARCHIMEDEAN_ADDITIONS, ARCHIMEDEAN_ADDITION_IDS } from './archimedean.js';
export { JOHNSON_ADDITIONS, JOHNSON_ADDITION_IDS } from './johnson.js';
export { CATALAN_ADDITIONS, CATALAN_ADDITION_IDS } from './catalan.js';
export { PRISM_ANTIPRISM_ADDITIONS, PRISM_ANTIPRISM_ADDITION_IDS } from './prisms.js';
export { MISCELLANEOUS_ADDITIONS, MISCELLANEOUS_ADDITION_IDS } from './miscellaneous/index.js';
export { APERIODIC_ADDITIONS, APERIODIC_ADDITION_IDS, APERIODIC_PAIRS } from './aperiodic.js';
export { STELLA_JEWEL_ADDITIONS, STELLA_JEWEL_ADDITION_IDS } from './stellaJewel.js';
export { SUNSTAR_ADDITIONS, SUNSTAR_ADDITION_IDS } from './sunstar.js';
export { BRIDGE_ADDITIONS, BRIDGE_ADDITION_IDS, BRIDGES_3D_IDS } from './bridges.js';
export { STELLATION_ADDITIONS, STELLATION_IDS, stellationInfo } from './stellations/index.js';
export { isFaceEligibleForAttach } from './attachEligibility.js';
export declare const POLYHEDRA: Record<string, PolyhedronSpec>;
export declare const POLYHEDRON_IDS: string[];
