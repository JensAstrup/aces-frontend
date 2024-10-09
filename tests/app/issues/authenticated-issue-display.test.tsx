import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'

import AuthenticatedIssueDisplay from '@aces/app/issues/authenticated-issue-display'
import User from '@aces/interfaces/user'
import { View } from '@aces/interfaces/view'
import useCurrentUser from '@aces/lib/hooks/auth/use-current-user'
import useViews from '@aces/lib/hooks/views/views-context'


jest.mock('@aces/lib/hooks/auth/use-current-user')
jest.mock('@aces/lib/hooks/views/views-context')
jest.mock('@aces/components/issues/issue-content', () => ({
  __esModule: true,
  default: () => <div data-testid="issue-content">Issue Content</div>,
}))
jest.mock('@aces/components/ui/separator', () => ({
  Separator: () => <hr data-testid="separator" />,
}))
jest.mock('@aces/components/view-dropdown', () => ({
  __esModule: true,
  default: ({ views, setSelectedView }: { views: View[], selectedView: View | null, setSelectedView: (view: View) => void }) => (
    <div data-testid="view-dropdown">
      {views.map(view => (
        <button
          key={view.id}
          onClick={() => {
            setSelectedView(view)
          }}
        >
          {view.name}
        </button>
      ))}
    </div>
  ),
}))

const mockUseCurrentUser = useCurrentUser as jest.MockedFunction<typeof useCurrentUser>
const mockUseViews = useViews as jest.MockedFunction<typeof useViews>

describe('AuthenticatedIssueDisplay', () => {
  const mockViews: View[] = [
    { id: 'view1', name: 'View 1' },
    { id: 'view2', name: 'View 2' },
  ] as View[]
  const mockUser: User = { id: 'user1', name: 'John Doe' } as unknown as User

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render ViewDropdown when user is authenticated', () => {
    mockUseCurrentUser.mockReturnValue({ user: mockUser } as unknown as ReturnType<typeof useCurrentUser>)
    mockUseViews.mockReturnValue({
      selectedView: null,
      setSelectedView: jest.fn(),
      views: mockViews,
    })

    render(<AuthenticatedIssueDisplay views={mockViews} />)

    expect(screen.getByTestId('view-dropdown')).toBeInTheDocument()
  })

  it('should not render ViewDropdown when user is not authenticated', () => {
    mockUseCurrentUser.mockReturnValue({ user: null } as unknown as ReturnType<typeof useCurrentUser>)
    mockUseViews.mockReturnValue({
      selectedView: null,
      setSelectedView: jest.fn(),
      views: mockViews,
    })

    render(<AuthenticatedIssueDisplay views={mockViews} />)

    expect(screen.queryByTestId('view-dropdown')).not.toBeInTheDocument()
  })

  it('should render Separator and IssueContent', () => {
    mockUseCurrentUser.mockReturnValue({ user: mockUser } as unknown as ReturnType<typeof useCurrentUser>)
    mockUseViews.mockReturnValue({
      selectedView: null,
      setSelectedView: jest.fn(),
      views: mockViews,
    })

    render(<AuthenticatedIssueDisplay views={mockViews} />)

    expect(screen.getByTestId('separator')).toBeInTheDocument()
    expect(screen.getByTestId('issue-content')).toBeInTheDocument()
  })

  it('should handle view selection correctly', () => {
    const setSelectedViewMock = jest.fn()
    mockUseCurrentUser.mockReturnValue({ user: mockUser } as unknown as ReturnType<typeof useCurrentUser>)
    mockUseViews.mockReturnValue({
      selectedView: null,
      setSelectedView: setSelectedViewMock,
      views: mockViews,
    })

    render(<AuthenticatedIssueDisplay views={mockViews} />)

    const viewButton = screen.getByText('View 1')
    fireEvent.click(viewButton)

    expect(setSelectedViewMock).toHaveBeenCalledWith(mockViews[0])
  })

  it('should handle view selection with function correctly', () => {
    const setSelectedViewMock = jest.fn()
    mockUseCurrentUser.mockReturnValue({ user: mockUser } as unknown as ReturnType<typeof useCurrentUser>)
    mockUseViews.mockReturnValue({
      selectedView: mockViews[0],
      setSelectedView: setSelectedViewMock,
      views: mockViews,
    })

    render(<AuthenticatedIssueDisplay views={mockViews} />)

    const viewButton = screen.getByText('View 2')
    fireEvent.click(viewButton)

    expect(setSelectedViewMock).toHaveBeenCalledWith(mockViews[1])
  })
})
