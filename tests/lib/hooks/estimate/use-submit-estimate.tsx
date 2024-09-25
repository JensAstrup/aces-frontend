import { renderHook, act } from '@testing-library/react'
import useSWRMutation from 'swr/mutation'

import { useSubmitEstimate } from './use-submit-estimate'


jest.mock('swr/mutation')

describe('useSubmitEstimate', () => {
  const mockedUseSWRMutation = useSWRMutation as jest.MockedFunction<typeof useSWRMutation>

  beforeEach(() => {
    jest.clearAllMocks()
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
    const mockTrigger = jest.fn().mockResolvedValue({ success: true })
    mockedUseSWRMutation.mockReturnValue({
      trigger: mockTrigger,
      data: { success: true },
      error: undefined,
      isMutating: false,
    } as unknown as ReturnType<typeof useSWRMutation>)

    const { result } = renderHook(() => useSubmitEstimate())

    await act(async () => {
      const response = await result.current.submitEstimate('issue-1', 5)
      expect(response).toEqual({ success: true })
    })

    expect(mockTrigger).toHaveBeenCalledWith({ issueId: 'issue-1', estimate: 5 })
    expect(result.current.data).toEqual({ success: true })
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
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error submitting estimate:', mockError)

    consoleErrorSpy.mockRestore()
  })

  it('should update loading state during submission', async () => {
    const mockTrigger = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(() => {
      resolve({ success: true })
      // eslint-disable-next-line no-magic-numbers
    }, 100)))
    mockedUseSWRMutation.mockReturnValue({
      trigger: mockTrigger,
      data: undefined,
      error: undefined,
      isMutating: true,
    } as unknown as ReturnType<typeof useSWRMutation>)

    const { result } = renderHook(() => useSubmitEstimate())

    const submissionPromise = act(async () => {
      await result.current.submitEstimate('issue-1', 5)
    })

    expect(result.current.isLoading).toBe(true)

    await submissionPromise

    expect(result.current.isLoading).toBe(false)
  })
})
