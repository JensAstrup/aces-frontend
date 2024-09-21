import * as Sentry from '@sentry/react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'

import Stats from '@aces/components/stats/stats'
import { useToast } from '@aces/components/ui/use-toast'
import setEstimate from '@aces/lib/actions/estimate'
import { useCurrentUser } from '@aces/lib/hooks/auth/use-current-user'
import { useIssues } from '@aces/lib/hooks/issues/issues-context'
import roundToNearestFibonacci from '@aces/lib/utils/round-to-nearest-fibonacci'


jest.mock('@sentry/react', () => ({
  captureException: jest.fn(),
}))

jest.mock('@aces/lib/actions/estimate', () => jest.fn())

jest.mock('@aces/lib/hooks/auth/use-current-user', () => ({
  useCurrentUser: jest.fn(),
}))

jest.mock('@aces/lib/hooks/issues/issues-context', () => ({
  useIssues: jest.fn(),
}))

jest.mock('@aces/components/ui/toaster', () => ({
  Toaster: jest.fn(() => null),
}))

jest.mock('@aces/components/ui/use-toast', () => ({
  useToast: jest.fn(),
}))

jest.mock('@aces/components/ui/toaster', () => ({
  Toaster: jest.fn(() => null),
}))

jest.mock('@aces/components/ui/toast', () => ({
  // @ts-expect-error Mocking children here
  ToastProvider: ({ children }) => children,
}))

jest.mock('@aces/components/stats/stat-card', () => (props: { title: string, value: number, onClick: () => unknown, disabled: boolean }) => (
  <button data-testid={`stat-card-${props.title}`} onClick={props.onClick} disabled={props.disabled}>
    {props.title}
:
    {props.value}
  </button>
))

jest.mock('@aces/lib/utils/calculate-stats', () => ({
  calculateStats: (votes: Array<number | null>) => {
    const filteredVotes = votes.filter(v => v !== null)
    const sorted = [...filteredVotes].sort((a, b) => a - b)
    const lowest = sorted[0]
    const highest = sorted[sorted.length - 1]
    const median = sorted[Math.floor(sorted.length / 2)]
    const average = sorted.reduce((a, b) => a + b, 0) / sorted.length
    return { lowest, highest, median, average }
  },
}))

jest.mock('@aces/lib/utils/round-to-nearest-fibonacci', () => jest.fn((n: number) => {
  // Simple mock: return the number itself for testing
  return n
}))
const mockRoundToNearestFibonacci = roundToNearestFibonacci as jest.Mock

describe('Stats Component', () => {
  const mockUseCurrentUser = useCurrentUser as jest.Mock
  const mockUseIssues = useIssues as jest.Mock
  const mockUseToast = useToast as jest.Mock
  const mockSetEstimate = setEstimate as jest.Mock
  const mockCaptureException = Sentry.captureException as jest.Mock

  const mockToast = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseToast.mockReturnValue({ toast: mockToast })
  })

  it('should render nothing when votes array is empty', () => {
    mockUseIssues.mockReturnValue({ currentIssue: { id: 'issue-1' } })
    mockUseCurrentUser.mockReturnValue({ user: { linearId: 'user-1' } })

    const { container } = render(<Stats votes={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('should render all stats when votes array is not empty', () => {
    const votes = [1, 2, 3, 5, 8]
    mockUseIssues.mockReturnValue({ currentIssue: { id: 'issue-1' } })
    mockUseCurrentUser.mockReturnValue({ user: { linearId: 'user-1' } })

    render(<Stats votes={votes} />)

    expect(screen.getByText('Stats')).toBeInTheDocument()
    expect(screen.getByTestId('stat-card-Lowest')).toHaveTextContent('Lowest:1')
    expect(screen.getByTestId('stat-card-Median')).toHaveTextContent('Median:3')
    expect(screen.getByTestId('stat-card-Average')).toHaveTextContent('Average:4')
    expect(screen.getByTestId('stat-card-Highest')).toHaveTextContent('Highest:8')
  })

  it('should call setEstimate and show success toast when a stat is clicked successfully', async () => {
    const votes = [1, 2, 3, 5, 8]
    mockUseIssues.mockReturnValue({ currentIssue: { id: 'issue-1' } })
    mockUseCurrentUser.mockReturnValue({ user: { linearId: 'user-1' } })
    mockSetEstimate.mockResolvedValueOnce({})

    mockRoundToNearestFibonacci.mockImplementation((n: number) => n)

    render(<Stats votes={votes} />)

    const statButton = screen.getByTestId('stat-card-Lowest')
    fireEvent.click(statButton)

    await waitFor(() => {
      expect(mockSetEstimate).toHaveBeenCalledWith('issue-1', 1)
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Estimate set',
        description: 'Estimate set successfully to 1',
        duration: 3000,
      })
    })
  })

  it('should show error toast and capture exception when setEstimate fails', async () => {
    const votes = [1, 2, 3, 5, 8]
    mockUseIssues.mockReturnValue({ currentIssue: { id: 'issue-1' } })
    mockUseCurrentUser.mockReturnValue({ user: { linearId: 'user-1' } })
    const error = new Error('Network Error')
    mockSetEstimate.mockRejectedValueOnce(error)

    mockRoundToNearestFibonacci.mockImplementation((n: number) => n)

    render(<Stats votes={votes} />)

    const statButton = screen.getByTestId('stat-card-Highest')
    fireEvent.click(statButton)

    await waitFor(() => {
      expect(mockSetEstimate).toHaveBeenCalledWith('issue-1', 8)
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'An error occurred while setting the estimate',
        duration: 5000,
        variant: 'destructive',
      })
      expect(mockCaptureException).toHaveBeenCalledWith(error)
    })
  })

  it('should not call setEstimate when user does not have linearId', () => {
    const votes = [1, 2, 3]
    mockUseIssues.mockReturnValue({ currentIssue: { id: 'issue-1' } })
    mockUseCurrentUser.mockReturnValue({ user: null })

    render(<Stats votes={votes} />)

    const statButton = screen.getByTestId('stat-card-Median')
    fireEvent.click(statButton)

    expect(mockSetEstimate).not.toHaveBeenCalled()
    expect(mockToast).not.toHaveBeenCalled()
  })

  it('should not call setEstimate if currentIssue.id is missing', () => {
    const votes = [1, 2, 3]
    mockUseIssues.mockReturnValue({ currentIssue: null })
    mockUseCurrentUser.mockReturnValue({ user: { linearId: 'user-1' } })

    render(<Stats votes={votes} />)

    const statButton = screen.getByTestId('stat-card-Median')
    fireEvent.click(statButton)

    expect(mockSetEstimate).not.toHaveBeenCalled()
    expect(mockToast).not.toHaveBeenCalled()
  })

  it('should prevent multiple submissions', async () => {
    const votes = [1, 2, 3]
    mockUseIssues.mockReturnValue({ currentIssue: { id: 'issue-1' } })
    mockUseCurrentUser.mockReturnValue({ user: { linearId: 'user-1' } })
    mockSetEstimate.mockResolvedValue({})

    render(<Stats votes={votes} />)

    const statButton = screen.getByTestId('stat-card-Lowest')
    fireEvent.click(statButton)
    fireEvent.click(statButton)

    await waitFor(() => {
      expect(mockSetEstimate).toHaveBeenCalledTimes(1)
      expect(mockToast).toHaveBeenCalledTimes(1)
    })
  })
})
