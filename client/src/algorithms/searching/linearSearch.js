/**
 * Linear Search Step Generator with Live Metrics
 * Sequentially checks each array element against the target value.
 */
export function generateLinearSearchSteps(initialArray, target) {
  const steps = []
  const arr = [...initialArray]
  const n = arr.length
  const numericTarget = Number(target)

  let comparisons = 0
  let arrayAccesses = 0
  let elementsScanned = 0

  steps.push({
    array: [...arr],
    currentIndex: null,
    target: numericTarget,
    foundIndex: null,
    notFound: false,
    explanation: `Starting Linear Search for target value: ${numericTarget}.`,
    codeLine: 1,
    action: 'init',
    metrics: {
      comparisons,
      arrayAccesses,
      elementsScanned,
      swaps: 0,
      shifts: 0,
    },
  })

  let found = false
  for (let i = 0; i < n; i++) {
    comparisons++
    arrayAccesses++
    elementsScanned++

    steps.push({
      array: [...arr],
      currentIndex: i,
      target: numericTarget,
      foundIndex: null,
      notFound: false,
      explanation: `Checking index ${i}: Is arr[${i}] (${arr[i]}) equal to target (${numericTarget})?`,
      codeLine: 2,
      action: 'compare',
      metrics: {
        comparisons,
        arrayAccesses,
        elementsScanned,
        swaps: 0,
        shifts: 0,
      },
    })

    if (arr[i] === numericTarget) {
      found = true
      steps.push({
        array: [...arr],
        currentIndex: i,
        target: numericTarget,
        foundIndex: i,
        notFound: false,
        explanation: `Target ${numericTarget} found at index ${i}!`,
        codeLine: 3,
        action: 'found',
        metrics: {
          comparisons,
          arrayAccesses,
          elementsScanned,
          swaps: 0,
          shifts: 0,
        },
      })
      break
    }
  }

  if (!found) {
    steps.push({
      array: [...arr],
      currentIndex: null,
      target: numericTarget,
      foundIndex: null,
      notFound: true,
      explanation: `Reached end of array. Target ${numericTarget} is not present.`,
      codeLine: 5,
      action: 'not-found',
      metrics: {
        comparisons,
        arrayAccesses,
        elementsScanned,
        swaps: 0,
        shifts: 0,
      },
    })
  }

  return steps
}
