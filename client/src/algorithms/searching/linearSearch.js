/**
 * Linear Search Step Generator
 * Sequentially compares each element of the array with the target value.
 */
export function generateLinearSearchSteps(initialArray, target) {
  const steps = []
  const arr = [...initialArray]
  const n = arr.length
  const numericTarget = Number(target)

  steps.push({
    array: [...arr],
    currentIndex: null,
    target: numericTarget,
    foundIndex: null,
    notFound: false,
    explanation: `Starting Linear Search for target value: ${numericTarget}.`,
    codeLine: 1,
    action: 'init',
  })

  let found = false
  for (let i = 0; i < n; i++) {
    steps.push({
      array: [...arr],
      currentIndex: i,
      target: numericTarget,
      foundIndex: null,
      notFound: false,
      explanation: `Checking index ${i}: Is arr[${i}] (${arr[i]}) equal to target (${numericTarget})?`,
      codeLine: 2,
      action: 'compare',
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
      explanation: `Reached end of array. Target ${numericTarget} is not present in the array.`,
      codeLine: 5,
      action: 'not-found',
    })
  }

  return steps
}
