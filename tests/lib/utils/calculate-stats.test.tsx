import { calculateStats } from '@aces/lib/utils/calculate-stats'


describe('calculateStats', () => {
  it('should return all zeros for empty input', () => {
    const result = calculateStats([])
    expect(result).toEqual({ lowest: 0, highest: 0, median: 0, average: 0 })
  })

  it('should calculate correct stats for an array of numbers', () => {
    const result = calculateStats([1, 2, 3, 4, 5])
    expect(result).toEqual({ lowest: 1, highest: 5, median: 3, average: 3 })
  })

  it('should disregard null values in the array', () => {
    const result = calculateStats([null, 1, 2, 3, null, 4, 5, null])
    expect(result).toEqual({ lowest: 1, highest: 5, median: 3, average: 3 })
  })

  it('should calculate correct stats for an array with one number', () => {
    const result = calculateStats([5])
    expect(result).toEqual({ lowest: 5, highest: 5, median: 5, average: 5 })
  })

  it('should handle an array of all null values', () => {
    const result = calculateStats([null, null, null])
    expect(result).toEqual({ lowest: 0, highest: 0, median: 0, average: 0 })
  })

  it('should calculate correct average for non-integer results', () => {
    const result = calculateStats([1, 2, 3])
    expect(result.average).toBeCloseTo(2, 5)
  })

  it('should calculate correct average for numbers producing non-integer average', () => {
    const result = calculateStats([1, 2, 4])
    expect(result.average).toBeCloseTo(2.3333, 4)
  })
})
