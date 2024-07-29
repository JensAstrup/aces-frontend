import { act, renderHook } from '@testing-library/react'

import useAuth from '@aces/lib/hooks/auth/use-authenticate'



const mockFetch = global.fetch as jest.Mock

describe('useAuth', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    localStorage.clear()
  })

  it('should initialize with isAuthCalled as false', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.isAuthCalled).toBe(false)
  })

  it('should set isAuthCalled to true after successful authentication', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ accessToken: 'test-token' }),
    })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.handleAuth('test-code')
    })

    expect(result.current.isAuthCalled).toBe(true)
  })

  it('should store accessToken in localStorage after successful authentication', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ accessToken: 'test-token' }),
    })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.handleAuth('test-code')
    })

    expect(localStorage.getItem('accessToken')).toBe('test-token')
  })

  it('should throw an error if the response is not ok', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
    })

    const { result } = renderHook(() => useAuth())

    await expect(result.current.handleAuth('test-code')).rejects.toThrow('Failed to exchange code for access token')
  })

  it('should not call handleAuth multiple times if already called', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ accessToken: 'test-token' }),
    })

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await result.current.handleAuth('test-code')
      await result.current.handleAuth('another-code')
    })

    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('should reset authCalledRef if an error occurs', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useAuth())

    await expect(result.current.handleAuth('test-code')).rejects.toThrow('Network error')

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ accessToken: 'test-token' }),
    })

    await act(async () => {
      await result.current.handleAuth('another-code')
    })

    expect(mockFetch).toHaveBeenCalledTimes(2)
  })

  it('should log errors to console', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    mockFetch.mockRejectedValueOnce(new Error('Test error'))

    const { result } = renderHook(() => useAuth())

    await expect(result.current.handleAuth('test-code')).rejects.toThrow('Test error')

    expect(consoleErrorSpy).toHaveBeenCalledWith(new Error('Test error'))
    consoleErrorSpy.mockRestore()
  })
})
