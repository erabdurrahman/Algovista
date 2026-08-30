/**
 * Insertion Sort Step Generator with Live Metrics
 * Builds sorted array by repeatedly picking next key and shifting larger elements right.
 */
export function generateInsertionSortSteps(initialArray) {
  const steps = []
  const arr = [...initialArray]
  const n = arr.length

  let comparisons = 0
  let swaps = 0
  let shifts = 0
  let arrayAccesses = 0

  arrayAccesses++ // read arr[0]

  steps.push({
    array: [...arr],
    comparing: [],
    keyIndex: 0,
    sortedIndices: [0],
    explanation: `Starting Insertion Sort. First element arr[0] (${arr[0]}) is sorted by default.`,
    codeLine: 1,
    action: 'init',
    metrics: {
      comparisons,
      swaps,
      shifts,
      arrayAccesses,
    },
  })

  for (let i = 1; i < n; i++) {
    const key = arr[i]
    let j = i - 1
    arrayAccesses++ // read key = arr[i]

    steps.push({
      array: [...arr],
      comparing: [i],
      keyIndex: i,
      sortedIndices: Array.from({ length: i }, (_, idx) => idx),
      explanation: `Picking element arr[${i}] (key = ${key}) to insert into [0..${i - 1}].`,
      codeLine: 2,
      action: 'pick-key',
      metrics: {
        comparisons,
        swaps,
        shifts,
        arrayAccesses,
      },
    })

    while (j >= 0) {
      comparisons++
      arrayAccesses++ // read arr[j]

      if (arr[j] > key) {
        shifts++
        swaps++
        arrayAccesses += 2 // read arr[j] and write to arr[j+1]

        steps.push({
          array: [...arr],
          comparing: [j, j + 1],
          keyIndex: j + 1,
          sortedIndices: Array.from({ length: i }, (_, idx) => idx),
          explanation: `arr[${j}] (${arr[j]}) > key (${key}), so we shift ${arr[j]} right to index ${j + 1}.`,
          codeLine: 4,
          action: 'shift',
          metrics: {
            comparisons,
            swaps,
            shifts,
            arrayAccesses,
          },
        })

        arr[j + 1] = arr[j]
        j = j - 1

        steps.push({
          array: [...arr],
          comparing: [j + 1],
          keyIndex: j + 1,
          sortedIndices: Array.from({ length: i }, (_, idx) => idx),
          explanation: `Array state after shifting. Next checking index ${j}.`,
          codeLine: 4,
          action: 'shifted',
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
          comparing: [j],
          keyIndex: j + 1,
          sortedIndices: Array.from({ length: i }, (_, idx) => idx),
          explanation: `arr[${j}] (${arr[j]}) <= key (${key}), so we stop shifting.`,
          codeLine: 3,
          action: 'found-spot',
          metrics: {
            comparisons,
            swaps,
            shifts,
            arrayAccesses,
          },
        })
        break
      }
    }

    arr[j + 1] = key
    arrayAccesses++ // write key to arr[j+1]

    steps.push({
      array: [...arr],
      comparing: [j + 1],
      keyIndex: j + 1,
      sortedIndices: Array.from({ length: i + 1 }, (_, idx) => idx),
      explanation: `Inserted key (${key}) at sorted position index ${j + 1}.`,
      codeLine: 5,
      action: 'insert',
      metrics: {
        comparisons,
        swaps,
        shifts,
        arrayAccesses,
      },
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
    metrics: {
      comparisons,
      swaps,
      shifts,
      arrayAccesses,
    },
  })

  return steps
}
