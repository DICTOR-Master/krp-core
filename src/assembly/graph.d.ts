/**
 * Stage 8 — pure graph-logic helpers over the assembly graph. No geometry,
 * no Three.js: these operate only on node ids and connection endpoints, so
 * they're independently testable (see scripts/verify-graph.ts) and reusable
 * regardless of how the graph ends up rendered.
 */
import type { Assembly, AssemblyConnection } from './assembly.js';
/**
 * Every connection is created by confirmAttach() as (existing node -> new
 * node), i.e. nodeA is always the parent, nodeB the child — so the graph the
 * app can currently build is always a rooted tree/forest. Returns the given
 * node plus every node reachable by following nodeA -> nodeB edges
 * (its full subtree, itself included).
 */
export declare function collectSubtree(connections: AssemblyConnection[], rootId: string): Set<string>;
/** The one connection where `nodeId` is the child (nodeB) — undefined for the root. */
export declare function findParentConnection(connections: AssemblyConnection[], nodeId: string): AssemblyConnection | undefined;
/**
 * True if the assembly's connections, treated as undirected edges between
 * nodeA and nodeB, contain a cycle (the graph is not a forest) — a "closed
 * cage" in construction-kit terms. Standard union-find over connections.
 *
 * Currently unreachable through this app's own UI: every attach spawns a
 * brand-new node (confirmAttach never links two already-placed nodes), so
 * the graph this app can build today is always a tree, and this will always
 * return false on it. Implemented and unit-tested now (scripts/verify-graph.ts,
 * hand-built cyclic and acyclic graphs) so a future "connect two existing
 * free vertices" interaction has a correct, ready primitive rather than a
 * placeholder — noted honestly rather than left undocumented.
 */
export declare function hasCycle(assembly: Assembly): boolean;
