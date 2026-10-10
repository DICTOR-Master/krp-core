/**
 * The combined registry across every polyhedron family. Individual family
 * files (deltahedra.ts, platonic.ts, archimedean.ts, johnson.ts, catalan.ts,
 * prisms.ts) stay independently importable for family-specific logic (the
 * D10<->D12 rewrite rule only ever needs DELTAHEDRA, for instance) — this
 * file is for anything that should work across all of them, like the shape
 * picker and the assembly graph's validation.
 */
import { DELTAHEDRA, DELTAHEDRON_IDS } from './deltahedra.js';
import { PLATONIC_ADDITIONS, PLATONIC_ADDITION_IDS } from './platonic.js';
import { ARCHIMEDEAN_ADDITIONS, ARCHIMEDEAN_ADDITION_IDS } from './archimedean.js';
import { JOHNSON_ADDITIONS, JOHNSON_ADDITION_IDS } from './johnson.js';
import { CATALAN_ADDITIONS, CATALAN_ADDITION_IDS } from './catalan.js';
import { PRISM_ANTIPRISM_ADDITIONS, PRISM_ANTIPRISM_ADDITION_IDS } from './prisms.js';
import { MISCELLANEOUS_ADDITIONS, MISCELLANEOUS_ADDITION_IDS } from './miscellaneous/index.js';
import { APERIODIC_ADDITIONS, APERIODIC_ADDITION_IDS } from './aperiodic.js';
import { STELLA_JEWEL_ADDITIONS, STELLA_JEWEL_ADDITION_IDS } from './stellaJewel.js';
import { SUNSTAR_ADDITIONS, SUNSTAR_ADDITION_IDS } from './sunstar.js';
import { HEXA_ADDITIONS, HEXA_ADDITION_IDS } from './hexa.js';
import { DODECA13_ADDITIONS, DODECA13_ADDITION_IDS } from './dodeca13.js';
import { EDGE_ROOF_ADDITIONS, EDGE_ROOF_ADDITION_IDS } from './edgeRoof.js';
import { BRIDGE_ADDITIONS, BRIDGE_ADDITION_IDS } from './bridges.js';
import { STELLATION_ADDITIONS, STELLATION_IDS } from './stellations/index.js';
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
export { HEXA_ADDITIONS, HEXA_ADDITION_IDS, HEXA_PARTS, HEXA_VOLUMES } from './hexa.js';
export { DODECA13_ADDITIONS, DODECA13_ADDITION_IDS, DODECA13_PARTS, DODECA13_VOLUMES } from './dodeca13.js';
export { EDGE_ROOF_ADDITIONS, EDGE_ROOF_ADDITION_IDS } from './edgeRoof.js';
export { BRIDGE_ADDITIONS, BRIDGE_ADDITION_IDS, BRIDGES_3D_IDS } from './bridges.js';
export { STELLATION_ADDITIONS, STELLATION_IDS, stellationInfo } from './stellations/index.js';
export { isFaceEligibleForAttach } from './attachEligibility.js';
export const POLYHEDRA = {
  ...DELTAHEDRA,
  ...PLATONIC_ADDITIONS,
  ...ARCHIMEDEAN_ADDITIONS,
  ...JOHNSON_ADDITIONS,
  ...CATALAN_ADDITIONS,
  ...PRISM_ANTIPRISM_ADDITIONS,
  ...MISCELLANEOUS_ADDITIONS,
  ...APERIODIC_ADDITIONS,
  ...STELLA_JEWEL_ADDITIONS,
  ...SUNSTAR_ADDITIONS,
  ...HEXA_ADDITIONS,
  ...DODECA13_ADDITIONS,
  ...EDGE_ROOF_ADDITIONS,
  ...BRIDGE_ADDITIONS,
  ...STELLATION_ADDITIONS,
};
export const POLYHEDRON_IDS = [
  ...DELTAHEDRON_IDS,
  ...PLATONIC_ADDITION_IDS,
  ...ARCHIMEDEAN_ADDITION_IDS,
  ...JOHNSON_ADDITION_IDS,
  ...CATALAN_ADDITION_IDS,
  ...PRISM_ANTIPRISM_ADDITION_IDS,
  ...MISCELLANEOUS_ADDITION_IDS,
  ...APERIODIC_ADDITION_IDS,
  ...STELLA_JEWEL_ADDITION_IDS,
  ...SUNSTAR_ADDITION_IDS,
  ...HEXA_ADDITION_IDS,
  ...DODECA13_ADDITION_IDS,
  ...EDGE_ROOF_ADDITION_IDS,
  ...BRIDGE_ADDITION_IDS,
  ...STELLATION_IDS,
];
