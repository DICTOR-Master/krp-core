/** Whether two placed solids pass through each other: see overlap.js. */
export interface PlacedSolid { vertices: [number, number, number][]; faces: number[][] }
export declare function placeVertices(vertices: [number, number, number][], position: [number, number, number], quaternion: [number, number, number, number]): [number, number, number][];
export declare function solidsOverlap(a: PlacedSolid, b: PlacedSolid, margin?: number): boolean;
export interface SampledSolid extends PlacedSolid { samples: [number, number, number][] }
export declare function placedSolid(spec: PlacedSolid, position?: [number, number, number], quaternion?: [number, number, number, number], margin?: number): SampledSolid;
