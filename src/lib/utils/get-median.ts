function getMedian(numbers: number[]): number {
  // Step 1: Sort the array in ascending order
  numbers.sort((a, b) => a - b)

  // Step 2: Find the middle index
  const middleIndex = Math.floor(numbers.length / 2)

  // Step 3: Return the median
  if (numbers.length % 2 === 0) {
    // If even, return the average of the two middle numbers
    return (numbers[middleIndex - 1] + numbers[middleIndex]) / 2
  }
  else {
    // If odd, return the middle number
    return numbers[middleIndex]
  }
}

export default getMedian
