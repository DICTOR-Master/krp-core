import type { Assembly } from './assembly.js';
export declare const isGoldenBuild: (a: Assembly) => boolean;
export interface GoldenStatus {
    total: number;
    inTiling: number;
}
export declare function goldenStatus(a: Assembly): GoldenStatus | null;
export declare function withNextSafePiece(a: Assembly): Assembly | null;
