import { render } from '@testing-library/react'
import React from 'react'

import RoundProviders from '@aces/app/rounds/[roundId]/round-providers'
import { View } from '@aces/interfaces/view'
import * as ViewsContextModule from '@aces/lib/hooks/views/views-context'


jest.mock('@aces/lib/hooks/views/views-context', () => ({
  ViewsProvider: jest.fn(({ children }) => <div data-testid="views-provider">{children}</div>),
}))

jest.mock('@aces/lib/hooks/issues/issues-context', () => ({
  IssuesProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="issues-provider">{children}</div>,
}))

jest.mock('@aces/lib/hooks/votes/use-votes', () => ({
  VotesProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="votes-provider">{children}</div>,
}))

jest.mock('@aces/lib/socket/web-socket-provider', () => ({
  WebSocketProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="websocket-provider">{children}</div>,
}))

describe('RoundProviders', () => {
  const mockViews: View[] = [
    { id: '1', name: 'View 1' },
    { id: '2', name: 'View 2' },
  ] as View[]

  it('should render all providers in the correct order', () => {
    const { getByTestId } = render(
      <RoundProviders views={mockViews}>
        <div data-testid="child-component">Child Component</div>
      </RoundProviders>
    )

    const viewsProvider = getByTestId('views-provider')
    const issuesProvider = getByTestId('issues-provider')
    const votesProvider = getByTestId('votes-provider')
    const websocketProvider = getByTestId('websocket-provider')
    const childComponent = getByTestId('child-component')

    expect(viewsProvider).toContainElement(issuesProvider)
    expect(issuesProvider).toContainElement(votesProvider)
    expect(votesProvider).toContainElement(websocketProvider)
    expect(websocketProvider).toContainElement(childComponent)
  })

  it('should pass views prop to ViewsProvider', () => {
    render(
      <RoundProviders views={mockViews}>
        <div>Child Component</div>
      </RoundProviders>
    )

    expect(ViewsContextModule.ViewsProvider).toHaveBeenCalledWith(
      expect.objectContaining({
        views: mockViews,
      }),
      {}
    )
  })

  it('should render child components', () => {
    const { getByText } = render(
      <RoundProviders views={mockViews}>
        <div>Test Child</div>
      </RoundProviders>
    )

    expect(getByText('Test Child')).toBeInTheDocument()
  })
})
