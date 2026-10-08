/**
 * Pure faceted-search matcher shared by the ShapeBrowser's Search screen
 * (and, via countWith, its zero-result chip-hiding logic). Kept separate
 * from the component tree so it's independently verifiable (see
 * scripts/verify-search.ts) and reusable by Home/Favorites if they ever
 * need the same predicate.
 *
 * Facet semantics, matching the validated karaoke-picker prototype:
 *  - families: multi-select, AND/intersection ("belongs to every selected
 *    family", never the union of either).
 *  - faceShapes: multi-select, OR within the group ("has at least one of
 *    these face sizes").
 *  - faceCountBand: single-select, optional -- never blocks the picker
 *    when left unset.
 */
import { type PolyhedronSpec } from './index.js';
import { type FamilyKey } from './families.js';
export type FaceCountBand = 'le10' | '11-30' | '31plus';
export interface Filters {
  query: string;
  families: FamilyKey[];
  faceShapes: number[];
  faceCountBand: FaceCountBand | null;
}
export declare const EMPTY_FILTERS: Filters;
export declare function matchesFilters(spec: PolyhedronSpec, f: Filters): boolean;
export declare function filteredIds(f: Filters, restrictTo?: string[]): string[];
export declare function hasActiveFilter(f: Filters): boolean;
/**
 * Result count if `override` were merged into `base`. Used to decide
 * whether an as-yet-unselected chip should render at all: any chip whose
 * hypothetical selection would zero out the result set is hidden rather
 * than shown disabled (the "narrowing must never dead-end" requirement).
 */
export declare function countWith(base: Filters, override: Partial<Filters>, restrictTo?: string[]): number;
/** All distinct face-gon sizes actually present anywhere in the registry, ascending. */
export declare function allFaceShapeSizes(): number[];
export declare const FACE_COUNT_BANDS: Array<{
  id: FaceCountBand;
  label: string;
}>;
