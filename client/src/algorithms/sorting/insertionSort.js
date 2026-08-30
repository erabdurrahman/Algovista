/**
 * Insertion Sort Step Generator
 * Builds the sorted array in-place by picking the next element and shifting larger elements to the right.
 */
export function generateInsertionSortSteps(initialArray) {
  const steps = []
  const arr = [...initialArray]
  const n = arr.length

  steps.push({
    array: [...arr],
    comparing: [],
    keyIndex: 0,
    sortedIndices: [0],
    explanation: `Starting Insertion Sort. The first element arr[0] (${arr[0]}) is considered sorted by default.`,
    codeLine: 1,
    action: 'init',
  })

  for (let i = 1; i < n; i++) {
    const key = arr[i]
    let j = i - 1

    steps.push({
      array: [...arr],
      comparing: [i],
      keyIndex: i,
      sortedIndices: Array.from({ length: i }, (_, idx) => idx),
      explanation: `Picking element arr[${i}] (key = ${key}) to insert into the sorted portion [0..${i - 1}].`,
      codeLine: 2,
      action: 'pick-key',
    })

    while (j >= 0 && arr[j] > key) {
      steps.push({
        array: [...arr],
        comparing: [j, j + 1],
        keyIndex: j + 1,
        sortedIndices: Array.from({ length: i }, (_, idx) => idx),
        explanation: `arr[${j}] (${arr[j]}) > key (${key}), so we shift ${arr[j]} right to index ${j + 1}.`,
        codeLine: 4,
        action: 'shift',
      })

      arr[j + 1] = arr[j]
      j = j - 1

      steps.push({
        array: [...arr],
        comparing: [j + 1],
        keyIndex: j + 1,
        sortedIndices: Array.from({ length: i }, (_, idx) => idx),
        explanation: `Array state after shifting ${arr[j + 1]}. Next checking position ${j}.`,
        codeLine: 4,
        action: 'shifted',
      })
    }

    if (j >= 0) {
      steps.push({
        array: [...arr],
        comparing: [j],
        keyIndex: j + 1,
        sortedIndices: Array.from({ length: i }, (_, idx) => idx),
        explanation: `arr[${j}] (${arr[j]}) <= key (${key}), so we stop shifting.`,
        codeLine: 3,
        action: 'found-spot',
      })
    }

    arr[j + 1] = key

    steps.push({
      array: [...arr],
      comparing: [j + 1],
      keyIndex: j + 1,
      sortedIndices: Array.from({ length: i + 1 }, (_, idx) => idx),
      explanation: `Inserted key (${key}) at its correct sorted position (index ${j + 1}).`,
      codeLine: 5,
      action: 'insert',
    })
  }

  const allSorted = Array.from({ length: n }, (_, idx) => idx)
  steps.push({
    array: [...arr],
    comparing: [],
    keyIndex: null,
    sortedIndices: allSorted,
    explanation: 'Insertion Sort complete! All elements are sorted.',
    codeLine: 6,
    action: 'complete',
  })

  return steps
}
