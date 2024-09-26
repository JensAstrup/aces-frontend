import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'

import { IssueNavigation } from '@aces/components/issues/issue-navigation'



// Mock the lucide-react components
jest.mock('lucide-react', () => ({
  ChevronLeft: () => <div data-testid="chevron-left" />,
  ChevronRight: () => <div data-testid="chevron-right" />,
}))

describe('IssueNavigation', () => {
  it('should render nothing when handleNavigate is not provided', () => {
    const { container } = render(<IssueNavigation />)
    expect(container.firstChild).toBeNull()
  })

  it('should render navigation buttons when handleNavigate is provided', () => {
    render(<IssueNavigation handleNavigate={() => {}} />)
    expect(screen.getByTestId('chevron-left')).toBeInTheDocument()
    expect(screen.getByTestId('chevron-right')).toBeInTheDocument()
  })

  it('should disable previous button when hasPrevIssue is false', () => {
    render(<IssueNavigation handleNavigate={() => {}} hasPrevIssue={false} hasNextIssue={true} />)
    const prevButton = screen.getByTestId('chevron-left').closest('button')
    const nextButton = screen.getByTestId('chevron-right').closest('button')
    expect(prevButton).toBeDisabled()
    expect(nextButton).not.toBeDisabled()
  })

  it('should disable next button when hasNextIssue is false', () => {
    render(<IssueNavigation handleNavigate={() => {}} hasPrevIssue={true} hasNextIssue={false} />)
    const prevButton = screen.getByTestId('chevron-left').closest('button')
    const nextButton = screen.getByTestId('chevron-right').closest('button')
    expect(prevButton).not.toBeDisabled()
    expect(nextButton).toBeDisabled()
  })

  it('should call handleNavigate with "previous" when previous button is clicked', () => {
    const handleNavigateMock = jest.fn()
    render(<IssueNavigation handleNavigate={handleNavigateMock} hasPrevIssue={true} hasNextIssue={true} />)
    const prevButton = screen.getByTestId('chevron-left').closest('button')
    fireEvent.click(prevButton as HTMLElement)
    expect(handleNavigateMock).toHaveBeenCalledWith('previous')
  })

  it('should call handleNavigate with "next" when next button is clicked', () => {
    const handleNavigateMock = jest.fn()
    render(<IssueNavigation handleNavigate={handleNavigateMock} hasPrevIssue={true} hasNextIssue={true} />)
    const nextButton = screen.getByTestId('chevron-right').closest('button')
    fireEvent.click(nextButton as HTMLElement)
    expect(handleNavigateMock).toHaveBeenCalledWith('next')
  })

  it('should not call handleNavigate when disabled buttons are clicked', () => {
    const handleNavigateMock = jest.fn()
    render(<IssueNavigation handleNavigate={handleNavigateMock} hasPrevIssue={false} hasNextIssue={false} />)
    const prevButton = screen.getByTestId('chevron-left').closest('button')
    const nextButton = screen.getByTestId('chevron-right').closest('button')
    fireEvent.click(prevButton as HTMLElement)
    fireEvent.click(nextButton as HTMLElement)
    expect(handleNavigateMock).not.toHaveBeenCalled()
  })
})
