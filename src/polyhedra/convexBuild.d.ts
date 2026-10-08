/**
 * Small helpers for the few shapes whose corners are computed rather than
 * written out (the Penrose rhombus prisms, the rhombic icosahedron):
 * centre a convex solid on the origin, wind every face anticlockwise seen
 * from outside (the registry's convention), and read the edges off the
 * faces.
 */
import type { Vec3 } from './core.js';
export declare function centred(vertices: Vec3[]): Vec3[];
/** Faces (each a cycle of corner indices, either way round) wound outward,
 *  for a convex solid centred on the origin. A face that needs turning
 *  keeps its first corner (face attach lines faces up from it; golden
 *  rhombi start at an acute corner). */
export declare function outward(vertices: Vec3[], faces: number[][]): number[][];
export declare function edgesOf(faces: number[][]): [number, number][];
/** A zonohedron: every face spans the generators in one plane and sits
 *  where the others push it (each generator counted +-1/2 by which side of
 *  the face plane it points). Two generators make a rhombus; three or more
 *  in one plane make a hexagon (or larger zonogon), started at its
 *  sharpest corner so face attach lines it up from a mirror line. */
export declare function zonohedron(gens: Vec3[]): {
  vertices: Vec3[];
  faces: number[][];
};
