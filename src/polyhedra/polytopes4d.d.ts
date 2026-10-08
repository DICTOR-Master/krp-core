/**
 * The 4D Polytopes family (direct decisions 2026-09-30): the six convex
 * regular 4-polytopes themselves, each built by RCP-C2B from its seed
 * cell. Named by cell count with the common name alongside, grouped by
 * symmetry: A4 (5-cell), B4 (8-cell and 16-cell, duals), F4 (24-cell,
 * self-dual), H4 (120-cell and 600-cell, duals). They aren't 3D shapes,
 * so they are not registry entries: a card stands for a seed and target.
 */
import { type Vec3 } from './core.js';
export type Symmetry4D = 'A4' | 'B4' | 'F4' | 'H4';
export interface Polytope4D {
  id: string;
  /** e.g. '8-cell' */
  name: string;
  /** e.g. 'tesseract' */
  common?: string;
  schlafli: string;
  cells: number;
  /** The seed cell's shape id: every cell of the polytope is this shape. */
  seed: string;
  /** The RCP target (a closure name of the seed). */
  target: string;
  /** A second RCP route, when there is one (the 600-cell from a vertex). */
  vertexFirstTarget?: string;
  symmetry: Symmetry4D;
  /** The dual polytope's id (itself for the self-dual ones). */
  dual: string;
}
export declare const POLYTOPES_4D: Polytope4D[];
export declare const POLYTOPE_4D_IDS: string[];
export declare const SYMMETRIES_4D: Symmetry4D[];
export declare function polytope4D(id: string): Polytope4D | undefined;
/** The card and details title: '8-cell (tesseract)'. */
export declare function polytopeTitle(p: Polytope4D): string;
/**
 * The finished polytope as a 3D wireframe: every cell's edges under the
 * same perspective projection View 4D shows, with shared corners and
 * edges merged.
 */
export declare function polytopeWireframe(id: string): {
  vertices: Vec3[];
  edges: [number, number][];
};
