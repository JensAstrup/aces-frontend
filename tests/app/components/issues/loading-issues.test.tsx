import { render, screen } from '@testing-library/react'

import LoadingIssues from '@aces/components/issues/loading-issues'


jest.mock('@aces/components/icons', () => ({
  __esModule: true,
  Icons: {
    spinner: () => <div data-testid="spinner" />,
  },
}))

describe('LoadingIssues', () => {
  it('should render spinner', () => {
    render(<LoadingIssues />)

    expect(screen.getByText('Retrieving Issues...')).toBeInTheDocument()
    expect(screen.getByTestId('spinner')).toBeInTheDocument()
  })
})
