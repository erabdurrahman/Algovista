/**
 * Binary Search Step Generator with Live Metrics
 * Repeatedly divides sorted search space in half.
 */
export function generateBinarySearchSteps(initialArray, target) {
  const steps = []
  const arr = [...initialArray].sort((a, b) => a - b)
  const n = arr.length
  const numericTarget = Number(target)

  let low = 0
  let high = n - 1
  let found = false

  let comparisons = 0
  let arrayAccesses = 0
  let divisions = 0

  steps.push({
    array: [...arr],
    low,
    high,
    mid: null,
    target: numericTarget,
    foundIndex: null,
    notFound: false,
    eliminated: [],
    explanation: `Array sorted for Binary Search: [${arr.join(', ')}]. Searching for ${numericTarget}.`,
    codeLine: 1,
    action: 'init',
    metrics: {
      comparisons,
      arrayAccesses,
      divisions,
      searchSpaceRemaining: n,
      swaps: 0,
      shifts: 0,
    },
  })

  while (low <= high) {
    divisions++
    const mid = Math.floor((low + high) / 2)
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
      explanation: `Search space: [index ${low}..${high}] (${high - low + 1} items). Midpoint is index ${mid} (value: ${arr[mid]}).`,
      codeLine: 2,
      action: 'calculate-mid',
      metrics: {
        comparisons,
        arrayAccesses,
        divisions,
        searchSpaceRemaining: high - low + 1,
        swaps: 0,
        shifts: 0,
      },
    })

    comparisons++
    arrayAccesses++ // read arr[mid]

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
      metrics: {
        comparisons,
        arrayAccesses,
        divisions,
        searchSpaceRemaining: high - low + 1,
        swaps: 0,
        shifts: 0,
      },
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
        metrics: {
          comparisons,
          arrayAccesses,
          divisions,
          searchSpaceRemaining: 1,
          swaps: 0,
          shifts: 0,
        },
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
        explanation: `arr[${mid}] (${arr[mid]}) < target (${numericTarget}). Discarding left half [${low}..${mid}].`,
        codeLine: 5,
        action: 'search-right',
        metrics: {
          comparisons,
          arrayAccesses,
          divisions,
          searchSpaceRemaining: high - (mid + 1) + 1,
          swaps: 0,
          shifts: 0,
        },
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
        explanation: `arr[${mid}] (${arr[mid]}) > target (${numericTarget}). Discarding right half [${mid}..${high}].`,
        codeLine: 6,
        action: 'search-left',
        metrics: {
          comparisons,
          arrayAccesses,
          divisions,
          searchSpaceRemaining: (mid - 1) - low + 1,
          swaps: 0,
          shifts: 0,
        },
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
      explanation: `Search space exhausted (low > high). Target ${numericTarget} does not exist in array.`,
      codeLine: 7,
      action: 'not-found',
      metrics: {
        comparisons,
        arrayAccesses,
        divisions,
        searchSpaceRemaining: 0,
        swaps: 0,
        shifts: 0,
      },
    })
  }

  return steps
}
