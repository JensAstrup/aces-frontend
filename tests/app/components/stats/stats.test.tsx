import * as Sentry from '@sentry/react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'

import Stats from '@aces/components/stats/stats'
import * as useToastModule from '@aces/components/ui/use-toast'
import * as setEstimateModule from '@aces/lib/actions/estimate'
import * as useCurrentUserModule from '@aces/lib/hooks/auth/use-current-user'
import * as useIssuesModule from '@aces/lib/hooks/issues/issues-context'

// Mock Sentry
jest.mock('@sentry/react', () => ({
  captureException: jest.fn(),
}))

// Mock setEstimate
jest.mock('@aces/lib/actions/estimate', () => ({
  __esModule: true,
  default: jest.fn(),
}))

// Mock useIssues
jest.mock('@aces/lib/hooks/issues/issues-context', () => ({
  useIssues: jest.fn(),
}))

// Mock useCurrentUser
jest.mock('@aces/lib/hooks/auth/use-current-user', () => ({
  useCurrentUser: jest.fn(),
}))

// Mock useToast
jest.mock('@aces/components/ui/use-toast', () => ({
  useToast: jest.fn(),
}))

// Mock StatCard component
jest.mock('@aces/components/stats/card', () => ({
  __esModule: true,
  default: ({ stat, onClick, disabled }: { stat: { title: string, value: number }, onClick: () => void, disabled: boolean }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid={`stat-card-${stat.title}`}
    >
      {stat.title}
:
      {stat.value}
    </button>
  ),
}))

// Mock Toaster component
jest.mock('@aces/components/ui/toaster', () => ({
  __esModule: true,
  Toaster: () => <div data-testid="toaster">Toaster</div>,
}))

describe('Stats Component', () => {
  // Explicitly type the mocks using Jest's Mock type
  let mockUseIssues: jest.Mock
  let mockUseCurrentUser: jest.Mock
  let mockUseToast: jest.Mock
  let mockSetEstimate: jest.Mock
  let mockToast: jest.Mock

  beforeEach(() => {
    // Reset all mocks before each test to ensure test isolation
    jest.resetAllMocks()

    // Assign the mocked modules to typed variables
    mockUseIssues = useIssuesModule.useIssues as jest.Mock
    mockUseCurrentUser = useCurrentUserModule.useCurrentUser as jest.Mock
    mockUseToast = useToastModule.useToast as jest.Mock
    mockSetEstimate = setEstimateModule.default as jest.Mock

    // Initialize mockToast as a Jest mock function
    mockToast = jest.fn()
    mockUseToast.mockReturnValue({
      toast: mockToast,
    })

    // Provide default mock implementations
    mockUseIssues.mockReturnValue({
      currentIssue: { id: 'issue-1' },
    })

    mockUseCurrentUser.mockReturnValue({
      user: { linearId: 'user-123' },
    })
  })

  test('renders stats correctly when votes are provided', () => {
    const votes: Array<number | null> = [1, 2, 3, 4, 5]
    render(<Stats votes={votes} />)

    // Check for the Stats heading
    expect(screen.getByText('Stats')).toBeInTheDocument()

    // Check each StatCard
    expect(screen.getByTestId('stat-card-Lowest')).toHaveTextContent('Lowest:1')
    expect(screen.getByTestId('stat-card-Median')).toHaveTextContent('Median:3')
    expect(screen.getByTestId('stat-card-Average')).toHaveTextContent('Average:3')
    expect(screen.getByTestId('stat-card-Highest')).toHaveTextContent('Highest:5')

    // Check for Toaster component
    expect(screen.getByTestId('toaster')).toBeInTheDocument()
  })

  test('does not render when votes array is empty', () => {
    const votes: Array<number | null> = []
    const { container } = render(<Stats votes={votes} />)
    expect(container.firstChild).toBeNull()
  })

  test('clicking on a stat calls setEstimate with correct value and shows success toast', async () => {
    const votes: Array<number | null> = [1, 2, 3, 4, 5]
    mockSetEstimate.mockResolvedValueOnce(undefined) // Simulate successful API call

    render(<Stats votes={votes} />)

    const lowestStat = screen.getByTestId('stat-card-Lowest')
    fireEvent.click(lowestStat)

    // Verify setEstimate is called with correct arguments
    expect(mockSetEstimate).toHaveBeenCalledWith('issue-1', 1)

    // Wait for toast to be called
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Estimate set',
        description: 'Estimate set successfully to 1',
        duration: 3000,
      })
    })
  })

  test('shows error toast and captures exception when setEstimate fails', async () => {
    const votes: Array<number | null> = [1, 2, 3, 4, 5]
    const mockError = new Error('Network Error')
    mockSetEstimate.mockRejectedValueOnce(mockError) // Simulate failed API call

    render(<Stats votes={votes} />)

    const highestStat = screen.getByTestId('stat-card-Highest')
    fireEvent.click(highestStat)

    // Verify setEstimate is called with correct arguments
    expect(mockSetEstimate).toHaveBeenCalledWith('issue-1', 5)

    // Wait for error toast and Sentry capture
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'An error occurred while setting the estimate',
        duration: 5000,
        variant: 'destructive',
      })
      expect(Sentry.captureException).toHaveBeenCalledWith(mockError)
    })
  })

  test('does not call setEstimate if user is not authenticated', () => {
    const votes: Array<number | null> = [1, 2, 3, 4, 5]

    // Mock useCurrentUser to return no user
    mockUseCurrentUser.mockReturnValue({
      user: null,
    })

    render(<Stats votes={votes} />)

    const medianStat = screen.getByTestId('stat-card-Median')
    fireEvent.click(medianStat)

    // Verify setEstimate is not called
    expect(mockSetEstimate).not.toHaveBeenCalled()

    // Verify toast is not called
    expect(mockToast).not.toHaveBeenCalled()
  })

  test('disables StatCard buttons while submitting', async () => {
    const votes: Array<number | null> = [1, 2, 3, 4, 5]
    let resolvePromise: () => void
    const promise = new Promise<void>((resolve) => {
      resolvePromise = resolve
    })
    mockSetEstimate.mockReturnValueOnce(promise)

    render(<Stats votes={votes} />)

    const averageStat = screen.getByTestId('stat-card-Average')
    fireEvent.click(averageStat)

    // Attempt to click another StatCard while submitting
    const lowestStat = screen.getByTestId('stat-card-Lowest')
    fireEvent.click(lowestStat)

    // setEstimate should not be called again
    expect(mockSetEstimate).toHaveBeenCalledTimes(1)
    expect(mockSetEstimate).toHaveBeenCalledWith('issue-1', 3)

    // Resolve the promise to simulate API response
    // @ts-expect-error resolvePromise is defined in the test
    resolvePromise()

    // Wait for toast to be called
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Estimate set',
        description: 'Estimate set successfully to 3',
        duration: 3000,
      })
    })

    // After submission, buttons should be enabled again
    expect(averageStat).not.toBeDisabled()
  })

  test('does not call setEstimate if currentIssue is undefined', () => {
    const votes: Array<number | null> = [1, 2, 3, 4, 5]

    // Mock useIssues to return no currentIssue
    mockUseIssues.mockReturnValue({
      currentIssue: null,
    })

    render(<Stats votes={votes} />)

    const lowestStat = screen.getByTestId('stat-card-Lowest')
    fireEvent.click(lowestStat)

    // Verify setEstimate is not called
    expect(mockSetEstimate).not.toHaveBeenCalled()

    // Verify toast is not called
    expect(mockToast).not.toHaveBeenCalled()
  })

  test('does not call setEstimate if submittingEstimate is true', async () => {
    const votes: Array<number | null> = [1, 2, 3, 4, 5]
    let resolvePromise: () => void
    const promise = new Promise<void>((resolve) => {
      resolvePromise = resolve
    })
    mockSetEstimate.mockReturnValueOnce(promise)

    render(<Stats votes={votes} />)

    const highestStat = screen.getByTestId('stat-card-Highest')
    fireEvent.click(highestStat)

    // Attempt to click another StatCard while submitting
    const lowestStat = screen.getByTestId('stat-card-Lowest')
    fireEvent.click(lowestStat)

    // Only the first click should trigger setEstimate
    expect(mockSetEstimate).toHaveBeenCalledTimes(1)
    expect(mockSetEstimate).toHaveBeenCalledWith('issue-1', 5)

    // Resolve the promise to clean up
    // @ts-expect-error resolvePromise is defined in the test
    resolvePromise()

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Estimate set',
        description: 'Estimate set successfully to 5',
        duration: 3000,
      })
    })
  })
})
