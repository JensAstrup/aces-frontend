import { render, screen } from '@testing-library/react'
import React from 'react'

import IssueDisplay from '@aces/app/issues/issue'
import { useInitialView } from '@aces/app/voting/use-initial-view'
import { useSelectedView } from '@aces/app/voting/use-selected-view'
import useViewsDisplay from '@aces/app/voting/use-views-display'


jest.mock('@aces/app/voting/use-views-display')
jest.mock('@aces/app/voting/use-initial-view')
jest.mock('@aces/app/voting/use-selected-view')
jest.mock('@aces/components/ui/issues/issue-section', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="issue-section">Mocked IssueSection</div>),
}))

jest.mock('@aces/components/ui/comments/comments', () => ({
  Comments: jest.fn(() => <div data-testid="comments">Mocked Comments</div>),
}))
jest.mock('@aces/components/ui/separator')
jest.mock('@aces/components/view-dropdown')
jest.mock('@aces/components/icons', () => ({
  Icons: {
    spinner: () => <div>Spinner Icon</div>,
  },
}))

const mockUseViewsDisplay = useViewsDisplay as jest.Mock
const mockUseInitialView = useInitialView as jest.Mock
const mockUseSelectedView = useSelectedView as jest.Mock

describe('IssueDisplay', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading section when isLoading is true', () => {
    mockUseViewsDisplay.mockReturnValue({
      favoriteViews: [],
      setSelectedView: jest.fn(),
    })

    render(<IssueDisplay />)

    expect(screen.getByText(/Spinner Icon/i)).toBeInTheDocument()
  })

  it('renders issue section when issues are present', () => {
    mockUseViewsDisplay.mockReturnValue({
      favoriteViews: [],
      setSelectedView: jest.fn(),
    })

    mockUseSelectedView.mockImplementation((setIsLoading, selectedView, setIssues) => {
      React.useEffect(() => {
        setIsLoading(false)
        setIssues([{ id: 1, title: 'Test Issue' }])
      }, [setIsLoading, setIssues])
    })

    render(<IssueDisplay />)

    expect(screen.getByTestId('issue-section')).toBeInTheDocument()
    expect(screen.getByTestId('comments')).toBeInTheDocument()
  })

  it('renders no issues section when no issues are present', () => {
    mockUseViewsDisplay.mockReturnValue({
      favoriteViews: [],
      setSelectedView: jest.fn(),
    })

    mockUseSelectedView.mockImplementation((setIsLoading, selectedView, setIssues) => {
      React.useEffect(() => {
        setIsLoading(false)
        setIssues([])
      }, [setIsLoading, setIssues])
    })

    render(<IssueDisplay />)

    expect(screen.getByText(/No issues found/i)).toBeInTheDocument()
    expect(screen.getByText(/Please try another view/i)).toBeInTheDocument()
  })

  it('calls useInitialView and useSelectedView hooks', () => {
    mockUseViewsDisplay.mockReturnValue({
      favoriteViews: [],
      setSelectedView: jest.fn(),
    })

    render(<IssueDisplay />)

    expect(mockUseInitialView).toHaveBeenCalled()
    expect(mockUseSelectedView).toHaveBeenCalled()
  })

  it('sets the selected view if favoriteViews is not empty', () => {
    const setSelectedView = jest.fn()
    mockUseViewsDisplay.mockReturnValue({
      favoriteViews: ['view1'],
      setSelectedView,
    })

    render(<IssueDisplay />)

    expect(setSelectedView).toHaveBeenCalledWith('view1')
  })

  it('does not set the selected view if favoriteViews is empty', () => {
    const setSelectedView = jest.fn()
    mockUseViewsDisplay.mockReturnValue({
      favoriteViews: [],
      setSelectedView,
    })

    render(<IssueDisplay />)

    expect(setSelectedView).not.toHaveBeenCalled()
  })
})
