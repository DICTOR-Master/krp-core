/** The space-filling pairs' honeycombs as neighbour rules: see honeycombs.js. */
import type { HintRule } from './hints.js';
export declare const HONEYCOMBS: Record<string, () => { shape: string; vertices: [number, number, number][] }[]>;
export declare function matchPose(spec: { vertices: [number, number, number][] }, cellVertices: [number, number, number][]): { position: [number, number, number]; quaternion: [number, number, number, number] } | null;
export declare function honeycombRules(name: string, specs: Record<string, unknown>): Record<string, HintRule[]>;
