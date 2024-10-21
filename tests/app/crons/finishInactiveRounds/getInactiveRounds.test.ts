import { PrismaClient } from '@prisma/client'

import getInactiveRounds from '@aces/app/crons/finishInactiveRounds/getInactiveRounds'


jest.mock('@prisma/client', () => {
  const prismaMock = {
    round: {
      updateMany: jest.fn(),
    },
  }
  return {
    PrismaClient: jest.fn(() => prismaMock),
  }
})

describe('getInactiveRounds', () => {
  let originalDateNow: () => number
  let mockPrismaClient: {
        round: {
            updateMany: jest.Mock
        }
    }


  beforeAll(() => {
    mockPrismaClient = new PrismaClient() as unknown as {
        round: {
            updateMany: jest.Mock
        }
    }
    originalDateNow = Date.now
  })

  beforeEach(() => {
    // Clear all mock calls and instances before each test
    jest.clearAllMocks()

    // Restore the original Date.now function before each test
    Date.now = originalDateNow
  })

  afterAll(() => {
    // Restore the original Date.now function after all tests
    Date.now = originalDateNow
  })

  it('should update inactive rounds and return the count', async () => {
    // Arrange: Mock updateMany to return a count of 5
    mockPrismaClient.round.updateMany.mockResolvedValueOnce({ count: 5 })

    // Act: Call the function under test
    const result = await getInactiveRounds()

    // Assert: Check the returned count and that updateMany was called correctly
    expect(result).toBe(5)
    expect(mockPrismaClient.round.updateMany).toHaveBeenCalledTimes(1)
    expect(mockPrismaClient.round.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'CREATED',
        }),
        data: {
          status: 'FINISHED',
        },
      })
    )
  })

  it('should use the correct date for filtering', async () => {
    // Arrange: Mock Date.now and updateMany
    const mockNow = 1672531200000 // 2023-01-01T00:00:00Z
    jest.spyOn(Date, 'now').mockImplementation(() => mockNow)
    mockPrismaClient.round.updateMany.mockResolvedValueOnce({ count: 0 })

    // Act: Call the function under test
    await getInactiveRounds()

    // Calculate the expected date
    const expectedDate = new Date(mockNow - 24 * 60 * 60 * 1000)

    // Assert: Check that updateMany was called with the correct filter
    expect(mockPrismaClient.round.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          updatedAt: {
            lt: expectedDate,
          },
          issues: expect.objectContaining({
            none: expect.objectContaining({
              createdAt: {
                gte: expectedDate,
              },
            }),
          }),
        }),
      })
    )
  })

  it('should handle case when no rounds are updated', async () => {
    // Arrange: Mock updateMany to return a count of 0
    mockPrismaClient.round.updateMany.mockResolvedValueOnce({ count: 0 })

    // Act: Call the function under test
    const result = await getInactiveRounds()

    // Assert: Check the returned count and that updateMany was called once
    expect(result).toBe(0)
    expect(mockPrismaClient.round.updateMany).toHaveBeenCalledTimes(1)
  })

  it('should throw an error if the database operation fails', async () => {
    // Arrange: Mock Date.now and have updateMany reject with an error
    const mockNow = 1672531200000 // 2023-01-01T00:00:00Z
    jest.spyOn(Date, 'now').mockImplementation(() => mockNow)
    const mockError = new Error('Database error')
    mockPrismaClient.round.updateMany.mockRejectedValueOnce(mockError)

    // Act & Assert: Expect the function to throw the mocked error
    await expect(getInactiveRounds()).rejects.toThrow('Database error')
  })
})
