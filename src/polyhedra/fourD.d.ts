/**
 * 4D extension, Stage A: classifies which registered 3D shapes can be a
 * "cell" of some convex 4-polytope, purely from their own already-stored
 * geometry (vertices/edges/faces) — never a hand-stored field on the
 * shape itself. Same "derive, don't duplicate" rule core.ts's own file
 * header states for every other derived fact in this registry.
 *
 * The math: a 3D polyhedron closes into a finite solid because the FACE
 * angles meeting at a shared VERTEX sum to less than 360° (the "angle
 * defect" that gives a polyhedron its curvature). The 4D analogue is one
 * dimension up: a 4-polytope closes because the DIHEDRAL angles of its
 * CELLS (3D shapes) meeting at a shared EDGE sum to less than 360° — the
 * natural angle measure at an edge in 3D is the dihedral angle between
 * its two bounding faces, exactly the way the natural angle measure at a
 * vertex in 2D/3D is an interior face angle. `k` copies of a cell meeting
 * at a shared edge need `k * dihedralAngle < 360°` to curve into a real
 * 4D closure; `=360°` tiles ordinary flat 3D space instead (the cube's
 * own case at k=4); `>360°` never closes at all (the icosahedron, at any
 * k — verified below, not assumed).
 */
import type { PolyhedronSpec } from './core.js';
/**
 * The shape's single dihedral angle in degrees, or `null` if it doesn't
 * have one (most families mix face types and genuinely have several
 * distinct dihedral angles by edge — those are simply not eligible for
 * 4D-cell classification, not given a fabricated average).
 *
 * Sign convention verified against known values: for two faces sharing
 * an edge with outward unit normals n1/n2, the interior dihedral angle
 * is `180° - angleBetween(n1, n2)` — checked directly against a cube
 * (adjacent faces' normals are perpendicular, 90° between them, dihedral
 * 180-90=90°, the known right-angle cube dihedral) and a regular
 * tetrahedron (known dihedral ≈70.53°).
 */
export declare function dihedralAngleDeg(spec: PolyhedronSpec): number | null;
export type ClosureKind = '4d' | 'flat-tiles' | 'non-closing';
export interface ClosureOption {
  k: number;
  kind: ClosureKind;
  defectDeg: number;
}
/**
 * Every valid k (>=3 copies meeting at a shared edge) for this shape,
 * each independently classified — a shape can legitimately be more than
 * one kind at different k (the cube is both a tesseract cell at k=3 AND
 * an ordinary flat-space tile at k=4; direct instruction: return every
 * option, never collapse to one default verdict).
 */
export declare function closureClass(spec: PolyhedronSpec): ClosureOption[];
/** A shape belongs to the 4D-capable family iff it has at least one real 4D closure option. */
export declare function is4DCapable(spec: PolyhedronSpec): boolean;
/**
 * Computed, not hand-curated — matches every other family's own id-list
 * pattern in families.ts. Verified against the known, real classification
 * of the six regular convex 4-polytopes in scripts/verify-4d-closure.ts,
 * not just checked for internal consistency. Stellation pieces are left
 * out: the octahedron's is a regular tetrahedron, but a piece attaches by
 * its base alone, so no 4D build can grow on its other faces.
 */
export declare const FOURD_CAPABLE_IDS: string[];
