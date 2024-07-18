import { act, render } from '@testing-library/react'
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
      const { user, setUser } = useUser()
      return (
        <div>
          <span data-testid="user-name">{user?.name || 'No user'}</span>
          <button onClick={() => {
            setUser({ id: '1', name: 'Test User', accessToken: 'token' })
          }}
          >
            Set User
          </button>
        </div>
      )
    }

    const { getByTestId, getByText } = render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    )

    expect(getByTestId('user-name').textContent).toBe('No user')

    act(() => {
      getByText('Set User').click()
    })

    expect(getByTestId('user-name').textContent).toBe('Test User')
  })

  test('loads user from localStorage on mount', () => {
    const storedUser = { id: '2', name: 'Stored User', accessToken: 'stored-token' }
    localStorageMock.getItem.mockReturnValue(JSON.stringify(storedUser))

    const TestComponent = () => {
      const { user } = useUser()
      return <span data-testid="user-name">{user?.name || 'No user'}</span>
    }

    const { getByTestId } = render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    )

    expect(localStorageMock.getItem).toHaveBeenCalledWith('user')
    expect(getByTestId('user-name').textContent).toBe('Stored User')
  })

  test('throws error when useUser is used outside of UserProvider', () => {
    const TestComponent = () => {
      useUser()
      return null
    }

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      render(<TestComponent />)
    }).toThrow('useUser must be used within a UserProvider')

    consoleErrorSpy.mockRestore()
  })
})
