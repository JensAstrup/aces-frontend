import { act, renderHook } from '@testing-library/react'
import WS from 'jest-websocket-mock'

import useWebSocketIssue from '@aces/lib/hooks/issues/use-websocket-issue'


describe('useWebSocketIssue', () => {
  const mockApiHost = 'ws://example.com'
  let server: WS

  beforeEach(() => {
    process.env.NEXT_PUBLIC_WEBSOCKET = mockApiHost
  })

  afterEach(() => {
    WS.clean()
  })

  it('should initialize with null issue and isLoading true', async () => {
    const mockRoundId = '123'
    server = new WS(`${mockApiHost}?roundId=${mockRoundId}`)
    const { result } = renderHook(() => useWebSocketIssue(mockRoundId))
    await server.connected
    expect(result.current).toEqual({ issue: null, isLoading: true })
  })

  it('should update issue and set isLoading to false when receiving a valid message', async () => {
    const mockRoundId = '123'
    server = new WS(`${mockApiHost}?roundId=${mockRoundId}`)
    const mockIssue = { id: '1', title: 'Test Issue' }
    const { result } = renderHook(() => useWebSocketIssue(mockRoundId))

    await server.connected

    await act(() => {
      server.send(JSON.stringify(mockIssue))
    })

    expect(result.current).toEqual({ issue: mockIssue, isLoading: false })
  })

  it('should handle error when receiving an invalid message', async () => {
    const mockRoundId = '123'
    server = new WS(`${mockApiHost}?roundId=${mockRoundId}`)
    const { result } = renderHook(() => useWebSocketIssue(mockRoundId))

    await server.connected

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    await act(async () => {
      server.send('invalid JSON')
    })

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error parsing websocket message:', expect.any(Error))
    expect(result.current).toEqual({ issue: null, isLoading: false })

    consoleErrorSpy.mockRestore()
  })

  it('should close WebSocket connection on cleanup', async () => {
    const mockRoundId = '123'
    server = new WS(`${mockApiHost}?roundId=${mockRoundId}`)
    const { unmount } = renderHook(() => useWebSocketIssue(mockRoundId))
    await server.connected
    unmount()
    expect(server.closed).toBeTruthy()
  })

  it('should recreate WebSocket connection when roundId changes', async () => {
    const initialRoundId = '123'
    server = new WS(`${mockApiHost}?roundId=${initialRoundId}`)

    const { result, rerender } = renderHook(({ roundId }) => useWebSocketIssue(roundId), {
      initialProps: { roundId: initialRoundId },
    })

    await server.connected

    const newRoundId = '456'

    server.close()

    const newServer = new WS(`${mockApiHost}?roundId=${newRoundId}`)

    await act(async () => {
      rerender({ roundId: newRoundId })
    })

    await newServer.connected

    const newIssue = { id: '2', title: 'New Test Issue' }
    await act(async () => {
      newServer.send(JSON.stringify(newIssue))
    })

    expect(result.current).toEqual({ issue: newIssue, isLoading: false })

    newServer.close()
  })
})
