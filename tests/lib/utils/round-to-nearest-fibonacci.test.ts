import closestFibonacciNumber from '@aces/lib/utils/round-to-nearest-fibonacci'


test('closestFibonacciNumber', () => {
  expect(closestFibonacciNumber(0)).toBe(0)
  expect(closestFibonacciNumber(1)).toBe(1)
  expect(closestFibonacciNumber(2)).toBe(2)
  expect(closestFibonacciNumber(3)).toBe(3)
  expect(closestFibonacciNumber(4)).toBe(5)
  expect(closestFibonacciNumber(5)).toBe(5)
  expect(closestFibonacciNumber(6)).toBe(5)
  expect(closestFibonacciNumber(7)).toBe(8)
  expect(closestFibonacciNumber(8)).toBe(8)
})
