/**
 * RCP-C2B (Radial Cell Projection, click-to-build) — Stage 8's bridge from
 * the pure 4D engine (radialProjection.ts) to real, placeable
 * ShapeViewer.tsx nodes. See docs/radial-cell-projection.md section 21
 * and the approved plan for the full derivation of the 6 verified
 * closures this operates over.
 *
 * Beyond cell 0 (the seed itself, placed as an ordinary rigid copy of
 * the real registry shape), every cell's own 3D shadow is a genuine
 * perspective-warped, non-regular copy of the seed — not a rigid
 * transform of it. This is mathematically correct and already true of
 * the passive RadialProjectionViewer.tsx; a "synthetic" PolyhedronSpec
 * (real edges/faces/connectors topology, warped vertex positions) is
 * how that gets turned into something buildPlacedShape() can place as
 * an ordinary node without needing to know it's not a registry shape.
 */
import type { PolyhedronSpec, Vec3 } from './core.js';
export interface RcpComplex {
  seedSpecId: string;
  targetName: string;
  viewDistance: number;
  cells: {
    id: number;
    shell: number;
    vertices3D: Vec3[];
    coordPoint3D: Vec3;
    openVertices3D?: Vec3[];
  }[];
  adjacency: [number, number][];
  cell0IsSeed: boolean;
  openGaps?: {
    cells: [number, number];
    faceA: Vec3[];
    faceB: Vec3[];
  }[];
}
export declare const VERTEX_FIRST_SUFFIX = " (vertex-first)";
/** Splits an RCP target name into its closure (a FOUR_D_SHAPE_PARAMS name) and whether it's the vertex-first variant. */
export declare function parseRcpTarget(target: string): {
  closure: string;
  vertexFirst: boolean;
};
/** Every buildable target for a seed with these closures: each closure, followed by its vertex-first variant where one exists. */
export declare function rcpTargetOptions(closureNames: string[]): string[];
/**
 * The one entry point the UI/render layer needs: given a real seed id
 * and a target closure name (e.g. 'D4' + '16-cell'), returns every
 * cell's projected 3D vertices in one shared
 * perspective frame plus the shell/adjacency bookkeeping the shell-build
 * feature needs.
 */
export declare function buildRcpComplex(seedSpecId: string, targetName: string): RcpComplex;
/** The root's own spec for the given view: the registry seed, except a Closed vertex-first root, which shows cell 0's projected (skewed) shape. */
export declare function rootSpecForView(complex: RcpComplex, view3D: boolean): PolyhedronSpec;
/**
 * Builds a synthetic, non-registry PolyhedronSpec for one cell's own
 * warped geometry: `edges`/`faces` are pure index topology (unaffected
 * by projection) and are copied from the seed spec unchanged; `vertices`
 * are this cell's own projected positions; `connectors` CANNOT be copied
 * from the seed (Connector.pos equals the vertex's own position, which
 * has changed) and are rebuilt via buildConnectors against the new
 * positions instead. Never registered in POLYHEDRA — constructed fresh
 * whenever a cell needs to be placed or re-derived on load.
 *
 * Mirrored cells: every 4D reflection flips handedness, so roughly half
 * of any complex's cells project as mirror images of the seed, and the
 * seed's face winding then points INTO them -- they rendered inside-out
 * under Solid view's FrontSide material (found 2026-09-24: 294 of the
 * 600-cell's 600 cells, 11 of the 16-cell's 16). The vertex positions are
 * right; only the winding is wrong, so such a cell gets every face
 * reversed (same faces, same indices, opposite orientation).
 */
export declare function buildSyntheticCellSpec(seedSpec: PolyhedronSpec, cellId: number, vertices: Vec3[]): PolyhedronSpec;
/**
 * Positive when `faces` are wound outward around `vertices` (the solid's
 * convention, core.ts), negative when every face points inward. Sums each
 * face's Newell normal against its offset from the solid's centroid, so
 * it's robust for any convex cell, not just triangles.
 */
export declare function windingOutwardness(vertices: Vec3[], faces: number[][]): number;
/** Every cell at exactly `shell` in `complex`. */
export declare function cellsAtShell(complex: RcpComplex, shell: number): RcpComplex['cells'];
/** The highest shell present in `complex` — the shell-build feature's own "fully closed" check is `currentMaxBuiltShell === maxShell(complex)`. */
export declare function maxShell(complex: RcpComplex): number;
