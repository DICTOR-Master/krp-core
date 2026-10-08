/**
 * Nets (direct request 2026-09-30; built 2026-10-08): any shape's faces
 * unfolded flat, edge to edge, and folded back up. Ported from Rhombiverse's
 * src/geometry-extensions/nets.js and made general: it takes a shape's own
 * outward-wound faces (so non-convex shapes fold correctly too) and searches
 * spanning trees of the face graph for a flat net with no two faces
 * overlapping. Pure maths, no THREE (scripts/verify-nets.ts).
 *
 * A net is a tree over the faces: each face but the first hangs from a
 * parent face on a shared edge, its hinge. Folding by t (0 flat, 1 closed)
 * turns each face about its hinge by (1 - t) of its unfold angle, on top of
 * its parent's own turn; the first face lies flat throughout.
 */
import type { Vec3 } from '../polyhedra/core.js';
export type Mat4 = number[];
export declare function mul(A: Mat4, B: Mat4): Mat4;
export declare const apply: (M: Mat4, p: Vec3) => Vec3;
interface Face {
  pts: Vec3[];
  keys: number[];
}
interface TreeNode {
  parent: number;
  a?: Vec3;
  d?: Vec3;
  angle?: number;
  hinge?: string;
}
interface Tree {
  nodes: TreeNode[];
  order: number[];
}
type P2 = [number, number];
/** Fan triangles of a simple polygon by ear clipping (works for concave faces too). */
export declare function triangulate(P: P2[]): [number, number, number][];
export declare function polygonsOverlap(A: P2[], B: P2[], tA?: [number, number, number][], tB?: [number, number, number][]): boolean;
export interface Net {
  faces: Face[];
  tree: Tree;
  /** Each face's corners on the page at t = 0 (x, y), in the shape's own units. */
  flat: P2[][];
  /** Per-face transforms at fold t (0 flat, 1 closed). */
  at: (t: number) => Mat4[];
  /**
     * The cut edges, paired: each pair is the same solid edge seen from its two
     * faces, which meet when folded. { label, sides: [{ face, j }, { face, j }] }
     * where side j runs from corner j to corner j + 1 of that face.
     */
  pairs: {
    label: number;
    sides: {
      face: number;
      j: number;
    }[];
  }[];
  /** Hinges (fold lines), as { face, j } on the child face. */
  hinges: {
    face: number;
    j: number;
  }[];
}
/**
 * Why a shape has no net, or null if it can have one: the surface must be
 * closed (every edge on exactly two faces), with flat faces.
 */
export declare function netProblem(vertices: Vec3[], faceIdx: number[][]): string | null;
/**
 * A shape's net: the first spanning tree found whose faces lie flat with no
 * two overlapping, preferring the most compact among the plain trees; or
 * null if none is found. Faces must be outward-wound.
 */
export declare function netOf(vertices: Vec3[], faceIdx: number[][], maxSeeds?: number): Net | null;
export {};
