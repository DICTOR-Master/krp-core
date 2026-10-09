/** The Kagome hulls (DISCOVERIES #17, DICTO 2026-10-09): see kagomeHulls.js. */
export interface KagomeHull { name: string; hull: string; neighbours: number; isAnchor(a: number[]): boolean }
export declare const KAGOME_HULLS: Record<string, KagomeHull>;
export declare const KAGOME_HULL_IDS: string[];
export declare function kagomeHullSolids(): Promise<Record<string, any>>;
export declare function hullCells(data: Record<string, any>, id: string, a: number[]): number[][];
