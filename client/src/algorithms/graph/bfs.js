/**
 * Breadth First Search (BFS) Step Generator
 * Traverses a graph level by level using a FIFO queue.
 */
export function generateBFSSteps(graph, startNode = 'A') {
  const steps = []
  const { nodes, adjacencyList } = graph

  const actualStart = nodes.some((n) => n.id === startNode) ? startNode : nodes[0]?.id || 'A'
  const visited = new Set()
  const queue = []
  const traversalOrder = []

  steps.push({
    currentNode: null,
    queue: [],
    visited: [],
    traversalOrder: [],
    activeEdge: null,
    explanation: `Starting Breadth First Search (BFS) from root node '${actualStart}'.`,
    codeLine: 1,
    action: 'init',
  })

  // Enqueue start node
  visited.add(actualStart)
  queue.push(actualStart)

  steps.push({
    currentNode: actualStart,
    queue: [...queue],
    visited: Array.from(visited),
    traversalOrder: [],
    activeEdge: null,
    explanation: `Mark node '${actualStart}' as visited and enqueue it. Queue: [${queue.join(', ')}].`,
    codeLine: 2,
    action: 'enqueue',
  })

  while (queue.length > 0) {
    const current = queue.shift()
    traversalOrder.push(current)

    steps.push({
      currentNode: current,
      queue: [...queue],
      visited: Array.from(visited),
      traversalOrder: [...traversalOrder],
      activeEdge: null,
      explanation: `Dequeued node '${current}'. Processing node '${current}'.`,
      codeLine: 3,
      action: 'dequeue',
    })

    const neighbors = adjacencyList[current] || []

    for (const neighbor of neighbors) {
      steps.push({
        currentNode: current,
        queue: [...queue],
        visited: Array.from(visited),
        traversalOrder: [...traversalOrder],
        activeEdge: [current, neighbor],
        explanation: `Inspecting neighbor '${neighbor}' of node '${current}'.`,
        codeLine: 4,
        action: 'explore-neighbor',
      })

      if (!visited.has(neighbor)) {
        visited.add(neighbor)
        queue.push(neighbor)

        steps.push({
          currentNode: current,
          queue: [...queue],
          visited: Array.from(visited),
          traversalOrder: [...traversalOrder],
          activeEdge: [current, neighbor],
          explanation: `Neighbor '${neighbor}' not visited yet. Mark visited and push to Queue: [${queue.join(', ')}].`,
          codeLine: 5,
          action: 'enqueue',
        })
      } else {
        steps.push({
          currentNode: current,
          queue: [...queue],
          visited: Array.from(visited),
          traversalOrder: [...traversalOrder],
          activeEdge: [current, neighbor],
          explanation: `Neighbor '${neighbor}' is already visited. Skip.`,
          codeLine: 4,
          action: 'already-visited',
        })
      }
    }
  }

  steps.push({
    currentNode: null,
    queue: [],
    visited: Array.from(visited),
    traversalOrder: [...traversalOrder],
    activeEdge: null,
    explanation: `BFS Traversal complete! Visited order: ${traversalOrder.join(' ➔ ')}.`,
    codeLine: 6,
    action: 'complete',
  })

  return steps
}
