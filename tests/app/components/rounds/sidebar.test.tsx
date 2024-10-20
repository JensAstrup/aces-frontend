import { render, screen } from '@testing-library/react'
import React from 'react'

import { RoundSidebar } from '@aces/components/rounds/sidebar'
import { Issue } from '@aces/interfaces/issue'
import { useIssues } from '@aces/lib/hooks/issues/issues-context'
import { useVotes } from '@aces/lib/hooks/votes/use-votes'


jest.mock('@aces/components/icons', () => ({
  __esModule: true,
  Icons: {
    spinner: () => <div>Spinner</div>,
  },
}))
jest.mock('@aces/lib/hooks/issues/issues-context')
jest.mock('@aces/lib/hooks/votes/use-votes')
jest.mock('@aces/components/estimates/estimate-section', () => ({
  __esModule: true,
  default: () => <div>Estimate Section</div>,
}))
jest.mock('next/dynamic', () => () => {
  const Component = (props: object) => <div data-testid={Object.keys(props)[0]} {...props} />
  return Component
})

const mockUseIssues = useIssues as jest.MockedFunction<typeof useIssues>
const mockUseVotes = useVotes as jest.MockedFunction<typeof useVotes>

describe('RoundSidebar', () => {
  const defaultProps = {
    roundId: 'test-round-id',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render loading spinner when isLoading is true', () => {
    mockUseIssues.mockReturnValue({
      currentIssue: null,
      isLoading: true,
      issues: [],
      setCurrentIssue: jest.fn(),
      setIssues: jest.fn()
    })
    mockUseVotes.mockReturnValue({
      votes: [],
      expectedVotes: 0,
      setVotes: jest.fn(),
      setExpectedVotes: jest.fn()
    })

    render(<RoundSidebar {...defaultProps} />)

    expect(screen.getByText('Spinner')).toBeInTheDocument()
  })

  it('should render EstimateSection when there are no votes', () => {
    mockUseIssues.mockReturnValue({
      currentIssue: { id: '1', title: 'Test Issue' } as Issue,
      isLoading: false,
      issues: [],
      setCurrentIssue: jest.fn(),
      setIssues: jest.fn()
    })
    mockUseVotes.mockReturnValue({
      votes: [],
      expectedVotes: 3,
      setVotes: jest.fn(),
      setExpectedVotes: jest.fn()
    })

    render(<RoundSidebar {...defaultProps} />)

    expect(screen.getByText('Estimate Section')).toBeInTheDocument()
  })

  it('should render EstimateSection and Votes when votes are incomplete', () => {
    mockUseIssues.mockReturnValue({
      currentIssue: { id: '1', title: 'Test Issue' } as Issue,
      isLoading: false,
      issues: [],
      setCurrentIssue: jest.fn(),
      setIssues: jest.fn()
    })
    mockUseVotes.mockReturnValue({
      votes: [1, 2],
      expectedVotes: 3,
      setVotes: jest.fn(),
      setExpectedVotes: jest.fn()
    })

    render(<RoundSidebar {...defaultProps} />)

    expect(screen.getByText('Estimate Section')).toBeInTheDocument()
    expect(screen.getByTestId('votes')).toBeInTheDocument()
  })

  it('should render Votes and Stats when all expected votes are in', () => {
    mockUseIssues.mockReturnValue({
      currentIssue: { id: '1', title: 'Test Issue' } as Issue,
      isLoading: false,
      issues: [],
      setCurrentIssue: jest.fn(),
      setIssues: jest.fn()
    })
    mockUseVotes.mockReturnValue({
      votes: [1, 2, 3],
      expectedVotes: 3,
      setVotes: jest.fn(),
      setExpectedVotes: jest.fn()
    })

    render(<RoundSidebar {...defaultProps} />)

    expect(screen.getAllByTestId('votes')).toHaveLength(2)
  })
})
