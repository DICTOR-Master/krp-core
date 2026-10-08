/**
 * Composite-Seed RCP investigation, Stage 5 — the tetrahedral
 * experiment (hypothesis.md §13, explicitly "fully open, remain
 * explicitly preliminary"). Computes the full angular spectrum of
 * `S_tet(L)`'s exposed RD facet normals against the 4 target ⟨111⟩
 * directions, classified into exactly one of hypothesis.md §13's three
 * stated possibilities -- NOT assumed to match the cube/octahedron
 * pattern going in, per the plan's own Stage 5 acceptance criterion.
 * Also runs the Stage 2 positional-residual test for this selection,
 * since the hypothesis doc leaves that untested for the tetrahedral
 * case too.
 */
export type SpectrumClassification = 'single-constant-angle' | 'several-discrete-classes' | 'complex-distribution';
export interface TetrahedralResult {
  L: number;
  /** Positional residual (Stage 2's test, applied here) -- per boundary class. */
  positional: {
    name: string;
    count: number;
    epsPos: number;
    exact: boolean;
  }[];
  maxEpsPos: number;
  /** Every distinct angle (rounded to EXACT_TOL_DEG) found across ALL 4 classes' own exposed facet normals, with how many facets land at each -- the raw evidence for the classification below. */
  distinctAngles: {
    angleDeg: number;
    count: number;
  }[];
  classification: SpectrumClassification;
}
export declare function tetrahedralExperimentAtL(L: number): TetrahedralResult;
export declare function sweepTetrahedralExperiment(maxL: number): TetrahedralResult[];
