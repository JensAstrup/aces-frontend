import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import { Issue } from '@aces/app/interfaces/issue'

import '@testing-library/jest-dom'
import IssueDisplay from '@aces/app/issues/issue'
import { useInitialView } from '@aces/app/issues/use-initial-view'
import { useSelectedView } from '@aces/app/issues/use-selected-view'
import useViewsDisplay from '@aces/app/issues/use-views-display'

// Mock the imported components and hooks
jest.mock('@aces/app/issues/use-initial-view')
jest.mock('@aces/app/issues/use-selected-view')
jest.mock('@aces/app/issues/use-views-display')
jest.mock('@aces/components/ui/issues/issue-section', () => ({
  __esModule: true,
  default: jest.fn(({ issue, onPrevIssue, onNextIssue }) => (
    <div data-testid="issue-section">
      <span>{issue.title}</span>
      <button onClick={onPrevIssue}>Prev</button>
      <button onClick={onNextIssue}>Next</button>
    </div>
  )),
}))
jest.mock('@aces/components/ui/comments/comments', () => ({
  Comments: jest.fn(() => <div data-testid="comments">Mocked Comments</div>),
}))
jest.mock('@aces/components/view-dropdown', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="view-dropdown">Mocked ViewDropdown</div>),
}))
jest.mock('@aces/components/ui/separator', () => ({
  Separator: jest.fn(() => <div data-testid="separator">Mocked Separator</div>),
}))
jest.mock('@aces/components/icons', () => ({
  Icons: {
    spinner: jest.fn(() => <div data-testid="spinner">Mocked Spinner</div>),
  },
}))

const mockUseViewsDisplay = useViewsDisplay as jest.MockedFunction<typeof useViewsDisplay>
const mockUseInitialView = useInitialView as jest.MockedFunction<typeof useInitialView>
const mockUseSelectedView = useSelectedView as jest.MockedFunction<typeof useSelectedView>

describe('IssueDisplay', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseViewsDisplay.mockReturnValue({
      favoriteViews: [{ id: 1, name: 'View 1' }],
      setSelectedView: jest.fn(),
      selectedView: { id: 1, name: 'View 1' }
    })
    mockUseInitialView.mockImplementation(() => {})
    mockUseSelectedView.mockImplementation((setIsLoading, selectedView, issues, setIssues) => {
      React.useEffect(() => {
        setIsLoading(false)
        setIssues([
          { id: 1, title: 'Issue 1' } as Issue,
          { id: 2, title: 'Issue 2' } as Issue,
        ])
      }, [])
    })
  })

  it('renders loading state initially', () => {
    mockUseSelectedView.mockImplementation((setIsLoading) => {
      React.useEffect(() => {
        setIsLoading(true)
      }, [])
    })

    // eslint-disable-next-line react/jsx-no-undef
    render(<IssueDisplay />)
    expect(screen.getByTestId('spinner')).toBeInTheDocument()
  })

  it('renders issue section when issues are loaded', () => {
    render(<IssueDisplay />)
    expect(screen.getByTestId('issue-section')).toBeInTheDocument()
    expect(screen.getByTestId('comments')).toBeInTheDocument()
  })

  it('renders no issues message when there are no issues', () => {
    mockUseSelectedView.mockImplementation((setIsLoading, selectedView, issues, setIssues) => {
      React.useEffect(() => {
        setIsLoading(false)
        setIssues([])
      }, [])
    })

    render(<IssueDisplay />)
    expect(screen.getByText('No issues found')).toBeInTheDocument()
    expect(screen.getByText('Please try another view')).toBeInTheDocument()
  })

  it('navigates between issues', () => {
    render(<IssueDisplay />)

    expect(screen.getByText('Issue 1')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Next'))
    expect(screen.getByText('Issue 2')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Prev'))
    expect(screen.getByText('Issue 1')).toBeInTheDocument()
  })

  it('calls setSelectedView when favoriteViews change', () => {
    const setSelectedView = jest.fn()
    mockUseViewsDisplay.mockReturnValue({
      favoriteViews: [{ id: 1, name: 'newView' }],
      setSelectedView,
      selectedView: null,
    })

    render(<IssueDisplay />)

    expect(setSelectedView).toHaveBeenCalledWith({ id: 1, name: 'newView' })
  })

  it('resets currentIssueIndex when selectedView changes', () => {
    const { rerender } = render(<IssueDisplay />)

    fireEvent.click(screen.getByText('Next'))
    expect(screen.getByText('Issue 2')).toBeInTheDocument()

    mockUseViewsDisplay.mockReturnValue({
      favoriteViews: [{ id: 1, name: 'View 1' }],
      setSelectedView: jest.fn(),
      selectedView: { id: 2, name: 'View 2' }
    })

    rerender(<IssueDisplay />)
    expect(screen.getByText('Issue 1')).toBeInTheDocument()
  })

  it('renders ViewDropdown and Separator', () => {
    render(<IssueDisplay />)
    expect(screen.getByTestId('view-dropdown')).toBeInTheDocument()
    expect(screen.getByTestId('separator')).toBeInTheDocument()
  })
})
