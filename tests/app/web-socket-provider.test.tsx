import { act, render, waitFor } from '@testing-library/react'
import React from 'react'

import WebSocketProvider from '@aces/app/web-socket-provider'
import { useIssues } from '@aces/lib/hooks/issues/issues-context'
import { useVotes } from '@aces/lib/hooks/votes/use-votes'
import inboundHandler from '@aces/lib/socket/inbound-handler'


jest.mock('@aces/lib/hooks/issues/issues-context')
jest.mock('@aces/lib/hooks/votes/use-votes')
jest.mock('@aces/lib/socket/inbound-handler')

const mockUseIssues = useIssues as jest.MockedFunction<typeof useIssues>
const mockUseVotes = useVotes as jest.MockedFunction<typeof useVotes>
const mockInboundHandler = inboundHandler as jest.MockedFunction<typeof inboundHandler>

describe('WebSocketProvider', () => {
  let mockWebSocket: jest.Mocked<WebSocket>
  const mockSetCurrentIssue = jest.fn()
  const mockSetVotes = jest.fn()
  const mockSetExpectedVotes = jest.fn()
  const mockOnVoteReceived = jest.fn()
  const mockOnError = jest.fn()
  const mockRoundId = 'test-round-id'

  beforeEach(() => {
    jest.resetAllMocks()
    mockUseIssues.mockReturnValue({
      state: {
        issues: [],
        currentIssueIndex: 0,
        selectedView: null,
        nextPage: null,
        isLoading: false,
      },
      dispatch: jest.fn(),
      currentIssue: null,
      setCurrentIssue: mockSetCurrentIssue,
    })
    mockUseVotes.mockReturnValue({
      votes: [],
      expectedVotes: 0,
      setVotes: mockSetVotes,
      setExpectedVotes: mockSetExpectedVotes,
    })

    mockWebSocket = {
      onmessage: null,
      onclose: null,
      close: jest.fn(),
    } as unknown as jest.Mocked<WebSocket>

    global.WebSocket = jest.fn(() => mockWebSocket) as unknown as typeof WebSocket
    jest.spyOn(console, 'log').mockImplementation()
    jest.spyOn(console, 'error').mockImplementation()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should initialize WebSocket connection', () => {
    render(<WebSocketProvider roundId={mockRoundId} />)
    expect(global.WebSocket).toHaveBeenCalledWith(`${process.env.NEXT_PUBLIC_WEBSOCKET}?roundId=${mockRoundId}`)
  })

  it('should handle roundIssueUpdated message', () => {
    const mockIssue = { id: '1', title: 'Test Issue' }
    mockInboundHandler.mockReturnValueOnce({ event: 'roundIssueUpdated', payload: mockIssue })

    render(<WebSocketProvider roundId={mockRoundId} />)

    act(() => {
      mockWebSocket.onmessage!({ data: 'test' } as MessageEvent)
    })

    expect(mockSetCurrentIssue).toHaveBeenCalledWith(mockIssue)
    expect(mockSetVotes).toHaveBeenCalledWith([])
  })

  it('should handle response message', () => {
    const mockIssue = { id: '2', title: 'Another Test Issue' }
    mockInboundHandler.mockReturnValueOnce({ event: 'response', payload: mockIssue })

    render(<WebSocketProvider roundId={mockRoundId} />)

    act(() => {
      mockWebSocket.onmessage!({ data: 'test' } as MessageEvent)
    })

    expect(mockSetCurrentIssue).toHaveBeenCalledWith(mockIssue)
  })

  it('should handle voteUpdated message', () => {
    const mockVotePayload = { votes: [1, 2, 3], expectedVotes: 5 }
    mockInboundHandler.mockReturnValueOnce({ event: 'voteUpdated', payload: mockVotePayload })

    render(<WebSocketProvider roundId={mockRoundId} onVoteReceived={mockOnVoteReceived} />)

    act(() => {
      mockWebSocket.onmessage!({ data: 'test' } as MessageEvent)
    })

    expect(mockOnVoteReceived).toHaveBeenCalledWith(mockVotePayload)
    expect(mockSetVotes).toHaveBeenCalledWith(mockVotePayload.votes)
    expect(mockSetExpectedVotes).toHaveBeenCalledWith(mockVotePayload.expectedVotes)
  })

  it('should handle error message', () => {
    const mockError = 'Test error'
    mockInboundHandler.mockReturnValueOnce({ event: 'error', payload: mockError })

    render(<WebSocketProvider roundId={mockRoundId} onError={mockOnError} />)

    act(() => {
      mockWebSocket.onmessage!({ data: 'test' } as MessageEvent)
    })

    expect(mockOnError).toHaveBeenCalledWith(mockError)
  })

  it('should log unknown message types', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
    // @ts-expect-error Mocking an invalid message event for testing
    mockInboundHandler.mockReturnValueOnce({ event: 'unknownEvent', payload: 'test' })

    render(<WebSocketProvider roundId={mockRoundId} />)

    act(() => {
      mockWebSocket.onmessage!({ data: 'test' } as MessageEvent)
    })

    expect(consoleErrorSpy).toHaveBeenCalledWith('Unknown message type received from WebSocket:', { event: 'unknownEvent', payload: 'test' })
    consoleErrorSpy.mockRestore()
  })

  it('should close WebSocket connection on unmount', () => {
    const { unmount } = render(<WebSocketProvider roundId={mockRoundId} />)
    unmount()
    expect(mockWebSocket.close).toHaveBeenCalled()
  })

  it('should handle beforeunload event', () => {
    const mockFetch = jest.fn().mockResolvedValue({ ok: true })
    global.fetch = mockFetch

    render(<WebSocketProvider roundId={mockRoundId} />)

    act(() => {
      window.dispatchEvent(new Event('beforeunload'))
    })

    expect(mockWebSocket.close).toHaveBeenCalled()
    expect(mockFetch).toHaveBeenCalledWith(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/disconnect`,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Authorization': ''
        }),
        body: JSON.stringify({ roundId: mockRoundId }),
        keepalive: true
      })
    )
  })

  it('should use localStorage token for authorization if available', () => {
    const mockToken = 'test-token'
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
      if (key === 'accessToken') return mockToken
      return null
    })

    const mockFetch = jest.fn().mockResolvedValue({ ok: true })
    global.fetch = mockFetch

    render(<WebSocketProvider roundId={mockRoundId} />)

    act(() => {
      window.dispatchEvent(new Event('beforeunload'))
    })

    expect(mockFetch).toHaveBeenCalledWith(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/disconnect`,
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: mockToken
        })
      })
    )
  })
})
