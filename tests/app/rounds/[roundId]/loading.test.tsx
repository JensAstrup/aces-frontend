import { render, screen } from '@testing-library/react'

import Loading from '@aces/app/rounds/[roundId]/loading'


jest.mock('@aces/components/rounds/loading-round', () => ({
  __esModule: true,
  default: () => <div data-testid="loading-round" />
}))

describe('Loading', () => {
  it('should render LoadingRound', () => {
    render(<Loading />)

    expect(screen.getByTestId('loading-round')).toBeInTheDocument()
  })
})
