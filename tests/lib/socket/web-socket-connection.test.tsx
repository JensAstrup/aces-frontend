import * as Sentry from '@sentry/nextjs'
import { act, render, waitFor } from '@testing-library/react'
import React from 'react'

import useVote from '@aces/lib/api/set-vote'
import useCurrentUser from '@aces/lib/hooks/auth/use-current-user'
import useIssues from '@aces/lib/hooks/issues/issues-context'
import { useVotes } from '@aces/lib/hooks/votes/use-votes'
import WebSocketConnection from '@aces/lib/socket/web-socket-connection'
import { useWebSocket } from '@aces/lib/socket/web-socket-provider'


jest.mock('@aces/lib/socket/web-socket-provider')
jest.mock('@aces/lib/hooks/votes/use-votes')
jest.mock('@aces/lib/api/set-vote')
jest.mock('@aces/lib/hooks/issues/issues-context')
jest.mock('@aces/lib/hooks/auth/use-current-user')
jest.mock('@sentry/nextjs')

const mockUseWebSocket = useWebSocket as jest.MockedFunction<typeof useWebSocket>
const mockUseVotes = useVotes as jest.MockedFunction<typeof useVotes>
const mockUseVote = useVote as jest.MockedFunction<typeof useVote>
const mockUseIssues = useIssues as jest.MockedFunction<typeof useIssues>
const mockUseCurrentUser = useCurrentUser as jest.MockedFunction<typeof useCurrentUser>

describe('WebSocketConnection', () => {
  let mockWebSocket: jest.Mock
  let mockSetIsConnected: jest.Mock
  let mockSetVotes: jest.Mock
  let mockSetExpectedVotes: jest.Mock
  let mockOnVoteReceived: jest.Mock
  let mockSetCurrentIssue: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    mockSetIsConnected = jest.fn()
    mockSetVotes = jest.fn()
    mockSetExpectedVotes = jest.fn()
    mockOnVoteReceived = jest.fn()
    mockSetCurrentIssue = jest.fn()

    mockUseWebSocket.mockReturnValue({
      isConnected: true,
      setIsConnected: mockSetIsConnected
    })

    mockUseVotes.mockReturnValue({
      votes: [],
      expectedVotes: 0,
      setVotes: mockSetVotes,
      setExpectedVotes: mockSetExpectedVotes
    })

    mockUseVote.mockReturnValue({
      trigger: mockOnVoteReceived,
      isMutating: false,
      error: undefined
    })

    mockUseIssues.mockReturnValue({
      currentIssue: null,
      setCurrentIssue: mockSetCurrentIssue,
      issues: [],
      setIssues: jest.fn(),
      isLoading: false,
      loadIssuesForViews: jest.fn()
    })

    mockUseCurrentUser.mockReturnValue({
      user: undefined,
      isLoading: false,
      error: false
    })

    mockWebSocket = jest.fn(() => ({
      onopen: null,
      onmessage: null,
      onclose: null,
    }))
    global.WebSocket = mockWebSocket as unknown as typeof WebSocket

    process.env.NEXT_PUBLIC_WEBSOCKET = 'ws://test.com'
  })

  it('should establish a WebSocket connection on mount', async () => {
    render(<WebSocketConnection roundId="test-round" />)

    await waitFor(() => {
      expect(mockWebSocket).toHaveBeenCalledWith('ws://test.com?roundId=test-round')
    })

    act(() => {
      mockWebSocket.mock.results[0].value.onopen()
    })

    expect(mockSetIsConnected).toHaveBeenCalledWith(true)
  })

  it('should handle errors', async () => {
    const mockOnError = jest.fn()
    const mockCaptureException = jest.spyOn(Sentry, 'captureException').mockImplementation()

    render(<WebSocketConnection roundId="test-round" onError={mockOnError} />)

    await waitFor(() => {
      expect(mockWebSocket).toHaveBeenCalled()
    })

    const mockErrorMessage = {
      data: JSON.stringify({
        event: 'error',
        payload: 'Test error message',
      }),
    }

    act(() => {
      mockWebSocket.mock.results[0].value.onmessage(mockErrorMessage)
    })

    expect(mockOnError).toHaveBeenCalledWith('Test error message')
    expect(mockCaptureException).toHaveBeenCalledWith('Error received from WebSocket: Test error message')

    mockCaptureException.mockRestore()
  })
})
