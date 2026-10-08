/**
 * The hexagonal-prism sub-family (direct request 2026-10-06): the unbuilt
 * hexagonal-prism rows of Kaleidohedra's target table (TARGETS.md,
 * "Hexagonal prism -- sheared hexagonal"), where the table's face
 * description matches the built shape exactly (the rhombus and square
 * counts, the hexagon corner angles and the volume). Each is a zonohedron
 * of four unit edge directions (edge 1), three of them in one plane (the
 * hexagon's), so it has two hexagons and six sides, eight faces in all.
 * Numbers are Kaleidohedra's target numbers.
 *
 * Every one tiles space by translation (a zonohedron of four directions).
 * Eight rows (1, 2, 6, 7, 9, 10, 11, 12) read the table's "144/144/108"
 * hexagon as 144/144/72 instead, which is the only corner set that sums to
 * 720 degrees and matches their edges, volume and counts. Those eight are
 * tentative until Kaleidohedra's table is corrected; see TARGETS.md,
 * "Hexagonal prism -- non-builds".
 */
import { type PolyhedronSpec } from '../../core.js';
export declare const HEX_TARGET_ADDITIONS: Record<string, PolyhedronSpec>;
export declare const HEX_TARGET_ADDITION_IDS: string[];
