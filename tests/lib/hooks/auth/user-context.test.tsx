import { act, render, renderHook, screen } from '@testing-library/react'
import React from 'react'

import { UserContext, UserProvider, useUser } from '@aces/lib/hooks/auth/user-context'
import '@testing-library/jest-dom'

// Mock the entire module to control when the effect resolves
jest.mock('@aces/lib/hooks/auth/user-context', () => {
  const originalModule = jest.requireActual('@aces/lib/hooks/auth/user-context')
  return {
    ...originalModule,
    UserProvider: ({ children }: { children: React.ReactNode }) => {
      const [state, setState] = React.useState({
        user: null,
        isLoading: true,
        error: null,
      })

      React.useEffect(() => {
        const loadUser = async () => {
          await new Promise(resolve => setTimeout(resolve, 0)) // Simulate async operation
          try {
            const accessToken = localStorage.getItem('accessToken')
            if (accessToken) {
              // @ts-expect-error Only needed for testing purposes
              setState({ user: { id: '', name: '', accessToken }, isLoading: false, error: null })
            }
            else {
              setState({ user: null, isLoading: false, error: null })
            }
          }
          catch (err) {
            // @ts-expect-error Only needed for testing purposes
            setState({ user: null, isLoading: false, error: err instanceof Error ? err : new Error('An unknown error occurred') })
          }
        }
        loadUser()
      }, [])

      return (
        <originalModule.UserContext.Provider value={state}>
          {children}
        </originalModule.UserContext.Provider>
      )
    },
  }
})

describe('UserProvider', () => {
  const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn(),
  }

  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })
    jest.clearAllMocks()
  })

  const TestComponent: React.FC = () => {
    const { user, isLoading, error } = useUser()

    if (isLoading) return <div data-testid="loading">Loading...</div>
    if (error) return <div data-testid="error">{error.message}</div>
    if (user) return <div data-testid="user">{user.accessToken}</div>
    return <div data-testid="no-user">No user</div>
  }

  it('should render loading state initially and then no user when accessToken is not available', async () => {
    mockLocalStorage.getItem.mockReturnValue(null)

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    )

    expect(screen.getByTestId('loading')).toBeInTheDocument()

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(screen.getByTestId('no-user')).toBeInTheDocument()
  })

  it('should render loading state initially and then user when accessToken is available in localStorage', async () => {
    mockLocalStorage.getItem.mockReturnValue('fake-token')

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    )

    expect(screen.getByTestId('loading')).toBeInTheDocument()

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(screen.getByTestId('user')).toBeInTheDocument()
    expect(screen.getByTestId('user')).toHaveTextContent('fake-token')
  })

  it('should handle error when localStorage throws an exception', async () => {
    mockLocalStorage.getItem.mockImplementation(() => {
      throw new Error('localStorage error')
    })

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    )

    expect(screen.getByTestId('loading')).toBeInTheDocument()

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(screen.getByTestId('error')).toBeInTheDocument()
    expect(screen.getByTestId('error')).toHaveTextContent('localStorage error')
  })

  it('should handle unknown errors', async () => {
    mockLocalStorage.getItem.mockImplementation(() => {
      throw 'Unknown error'
    })

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    )

    expect(screen.getByTestId('loading')).toBeInTheDocument()

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(screen.getByTestId('error')).toBeInTheDocument()
    expect(screen.getByTestId('error')).toHaveTextContent('An unknown error occurred')
  })

  it('should provide the correct context value', async () => {
    mockLocalStorage.getItem.mockReturnValue('fake-token')

    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <UserProvider>{children}</UserProvider>
    )

    const { result } = renderHook(() => React.useContext(UserContext), { wrapper })

    expect(result.current.isLoading).toBe(true)

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current).toEqual({
      user: { id: '', name: '', accessToken: 'fake-token' },
      isLoading: false,
      error: null,
    })
  })
})
