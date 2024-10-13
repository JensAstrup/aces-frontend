import { render, screen, fireEvent, act } from '@testing-library/react'
import React from 'react'
import '@testing-library/jest-dom'


import ViewDropdown from '@aces/components/view-dropdown'
import { View } from '@aces/interfaces/view'
import useViews from '@aces/lib/hooks/views/views-context'


jest.mock('@aces/lib/hooks/views/views-context')
jest.mock('@radix-ui/react-icons', () => ({
  ListBulletIcon: () => <div data-testid="list-bullet-icon" />,
}))

const mockUseViews = useViews as jest.MockedFunction<typeof useViews>

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
  DropdownMenuSeparator: () => <hr />,
}))

describe('ViewDropdown', () => {
  const mockViews: View[] = [
    { id: '1', name: 'View 1' },
    { id: '2', name: 'View 2' },
    { id: '3', name: 'View 3' },
  ] as View[]

  const mockSetView = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseViews.mockReturnValue({
      selectedView: null,
      setView: mockSetView,
      views: mockViews,
    })
  })

  it('should render the dropdown button with "Select a view" when no view is selected', () => {
    render(<ViewDropdown views={mockViews} />)
    expect(screen.getAllByText('Select a view')).toHaveLength(2)
  })

  it('should render the dropdown button with the selected view name when a view is selected', () => {
    mockUseViews.mockReturnValue({
      selectedView: mockViews[0],
      setView: mockSetView,
      views: mockViews,
    })
    render(<ViewDropdown views={mockViews} />)
    expect(screen.getAllByText('View 1')).toHaveLength(2)
  })

  it('should render the list of views in the dropdown menu', () => {
    render(<ViewDropdown views={mockViews} />)
    fireEvent.click(screen.getAllByRole('button')[0])
    expect(screen.getByText('View 1')).toBeInTheDocument()
    expect(screen.getByText('View 2')).toBeInTheDocument()
    expect(screen.getByText('View 3')).toBeInTheDocument()
  })

  it('should call setView when a view is selected', () => {
    render(<ViewDropdown views={mockViews} />)
    fireEvent.click(screen.getAllByRole('button')[0])
    fireEvent.click(screen.getByText('View 2'))
    expect(mockSetView).toHaveBeenCalledWith(mockViews[1])
  })

  it('should set the first view as selected when views are available and no view is selected', () => {
    jest.useFakeTimers()
    render(<ViewDropdown views={mockViews} />)
    act(() => {
      jest.runAllTimers()
    })
    expect(mockSetView).toHaveBeenCalledWith(mockViews[0])
    jest.useRealTimers()
  })

  it('should not set a view when views are empty', () => {
    jest.useFakeTimers()
    render(<ViewDropdown views={[]} />)
    act(() => {
      jest.runAllTimers()
    })
    expect(mockSetView).not.toHaveBeenCalled()
    jest.useRealTimers()
  })

  it('should render the ListBulletIcon', () => {
    render(<ViewDropdown views={mockViews} />)
    expect(screen.getByTestId('list-bullet-icon')).toBeInTheDocument()
  })
})
