/**
 * RVCMG (Reversible Vertex-Coalescence Morphing Geometry) public export
 * surface. Filled in incrementally, one stage at a time, per the RVCMG
 * implementation plan — do not export anything here before its owning
 * stage has landed and passed its own acceptance checks.
 */
export { HEMI_RD_INTERFACE, validateHemiRdInterface, hemiRdInterfaceFrame } from './hemiRdInterface.js';
export type { HemiRdInterfaceReport, PlanarFrame } from './hemiRdInterface.js';
export type { RvcmgVertex, RvcmgState, CoalescenceOp } from './types.js';
export { statesApproximatelyEqual, parseCompoundId } from './types.js';
export { coalesce } from './coalesce.js';
export { separate } from './separate.js';
export { splitVertex } from './splitVertex.js';
export type { SplitDemoResult } from './split-demos/heptagon.js';
export { deriveHeptagonBySplitting } from './split-demos/heptagon.js';
export { deriveOctagonBySplitting } from './split-demos/octagon.js';
export type { StateGraph } from './stateGraph.js';
export { createStateGraph, addState, addTransition, findPath, isComposite } from './stateGraph.js';
export { interpolate, classifyState } from './morph.js';
export type { VerifyTransitionOptions } from './verify.js';
export { verifyTransition } from './verify.js';
export type { AdapterPieceResult } from './adapters/triangleToRdH.js';
export { deriveTriangleToRdH, hemiRdStartState, RD_EDGE_LENGTH } from './adapters/triangleToRdH.js';
export { deriveSquareToRdH } from './adapters/squareToRdH.js';
export { derivePentagonToRdH } from './adapters/pentagonToRdH.js';
export { deriveGoldenRhombusToRdH, GOLDEN_RATIO_MEASURED } from './adapters/goldenRhombusToRdH.js';
export { deriveDIKiteToRdH } from './adapters/diKiteToRdH.js';
export { deriveDHKiteToRdH } from './adapters/dhKiteToRdH.js';
export { deriveRegularHexToRdH } from './adapters/regularHexToRdH.js';
export { measureKiteFace } from './adapters/kiteToRdH.js';
export type { KiteFaceMeasured, KitePieceOptions } from './adapters/kiteToRdH.js';
export { fitTargetPolygon } from './adapters/shared.js';
export type { AngleFitGroup, TargetCorner } from './adapters/shared.js';
export { assignTargetAngles } from './adapters/shared.js';
