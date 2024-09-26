import { max } from 'lodash'

/**
 * Rounds a given number to the nearest Fibonacci number up to 8.
 * In case of a tie, the higher Fibonacci number is chosen.
 *
 * @param num - The input number to round.
 * @returns The nearest Fibonacci number.
 */
function roundToNearestFibonacci(num: number): number {
  const fibonacciNumbers: number[] = [0, 1, 1, 2, 3, 5, 8]

  if (num <= 0) {
    return 0
  }

  // Pair each Fibonacci number with its absolute difference from num
  // Example with input 4: [{ fibonacciNumber: 0, absoluteDifference: 4 }, { fibonacciNumber: 1, absoluteDifference: 3 }, ...]
  const fibonacciWithDifferences = fibonacciNumbers.map(fibonacciNumber => (
    { fibonacciNumber, absoluteDifference: Math.abs(num - fibonacciNumber) }))

  // Determine the minimum absolute difference
  // Example with input 4: 1
  // { fibonacciNumber: 3, absoluteDifference: 1 },
  // { fibonacciNumber: 5, absoluteDifference: 1 },
  const minimumDifference = fibonacciWithDifferences
    .map(item => item.absoluteDifference)
    // By initializing with Infinity, we ensure that any real difference will be smaller, allowing the first comparison to set a valid starting point.
    .reduce((currentMin, difference) => difference < currentMin ? difference : currentMin, Infinity)

  // Filter Fibonacci numbers that have the minimum absolute difference
  const closestFibonacciNumbers = fibonacciWithDifferences
    .filter(item => item.absoluteDifference === minimumDifference)
    .map(item => item.fibonacciNumber)

  // Select the highest Fibonacci number among the closest ones in case of a tie
  const nearestFibonacci = max(closestFibonacciNumbers)!

  return nearestFibonacci
}

export default roundToNearestFibonacci
