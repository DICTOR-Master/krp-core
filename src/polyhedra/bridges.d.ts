/**
 * 3D+ Bridges (direct decisions 2026-09-30): 3D shapes that cross a
 * dimensional boundary, each a shadow (projection), slice (section),
 * building block (cell) or corner (vertex figure) of a higher polytope.
 * Membership is mostly shapes that already live in other families; the
 * one shape new here is the rhombic icosahedron, the 5-cube's shadow.
 * Each member's bridge is described in the shape details panel
 * (i18n key `bridge.<id>`).
 */
import { type PolyhedronSpec } from './core.js';
export declare const BRIDGE_ADDITIONS: Record<string, PolyhedronSpec>;
export declare const BRIDGE_ADDITION_IDS: string[];
/**
 * Every member of 3D+ Bridges, by section (direct decision 2026-09-30: the
 * 4D-capable cells are a section here, not a family of their own). A shape
 * with several bridges sits under its main one; its details list them all.
 * - cells: the cells of the regular 4D polytopes (the tetrahedron also as
 *   the grade-2 pyramid, which has its exact angles), the square pyramid
 *   (two make each octahedral cell of the 24-cell in rhombic stacking) and
 *   the truncated octahedron (a cell of the omnitruncated 5-cell);
 * - shadows: projections of the tesseract, 24-cell, 5-cube and 6-cube, and
 *   the tiles of the 5D and 6D quasicrystals;
 * - slices: sections of a 4D polytope;
 * - corners: vertex figures.
 */
export declare const BRIDGE_SECTIONS: {
  id: 'cells' | 'shadows' | 'slices' | 'corners';
  ids: string[];
}[];
export declare const BRIDGES_3D_IDS: string[];
