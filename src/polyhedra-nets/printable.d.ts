/**
 * A printable net (direct decisions 2026-10-08): an A4 PDF, the net scaled
 * to fit, cut lines solid, fold lines dashed, each glued pair of edges
 * numbered alike on both sides, and optional glue tabs, one per glued pair.
 * Written as a small vector PDF by hand (lines, fills and Helvetica text),
 * so no PDF library is needed.
 */
import { type Net } from './unfold.js';
type P2 = [number, number];
export interface PrintableOptions {
  title: string;
  tabs: boolean;
  credit?: string;
}
/** The net laid out on the page: polygons in points, plus its pieces. */
export declare function layoutNet(net: Net, tabs: boolean): {
  page: P2[][];
  side: (f: number, j: number) => [P2, P2];
  tabs: P2[][];
  edgeMm: number;
  ccw: boolean;
};
export declare function printableNetPdf(net: Net, opts: PrintableOptions): Uint8Array<ArrayBuffer>;
export {};
