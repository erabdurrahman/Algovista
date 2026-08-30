/**
 * Selection Sort Step Generator with Live Metrics
 * Finds the smallest element in unsorted subarray and swaps it to the front.
 */
export function generateSelectionSortSteps(initialArray) {
  const steps = []
  const arr = [...initialArray]
  const n = arr.length
  const sortedIndices = []

  let comparisons = 0
  let swaps = 0
  let shifts = 0
  let arrayAccesses = 0

  steps.push({
    array: [...arr],
    comparing: [],
    minIndex: null,
    swapped: false,
    sortedIndices: [],
    explanation: `Starting Selection Sort with ${n} elements.`,
    codeLine: 1,
    action: 'init',
    metrics: {
      comparisons,
      swaps,
      shifts,
      arrayAccesses,
    },
  })

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i
    arrayAccesses++ // read arr[i]

    steps.push({
      array: [...arr],
      comparing: [i],
      minIndex: minIdx,
      swapped: false,
      sortedIndices: [...sortedIndices],
      explanation: `Pass ${i + 1}: Initialized minimum at index ${minIdx} (value: ${arr[minIdx]}).`,
      codeLine: 2,
      action: 'set-min',
      metrics: {
        comparisons,
        swaps,
        shifts,
        arrayAccesses,
      },
    })

    for (let j = i + 1; j < n; j++) {
      comparisons++
      arrayAccesses += 2 // read arr[j] and arr[minIdx]

      steps.push({
        array: [...arr],
        comparing: [j, minIdx],
        minIndex: minIdx,
        swapped: false,
        sortedIndices: [...sortedIndices],
        explanation: `Comparing arr[${j}] (${arr[j]}) with current minimum arr[${minIdx}] (${arr[minIdx]}).`,
        codeLine: 3,
        action: 'compare',
        metrics: {
          comparisons,
          swaps,
          shifts,
          arrayAccesses,
        },
      })

      if (arr[j] < arr[minIdx]) {
        minIdx = j
        steps.push({
          array: [...arr],
          comparing: [j],
          minIndex: minIdx,
          swapped: false,
          sortedIndices: [...sortedIndices],
          explanation: `Found new minimum: ${arr[minIdx]} at index ${minIdx}.`,
          codeLine: 4,
          action: 'new-min',
          metrics: {
            comparisons,
            swaps,
            shifts,
            arrayAccesses,
          },
        })
      }
    }

    if (minIdx !== i) {
      const temp = arr[i]
      arr[i] = arr[minIdx]
      arr[minIdx] = temp
      swaps++
      arrayAccesses += 4 // 2 reads + 2 writes

      steps.push({
        array: [...arr],
        comparing: [i, minIdx],
        minIndex: minIdx,
        swapped: true,
        sortedIndices: [...sortedIndices],
        explanation: `Swapping minimum element ${arr[i]} (from index ${minIdx}) into position ${i}.`,
        codeLine: 5,
        action: 'swap',
        metrics: {
          comparisons,
          swaps,
          shifts,
          arrayAccesses,
        },
      })
    } else {
      steps.push({
        array: [...arr],
        comparing: [i],
        minIndex: minIdx,
        swapped: false,
        sortedIndices: [...sortedIndices],
        explanation: `Element at index ${i} (${arr[i]}) is already the minimum for this pass.`,
        codeLine: 5,
        action: 'no-swap',
        metrics: {
          comparisons,
          swaps,
          shifts,
          arrayAccesses,
        },
      })
    }

    sortedIndices.push(i)
  }

  const allSorted = Array.from({ length: n }, (_, idx) => idx)
  steps.push({
    array: [...arr],
    comparing: [],
    minIndex: null,
    swapped: false,
    sortedIndices: allSorted,
    explanation: 'Selection Sort complete! The array is fully sorted.',
    codeLine: 6,
    action: 'complete',
    metrics: {
      comparisons,
      swaps,
      shifts,
      arrayAccesses,
    },
  })

  return steps
}
