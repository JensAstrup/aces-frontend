import { renderHook, act } from '@testing-library/react'
import useSWRMutation from 'swr/mutation'

import { submitEstimateFetcher, useSubmitEstimate } from '@aces/lib/hooks/estimate/use-submit-estimate'


jest.mock('swr/mutation')

describe('useSubmitEstimate', () => {
  const mockedUseSWRMutation = useSWRMutation as jest.MockedFunction<typeof useSWRMutation>
  const originalFetch = global.fetch

  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('should return initial state', () => {
    mockedUseSWRMutation.mockReturnValue({
      trigger: jest.fn(),
      data: undefined,
      error: undefined,
      isMutating: false,
    } as unknown as ReturnType<typeof useSWRMutation>)

    const { result } = renderHook(() => useSubmitEstimate())

    expect(result.current.data).toBeUndefined()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeUndefined()
    expect(typeof result.current.submitEstimate).toBe('function')
  })

  it('should submit estimate successfully', async () => {
    const mockTrigger = jest.fn().mockResolvedValue({ message: 'Estimate submitted successfully' })
    mockedUseSWRMutation.mockReturnValue({
      trigger: mockTrigger,
      data: { message: 'Estimate submitted successfully' },
      error: undefined,
      isMutating: false,
    } as unknown as ReturnType<typeof useSWRMutation>)

    const { result } = renderHook(() => useSubmitEstimate())

    await act(async () => {
      const response = await result.current.submitEstimate('issue-1', 5)
      expect(response).toEqual({ message: 'Estimate submitted successfully' })
    })

    expect(mockTrigger).toHaveBeenCalledWith({ issueId: 'issue-1', estimate: 5 })
    expect(result.current.data).toEqual({ message: 'Estimate submitted successfully' })
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeUndefined()
  })

  it('should handle submission error', async () => {
    const mockError = new Error('Submission failed')
    const mockTrigger = jest.fn().mockRejectedValue(mockError)
    mockedUseSWRMutation.mockReturnValue({
      trigger: mockTrigger,
      data: undefined,
      error: mockError,
      isMutating: false,
    } as unknown as ReturnType<typeof useSWRMutation>)

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    const { result } = renderHook(() => useSubmitEstimate())

    await act(async () => {
      await expect(result.current.submitEstimate('issue-1', 5)).rejects.toThrow('Submission failed')
    })

    expect(mockTrigger).toHaveBeenCalledWith({ issueId: 'issue-1', estimate: 5 })
    expect(result.current.data).toBeUndefined()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toEqual(mockError)

    consoleErrorSpy.mockRestore()
  })

  it('should call submitEstimateFetcher with correct parameters', async () => {
    const mockResponse = { message: 'Estimate submitted successfully' }
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(mockResponse),
    } as unknown as Response)

    const mockTrigger = jest.fn().mockImplementation(async (params) => {
      const url = '/api/estimate/submit'
      return submitEstimateFetcher(url, { arg: params })
    })

    mockedUseSWRMutation.mockReturnValue({
      trigger: mockTrigger,
      data: undefined,
      error: undefined,
      isMutating: false,
    } as unknown as ReturnType<typeof useSWRMutation>)

    const { result } = renderHook(() => useSubmitEstimate())

    await act(async () => {
      const response = await result.current.submitEstimate('issue-1', 5)
      expect(response).toEqual(mockResponse)
    })

    expect(mockFetch).toHaveBeenCalledWith('/api/estimate/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ issueId: 'issue-1', estimate: 5 }),
    })
  })

  it('should throw an error when fetch response is not ok', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
    } as Response)

    const mockTrigger = jest.fn().mockImplementation(async (params) => {
      const url = '/api/estimate/submit'
      return submitEstimateFetcher(url, { arg: params })
    })

    mockedUseSWRMutation.mockReturnValue({
      trigger: mockTrigger,
      data: undefined,
      error: undefined,
      isMutating: false,
    } as unknown as ReturnType<typeof useSWRMutation>)

    const { result } = renderHook(() => useSubmitEstimate())

    await act(async () => {
      await expect(result.current.submitEstimate('issue-1', 5)).rejects.toThrow('HTTP error! status: 400')
    })
  })
})
