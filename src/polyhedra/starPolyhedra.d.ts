/**
 * The 4 Kepler-Poinsot solids (star polyhedra) -- BROWSABLE ONLY, never
 * merged into the main POLYHEDRA registry (index.ts), never a `FamilyKey`
 * in families.ts, never wired into any attach flow. See
 * docs/star-polyhedra-spec.md for the full staged plan and reasoning:
 * every face here is a genuine star or a shape whose OWN winding is
 * different from a convex polygon's, and the whole vertex/face-attach
 * engine (facesCongruent, vertex-capacity/hover, PolyhedralWheel's
 * family-driven picker) assumes convex, simple, non-self-intersecting
 * faces throughout. Kept structurally impossible to leak into that
 * system rather than filtered out ad hoc.
 *
 * Every one of the 4 is derived directly from this registry's own
 * already-validated DELTAHEDRA.D20 (icosahedron) or PLATONIC_ADDITIONS.
 * DODECAHEDRON vertex/edge/face data -- never hand-typed coordinates,
 * the same "derive, don't duplicate" standard every other family here
 * already holds itself to. Each construction was verified numerically
 * before being written here (real planarity/regularity/winding checks,
 * not assumed from memory) -- see this file's own comments at each step
 * for exactly what was checked, and docs/star-polyhedra-spec.md for the
 * summary table.
 */
import { type PolyhedronSpec } from './core.js';
export declare const STAR_POLYHEDRA: Record<string, PolyhedronSpec>;
export declare const STAR_POLYHEDRON_IDS: string[];
/**
 * Real, published invariants not derivable from vertices/edges/faces
 * alone the way V/E/F themselves are: the Schläfli symbol (the two
 * numbers describing face type and vertex figure, {p/q, r/s}) and
 * density (how many times the faces wind around the solid's own
 * center -- the star-polyhedron analogue of an ordinary polyhedron
 * always having density 1). Metadata, not geometry -- kept separate
 * from PolyhedronSpec itself, which stays family-agnostic.
 */
export declare const STAR_POLYHEDRON_META: Record<string, {
  schlafli: string;
  density: number;
}>;
