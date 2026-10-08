/**
 * platonic.ts — the 2 Platonic solids not already covered by the deltahedra
 * family. The tetrahedron, octahedron, and icosahedron are each *both* a
 * Platonic solid and a deltahedron (all-equilateral-triangle faces) —
 * they're D4/D8/D20 in ./deltahedra.ts and are not re-derived here.
 *
 * Cube and dodecahedron both have non-triangular regular faces (squares,
 * pentagons), so this is where PolyhedronSpec.faces first needs more than 3
 * entries per face. Both shapes were cross-checked against a true 3D
 * convex-hull computation (Python's scipy.spatial.ConvexHull, not the
 * "top-k vertices by dot product with a guessed face normal" heuristic that
 * was tried first for the dodecahedron and produced non-planar, wrong-vertex
 * faces — coplanar hull triangles were grouped by their shared plane
 * equation instead): vertex count, edge count, face count, per-vertex
 * degree, face planarity, and edge-length uniformity all verified directly.
 */
import { type PolyhedronSpec } from './core.js';
export declare const PLATONIC_ADDITIONS: Record<string, PolyhedronSpec>;
export declare const PLATONIC_ADDITION_IDS: string[];
