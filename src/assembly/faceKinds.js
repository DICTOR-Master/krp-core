import { KALEIDOHEDRA_VERIFIED, REGULAR_NINE_NEW } from '../polyhedra/families.js';
export const FACE_KIND_COLORS = {
    triangle: 0x47cc24,
    square: 0x3fa9f5,
    rhombus: 0xff5fa2,
    regularHexagon: 0xffc933,
    hexagon: 0xa77bff,
    other: 0x9aa59a,
};
/** Whether a shape is drawn with face-kind colours instead of its piece colour. */
export const usesFaceKindColors = (specId) => KALEIDOHEDRA_VERIFIED.includes(specId) || REGULAR_NINE_NEW.includes(specId);
/** A face's kind from its corners (all faces here are convex). */
export function faceKind(vertices, face) {
    const pts = face.map((i) => vertices[i]);
    const n = pts.length;
    const len = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
    const sides = pts.map((p, k) => len(p, pts[(k + 1) % n]));
    const equalSides = sides.every((s) => Math.abs(s - sides[0]) < 1e-6 * sides[0]);
    const corner = (k) => {
        const p = pts[k], a = pts[(k + n - 1) % n], b = pts[(k + 1) % n];
        const u = [a[0] - p[0], a[1] - p[1], a[2] - p[2]], v = [b[0] - p[0], b[1] - p[1], b[2] - p[2]];
        return (Math.acos((u[0] * v[0] + u[1] * v[1] + u[2] * v[2]) / (Math.hypot(u[0], u[1], u[2]) * Math.hypot(v[0], v[1], v[2]))) * 180) / Math.PI;
    };
    if (n === 3)
        return 'triangle';
    if (n === 4 && equalSides)
        return Math.abs(corner(0) - 90) < 1e-4 ? 'square' : 'rhombus';
    if (n === 6)
        return equalSides && pts.every((_, k) => Math.abs(corner(k) - 120) < 1e-4) ? 'regularHexagon' : 'hexagon';
    return 'other';
}
/** CSS colour string for a face kind. */
export const faceKindCss = (kind) => `#${FACE_KIND_COLORS[kind].toString(16).padStart(6, '0')}`;
/** Per-face colours for a spec, as numbers. */
export const faceKindColorsOf = (spec) => spec.faces.map((f) => FACE_KIND_COLORS[faceKind(spec.vertices, f)]);
