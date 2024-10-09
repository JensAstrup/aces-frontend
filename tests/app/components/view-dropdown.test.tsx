import { render, screen, fireEvent, act } from '@testing-library/react'
import React from 'react'

import ViewDropdown from '@aces/components/view-dropdown'
import { View } from '@aces/interfaces/view'


jest.mock('@radix-ui/react-icons', () => ({
  ListBulletIcon: () => <div data-testid="list-bullet-icon" />,
}))

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

  it('should render the component', () => {
    render(<ViewDropdown views={mockViews} selectedView={null} setView={() => {}} />)
    expect(screen.getAllByText('Select a view')).toHaveLength(2)
    expect(screen.getByTestId('list-bullet-icon')).toBeInTheDocument()
  })

  it('should display the selected view name when a view is selected', () => {
    render(<ViewDropdown views={mockViews} selectedView={mockViews[0]} setView={() => {}} />)
    expect(screen.getByText('View 2')).toBeInTheDocument()
  })

  it('should render all view options', () => {
    render(<ViewDropdown views={mockViews} selectedView={null} setView={() => {}} />)
    mockViews.forEach((view) => {
      expect(screen.getByText(view.name)).toBeInTheDocument()
    })
  })

  it('should call setView when a view is clicked', () => {
    const mockSetView = jest.fn()
    render(<ViewDropdown views={mockViews} selectedView={null} setView={mockSetView} />)

    fireEvent.click(screen.getByText('View 2'))
    expect(mockSetView).toHaveBeenCalledWith(mockViews[1])
  })

  it('should display "No views available" when views array is empty', () => {
    render(<ViewDropdown views={[]} selectedView={null} setView={() => {}} />)
    expect(screen.getByText('No views available')).toBeInTheDocument()
  })

  it('should automatically select the first view if no view is selected', () => {
    const mockSetView = jest.fn()
    act(() => {
      render(<ViewDropdown views={mockViews} selectedView={null} setView={mockSetView} />)
    })
    expect(mockSetView).toHaveBeenCalledWith(mockViews[0])
  })

  it('should not automatically select a view if one is already selected', () => {
    const mockSetView = jest.fn()
    act(() => {
      render(<ViewDropdown views={mockViews} selectedView={mockViews[1]} setView={mockSetView} />)
    })
    expect(mockSetView).not.toHaveBeenCalled()
  })
})
