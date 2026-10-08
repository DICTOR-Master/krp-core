/**
 * The assembly graph — Stage 6's real data structure. Built directly from
 * user actions (placeRoot / confirmAttach in ShapeViewer.tsx), never
 * inferred by walking the Three.js scene. The scene is a rendering of this
 * graph, not the other way around.
 */
export interface AssemblyNode {
    id: string;
    shape: string;
    transform: {
        position: [number, number, number];
        quaternion: [number, number, number, number];
    };
    rcpPolytope?: {
        seedSpecId: string;
        target: string;
        view3D?: boolean;
    };
    color?: string;
}
export interface AssemblyConnection {
    nodeA: string;
    vertexA: number;
    nodeB: string;
    vertexB: number;
    kind?: 'vertex' | 'face' | 'duoprism' | 'rcp4d';
    orphaned?: boolean;
    duoprismExtraFaces?: number[];
    cellId?: number;
    shell?: number;
}
export interface Assembly {
    nodes: AssemblyNode[];
    connections: AssemblyConnection[];
}
export declare function emptyAssembly(): Assembly;
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
export declare const ASSEMBLY_STORAGE_KEY = "polyhedraverse:assembly";
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
export declare function migrateLegacyRcp4d(v: unknown): unknown;
/**
 * Every load-time migration, in order -- what loading code should call
 * (then isValidAssembly as usual). migrateLegacyRcp4d, then the retired
 * 4D fold (2026-09-25): a face connection's `fold4: true` flag is simply
 * dropped. That's exact, not approximate -- a fold only ever rotated the
 * child's inner group by angle x slider, and the node's own stored pose
 * was always the ordinary flush face-attach pose (slider at 0%).
 */
export declare function migrateLegacyAssembly(v: unknown): unknown;
/** Structural validation for untrusted input (the API route body, a fetch response). */
export declare function isAssembly(v: unknown): v is Assembly;
/**
 * Beyond structural shape: every node's `shape` must be a real polyhedron id
 * (any family — see krp-core/src/polyhedra/index.js) and every connection must
 * reference node ids and vertex indices that actually exist. Guards the
 * renderer against a corrupted or hand-edited save file crashing on load.
 */
export declare function isValidAssembly(v: unknown): v is Assembly;
