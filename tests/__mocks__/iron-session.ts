// __mocks__/iron-session.js

const mockGetIronSession = jest.fn()
const mockWithIronSession = jest.fn(handler => handler)

// If IronSession is a class or constructor you interact with:
const mockIronSession = jest.fn().mockImplementation(() => ({
  get: jest.fn(),
  set: jest.fn(),
  destroy: jest.fn(),
}))

module.exports = {
  getIronSession: mockGetIronSession,
  withIronSession: mockWithIronSession,
  IronSession: mockIronSession,
}
