import type { Vec3 } from '../core.js';
export declare const STELLATION_PIECES: Record<string, {
  solid: string;
  size: number;
  hand?: 'left' | 'right';
  baseFace: number;
  vertices: Vec3[];
  faces: number[][];
}>;
