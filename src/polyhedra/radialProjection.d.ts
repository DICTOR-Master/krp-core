/**
 * 4D Radial Cell Projection — Stage 1's generic engine: a 3D seed cell +
 * a real 4D adjacency rule (hyperplane rotation, not a per-pair 3D
 * rigid-transform patch) + a 4D->3D perspective projection = a genuine
 * 3D representation of a regular 4-polytope. One engine, parameterized
 * per seed shape, not four hardcoded objects.
 *
 * It builds real 4D coordinates from the start via hyperplane rotations —
 * not per-pair 3D rigid corrections after the fact, which don't compose
 * associatively and oscillate for any node with 2+ edge-partners —
 * the literal Wythoff/Coxeter construction used to generate every
 * regular 4-polytope. Rotations in a finite reflection group compose
 * exactly and the orbit is *guaranteed* to close after finitely many
 * steps; there is no iterative numerical correction to oscillate.
 *
 * theta (the cell-to-cell 4D dihedral angle) is NOT derivable from a
 * cell's own 3D dihedral angle by any simple formula — checked
 * directly: the tesseract's own angle-defect (90deg, from fourD.ts's
 * closureClass at k=3) happens to equal its theta (90deg), but the
 * 16-cell's defect (77.9deg, at k=4) does NOT equal its theta (60deg).
 * So FOUR_D_SHAPE_PARAMS below is not a shortcut for something already
 * computed elsewhere — each entry is an independently required,
 * independently verified fact about that specific target 4-polytope's
 * real embedded geometry. Derivation for each (see
 * scripts/verify-radial-projection.ts for the full checks):
 *  - tesseract: the [-1,1]^4 hypercube's 8 facet hyperplanes.
 *  - 16-cell: the +-e_i (i=1..4) cross-polytope's 16 signed-orthant cells.
 *  - 24-cell: rectifying the 16-cell (the cuboctahedron analogy one
 *    dimension up — cuboctahedron = rectified cube = rectified
 *    octahedron; 24-cell = rectified tesseract = rectified 16-cell).
 *  - 120-cell: duality with the 600-cell, whose 120 vertices are the
 *    binary icosahedral group's unit quaternions.
 */
import type { PolyhedronSpec, Vec3 } from './core.js';
export type Vec4 = [number, number, number, number];
export type Mat4x4 = [
  [
    number,
    number,
    number,
    number
  ],
  [
    number,
    number,
    number,
    number
  ],
  [
    number,
    number,
    number,
    number
  ],
  [
    number,
    number,
    number,
    number
  ]
];
export declare const IDENTITY4: Mat4x4;
export declare function matMul(a: Mat4x4, b: Mat4x4): Mat4x4;
export declare function matVec(a: Mat4x4, v: Vec4): Vec4;
export declare function dot4(a: Vec4, b: Vec4): number;
export declare function norm4(a: Vec4): Vec4;
/**
 * The mirror direction m such that reflecting n across the hyperplane
 * with normal m sends n exactly to cos(theta)*n + sin(theta)*f, for
 * orthonormal n, f. Derived from reflect(n,m) = n - 2(n.m)m = target,
 * solving for m: m = sin(theta/2)*n - cos(theta/2)*f (verified directly
 * by substitution: n.m = sin(theta/2), so n - 2sin(theta/2)*m expands
 * via the half-angle identities to cos(theta)*n + sin(theta)*f exactly).
 *
 * This MUST be a reflection, not a rotation by theta within the (n,f)
 * plane — the two send n to the same place but differ on f itself (a
 * rotation sends f -> -sin(theta)n+cos(theta)f; this reflection sends
 * f -> sin(theta)n-cos(theta)f), and only the reflection reproduces the
 * real target 4-polytopes. A first version of this engine used the
 * rotation formula instead: it happened to still close correctly for
 * the cube (8 cells) by coincidence of that seed's extra symmetry
 * (every local face normal is itself a signed coordinate axis), but
 * diverged past 200 cells without closing for D4, D8, and DODECAHEDRON
 * — caught directly by scripts/verify-radial-projection.ts rather than
 * assumed correct from the cube case alone. This is exactly the same
 * literal reflection operation validated by hand for cube/16-cell/
 * 24-cell/120-cell earlier this session (mirror = normalize(n0-n1) for
 * a KNOWN target n1) — here solved for m directly from theta instead of
 * needing the target normal already known in advance, so it generalizes
 * to every face of every seed, not just the ones checked by hand.
 */
export declare function bisectingMirror(n: Vec4, f: Vec4, thetaRad: number): Vec4;
/** The 4x4 reflection across the hyperplane with unit normal m: v -> v - 2(v.m)m. */
export declare function reflectionMatrix(m: Vec4): Mat4x4;
export interface FourDShapeParams {
  /** Which real 4-polytope this closure produces, e.g. '16-cell' -- shown in the UI, and used to select a specific closure for a seed with more than one (D4 has 3). */
  name: string;
  thetaDeg: number;
  cellCount: number;
  adjacencyDegree: number;
}
export declare const FOUR_D_SHAPE_PARAMS: Record<string, FourDShapeParams[]>;
/**
 * Resolves which key of `FOUR_D_SHAPE_PARAMS` applies to `spec`: its own
 * id if registered directly, otherwise (a real, live gap this session's
 * own graded-pyramid work exposed: `PYRAMID_TRI_G2` is geometrically a
 * duplicate of D4 but has its own, different registry id) whichever
 * registered shape it's vertex-for-vertex congruent to. Derived by
 * actual comparison, not a hand-maintained alias list, so any FUTURE
 * D4-congruent (or CUBE-/D8-/DODECAHEDRON-congruent) duplicate resolves
 * correctly without needing its own entry here.
 */
export declare function resolveParamsKey(spec: PolyhedronSpec): string | undefined;
export interface FourDCell {
  id: number;
  transform: Mat4x4;
  normal: Vec4;
  /** BFS ring distance from the seed cell (0 for the seed itself, 1 for its direct neighbors, ...) -- real bookkeeping from the BFS `buildCellComplex` already does, just recorded rather than discarded, for shell-by-shell interactive build/remove. */
  shell: number;
}
export interface FourDCellComplex {
  seedSpecId: string;
  targetName: string;
  thetaDeg: number;
  seedEmbedding: Vec4[];
  cells: FourDCell[];
  adjacency: [cellIdA: number, cellIdB: number, viaFaceOfA: number][];
}
/**
 * Builds the full cell complex for a FOURD_CAPABLE seed shape: starts
 * from one reference cell, and repeatedly generates the neighbor across
 * each free face by REFLECTING the current cell across the hyperplane
 * that bisects its own outward normal and that face's own (globally
 * oriented) local normal, by angle `theta` — the literal Wythoff/Coxeter
 * orbit generation, not a per-pair correction. BFS naturally dedupes
 * cells that are reached more than once (closure), verified in
 * scripts/verify-radial-projection.ts to terminate at exactly the known
 * cell count for all 4 seeds.
 */
export declare function buildCellComplex(spec: PolyhedronSpec, choice?: string | number, maxCells?: number): FourDCellComplex;
export declare function projectVec4ToVec3(v: Vec4, viewDistance: number): Vec3;
/** Every one of a cell's own embedded vertices, in the global 4D frame. */
export declare function cellVertices(complex: FourDCellComplex, cell: FourDCell): Vec4[];
export interface RadialProjectionScene {
  viewDistance: number;
  cellsVertices3D: Vec3[][];
}
/**
 * Stage 7's rendering bridge: builds the full cell complex for `spec`
 * and perspective-projects every cell's vertices to 3D in one pass, per
 * the plan's own formula `(x,y,z,w) -> (x/(d-w), y/(d-w), z/(d-w))`.
 * `viewDistance` is chosen automatically as `maxAbsW * viewMargin` --
 * comfortably past every generated vertex's own w-extent so the
 * near-viewpoint clamp in projectVec4ToVec3 is never the thing doing
 * the work, while still being close enough that outer cells visibly
 * expand under the perspective, matching the plan's own Stage 2 "done
 * when" description.
 */
export declare function buildRadialProjectionScene(spec: PolyhedronSpec, viewMargin?: number, closure?: string): RadialProjectionScene;
export interface DualCell {
  id: number;
  vertices: Vec4[];
  normal: Vec4;
  originalVertex: Vec4;
}
export interface DualCellComplex {
  cells: DualCell[];
  adjacency: [number, number][];
}
/**
 * Stage 6: duality, as a real operation on ANY FourDCellComplex, not a
 * 120/600-cell-only special case. Standard polytope duality: k-faces of
 * P correspond to (n-1-k)-faces of its dual with reversed inclusion --
 * here, VERTICES of the original become CELLS of the dual (one dual
 * cell per original vertex, its own vertices being the centroids of
 * every original CELL incident to that vertex), and EDGES of the
 * original become the dual's own cell-ADJACENCY (two dual cells are
 * adjacent exactly when the corresponding original vertices are
 * edge-connected) -- exactly the relationship independently verified by
 * hand this session for 120-cell <-> 600-cell (dodecahedral cells dual
 * to binary-icosahedral quaternions), now implemented generically off
 * of whatever FourDCellComplex buildCellComplex() produces, for any
 * seed. Checked in scripts/verify-radial-projection.ts against the
 * already-known 600-cell combinatorics (120 cells, all regular
 * tetrahedra, degree 4, matching V=120,E=720,F=1200,C=600).
 *
 * Verification-only since 2026-09-24: the app builds the 600-cell
 * directly by reflection (SIX_HUNDRED_CELL_THETA_DEG), and
 * scripts/verify-radial-projection.ts checks that dualizing the 120-cell
 * gives the same polytope -- two independent routes to one answer.
 */
export declare function dualize(complex: FourDCellComplex): DualCellComplex;
