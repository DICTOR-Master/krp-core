/**
 * RVCMG v2 — shared derivation for the two kite adapter pieces
 * (DI-Kite-to-U-Hex, DH-Kite-to-U-Hex): direct port of `kiteToRdH.ts`
 * onto the new universal hex interface. Structurally unchanged — the
 * kite pieces already used `fitTargetPolygon` (no radius-asymmetry
 * heuristic to drop, unlike the rhombus pieces), so this is a pure
 * source-hex swap.
 */
import type { AdapterPieceResult } from './triangleToUHex.js';
export interface KiteFaceMeasured {
  edgeShort: number;
  edgeLong: number;
  corners: {
    r: number;
    theta: number;
  }[];
}
/** Identical to `kiteToRdH.ts`'s own `measureKiteFace` — not duplicated logic drift, just re-declared here since v1's adapters/ files are being kept as an archived, standalone set (see project memory on the archive plan). */
export declare function measureKiteFace(catalanId: string): KiteFaceMeasured;
export interface KitePieceOptions {
  catalanId: string;
  pieceName: string;
}
export declare function deriveKiteToUHex({ catalanId, pieceName }: KitePieceOptions): AdapterPieceResult;
