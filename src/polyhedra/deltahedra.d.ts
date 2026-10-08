/**
 * deltahedra.ts — the 8 convex deltahedra (D4, D6, D8, D10, D12, D14, D16,
 * D20), unit edge length, each centered at its own centroid. Vertex/edge/face
 * data was derived from first principles and cross-checked against a 3D
 * convex-hull computation (vertex count, edge count, face count, and
 * vertex-degree sequence all match the known values for every shape).
 *
 * D12 (snub disphenoid) is the one shape that is not compass-and-straightedge
 * constructible — its coordinates depend on the positive real root of an
 * irreducible cubic, hardcoded below rather than solved at runtime.
 *
 * Call validateShape() (from ./core) in a test to re-check edge/face
 * uniformity at any time.
 */
import { type PolyhedronSpec } from './core.js';
export declare const DELTAHEDRA: Record<string, PolyhedronSpec>;
export declare const DELTAHEDRON_IDS: string[];
