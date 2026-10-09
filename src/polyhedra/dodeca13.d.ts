/** The DICTO Dodeca-13 family (DICTO, 2026-10-09): see dodeca13.js. */
import type { PolyhedronSpec } from './core.js';
export interface Dodeca13Part { role: 'dodeca' | 'centre' | 'wedge' | 'needle' | 'star' | 'unit'; vertices: [number, number, number][]; faces: number[][] }
export declare const DODECA13_ADDITIONS: Record<string, PolyhedronSpec>;
export declare const DODECA13_ADDITION_IDS: string[];
export declare const DODECA13_PARTS: Record<string, Record<'pieces' | 'units' | 'stars', Dodeca13Part[]>>;
export declare const DODECA13_VOLUMES: Record<string, number>;
