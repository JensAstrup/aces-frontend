import * as Sentry from '@sentry/nextjs'
import { act, render } from '@testing-library/react'
import React from 'react'

import WebSocketProvider from '@aces/app/web-socket-provider'
import { Issue } from '@aces/interfaces/issue'
import User from '@aces/interfaces/user'
import useCurrentUser from '@aces/lib/hooks/auth/use-current-user'
import { useIssues } from '@aces/lib/hooks/issues/issues-context'
import { useVotes } from '@aces/lib/hooks/votes/use-votes'
import inboundHandler from '@aces/lib/socket/inbound-handler'


jest.mock('@sentry/nextjs')
jest.mock('@aces/lib/hooks/issues/issues-context')
jest.mock('@aces/lib/hooks/votes/use-votes')
jest.mock('@aces/lib/hooks/auth/use-current-user')
jest.mock('@aces/lib/socket/inbound-handler')

const mockSentryCapture = Sentry.captureException as jest.MockedFunction<typeof Sentry.captureException>
const mockUseIssues = useIssues as jest.MockedFunction<typeof useIssues>
const mockUseVotes = useVotes as jest.MockedFunction<typeof useVotes>
const mockUseCurrentUser = useCurrentUser as jest.MockedFunction<typeof useCurrentUser>
const mockInboundHandler = inboundHandler as jest.MockedFunction<typeof inboundHandler>

describe('WebSocketProvider', () => {
  let mockWebSocket: jest.Mock
  let mockFetch: jest.Mock
  const mockRoundId = 'test-round-id'
  const mockOnVoteReceived = jest.fn()
  const mockOnError = jest.fn()
  const mockOnConnectionChange = jest.fn()

  beforeEach(() => {
    jest.resetAllMocks()
    mockWebSocket = jest.fn(() => ({
      onopen: null,
      onmessage: null,
      onclose: null,
      close: jest.fn(),
    }))
    global.WebSocket = mockWebSocket as unknown as jest.MockedClass<typeof WebSocket>
    mockFetch = jest.fn(() => Promise.resolve())
    global.fetch = mockFetch

    mockUseIssues.mockReturnValue({
      currentIssue: null,
      setCurrentIssue: jest.fn(),
    } as unknown as ReturnType<typeof useIssues>)
    mockUseVotes.mockReturnValue({
      setVotes: jest.fn(),
      setExpectedVotes: jest.fn(),
    } as unknown as ReturnType<typeof useVotes>)
    mockUseCurrentUser.mockReturnValue({ user: undefined, isLoading: false, error: undefined })

    process.env.NEXT_PUBLIC_WEBSOCKET = 'ws://test.com'
    process.env.NEXT_PUBLIC_API_URL = 'http://test.com'
  })

  it('should initialize WebSocket connection', () => {
    render(
      <WebSocketProvider
        roundId={mockRoundId}
        onVoteReceived={mockOnVoteReceived}
        onError={mockOnError}
        onConnectionChange={mockOnConnectionChange}
      />
    )

    expect(mockWebSocket).toHaveBeenCalledWith(`ws://test.com?roundId=${mockRoundId}`)
  })

  it('should handle WebSocket open event', () => {
    render(
      <WebSocketProvider
        roundId={mockRoundId}
        onVoteReceived={mockOnVoteReceived}
        onError={mockOnError}
        onConnectionChange={mockOnConnectionChange}
      />
    )

    const websocketInstance = mockWebSocket.mock.results[0].value
    act(() => {
      websocketInstance.onopen()
    })

    expect(mockOnConnectionChange).toHaveBeenCalledWith(true)
  })

  it('should handle WebSocket close event', () => {
    render(
      <WebSocketProvider
        roundId={mockRoundId}
        onVoteReceived={mockOnVoteReceived}
        onError={mockOnError}
        onConnectionChange={mockOnConnectionChange}
      />
    )

    const websocketInstance = mockWebSocket.mock.results[0].value
    act(() => {
      websocketInstance.onclose()
    })

    expect(mockOnConnectionChange).toHaveBeenCalledWith(false)
  })

  it('should handle ROUND_ISSUE_UPDATED message', () => {
    const mockSetCurrentIssue = jest.fn()
    mockUseIssues.mockReturnValue({
      currentIssue: { id: 'old-issue' },
      setCurrentIssue: mockSetCurrentIssue,
    } as unknown as ReturnType<typeof useIssues>)

    const mockSetVotes = jest.fn()
    const mockSetExpectedVotes = jest.fn()
    mockUseVotes.mockReturnValue({
      setVotes: mockSetVotes,
      setExpectedVotes: mockSetExpectedVotes,
    } as unknown as ReturnType<typeof useVotes>)

    mockInboundHandler.mockReturnValue({
      event: 'roundIssueUpdated',
      payload: {
        issue: { id: 'new-issue' },
        votes: [1, 2, 3],
        expectedVotes: 5,
      },
    })

    render(
      <WebSocketProvider
        roundId={mockRoundId}
        onVoteReceived={mockOnVoteReceived}
        onError={mockOnError}
        onConnectionChange={mockOnConnectionChange}
      />
    )

    const websocketInstance = mockWebSocket.mock.results[0].value
    act(() => {
      websocketInstance.onmessage({ data: 'test-message' })
    })

    expect(mockSetCurrentIssue).toHaveBeenCalledWith({ id: 'new-issue' })
    expect(mockSetVotes).toHaveBeenCalledWith([1, 2, 3])
    expect(mockSetExpectedVotes).toHaveBeenCalledWith(5)
  })

  it('should handle VOTE_UPDATED message', () => {
    const mockSetVotes = jest.fn()
    const mockSetExpectedVotes = jest.fn()
    mockUseVotes.mockReturnValue({
      setVotes: mockSetVotes,
      setExpectedVotes: mockSetExpectedVotes,
    } as unknown as ReturnType<typeof useVotes>)

    mockInboundHandler.mockReturnValue({
      event: 'voteUpdated',
      payload: {
        votes: [1, 2, 3],
        expectedVotes: 5,
      },
    })

    render(
      <WebSocketProvider
        roundId={mockRoundId}
        onVoteReceived={mockOnVoteReceived}
        onError={mockOnError}
        onConnectionChange={mockOnConnectionChange}
      />
    )

    const websocketInstance = mockWebSocket.mock.results[0].value
    act(() => {
      websocketInstance.onmessage({ data: 'test-message' })
    })

    expect(mockOnVoteReceived).toHaveBeenCalledWith({
      votes: [1, 2, 3],
      expectedVotes: 5,
    })
    expect(mockSetVotes).toHaveBeenCalledWith([1, 2, 3])
    expect(mockSetExpectedVotes).toHaveBeenCalledWith(5)
  })

  it('should handle ERROR message', () => {
    mockInboundHandler.mockReturnValue({
      event: 'error',
      payload: 'Test error message',
    })

    render(
      <WebSocketProvider
        roundId={mockRoundId}
        onVoteReceived={mockOnVoteReceived}
        onError={mockOnError}
        onConnectionChange={mockOnConnectionChange}
      />
    )

    const websocketInstance = mockWebSocket.mock.results[0].value
    act(() => {
      websocketInstance.onmessage({ data: 'test-message' })
    })

    expect(mockOnError).toHaveBeenCalledWith('Test error message')
    expect(mockSentryCapture).toHaveBeenCalledWith('Error received from WebSocket: Test error message')
  })

  it('should handle unknown message type', () => {
    mockInboundHandler.mockReturnValue({
      // @ts-expect-error - Testing unknown message type
      event: 'unknownEvent',
      payload: {},
    })

    render(
      <WebSocketProvider
        roundId={mockRoundId}
        onVoteReceived={mockOnVoteReceived}
        onError={mockOnError}
        onConnectionChange={mockOnConnectionChange}
      />
    )

    const websocketInstance = mockWebSocket.mock.results[0].value
    act(() => {
      websocketInstance.onmessage({ data: 'test-message' })
    })

    expect(mockSentryCapture).toHaveBeenCalledWith('Unknown message type received from WebSocket: unknownEvent')
  })

  it('should disconnect on unmount', () => {
    const { unmount } = render(
      <WebSocketProvider
        roundId={mockRoundId}
        onVoteReceived={mockOnVoteReceived}
        onError={mockOnError}
        onConnectionChange={mockOnConnectionChange}
      />
    )

    const websocketInstance = mockWebSocket.mock.results[0].value
    unmount()

    expect(websocketInstance.close).toHaveBeenCalled()
  })

  it('should not update currentIssue for authenticated users', () => {
    const mockSetCurrentIssue = jest.fn()
    mockUseIssues.mockReturnValue({
      issues: [],
      setIssues: jest.fn(),
      isLoading: false,
      loadIssues: jest.fn(),
      currentIssue: { id: 'old-issue' } as Issue,
      setCurrentIssue: mockSetCurrentIssue,
    })
    mockUseCurrentUser.mockReturnValue({ user: { linearId: 'test-linear-id' } as User, isLoading: false, error: undefined })

    mockInboundHandler.mockReturnValue({
      event: 'roundIssueUpdated',
      payload: {
        issue: { id: 'new-issue' },
        votes: [],
        expectedVotes: 0,
      },
    })

    render(
      <WebSocketProvider
        roundId={mockRoundId}
        onVoteReceived={mockOnVoteReceived}
        onError={mockOnError}
        onConnectionChange={mockOnConnectionChange}
      />
    )

    const websocketInstance = mockWebSocket.mock.results[0].value
    act(() => {
      websocketInstance.onmessage({ data: 'test-message' })
    })

    expect(mockSetCurrentIssue).not.toHaveBeenCalled()
  })
})
