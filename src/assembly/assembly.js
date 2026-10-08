/**
 * The assembly graph — Stage 6's real data structure. Built directly from
 * user actions (placeRoot / confirmAttach in ShapeViewer.tsx), never
 * inferred by walking the Three.js scene. The scene is a rendering of this
 * graph, not the other way around.
 */
import { POLYHEDRA } from '../polyhedra/index.js';
import { FOURD_CAPABLE_IDS } from '../polyhedra/fourD.js';
import { FOUR_D_SHAPE_PARAMS, resolveParamsKey } from '../polyhedra/radialProjection.js';
import { parseRcpTarget, rcpTargetOptions } from '../polyhedra/rcpBuild.js';
export function emptyAssembly() {
    return { nodes: [], connections: [] };
}
/**
 * Save/load persists to the browser's own localStorage, not a server API.
 * `/api/assemblies` (a local-JSON-file route) was removed 2026-09-16: it
 * worked in local dev but Vercel's production serverless functions have a
 * read-only filesystem outside `/tmp` — every POST there 500'd in
 * production, confirmed live (`docs/vercel-deployment-plan.md`'s own
 * "Known live issue" section). Real server-side storage (Vercel KV/Blob)
 * remains the eventual fix for cross-device sync, but is out of scope for
 * now — direct user decision, given it needs Vercel dashboard provisioning
 * this session couldn't do (MCP access was blocked). localStorage means a
 * saved assembly is tied to one browser, which matches this app's actual
 * single-user, single-device usage today.
 */
export const ASSEMBLY_STORAGE_KEY = 'polyhedraverse:assembly';
/**
 * Rewrites two pre-rename spellings (the feature was called "RPC-build"
 * before being renamed RCP-C2B) to today's, in place, on raw parsed
 * JSON — BEFORE `isValidAssembly` ever sees it, since that guard only
 * recognizes the current names and would otherwise either reject an
 * already-saved assembly outright (the `'rpc4d'` connection kind) or
 * silently drop its root's own build state (a node's `rpcPolytope`
 * field, now `rcpPolytope`, is just an unrecognized extra property to
 * every check here, not a validation failure — so without this it would
 * load as a plain, no-longer-a-build-root node instead of erroring).
 * Deliberately permissive about the shape of `v` (only ever called on
 * freshly `JSON.parse`d data of unknown shape) — anything not shaped
 * like `{ nodes: [...], connections: [...] }` is returned untouched, and
 * isValidAssembly is still the real authority on whether the result is
 * actually valid.
 */
export function migrateLegacyRcp4d(v) {
    if (typeof v !== 'object' || v === null)
        return v;
    const out = { ...v };
    if (Array.isArray(out.connections)) {
        out.connections = out.connections.map((c) => typeof c === 'object' && c !== null && c.kind === 'rpc4d' ? { ...c, kind: 'rcp4d' } : c);
    }
    if (Array.isArray(out.nodes)) {
        out.nodes = out.nodes.map((n) => {
            if (typeof n !== 'object' || n === null || !('rpcPolytope' in n))
                return n;
            const { rpcPolytope, ...rest } = n;
            return { ...rest, rcpPolytope: rpcPolytope };
        });
    }
    return out;
}
/**
 * Every load-time migration, in order -- what loading code should call
 * (then isValidAssembly as usual). migrateLegacyRcp4d, then the retired
 * 4D fold (2026-09-25): a face connection's `fold4: true` flag is simply
 * dropped. That's exact, not approximate -- a fold only ever rotated the
 * child's inner group by angle x slider, and the node's own stored pose
 * was always the ordinary flush face-attach pose (slider at 0%).
 */
export function migrateLegacyAssembly(v) {
    const out = migrateLegacyRcp4d(v);
    if (typeof out !== 'object' || out === null)
        return out;
    const o = out;
    if (Array.isArray(o.connections)) {
        o.connections = o.connections.map((c) => {
            if (typeof c !== 'object' || c === null || !('fold4' in c))
                return c;
            const { fold4: _dropped, ...rest } = c;
            void _dropped;
            return rest;
        });
    }
    return o;
}
function isVec3(v) {
    return Array.isArray(v) && v.length === 3 && v.every((n) => typeof n === 'number' && Number.isFinite(n));
}
function isQuat(v) {
    return Array.isArray(v) && v.length === 4 && v.every((n) => typeof n === 'number' && Number.isFinite(n));
}
function isNode(v) {
    if (typeof v !== 'object' || v === null)
        return false;
    const n = v;
    if (typeof n.id !== 'string' || typeof n.shape !== 'string')
        return false;
    if (typeof n.transform !== 'object' || n.transform === null)
        return false;
    const t = n.transform;
    if (!isVec3(t.position) || !isQuat(t.quaternion))
        return false;
    if (n.rcpPolytope !== undefined) {
        if (typeof n.rcpPolytope !== 'object' || n.rcpPolytope === null)
            return false;
        const rp = n.rcpPolytope;
        if (typeof rp.seedSpecId !== 'string' || typeof rp.target !== 'string')
            return false;
        if (rp.view3D !== undefined && typeof rp.view3D !== 'boolean')
            return false;
    }
    if (n.color !== undefined && typeof n.color !== 'string')
        return false;
    return true;
}
function isConnection(v) {
    if (typeof v !== 'object' || v === null)
        return false;
    const c = v;
    if (typeof c.nodeA !== 'string' ||
        typeof c.nodeB !== 'string' ||
        typeof c.vertexA !== 'number' ||
        typeof c.vertexB !== 'number') {
        return false;
    }
    if (c.kind !== undefined && c.kind !== 'vertex' && c.kind !== 'face' && c.kind !== 'duoprism' && c.kind !== 'rcp4d')
        return false;
    if (c.orphaned !== undefined && typeof c.orphaned !== 'boolean')
        return false;
    if (c.duoprismExtraFaces !== undefined) {
        if (c.kind !== 'duoprism')
            return false;
        if (!Array.isArray(c.duoprismExtraFaces) || !c.duoprismExtraFaces.every((f) => typeof f === 'number' && Number.isInteger(f) && f >= 0))
            return false;
    }
    if (c.cellId !== undefined || c.shell !== undefined) {
        if (c.kind !== 'rcp4d')
            return false;
        if (typeof c.cellId !== 'number' || !Number.isInteger(c.cellId) || c.cellId < 0)
            return false;
        if (typeof c.shell !== 'number' || !Number.isInteger(c.shell) || c.shell < 0)
            return false;
    }
    else if (c.kind === 'rcp4d') {
        return false; // rcp4d always carries cellId + shell
    }
    return true;
}
/** Structural validation for untrusted input (the API route body, a fetch response). */
export function isAssembly(v) {
    if (typeof v !== 'object' || v === null)
        return false;
    const a = v;
    return Array.isArray(a.nodes) && Array.isArray(a.connections) && a.nodes.every(isNode) && a.connections.every(isConnection);
}
/**
 * Beyond structural shape: every node's `shape` must be a real polyhedron id
 * (any family — see krp-core/src/polyhedra/index.js) and every connection must
 * reference node ids and vertex indices that actually exist. Guards the
 * renderer against a corrupted or hand-edited save file crashing on load.
 */
export function isValidAssembly(v) {
    if (!isAssembly(v))
        return false;
    const nodeById = new Map(v.nodes.map((n) => [n.id, n]));
    if (nodeById.size !== v.nodes.length)
        return false; // duplicate ids
    for (const node of v.nodes) {
        if (!(node.shape in POLYHEDRA))
            return false;
    }
    for (const conn of v.connections) {
        const a = nodeById.get(conn.nodeA);
        const b = nodeById.get(conn.nodeB);
        if (!a || !b)
            return false;
        // Orphaned connections keep a deliberately stale vertex index (see
        // AssemblyConnection.orphaned) — only the node references matter for them.
        if (conn.orphaned)
            continue;
        const isFaceLike = conn.kind === 'face' || conn.kind === 'duoprism';
        const countA = isFaceLike ? POLYHEDRA[a.shape].faces.length : POLYHEDRA[a.shape].vertices.length;
        const countB = isFaceLike ? POLYHEDRA[b.shape].faces.length : POLYHEDRA[b.shape].vertices.length;
        if (conn.vertexA < 0 || conn.vertexA >= countA)
            return false;
        if (conn.vertexB < 0 || conn.vertexB >= countB)
            return false;
        // Duoprism: self-attach only, FOURD-
        // capable shapes only — see duoprism.ts's own header comment for why
        // it's still gated to these 4 even though the geometry itself would
        // work for any shape: a deliberate scope match with the other 4D
        // feature, not a mathematical requirement), PLUS vertexA must equal
        // vertexB — a duoprism's far node is a translated copy of the near
        // one, so there's only ever one "the same face on both sides" role,
        // never two independently-chosen face indices.
        if (conn.kind === 'duoprism') {
            if (a.shape !== b.shape || !FOURD_CAPABLE_IDS.includes(a.shape) || conn.vertexA !== conn.vertexB)
                return false;
            const faceCount = POLYHEDRA[a.shape].faces.length;
            const extras = conn.duoprismExtraFaces ?? [];
            const allFaces = [conn.vertexA, ...extras];
            const uniqueFaces = new Set(allFaces);
            if (uniqueFaces.size !== allFaces.length)
                return false; // no duplicate/repeated face indices
            if (extras.some((f) => f < 0 || f >= faceCount))
                return false;
        }
        // RCP-C2B: nodeA must be a real root (rcpPolytope set, pointing at
        // a real closure of a real seed), cellId must be a real cell of that
        // closure, and nodeB's own shape must match the root's own seed.
        // Saves from before 2026-09-24 stored every 600-cell child as 'D4'
        // (the 600-cell was then built by dualizing the 120-cell, whose
        // cells were always labelled 'D4'), so that label stays valid there.
        if (conn.kind === 'rcp4d') {
            const rp = a.rcpPolytope;
            if (!rp || !(rp.seedSpecId in POLYHEDRA))
                return false;
            const cellCount = closureCellCount(rp.seedSpecId, rp.target);
            if (cellCount === undefined)
                return false;
            if (conn.cellId === undefined || conn.cellId < 0 || conn.cellId >= cellCount)
                return false;
            const legacy600CellChild = rp.target === '600-cell' && b.shape === 'D4';
            if (b.shape !== rp.seedSpecId && !legacy600CellChild)
                return false;
        }
    }
    // No duplicate cellId under the same rcp4d root.
    const cellIdsByRoot = new Map();
    for (const conn of v.connections) {
        if (conn.orphaned || conn.kind !== 'rcp4d' || conn.cellId === undefined)
            continue;
        const seen = cellIdsByRoot.get(conn.nodeA) ?? new Set();
        if (seen.has(conn.cellId))
            return false;
        seen.add(conn.cellId);
        cellIdsByRoot.set(conn.nodeA, seen);
    }
    return true;
}
/** The real cell count of `target` (one of an rcp4d root's real closures for `seedSpecId`), or undefined if it's not a real closure of that seed. Reuses radialProjection.ts's own resolveParamsKey (the exact congruence check buildCellComplex itself uses, e.g. for PYRAMID_TRI_G2 resolving to D4's params) rather than duplicating it. */
function closureCellCount(seedSpecId, target) {
    const seed = POLYHEDRA[seedSpecId];
    if (!seed)
        return undefined;
    const key = resolveParamsKey(seed);
    if (!key)
        return undefined;
    const closureNames = FOUR_D_SHAPE_PARAMS[key].map((o) => o.name);
    if (!rcpTargetOptions(closureNames).includes(target))
        return undefined;
    const { closure } = parseRcpTarget(target);
    return FOUR_D_SHAPE_PARAMS[key].find((o) => o.name === closure)?.cellCount;
}
