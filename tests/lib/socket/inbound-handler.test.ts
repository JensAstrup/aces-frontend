import * as Sentry from '@sentry/nextjs'

import inboundHandler from '@aces/lib/socket/inbound-handler'


jest.mock('@sentry/nextjs', () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
}))

describe('inboundHandler', () => {
  it('should return the parsed message', () => {
    const event = { data: '{"type":"test"}' } as MessageEvent
    const result = inboundHandler(event)
    expect(result).toEqual({ type: 'test' })
    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({ category: 'socket', message: 'Inbound message received', level: 'info', data: { event } })
  })

  it('should return null and capture exception if parsing fails', () => {
    const event = { data: 'invalid' } as MessageEvent
    const result = inboundHandler(event)
    expect(result).toBeNull()
    expect(Sentry.captureException).toHaveBeenCalled()
  })
})
