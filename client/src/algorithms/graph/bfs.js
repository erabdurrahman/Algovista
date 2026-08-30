/**
 * Breadth First Search (BFS) Step Generator with Live Metrics
 * Traverses graph level by level using a FIFO queue.
 */
export function generateBFSSteps(graph, startNode = 'A') {
  const steps = []
  const { nodes, adjacencyList } = graph

  const actualStart = nodes.some((n) => n.id === startNode) ? startNode : nodes[0]?.id || 'A'
  const visited = new Set()
  const queue = []
  const traversalOrder = []

  let nodesVisited = 0
  let edgesInspected = 0
  let maxQueueSize = 0

  steps.push({
    currentNode: null,
    queue: [],
    visited: [],
    traversalOrder: [],
    activeEdge: null,
    explanation: `Starting Breadth First Search (BFS) from root node '${actualStart}'.`,
    codeLine: 1,
    action: 'init',
    metrics: {
      nodesVisited,
      edgesInspected,
      maxQueueSize,
      comparisons: 0,
      swaps: 0,
    },
  })

  visited.add(actualStart)
  queue.push(actualStart)
  nodesVisited++
  maxQueueSize = Math.max(maxQueueSize, queue.length)

  steps.push({
    currentNode: actualStart,
    queue: [...queue],
    visited: Array.from(visited),
    traversalOrder: [],
    activeEdge: null,
    explanation: `Mark node '${actualStart}' as visited and enqueue it. Queue: [${queue.join(', ')}].`,
    codeLine: 2,
    action: 'enqueue',
    metrics: {
      nodesVisited,
      edgesInspected,
      maxQueueSize,
      comparisons: 0,
      swaps: 0,
    },
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
      explanation: `Dequeued node '${current}'. Processing its adjacent edges.`,
      codeLine: 3,
      action: 'dequeue',
      metrics: {
        nodesVisited,
        edgesInspected,
        maxQueueSize,
        comparisons: 0,
        swaps: 0,
      },
    })

    const neighbors = adjacencyList[current] || []

    for (const neighbor of neighbors) {
      edgesInspected++

      steps.push({
        currentNode: current,
        queue: [...queue],
        visited: Array.from(visited),
        traversalOrder: [...traversalOrder],
        activeEdge: [current, neighbor],
        explanation: `Inspecting neighbor edge (${current} ➔ ${neighbor}).`,
        codeLine: 4,
        action: 'explore-neighbor',
        metrics: {
          nodesVisited,
          edgesInspected,
          maxQueueSize,
          comparisons: 0,
          swaps: 0,
        },
      })

      if (!visited.has(neighbor)) {
        visited.add(neighbor)
        queue.push(neighbor)
        nodesVisited++
        maxQueueSize = Math.max(maxQueueSize, queue.length)

        steps.push({
          currentNode: current,
          queue: [...queue],
          visited: Array.from(visited),
          traversalOrder: [...traversalOrder],
          activeEdge: [current, neighbor],
          explanation: `Neighbor '${neighbor}' not visited yet. Mark visited and push to Queue: [${queue.join(', ')}].`,
          codeLine: 5,
          action: 'enqueue',
          metrics: {
            nodesVisited,
            edgesInspected,
            maxQueueSize,
            comparisons: 0,
            swaps: 0,
          },
        })
      } else {
        steps.push({
          currentNode: current,
          queue: [...queue],
          visited: Array.from(visited),
          traversalOrder: [...traversalOrder],
          activeEdge: [current, neighbor],
          explanation: `Neighbor '${neighbor}' is already visited. Skipping edge.`,
          codeLine: 4,
          action: 'already-visited',
          metrics: {
            nodesVisited,
            edgesInspected,
            maxQueueSize,
            comparisons: 0,
            swaps: 0,
          },
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
    explanation: `BFS Traversal complete! Final visited order: ${traversalOrder.join(' ➔ ')}.`,
    codeLine: 6,
    action: 'complete',
    metrics: {
      nodesVisited,
      edgesInspected,
      maxQueueSize,
      comparisons: 0,
      swaps: 0,
    },
  })

  return steps
}
