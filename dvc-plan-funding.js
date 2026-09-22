// Allocate shared contract/use-year balances across eligible stay nights.
// Residual edges allow reassignment: flexible points must not strand a
// restricted segment just because it was visited later in the itinerary.
(function () {
  function allocate(demands, supplies, canUse) {
    const sink = 1 + supplies.length + demands.length;
    const graph = Array.from({ length: sink + 1 }, () => []);
    function edge(from, to, capacity) {
      const forward = { to, capacity, original: capacity, reverse: graph[to].length };
      const backward = { to: from, capacity: 0, original: 0, reverse: graph[from].length };
      graph[from].push(forward); graph[to].push(backward);
      return forward;
    }
    const links = [];
    supplies.forEach((s, i) => {
      edge(0, i + 1, s.points);
      demands.forEach((d, j) => {
        if (canUse(s, d)) links.push({ supply: i, demand: j, edge: edge(i + 1, 1 + supplies.length + j, d.points) });
      });
    });
    const demandEdges = demands.map((d, j) => edge(1 + supplies.length + j, sink, d.points));
    let funded = 0;
    for (;;) {
      const parent = Array(graph.length).fill(null), queue = [0];
      parent[0] = {};
      for (let at = 0; at < queue.length && !parent[sink]; at++) {
        const from = queue[at];
        graph[from].forEach((e, index) => {
          if (e.capacity > 0 && !parent[e.to]) { parent[e.to] = { from, index }; queue.push(e.to); }
        });
      }
      if (!parent[sink]) break;
      let amount = Infinity;
      for (let v = sink; v !== 0; v = parent[v].from) amount = Math.min(amount, graph[parent[v].from][parent[v].index].capacity);
      for (let v = sink; v !== 0; v = parent[v].from) {
        const e = graph[parent[v].from][parent[v].index];
        e.capacity -= amount; graph[v][e.reverse].capacity += amount;
      }
      funded += amount;
    }
    return {
      funded,
      shortfall: demands.reduce((sum, d) => sum + d.points, 0) - funded,
      allocations: links.filter(l => l.edge.original > l.edge.capacity).map(l => ({ supply: l.supply, demand: l.demand, points: l.edge.original - l.edge.capacity })),
      unmet: demandEdges.map((e, demand) => ({ demand, points: e.capacity })).filter(d => d.points > 0),
    };
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { allocate };
  else window.DVCPlanFunding = { allocate };
})();
