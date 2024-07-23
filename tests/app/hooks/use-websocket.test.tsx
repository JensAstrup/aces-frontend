import { act, renderHook } from '@testing-library/react'
import WS from 'jest-websocket-mock'

import useWebSocketIssue from '@aces/lib/hooks/use-websocket'


describe('useWebSocketIssue', () => {
  const mockApiHost = 'ws://example.com'
  let server: WS

  beforeEach(() => {
    process.env.NEXT_PUBLIC_WEBSOCKET = mockApiHost
  })

  afterEach(() => {
    WS.clean()
  })

  it('should initialize with null currentIssue', async () => {
    const mockRoundId = '123'
    server = new WS(`${mockApiHost}?roundId=${mockRoundId}`)
    const { result } = renderHook(() => useWebSocketIssue(mockRoundId))
    await server.connected
    expect(result.current).toBeNull()
  })

  it('should update currentIssue when receiving a valid message', async () => {
    const mockRoundId = '123'
    server = new WS(`${mockApiHost}?roundId=${mockRoundId}`)
    const mockIssue = { id: '1', title: 'Test Issue' }
    const { result } = renderHook(() => useWebSocketIssue(mockRoundId))

    await server.connected

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      server.send(JSON.stringify(mockIssue))
    })

    expect(result.current).toEqual(mockIssue)
  })

  it('should handle error when receiving an invalid message', async () => {
    const mockRoundId = '123'
    server = new WS(`${mockApiHost}?roundId=${mockRoundId}`)
    const { result } = renderHook(() => useWebSocketIssue(mockRoundId))

    await server.connected

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      server.send('invalid JSON')
    })

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error parsing websocket message:', expect.any(Error))
    expect(result.current).toBeNull()

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

    // Close the first server before creating a new one
    server.close()

    // Create a new server for the new roundId
    const newServer = new WS(`ws://${mockApiHost}?roundId=${newRoundId}`)

    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      rerender({ roundId: newRoundId })
    })

    await newServer.connected

    // Send a message to the new server
    const newIssue = { id: '2', title: 'New Test Issue' }
    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      newServer.send(JSON.stringify(newIssue))
    })

    expect(result.current).toEqual(newIssue)

    newServer.close()
  })
})
