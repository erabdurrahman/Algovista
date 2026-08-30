/**
 * Depth First Search (DFS) Step Generator
 * Traverses a graph by exploring as deep as possible along each branch before backtracking.
 */
export function generateDFSSteps(graph, startNode = 'A') {
  const steps = []
  const { nodes, adjacencyList } = graph

  const actualStart = nodes.some((n) => n.id === startNode) ? startNode : nodes[0]?.id || 'A'
  const visited = new Set()
  const stack = []
  const traversalOrder = []

  steps.push({
    currentNode: null,
    stack: [],
    visited: [],
    traversalOrder: [],
    activeEdge: null,
    explanation: `Starting Depth First Search (DFS) from root node '${actualStart}'.`,
    codeLine: 1,
    action: 'init',
  })

  function dfsRecursive(node, parent = null) {
    visited.add(node)
    stack.push(node)
    traversalOrder.push(node)

    steps.push({
      currentNode: node,
      stack: [...stack],
      visited: Array.from(visited),
      traversalOrder: [...traversalOrder],
      activeEdge: parent ? [parent, node] : null,
      explanation: `Visited node '${node}'. Added to Call Stack: [${stack.join(' ➔ ')}].`,
      codeLine: 2,
      action: 'visit',
    })

    const neighbors = adjacencyList[node] || []

    for (const neighbor of neighbors) {
      steps.push({
        currentNode: node,
        stack: [...stack],
        visited: Array.from(visited),
        traversalOrder: [...traversalOrder],
        activeEdge: [node, neighbor],
        explanation: `From node '${node}', exploring neighbor '${neighbor}'.`,
        codeLine: 3,
        action: 'explore-neighbor',
      })

      if (!visited.has(neighbor)) {
        dfsRecursive(neighbor, node)

        steps.push({
          currentNode: node,
          stack: [...stack],
          visited: Array.from(visited),
          traversalOrder: [...traversalOrder],
          activeEdge: null,
          explanation: `Backtracked to node '${node}'. Top of stack is '${node}'.`,
          codeLine: 4,
          action: 'backtrack',
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
    explanation: `DFS Traversal complete! Visited order: ${traversalOrder.join(' ➔ ')}.`,
    codeLine: 5,
    action: 'complete',
  })

  return steps
}
