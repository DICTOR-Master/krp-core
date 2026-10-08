/**
 * RVCMG v2 — Pentagon-to-U-Hex: the new universal hex interface
 * collapsed to a real regular pentagon, matching a unit-edge
 * dodecahedron face. Same 1-merge structure as v1's `pentagonToRdH.ts`.
 *
 * v1 picked one of RD's two "long" hex edges to merge, for a documented
 * reason (its two long edges were exact inversion-symmetric images of
 * each other, so either was an equally valid, non-arbitrary choice). On
 * the new hex there is no long/short distinction at all — every
 * adjacent pair is symmetric-equivalent by the hex's own full 6-fold
 * symmetry — so merging `(v3,v4)` here is a genuinely arbitrary choice
 * among 6 equally valid ones, kept only for naming consistency with the
 * v1 piece it replaces.
 */
import type { AdapterPieceResult } from './triangleToUHex.js';
export declare function derivePentagonToUHex(): AdapterPieceResult;
