import { act, screen } from '@testing-library/react'
import React from 'react'
import { createRoot } from 'react-dom/client'

import AuthenticatedIssueDisplay from '@aces/app/issues/authenticated-issue-display'


jest.mock('@aces/lib/hooks/use-issue-manager')
jest.mock('@aces/lib/hooks/use-initial-view')
jest.mock('@aces/lib/hooks//use-views-display')
jest.mock('@aces/lib/hooks/user-context')
jest.mock('@aces/components/issues/issue-content')
jest.mock('@aces/components/ui/separator')
jest.mock('@aces/components/view-dropdown', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="view-dropdown">Mocked ViewDropdown</div>),
}))
jest.mock('react-markdown')


const mockUseIssueManager = jest.requireMock('@aces/lib/hooks/use-issue-manager')
const mockUseViewsDisplay = jest.requireMock('@aces/lib/hooks/use-views-display')
const mockUseUser = jest.requireMock('@aces/lib/hooks/user-context')
const mockIssueContent = jest.requireMock('@aces/components/issues/issue-content')

describe('AuthenticatedIssueDisplay', () => {
  let container: HTMLDivElement
  let root: ReturnType<typeof createRoot>

  beforeEach(() => {
    jest.clearAllMocks()
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)

    mockUseViewsDisplay.default.mockReturnValue({
      favoriteViews: [],
      setSelectedView: jest.fn(),
      selectedView: null
    })
    mockUseUser.useUser.mockReturnValue(null)
    mockUseIssueManager.default.mockReturnValue({
      issues: [],
      isLoading: false,
      currentIssueIndex: 0,
      handlePrevIssue: jest.fn(),
      handleNextIssue: jest.fn()
    })
    mockIssueContent.default.mockImplementation(() => <div data-testid="issue-content" />)
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    document.body.removeChild(container)
  })

  const renderComponent = () => {
    act(() => {
      root.render(<AuthenticatedIssueDisplay roundId="test-round" />)
    })
  }

  it('does not render ViewDropdown when user is not authenticated', () => {
    mockUseUser.useUser.mockReturnValue({ user: null })
    renderComponent()
    expect(screen.queryByTestId('view-dropdown')).not.toBeInTheDocument()
  })

  it('renders ViewDropdown when user is authenticated', () => {
    mockUseUser.useUser.mockReturnValue({ user: { id: '123' } })
    renderComponent()
    expect(screen.getByTestId('view-dropdown')).toBeInTheDocument()
  })

  it('calls setSelectedView with first favorite view when available', async () => {
    const mockUser = { id: 'test-user' }
    mockUseUser.useUser.mockReturnValue({ user: mockUser })
    const mockSetSelectedView = jest.fn()
    mockUseViewsDisplay.default.mockReturnValue({
      favoriteViews: [{ id: 'view1' }],
      setSelectedView: mockSetSelectedView,
      selectedView: null
    })

    renderComponent()

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(mockSetSelectedView).toHaveBeenCalledWith({ id: 'view1' })
  })

  it('passes correct props to IssueContent', () => {
    const mockUser = { id: 'test-user' }
    mockUseUser.useUser.mockReturnValue({ user: mockUser })
    const mockIssueManagerReturn = {
      issues: [{ id: 'issue1' }],
      isLoading: false,
      currentIssueIndex: 0,
      handlePrevIssue: jest.fn(),
      handleNextIssue: jest.fn()
    }
    mockUseIssueManager.default.mockReturnValue(mockIssueManagerReturn)

    renderComponent()

    expect(mockIssueContent.default).toHaveBeenCalledWith(
      expect.objectContaining(mockIssueManagerReturn),
      expect.anything()
    )
  })

  it('calls useIssueManager with correct props', () => {
    const mockUser = { id: 'test-user' }
    const mockSelectedView = { id: 'view1' }
    mockUseUser.useUser.mockReturnValue({ user: mockUser })
    mockUseViewsDisplay.default.mockReturnValue({
      favoriteViews: [],
      setSelectedView: jest.fn(),
      selectedView: mockSelectedView
    })

    renderComponent()

    expect(mockUseIssueManager.default).toHaveBeenCalledWith({
      selectedView: mockSelectedView,
      user: mockUser,
      roundId: 'test-round'
    })
  })
})
