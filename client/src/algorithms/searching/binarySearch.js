/**
 * Binary Search Step Generator
 * Finds a target within a sorted array by repeatedly dividing the search space in half.
 */
export function generateBinarySearchSteps(initialArray, target) {
  const steps = []
  // Ensure array is sorted for binary search
  const arr = [...initialArray].sort((a, b) => a - b)
  const n = arr.length
  const numericTarget = Number(target)

  let low = 0
  let high = n - 1
  let found = false

  steps.push({
    array: [...arr],
    low,
    high,
    mid: null,
    target: numericTarget,
    foundIndex: null,
    notFound: false,
    eliminated: [],
    explanation: `Array sorted for Binary Search: [${arr.join(', ')}]. Searching for target: ${numericTarget}.`,
    codeLine: 1,
    action: 'init',
  })

  while (low <= high) {
    const mid = Math.floor((low + high) / 2)

    // Calculate currently eliminated indices outside [low, high]
    const currentEliminated = []
    for (let k = 0; k < n; k++) {
      if (k < low || k > high) currentEliminated.push(k)
    }

    steps.push({
      array: [...arr],
      low,
      high,
      mid,
      target: numericTarget,
      foundIndex: null,
      notFound: false,
      eliminated: [...currentEliminated],
      explanation: `Current search space: [index ${low}..${high}]. Midpoint is index ${mid} (value: ${arr[mid]}).`,
      codeLine: 2,
      action: 'calculate-mid',
    })

    steps.push({
      array: [...arr],
      low,
      high,
      mid,
      target: numericTarget,
      foundIndex: null,
      notFound: false,
      eliminated: [...currentEliminated],
      explanation: `Comparing arr[${mid}] (${arr[mid]}) with target (${numericTarget}).`,
      codeLine: 3,
      action: 'compare',
    })

    if (arr[mid] === numericTarget) {
      found = true
      steps.push({
        array: [...arr],
        low,
        high,
        mid,
        target: numericTarget,
        foundIndex: mid,
        notFound: false,
        eliminated: [...currentEliminated],
        explanation: `Target ${numericTarget} found at index ${mid}!`,
        codeLine: 4,
        action: 'found',
      })
      break
    } else if (arr[mid] < numericTarget) {
      steps.push({
        array: [...arr],
        low,
        high,
        mid,
        target: numericTarget,
        foundIndex: null,
        notFound: false,
        eliminated: [...currentEliminated],
        explanation: `arr[${mid}] (${arr[mid]}) < target (${numericTarget}). Target must be on the right. Discarding left half.`,
        codeLine: 5,
        action: 'search-right',
      })
      low = mid + 1
    } else {
      steps.push({
        array: [...arr],
        low,
        high,
        mid,
        target: numericTarget,
        foundIndex: null,
        notFound: false,
        eliminated: [...currentEliminated],
        explanation: `arr[${mid}] (${arr[mid]}) > target (${numericTarget}). Target must be on the left. Discarding right half.`,
        codeLine: 6,
        action: 'search-left',
      })
      high = mid - 1
    }
  }

  if (!found) {
    const allIndices = Array.from({ length: n }, (_, idx) => idx)
    steps.push({
      array: [...arr],
      low,
      high,
      mid: null,
      target: numericTarget,
      foundIndex: null,
      notFound: true,
      eliminated: allIndices,
      explanation: `Search space exhausted (low > high). Target ${numericTarget} does not exist in this array.`,
      codeLine: 7,
      action: 'not-found',
    })
  }

  return steps
}
