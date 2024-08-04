import getMedian from '@aces/lib/utils/get-median'


describe('getMedian', () => {
  it('should return the median of an odd-length array', () => {
    const numbers = [5, 3, 8, 2, 7]
    const result = getMedian(numbers)
    expect(result).toBe(5)
  })

  it('should return the median of an even-length array', () => {
    const numbers = [5, 3, 8, 2, 7, 4]
    const result = getMedian(numbers)
    expect(result).toBe(4.5)
  })

  it('should handle a sorted array', () => {
    const numbers = [1, 2, 3, 4, 5]
    const result = getMedian(numbers)
    expect(result).toBe(3)
  })

  it('should handle an array with identical numbers', () => {
    const numbers = [7, 7, 7, 7, 7]
    const result = getMedian(numbers)
    expect(result).toBe(7)
  })

  it('should handle an array with negative numbers', () => {
    const numbers = [-5, -1, -3, -2, -4]
    const result = getMedian(numbers)
    expect(result).toBe(-3)
  })

  it('should handle an array with a single element', () => {
    const numbers = [42]
    const result = getMedian(numbers)
    expect(result).toBe(42)
  })

  it('should return NaN for an empty array', () => {
    const numbers: number[] = []
    const result = getMedian(numbers)
    expect(result).toBeNaN()
  })
})
