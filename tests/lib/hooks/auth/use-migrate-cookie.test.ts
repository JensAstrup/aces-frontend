import * as Sentry from '@sentry/react'
import { renderHook } from '@testing-library/react'
import useSWR from 'swr'

import useMigrateCookie from '@aces/lib/hooks/auth/use-migrate-cookie'


jest.mock('swr')
jest.mock('@sentry/react')

const mockUseSWR = useSWR as jest.MockedFunction<typeof useSWR>
const mockSentryCapture = Sentry.captureException as jest.MockedFunction<typeof Sentry.captureException>

describe('useMigrateCookie', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    global.fetch = jest.fn()
  })

  it('should call useSWR with correct parameters when csrfToken is provided', () => {
    const csrfToken = 'test-token'
    renderHook(() => {
      useMigrateCookie(csrfToken)
    })

    expect(mockUseSWR).toHaveBeenCalledWith(
      ['/api/auth/migrate', csrfToken],
      expect.any(Function),
      { revalidateOnFocus: false }
    )
  })

  it('should not call useSWR when csrfToken is empty', () => {
    renderHook(() => {
      useMigrateCookie('')
    })

    expect(mockUseSWR).toHaveBeenCalledWith(null, expect.any(Function), { revalidateOnFocus: false })
  })

  it('should call fetch with correct parameters in migrateCookie function', async () => {
    const csrfToken = 'test-token'
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({ success: true }),
    } as unknown as Response)

    renderHook(() => {
      useMigrateCookie(csrfToken)
    })
    await mockUseSWR.mock.calls[0][1]!()

    expect(mockFetch).toHaveBeenCalledWith('/api/auth/migrate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ csrfToken }),
    })
  })

  it('should throw an error and capture exception when fetch fails', async () => {
    const csrfToken = 'test-token'
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: false,
    } as Response)

    renderHook(() => {
      useMigrateCookie(csrfToken)
    })

    await expect(mockUseSWR.mock.calls[0][1]!()).rejects.toThrow('Failed to migrate cookie')
    expect(mockSentryCapture).toHaveBeenCalledWith(expect.any(Error))
  })

  it('should return JSON response when fetch succeeds', async () => {
    const csrfToken = 'test-token'
    const mockResponse = { success: true }
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(mockResponse),
    } as unknown as Response)

    renderHook(() => {
      useMigrateCookie(csrfToken)
    })
    const response = await mockUseSWR.mock.calls[0][1]!()

    expect(response).toEqual(mockResponse)
  })
})
