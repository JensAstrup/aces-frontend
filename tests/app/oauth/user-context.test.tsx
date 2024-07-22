import { render } from '@testing-library/react'
import React from 'react'

import { UserProvider, useUser } from '@aces/app/oauth/user-context'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('UserProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('provides user context to children', () => {
    const TestComponent = () => {
      const user = useUser()
      return (
        <div>
          <span data-testid="user-name">{user?.name || 'No user'}</span>
          <span data-testid="user-token">{user?.accessToken || 'No token'}</span>
        </div>
      )
    }

    const { getByTestId } = render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    )

    expect(getByTestId('user-name').textContent).toBe('No user')
    expect(getByTestId('user-token').textContent).toBe('No token')
  })

  test('loads accessToken from localStorage on mount', () => {
    const storedToken = 'stored-token'
    localStorageMock.getItem.mockReturnValue(storedToken)

    const TestComponent = () => {
      const user = useUser()
      return <span data-testid="user-token">{user?.accessToken || 'No token'}</span>
    }

    const { getByTestId } = render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    )

    expect(localStorageMock.getItem).toHaveBeenCalledWith('accessToken')
    expect(getByTestId('user-token').textContent).toBe(storedToken)
  })
})
