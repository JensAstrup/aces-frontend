import { render, screen } from '@testing-library/react'
import React from 'react'

import RoundPage from '@aces/app/rounds/[roundId]/page'
import '@testing-library/jest-dom'

// Mock the imported components and hooks
jest.mock('@aces/app/rounds/[roundId]/IssueDisplayWrapper', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="issue-display">Mocked IssueDisplay</div>),
}))

jest.mock('@aces/app/rounds/[roundId]/useRoundPageLogic', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('@aces/components/rounds/sidebar', () => ({
  RoundSidebar: jest.fn(() => <div data-testid="round-sidebar">Mocked RoundSidebar</div>),
}))

const mockUseRoundPageLogic = jest.requireMock('@aces/app/rounds/[roundId]/useRoundPageLogic').default

describe('RoundPage', () => {
  const mockParams = { roundId: 'test-round-id' }

  beforeEach(() => {
    mockUseRoundPageLogic.mockReturnValue({
      user: { id: 'test-user-id' },
      currentIssue: { id: 'test-issue-id' },
      isIssueLoading: false,
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders the component with correct layout', () => {
    render(<RoundPage params={mockParams} />)

    expect(screen.getByTestId('issue-display')).toBeInTheDocument()
    expect(screen.getByTestId('round-sidebar')).toBeInTheDocument()
  })

  it('calls useRoundPageLogic with correct roundId', () => {
    render(<RoundPage params={mockParams} />)

    expect(mockUseRoundPageLogic).toHaveBeenCalledWith('test-round-id')
  })

  it('passes correct props to IssueDisplay', () => {
    render(<RoundPage params={mockParams} />)

    const IssueDisplay = jest.requireMock('@aces/app/rounds/[roundId]/IssueDisplayWrapper').default
    expect(IssueDisplay).toHaveBeenCalledWith(
      {
        user: { id: 'test-user-id' },
        roundId: 'test-round-id',
      },
      expect.anything()
    )
  })

  it('passes correct props to RoundSidebar', () => {
    render(<RoundPage params={mockParams} />)

    const { RoundSidebar } = jest.requireMock('@aces/components/rounds/sidebar')
    expect(RoundSidebar).toHaveBeenCalledWith(
      {
        roundId: 'test-round-id',
        currentIssue: { id: 'test-issue-id' },
        isIssueLoading: false,
      },
      expect.anything()
    )
  })

  it('handles loading state correctly', () => {
    mockUseRoundPageLogic.mockReturnValue({
      user: null,
      currentIssue: null,
      isIssueLoading: true,
    })

    render(<RoundPage params={mockParams} />)

    const { RoundSidebar } = jest.requireMock('@aces/components/rounds/sidebar')
    expect(RoundSidebar).toHaveBeenCalledWith(
      {
        roundId: 'test-round-id',
        currentIssue: null,
        isIssueLoading: true,
      },
      expect.anything()
    )
  })
})
