/**
 * Exact face pieces of a Catalan solid's stellations (direct request
 * 2026-09-30: real-math stellation sizes, not decorative heights).
 *
 * Layer k of a solid's stellation diagram is every point that exactly k
 * face planes separate from the centre; the k-th stellation is layers
 * 0..k together. Cutting it along the cone from the centre through one
 * face F gives a piece whose base is exactly F: one on every face builds
 * the whole k-th stellation, the outer faces lying in real face planes
 * and the cone cuts being the seams between neighbouring pieces. For
 * k = 1 the piece is the pyramid whose sides lie in the neighbouring
 * face planes, with its apex over F's incircle centre.
 *
 * Method: start from the cone over F (above F's plane, inside a bounding
 * box), split it by every other face plane in turn, dropping any cell
 * already beyond more than k planes. What remains are cells of the plane
 * arrangement, so two kept cells either side of a plane share exactly
 * the same facet: a facet is on the piece's surface unless its mirror
 * cell (same sides, that one plane flipped) was also kept. Surface
 * facets on the same plane then merge into one polygon per region.
 */
import { type Vec3 } from '../core.js';
export interface StellationPiece {
  vertices: Vec3[];
  faces: number[][];
  baseFace: number;
}
/**
 * The piece of the k-th stellation over face `faceIndex` of a Catalan
 * solid (vertices centred on the origin). `faceVertices` are that
 * solid's own vertices, so the piece's base is exactly congruent to it.
 */
export declare function stellationPiece(solidVertices: Vec3[], solidFaces: number[][], faceIndex: number, k: number): StellationPiece;
