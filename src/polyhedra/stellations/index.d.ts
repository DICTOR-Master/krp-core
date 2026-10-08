/**
 * The Stellations family (direct decisions 2026-09-30): face-attach
 * pieces that stellate the Platonic and Catalan solids, each made to sit
 * on one face (see build.ts for the sizes). Only the base attaches: the
 * other faces are stellation surfaces or the seams between neighbouring
 * pieces. A solid gets only the stellations it really has (the
 * tetrahedron and cube none, just the flat piece; the octahedron one).
 * The two scalene-faced Catalans (the disdyakis solids) have mirror-image
 * faces, so their pieces come left- and right-handed.
 *
 * The geometry is generated once (scripts/generate-stellations.ts)
 * rather than solved on every page load.
 */
import { type PolyhedronSpec } from '../core.js';
/** The display name of a stellated solid: its Platonic name, or its registry name. */
export declare function stellatedSolidName(solid: string): string;
/** The named solid that one piece on every face builds, if it has a name. */
export declare function stellationBuilds(id: string): string | undefined;
export declare const STELLATION_ADDITIONS: Record<string, PolyhedronSpec>;
export declare const STELLATION_IDS: string[];
/** The stellated solid, size and (for scalene faces) hand of a stellation piece. */
export declare function stellationInfo(id: string): {
  solid: string;
  size: number;
  hand?: 'left' | 'right';
} | undefined;
