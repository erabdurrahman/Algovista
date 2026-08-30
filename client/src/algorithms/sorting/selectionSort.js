/**
 * Selection Sort Step Generator
 * Finds the smallest element in the unsorted subarray and swaps it with the leftmost unsorted element.
 */
export function generateSelectionSortSteps(initialArray) {
  const steps = []
  const arr = [...initialArray]
  const n = arr.length
  const sortedIndices = []

  steps.push({
    array: [...arr],
    comparing: [],
    minIndex: null,
    swapped: false,
    sortedIndices: [],
    explanation: `Starting Selection Sort with ${n} elements.`,
    codeLine: 1,
    action: 'init',
  })

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i

    steps.push({
      array: [...arr],
      comparing: [i],
      minIndex: minIdx,
      swapped: false,
      sortedIndices: [...sortedIndices],
      explanation: `Pass ${i + 1}: Initialized current minimum at index ${minIdx} (value: ${arr[minIdx]}).`,
      codeLine: 2,
      action: 'set-min',
    })

    for (let j = i + 1; j < n; j++) {
      steps.push({
        array: [...arr],
        comparing: [j, minIdx],
        minIndex: minIdx,
        swapped: false,
        sortedIndices: [...sortedIndices],
        explanation: `Comparing arr[${j}] (${arr[j]}) with current minimum arr[${minIdx}] (${arr[minIdx]}).`,
        codeLine: 3,
        action: 'compare',
      })

      if (arr[j] < arr[minIdx]) {
        minIdx = j
        steps.push({
          array: [...arr],
          comparing: [j],
          minIndex: minIdx,
          swapped: false,
          sortedIndices: [...sortedIndices],
          explanation: `Found new minimum element: ${arr[minIdx]} at index ${minIdx}.`,
          codeLine: 4,
          action: 'new-min',
        })
      }
    }

    if (minIdx !== i) {
      const temp = arr[i]
      arr[i] = arr[minIdx]
      arr[minIdx] = temp

      steps.push({
        array: [...arr],
        comparing: [i, minIdx],
        minIndex: minIdx,
        swapped: true,
        sortedIndices: [...sortedIndices],
        explanation: `Swapping minimum element ${arr[i]} (from index ${minIdx}) into position index ${i}.`,
        codeLine: 5,
        action: 'swap',
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
      })
    }

    sortedIndices.push(i)
  }

  // All sorted
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
  })

  return steps
}
