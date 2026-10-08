/**
 * Canonical family/facet data layer, shared by PolyhedralWheel and the
 * ShapeBrowser (karaoke-style picker). Single source of truth so the two
 * UIs can never disagree about family membership, labels, or symbols.
 *
 * A shape's family isn't always singular. The registry's own comments say
 * so directly: platonic.ts skips the tetrahedron/octahedron/icosahedron
 * because "they're D4/D8/D20 in ./deltahedra.ts" (they ARE Platonic
 * solids, just not re-derived there), and prisms.ts skips the 4-gonal
 * prism and 3-gonal antiprism because those ARE the cube and the
 * octahedron. So a shape can carry more than one family tag -- encoded
 * below as an explicit, documented overlap patch (EXTRA_MEMBERSHIP)
 * layered on top of the registry's own per-family id arrays, never
 * guessed at runtime.
 */
import { type PolyhedronSpec } from './index.js';
export type FamilyKey = 'DELTAHEDRA' | 'PLATONIC' | 'ARCHIMEDEAN' | 'JOHNSON' | 'CATALAN' | 'PRISMS' | 'ANTIPRISMS' | 'BRIDGES_3D' | 'POLYTOPES_4D' | 'STELLATIONS' | 'PARALLELOHEDRA' | 'SPACE_FILLING_PAIRS' | 'APERIODIC' | 'MISCELLANEOUS';
export declare const FAMILY_ORDER: FamilyKey[];
export declare const FAMILY_META: Record<FamilyKey, {
  label: string;
  symbol: string;
}>;
/**
 * Space-Filling Pairs: two convex shapes that together tile 3D space
 * face-to-face, each a classical uniform honeycomb (confirmed with the
 * user 2026-09-24, all 7; the 12-gonal prism + triangular prism pair also
 * qualifies but this registry's prisms stop at 10 sides). Every pair is
 * re-checked by scripts/verify-space-filling-pairs.py (dihedral angles
 * closing to 360 degrees around each edge type) -- not taken on
 * reputation alone.
 */
export declare const SPACE_FILLING_PAIR_LIST: Array<{
  ids: [string, string];
  honeycomb: string;
  nonConvex?: true;
}>;
/** Fedorov's five parallelohedra, one of each type in its most symmetric form. */
export declare const FEDOROV_FIVE: string[];
/**
 * Notable variants (direct decision 2026-09-30: "Fedorov's five + notable
 * variants"): sheared members of the same types that fill space by
 * translation just the same. The rhombohedron (a sheared cube), DICTO's
 * Zometool leaning hexagonal prism and its two blocks (parallelepipeds).
 */
export declare const PARALLELOHEDRON_VARIANTS: string[];
export declare const KALEIDOHEDRA_RD_TARGETS: string[];
export declare const KALEIDOHEDRA_HEX_TARGETS: string[];
export declare const KALEIDOHEDRA_VERIFIED: string[];
export declare const REGULAR_NINE_NEW: string[];
export declare const REGULAR_NINE: string[];
/** Every family a shape belongs to, in canonical FAMILY_ORDER order. */
export declare function familiesFor(specOrId: PolyhedronSpec | string): FamilyKey[];
export declare function faceTypeSortKey(id: string): [number, number, number];
/** Every shape id in a family (base + documented overlaps), face-type sorted. */
export declare function familyIds(family: FamilyKey): string[];
/** 1-indexed catalog position of every shape within a given family's own order. */
export declare function catalogByFamily(family: FamilyKey): Record<string, number>;
/**
 * A shape's complementary pieces: its Space-Filling Pairs partners (in
 * list order) and its Aperiodic Sets partner. The face-attach
 * picker lists these first (direct request 2026-09-30: "the complementary
 * pair piece should be at top of choices").
 */
export declare function pairPartners(id: string): string[];
