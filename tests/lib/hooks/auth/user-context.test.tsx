import { render, screen, waitFor } from '@testing-library/react'
import React from 'react'

import { UserProvider, useUser } from '@aces/lib/hooks/auth/user-context'
import '@testing-library/jest-dom'


jest.mock('@aces/lib/hooks/auth/user-context', () => ({
  ...jest.requireActual('@aces/lib/hooks/auth/user-context'),
  useUser: jest.fn(),
}))

const TestComponent = () => {
  const { user, isLoading, error } = useUser()

  if (isLoading) return <div data-testid="loading">Loading...</div>
  if (error) return <div data-testid="error">{error.message}</div>
  if (user) return <div data-testid="user">{user.accessToken}</div>
  return <div data-testid="no-user">No user</div>
}

describe('UserProvider', () => {
  it('renders loading state initially', () => {
    (useUser as jest.Mock).mockReturnValue({ user: null, isLoading: true, error: null })

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    )

    expect(screen.getByTestId('loading')).toBeInTheDocument()
  })

  it('renders user when user is available', async () => {
    (useUser as jest.Mock).mockReturnValue({ user: { id: '', name: '', accessToken: 'fake-token' }, isLoading: false, error: null })

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    )

    expect(screen.getByTestId('user')).toBeInTheDocument()
    expect(screen.getByTestId('user')).toHaveTextContent('fake-token')
  })

  it('renders no user when user is null', async () => {
    (useUser as jest.Mock).mockReturnValue({ user: null, isLoading: false, error: null })

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    )

    expect(screen.getByTestId('no-user')).toBeInTheDocument()
  })

  it('handles error state', async () => {
    (useUser as jest.Mock).mockReturnValue({ user: null, isLoading: false, error: new Error('Error loading user') })

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    )

    expect(screen.getByTestId('error')).toBeInTheDocument()
    expect(screen.getByTestId('error')).toHaveTextContent('Error loading user')
  })
})
