/** The DICTO Hexa family (DICTO, 2026-10-09): see hexa.js. */
import type { PolyhedronSpec } from './core.js';
export interface HexaPart { role: 'jewel' | 'trimmed' | 'cube' | 'roof' | 'stella' | 'hexa' | 'key' | 'shared'; vertices: [number, number, number][]; faces: number[][] }
export declare const HEXA_ADDITIONS: Record<string, PolyhedronSpec>;
export declare const HEXA_ADDITION_IDS: string[];
export declare const HEXA_PARTS: Record<string, Record<string, HexaPart[]>>;
export declare const HEXA_VOLUMES: Record<string, number>;
