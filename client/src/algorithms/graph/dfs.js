/**
 * Depth First Search (DFS) Step Generator with Live Metrics
 * Traverses graph by exploring branches deeply before backtracking.
 */
export function generateDFSSteps(graph, startNode = 'A') {
  const steps = []
  const { nodes, adjacencyList } = graph

  const actualStart = nodes.some((n) => n.id === startNode) ? startNode : nodes[0]?.id || 'A'
  const visited = new Set()
  const stack = []
  const traversalOrder = []

  let nodesVisited = 0
  let edgesInspected = 0
  let maxCallStackDepth = 0

  steps.push({
    currentNode: null,
    stack: [],
    visited: [],
    traversalOrder: [],
    activeEdge: null,
    explanation: `Starting Depth First Search (DFS) from root node '${actualStart}'.`,
    codeLine: 1,
    action: 'init',
    metrics: {
      nodesVisited,
      edgesInspected,
      maxCallStackDepth,
      comparisons: 0,
      swaps: 0,
    },
  })

  function dfsRecursive(node, parent = null) {
    visited.add(node)
    stack.push(node)
    traversalOrder.push(node)
    nodesVisited++
    maxCallStackDepth = Math.max(maxCallStackDepth, stack.length)

    steps.push({
      currentNode: node,
      stack: [...stack],
      visited: Array.from(visited),
      traversalOrder: [...traversalOrder],
      activeEdge: parent ? [parent, node] : null,
      explanation: `Visited node '${node}'. Added to Call Stack: [${stack.join(' ➔ ')}].`,
      codeLine: 2,
      action: 'visit',
      metrics: {
        nodesVisited,
        edgesInspected,
        maxCallStackDepth,
        comparisons: 0,
        swaps: 0,
      },
    })

    const neighbors = adjacencyList[node] || []

    for (const neighbor of neighbors) {
      edgesInspected++

      steps.push({
        currentNode: node,
        stack: [...stack],
        visited: Array.from(visited),
        traversalOrder: [...traversalOrder],
        activeEdge: [node, neighbor],
        explanation: `From node '${node}', inspecting edge (${node} ➔ ${neighbor}).`,
        codeLine: 3,
        action: 'explore-neighbor',
        metrics: {
          nodesVisited,
          edgesInspected,
          maxCallStackDepth,
          comparisons: 0,
          swaps: 0,
        },
      })

      if (!visited.has(neighbor)) {
        dfsRecursive(neighbor, node)

        steps.push({
          currentNode: node,
          stack: [...stack],
          visited: Array.from(visited),
          traversalOrder: [...traversalOrder],
          activeEdge: null,
          explanation: `Backtracked to node '${node}'. Top of call stack is '${node}'.`,
          codeLine: 4,
          action: 'backtrack',
          metrics: {
            nodesVisited,
            edgesInspected,
            maxCallStackDepth,
            comparisons: 0,
            swaps: 0,
          },
        })
      } else {
        steps.push({
          currentNode: node,
          stack: [...stack],
          visited: Array.from(visited),
          traversalOrder: [...traversalOrder],
          activeEdge: [node, neighbor],
          explanation: `Neighbor '${neighbor}' is already visited. Skipping branch.`,
          codeLine: 3,
          action: 'already-visited',
          metrics: {
            nodesVisited,
            edgesInspected,
            maxCallStackDepth,
            comparisons: 0,
            swaps: 0,
          },
        })
      }
    }

    stack.pop()
  }

  dfsRecursive(actualStart)

  steps.push({
    currentNode: null,
    stack: [],
    visited: Array.from(visited),
    traversalOrder: [...traversalOrder],
    activeEdge: null,
    explanation: `DFS Traversal complete! Final visited order: ${traversalOrder.join(' ➔ ')}.`,
    codeLine: 5,
    action: 'complete',
    metrics: {
      nodesVisited,
      edgesInspected,
      maxCallStackDepth,
      comparisons: 0,
      swaps: 0,
    },
  })

  return steps
}
