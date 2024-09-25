import * as Sentry from '@sentry/react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'

import { Stats } from '@aces/components/stats/index'
import { useToast } from '@aces/components/ui/use-toast'
import { useCurrentUser } from '@aces/lib/hooks/auth/use-current-user'
import { useSubmitEstimate } from '@aces/lib/hooks/estimate/use-submit-estimate'
import { useIssues } from '@aces/lib/hooks/issues/issues-context'
import roundToNearestFibonacci from '@aces/lib/utils/round-to-nearest-fibonacci'


jest.mock('@sentry/react', () => ({
  captureException: jest.fn(),
}))

jest.mock('@aces/lib/hooks/estimate/use-submit-estimate', () => ({
  useSubmitEstimate: jest.fn(),
}))

jest.mock('@aces/lib/hooks/auth/use-current-user', () => ({
  useCurrentUser: jest.fn(),
}))

jest.mock('@aces/lib/hooks/issues/issues-context', () => ({
  useIssues: jest.fn(),
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

// eslint-disable-next-line react/display-name
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

jest.mock('@aces/lib/utils/round-to-nearest-fibonacci', () => jest.fn((n: number) => n))

describe('Stats Component', () => {
  const mockUseCurrentUser = useCurrentUser as jest.Mock
  const mockUseIssues = useIssues as jest.Mock
  const mockUseToast = useToast as jest.Mock
  const mockUseSubmitEstimate = useSubmitEstimate as jest.Mock
  const mockCaptureException = Sentry.captureException as jest.Mock
  const mockRoundToNearestFibonacci = roundToNearestFibonacci as jest.Mock

  const mockToast = jest.fn()
  const mockSubmitEstimate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseToast.mockReturnValue({ toast: mockToast })
    mockUseSubmitEstimate.mockReturnValue({
      error: null,
      isLoading: false,
      submitEstimate: mockSubmitEstimate,
    })
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

  it('should call submitEstimate and show success toast when a stat is clicked successfully', async () => {
    const votes = [1, 2, 3, 5, 8]
    mockUseIssues.mockReturnValue({ currentIssue: { id: 'issue-1' } })
    mockUseCurrentUser.mockReturnValue({ user: { linearId: 'user-1' } })
    mockSubmitEstimate.mockResolvedValueOnce({})
    mockRoundToNearestFibonacci.mockImplementation((n: number) => n)

    render(<Stats votes={votes} />)

    const statButton = screen.getByTestId('stat-card-Lowest')
    fireEvent.click(statButton)

    await waitFor(() => {
      expect(mockSubmitEstimate).toHaveBeenCalledWith('issue-1', 1)
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Estimate set',
        description: 'Estimate set successfully to 1',
        duration: 3000,
      })
    })
  })

  it('should not call submitEstimate when user does not have linearId', () => {
    const votes = [1, 2, 3]
    mockUseIssues.mockReturnValue({ currentIssue: { id: 'issue-1' } })
    mockUseCurrentUser.mockReturnValue({ user: null })

    render(<Stats votes={votes} />)

    const statButton = screen.getByTestId('stat-card-Median')
    fireEvent.click(statButton)

    expect(mockSubmitEstimate).not.toHaveBeenCalled()
    expect(mockToast).not.toHaveBeenCalled()
  })

  it('should not call submitEstimate if currentIssue.id is missing', () => {
    const votes = [1, 2, 3]
    mockUseIssues.mockReturnValue({ currentIssue: null })
    mockUseCurrentUser.mockReturnValue({ user: { linearId: 'user-1' } })

    render(<Stats votes={votes} />)

    const statButton = screen.getByTestId('stat-card-Median')
    fireEvent.click(statButton)

    expect(mockSubmitEstimate).not.toHaveBeenCalled()
    expect(mockToast).not.toHaveBeenCalled()
  })

  it('should show error toast when submitEstimate fails', async () => {
    const votes = [1, 2, 3]
    mockUseIssues.mockReturnValue({ currentIssue: { id: 'issue-1' } })
    mockUseCurrentUser.mockReturnValue({ user: { linearId: 'user-1' } })
    mockSubmitEstimate.mockRejectedValueOnce(new Error('Submission failed'))

    render(<Stats votes={votes} />)

    const statButton = screen.getByTestId('stat-card-Median')
    fireEvent.click(statButton)

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'An error occurred while setting the estimate',
        duration: 5000,
        variant: 'destructive',
      })
      expect(mockCaptureException).toHaveBeenCalledWith(new Error('Submission failed'))
    })
  })

  it('should disable stat buttons when isLoading is true', () => {
    const votes = [1, 2, 3]
    mockUseIssues.mockReturnValue({ currentIssue: { id: 'issue-1' } })
    mockUseCurrentUser.mockReturnValue({ user: { linearId: 'user-1' } })
    mockUseSubmitEstimate.mockReturnValue({
      error: null,
      isLoading: true,
      submitEstimate: mockSubmitEstimate,
    })

    render(<Stats votes={votes} />)

    const statButtons = screen.getAllByRole('button')
    statButtons.forEach((button) => {
      expect(button).toBeDisabled()
    })
  })

  it('should show error toast when useSubmitEstimate returns an error', async () => {
    const votes = [1, 2, 3]
    mockUseIssues.mockReturnValue({ currentIssue: { id: 'issue-1' } })
    mockUseCurrentUser.mockReturnValue({ user: { linearId: 'user-1' } })
    mockUseSubmitEstimate.mockReturnValue({
      error: new Error('Submission error'),
      isLoading: false,
      submitEstimate: mockSubmitEstimate,
    })

    render(<Stats votes={votes} />)

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'An error occurred while setting the estimate',
        duration: 5000,
        variant: 'destructive',
      })
      expect(mockCaptureException).toHaveBeenCalledWith(new Error('Submission error'))
    })
  })
})
