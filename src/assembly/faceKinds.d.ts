/**
 * Face-kind colours (direct request 2026-10-01): the Kaleidohedra-verified
 * parallelohedra and the four new members of the regular nine show each kind of face in its own colour, the same
 * everywhere -- on their cards and when placed -- so squares, rhombi and
 * hexagons read at a glance. One colour per polygon kind; every rhombus
 * angle shares the rhombus colour.
 */
import type { PolyhedronSpec } from '../polyhedra/core.js';
export type FaceKind = 'triangle' | 'square' | 'rhombus' | 'regularHexagon' | 'hexagon' | 'other';
export declare const FACE_KIND_COLORS: Record<FaceKind, number>;
/** Whether a shape is drawn with face-kind colours instead of its piece colour. */
export declare const usesFaceKindColors: (specId: string) => boolean;
type V3 = readonly [number, number, number] | number[];
/** A face's kind from its corners (all faces here are convex). */
export declare function faceKind(vertices: readonly V3[], face: readonly number[]): FaceKind;
/** CSS colour string for a face kind. */
export declare const faceKindCss: (kind: FaceKind) => string;
/** Per-face colours for a spec, as numbers. */
export declare const faceKindColorsOf: (spec: Pick<PolyhedronSpec, "vertices" | "faces">) => number[];
export {};
