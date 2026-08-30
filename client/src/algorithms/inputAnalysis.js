/**
 * Input Analysis Utility
 * Inspects array properties to provide educational insights into input distribution,
 * ordering characteristics, and duplicate counts.
 */
export function analyzeArrayInput(arr) {
  if (!arr || !Array.isArray(arr) || arr.length === 0) {
    return {
      size: 0,
      orderStatus: 'Empty',
      orderDescription: 'No elements provided',
      hasDuplicates: false,
      duplicateCount: 0,
      min: null,
      max: null,
      range: 0,
      inversions: 0,
    }
  }

  const n = arr.length
  const numericArr = arr.map(Number)

  // 1. Min, Max & Range
  const min = Math.min(...numericArr)
  const max = Math.max(...numericArr)
  const range = max - min

  // 2. Duplicates detection
  const frequencyMap = new Map()
  let duplicateCount = 0
  for (const num of numericArr) {
    const count = (frequencyMap.get(num) || 0) + 1
    frequencyMap.set(num, count)
    if (count === 2) {
      duplicateCount++
    }
  }
  const hasDuplicates = duplicateCount > 0

  // 3. Count inversions to determine exact ordering status
  let inversions = 0
  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      if (numericArr[i] > numericArr[j]) {
        inversions++
      }
    }
  }

  const maxPossibleInversions = (n * (n - 1)) / 2

  let orderStatus = 'Random'
  let orderDescription = 'Elements are distributed in unsorted, random order.'

  if (inversions === 0) {
    orderStatus = 'Sorted (Ascending)'
    orderDescription = 'Best-case scenario for adaptive algorithms like Insertion Sort & Bubble Sort.'
  } else if (inversions === maxPossibleInversions) {
    orderStatus = 'Reverse Sorted (Descending)'
    orderDescription = 'Worst-case scenario for Bubble, Selection, and Insertion Sort (maximum comparisons and swaps).'
  } else if (inversions <= Math.max(1, Math.floor(n / 3))) {
    orderStatus = 'Nearly Sorted'
    orderDescription = `Very few inversions (${inversions}). Highly efficient for adaptive sorting algorithms.`
  }

  return {
    size: n,
    orderStatus,
    orderDescription,
    hasDuplicates,
    duplicateCount,
    min,
    max,
    range,
    inversions,
  }
}
