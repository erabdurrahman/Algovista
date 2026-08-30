/**
 * Bubble Sort Step Generator
 * Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.
 */
export function generateBubbleSortSteps(initialArray) {
  const steps = []
  const arr = [...initialArray]
  const n = arr.length
  const sortedIndices = []

  // Initial step
  steps.push({
    array: [...arr],
    comparing: [],
    swapped: false,
    sortedIndices: [],
    explanation: `Starting Bubble Sort with ${n} elements.`,
    codeLine: 1,
    action: 'init',
  })

  for (let i = 0; i < n - 1; i++) {
    let hasSwapped = false

    steps.push({
      array: [...arr],
      comparing: [],
      swapped: false,
      sortedIndices: [...sortedIndices],
      explanation: `Pass ${i + 1}: Checking elements from index 0 to ${n - i - 2}.`,
      codeLine: 2,
      action: 'pass-start',
    })

    for (let j = 0; j < n - i - 1; j++) {
      // Comparison step
      steps.push({
        array: [...arr],
        comparing: [j, j + 1],
        swapped: false,
        sortedIndices: [...sortedIndices],
        explanation: `Comparing arr[${j}] (${arr[j]}) and arr[${j + 1}] (${arr[j + 1]}).`,
        codeLine: 3,
        action: 'compare',
      })

      if (arr[j] > arr[j + 1]) {
        // Swap
        const temp = arr[j]
        arr[j] = arr[j + 1]
        arr[j + 1] = temp
        hasSwapped = true

        steps.push({
          array: [...arr],
          comparing: [j, j + 1],
          swapped: true,
          sortedIndices: [...sortedIndices],
          explanation: `${arr[j + 1]} > ${arr[j]}, so we swap them.`,
          codeLine: 4,
          action: 'swap',
        })
      } else {
        steps.push({
          array: [...arr],
          comparing: [j, j + 1],
          swapped: false,
          sortedIndices: [...sortedIndices],
          explanation: `${arr[j]} <= ${arr[j + 1]}, no swap needed.`,
          codeLine: 3,
          action: 'no-swap',
        })
      }
    }

    // Element at n - i - 1 is now in its final sorted position
    sortedIndices.push(n - i - 1)
    steps.push({
      array: [...arr],
      comparing: [],
      swapped: false,
      sortedIndices: [...sortedIndices],
      explanation: `Element ${arr[n - i - 1]} is now placed at its sorted position (index ${n - i - 1}).`,
      codeLine: 2,
      action: 'placed',
    })

    // If no two elements were swapped by inner loop, then break
    if (!hasSwapped) {
      steps.push({
        array: [...arr],
        comparing: [],
        swapped: false,
        sortedIndices: Array.from({ length: n }, (_, idx) => idx),
        explanation: 'No swaps occurred during this pass. The array is already sorted!',
        codeLine: 6,
        action: 'early-exit',
      })
      break
    }
  }

  // Mark all indices as sorted at completion
  const allSorted = Array.from({ length: n }, (_, idx) => idx)
  steps.push({
    array: [...arr],
    comparing: [],
    swapped: false,
    sortedIndices: allSorted,
    explanation: 'Bubble Sort complete! All elements are sorted in ascending order.',
    codeLine: 7,
    action: 'complete',
  })

  return steps
}
