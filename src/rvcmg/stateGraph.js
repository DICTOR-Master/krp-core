/**
 * RVCMG's state graph (spec §10, §19): states are nodes, named
 * transitions are UNDIRECTED edges — never a `3->4->5->6` ladder assumed
 * from vertex count. Same-vertex-count transitions
 * (`S_6^(a) <-> S_6^(b)`) and skip-transitions (`5 <-> 3` without
 * visiting 4) are first-class edges here, not derived shortcuts; whether
 * a claimed skip edge is actually EQUIVALENT to some composite path
 * through it is a separate question this module doesn't answer (spec
 * §25.7 — see verify.ts, Stage 7).
 */
export function createStateGraph() {
  return { states: new Map(), edges: [] };
}
export function addState(graph, state) {
  graph.states.set(state.id, state);
}
/**
 * Registers `op` AND its inverse (spec §19: "the state graph is
 * undirected at the level of valid state connectivity") — a caller only
 * ever needs to add the forward direction once. The synthesized reverse
 * edge carries the same descriptive fields (coalescedPair/targetPos/
 * path/deformation) as bookkeeping metadata with fromStateId/toStateId
 * swapped; it is NOT a re-derived geometric inverse (that's separate()'s
 * job, Stage 4, given the real states involved) — this stage is graph
 * topology only. Idempotent: adding the same op twice, or both an op
 * and its already-registered inverse, doesn't duplicate edges.
 */
export function addTransition(graph, op) {
  if (!graph.edges.some((e) => e.id === op.id))
    graph.edges.push(op);
  if (!graph.edges.some((e) => e.id === op.inverse)) {
    graph.edges.push({
      ...op,
      id: op.inverse,
      fromStateId: op.toStateId,
      toStateId: op.fromStateId,
      inverse: op.id,
    });
  }
}
/** BFS shortest path (by edge count) from `fromId` to `toId`, or `null` if disconnected. Empty array if `fromId === toId`. */
export function findPath(graph, fromId, toId) {
  if (fromId === toId)
    return [];
  const visited = new Set([fromId]);
  const queue = [{ stateId: fromId, path: [] }];
  while (queue.length > 0) {
    const { stateId, path } = queue.shift();
    for (const edge of graph.edges) {
      if (edge.fromStateId !== stateId || visited.has(edge.toStateId))
        continue;
      const newPath = [...path, edge];
      if (edge.toStateId === toId)
        return newPath;
      visited.add(edge.toStateId);
      queue.push({ stateId: edge.toStateId, path: newPath });
    }
  }
  return null;
}
export function isComposite(path) {
  return path.length > 1;
}
