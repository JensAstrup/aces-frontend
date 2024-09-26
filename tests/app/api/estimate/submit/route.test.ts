import { NextResponse } from 'next/server'


jest.mock('@aces/lib/utils/decrypt', () => jest.fn())
import { POST } from '@aces/app/api/estimate/submit/route'
import setEstimate from '@aces/lib/estimates/api/estimate'


jest.mock('@aces/lib/estimates/api/estimate')
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn(),
  },
}))

describe('POST /api/estimate', () => {
  const mockSetEstimate = setEstimate as jest.MockedFunction<typeof setEstimate>
  const mockNextResponseJson = NextResponse.json as jest.MockedFunction<typeof NextResponse.json>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 400 if issueId is missing', async () => {
    const mockRequest = {
      json: jest.fn().mockResolvedValue({ estimate: 5 }),
    } as unknown as Request

    await POST(mockRequest)

    expect(mockNextResponseJson).toHaveBeenCalledWith('Missing issueId or estimate', { status: 400 })
    expect(mockSetEstimate).not.toHaveBeenCalled()
  })

  it('should return 400 if estimate is missing', async () => {
    const mockRequest = {
      json: jest.fn().mockResolvedValue({ issueId: 'issue-123' }),
    } as unknown as Request

    await POST(mockRequest)

    expect(mockNextResponseJson).toHaveBeenCalledWith('Missing issueId or estimate', { status: 400 })
    expect(mockSetEstimate).not.toHaveBeenCalled()
  })

  it('should call setEstimate and return 200 if both issueId and estimate are provided', async () => {
    const mockRequest = {
      json: jest.fn().mockResolvedValue({ issueId: 'issue-123', estimate: 5 }),
    } as unknown as Request

    await POST(mockRequest)

    expect(mockSetEstimate).toHaveBeenCalledWith('issue-123', 5)
    expect(mockNextResponseJson).toHaveBeenCalledWith('Estimate saved successfully', { status: 200 })
  })

  it('should handle errors from setEstimate', async () => {
    const mockRequest = {
      json: jest.fn().mockResolvedValue({ issueId: 'issue-123', estimate: 5 }),
    } as unknown as Request

    const mockError = new Error('Failed to set estimate')
    mockSetEstimate.mockRejectedValue(mockError)

    await expect(POST(mockRequest)).rejects.toThrow('Failed to set estimate')
  })
})
