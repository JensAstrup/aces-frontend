import { render, screen, fireEvent, act } from '@testing-library/react'
import React from 'react'
import '@testing-library/jest-dom'


import IssueGroupDropdown from '@aces/components/views/issue-group-dropdown'
import Team from '@aces/interfaces/team'
import { View } from '@aces/interfaces/view'
import useTeams from '@aces/lib/hooks/teams/teams-context'
import useViews from '@aces/lib/hooks/views/views-context'


const mockUseViewsReturn = {
  selectedView: null,
  setView: jest.fn(),
  views: [],
}

jest.mock('@aces/lib/hooks/views/views-context', () => ({
  __esModule: true,
  default: jest.fn(() => mockUseViewsReturn),
}))

const mockUseTeamsReturn = {
  selectedTeam: null,
  setTeam: jest.fn(),
  teams: [],
}

jest.mock('@aces/lib/hooks/teams/teams-context', () => ({
  __esModule: true,
  default: jest.fn(() => mockUseTeamsReturn),
}))

jest.mock('@radix-ui/react-icons', () => ({
  ListBulletIcon: () => <div data-testid="list-bullet-icon" />,
}))

const mockUseViews = useViews as jest.MockedFunction<typeof useViews>
const mockUseTeams = useTeams as jest.MockedFunction<typeof useTeams>

jest.mock('@aces/components/ui/button', () => ({
  Button: ({ children, ...props }: React.PropsWithChildren<object>) => (
    <button {...props}>{children}</button>
  ),
}))

jest.mock('@aces/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: React.PropsWithChildren<object>) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: React.PropsWithChildren<object>) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: React.PropsWithChildren<object>) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onClick }: React.PropsWithChildren<{ onClick?: () => void }>) => (
    <button onClick={onClick}>{children}</button>
  ),
  DropdownMenuLabel: ({ children }: React.PropsWithChildren<object>) => <div>{children}</div>,
  DropdownMenuGroup: ({ children }: React.PropsWithChildren<object>) => <div>{children}</div>,
  DropdownMenuSeparator: () => <hr />,
}))

describe('IssueGroupDropdown', () => {
  const mockViews: View[] = [
    { id: '1', name: 'View 1' },
    { id: '2', name: 'View 2' },
    { id: '3', name: 'View 3' },
  ] as View[]

  const mockTeams = [
    { id: '1', name: 'Team 1' },
    { id: '2', name: 'Team 2' },
  ] as Team[]

  const mockSetView = jest.fn()
  const mockSetTeam = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseViewsReturn.selectedView = null
    mockUseViewsReturn.setView = mockSetView
    // @ts-ignore
    mockUseViewsReturn.views = mockViews

    mockUseTeamsReturn.selectedTeam = null
    mockUseTeamsReturn.setTeam = mockSetTeam
    // @ts-ignore
    mockUseTeamsReturn.teams = mockTeams
  })

  it('should render the dropdown button with "Select a view" when no view is selected', () => {
    render(<IssueGroupDropdown views={mockViews} teams={mockTeams} />)
    expect(screen.getByText('Select a view')).toBeInTheDocument()
  })

  it('should render the dropdown button with the selected view name when a view is selected', () => {
    mockUseViews.mockReturnValue({
      selectedView: mockViews[0],
      setView: mockSetView,
      views: mockViews,
    })
    render(<IssueGroupDropdown views={mockViews} teams={mockTeams} />)
    expect(screen.getAllByText('View 1')).toHaveLength(2)
  })

  it('should render the list of views in the dropdown menu', () => {
    render(<IssueGroupDropdown views={mockViews} teams={mockTeams} />)
    fireEvent.click(screen.getAllByRole('button')[0])
    expect(screen.getAllByText('View 1')).toHaveLength(2)
    expect(screen.getByText('View 2')).toBeInTheDocument()
    expect(screen.getByText('View 3')).toBeInTheDocument()
  })

  it('should call setView when a view is selected', () => {
    render(<IssueGroupDropdown views={mockViews} teams={mockTeams} />)
    fireEvent.click(screen.getAllByRole('button')[0])
    fireEvent.click(screen.getByText('View 2'))
    expect(mockSetView).toHaveBeenCalledWith(mockViews[1])
  })

  it('should not set a view when views are empty', () => {
    jest.useFakeTimers()
    render(<IssueGroupDropdown views={[]} teams={mockTeams} />)
    act(() => {
      jest.runAllTimers()
    })
    expect(mockSetView).not.toHaveBeenCalled()
    jest.useRealTimers()
  })

  it('should render the ListBulletIcon', () => {
    render(<IssueGroupDropdown views={mockViews} teams={mockTeams} />)
    expect(screen.getByTestId('list-bullet-icon')).toBeInTheDocument()
  })
})
