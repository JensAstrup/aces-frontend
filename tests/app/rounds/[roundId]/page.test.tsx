import { Team } from '@linear/sdk'
import { User } from '@prisma/client'
import { render, screen } from '@testing-library/react'
import { IronSession } from 'iron-session'
import React from 'react'

import RoundPage from '@aces/app/rounds/[roundId]/page'
import RoundComponent from '@aces/app/rounds/[roundId]/round-component'
import RoundProviders from '@aces/app/rounds/[roundId]/round-providers'
import { View } from '@aces/interfaces/view'
import getTeams from '@aces/lib/linear/get-teams'
import getFavoriteViews from '@aces/lib/linear/get-views'
import { SessionData } from '@aces/lib/server/auth/session'
import migrateSession from '@aces/lib/utils/migrate-session'


jest.mock('@aces/app/rounds/[roundId]/round-component')
jest.mock('@aces/app/rounds/[roundId]/round-providers')
jest.mock('@aces/lib/linear/get-views')
jest.mock('@aces/lib/linear/get-teams')
jest.mock('@aces/lib/utils/migrate-session')
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  Suspense: ({ children }: { children: React.ReactNode }) => <div data-testid="suspense">{children}</div>
}))

const mockRoundComponent = RoundComponent as jest.MockedFunction<typeof RoundComponent>
const mockRoundProviders = RoundProviders as jest.MockedFunction<typeof RoundProviders>
const mockGetFavoriteViews = getFavoriteViews as jest.MockedFunction<typeof getFavoriteViews>
const mockMigrateSession = migrateSession as jest.MockedFunction<typeof migrateSession>
const mockGetTeams = getTeams as jest.MockedFunction<typeof getTeams>


describe('RoundPage', () => {
  const mockViews: View[] = [{ id: '1', name: 'View 1' }, { id: '2', name: 'View 2' }] as View[]
  const mockTeams: Team[] = [{ id: '1', name: 'Team 1' }, { id: '2', name: 'Team 2' }] as Team[]
  const mockParams = { roundId: 'round-123' }

  beforeEach(() => {
    jest.resetAllMocks()
    mockRoundComponent.mockReturnValue(<div data-testid="round-component" />)
    mockRoundProviders.mockImplementation(({ children }) => <div data-testid="round-providers">{children}</div>)
    mockGetTeams.mockResolvedValue(mockTeams)
  })

  const renderRoundPage = async () => {
    const RoundPageComponent = (await RoundPage({ params: mockParams })) as React.ReactElement
    render(RoundPageComponent)
  }

  it('should render RoundProviders and RoundComponent with views and teams when user is authenticated', async () => {
    mockMigrateSession.mockResolvedValue({ user: { token: 'user-token' } as User, anonymous: false } as IronSession<SessionData>)
    mockGetFavoriteViews.mockResolvedValue(mockViews)
    mockGetTeams.mockResolvedValue(mockTeams)

    await renderRoundPage()

    expect(screen.getByTestId('suspense')).toBeInTheDocument()
    expect(screen.getByTestId('round-providers')).toBeInTheDocument()
    expect(screen.getByTestId('round-component')).toBeInTheDocument()
    expect(mockRoundProviders).toHaveBeenCalledWith(expect.objectContaining({ views: mockViews, teams: mockTeams }), {})
    expect(mockRoundComponent).toHaveBeenCalledWith({ views: mockViews, teams: mockTeams, roundId: 'round-123' }, {})
  })

  it('should render RoundProviders and RoundComponent with empty views and teams when user is not authenticated', async () => {
    mockMigrateSession.mockResolvedValue({ user: null } as IronSession<SessionData>)

    await renderRoundPage()

    expect(screen.getByTestId('round-providers')).toBeInTheDocument()
    expect(screen.getByTestId('round-component')).toBeInTheDocument()
    expect(mockRoundProviders).toHaveBeenCalledWith(expect.objectContaining({ views: [], teams: [] }), {})
    expect(mockRoundComponent).toHaveBeenCalledWith({ views: [], teams: [], roundId: 'round-123' }, {})
  })

  it('should render RoundProviders and RoundComponent with empty views when user has no token', async () => {
    mockMigrateSession.mockResolvedValue({ user: { token: null } } as IronSession<SessionData>)

    await renderRoundPage()

    expect(screen.getByTestId('round-providers')).toBeInTheDocument()
    expect(screen.getByTestId('round-component')).toBeInTheDocument()
    expect(mockRoundProviders).toHaveBeenCalledWith(expect.objectContaining({ views: [] }), {})
    expect(mockRoundComponent).toHaveBeenCalledWith({ views: [], teams: [], roundId: 'round-123' }, {})
  })

  it('should call getFavoriteViews with the user when authenticated', async () => {
    const mockUser = { token: 'user-token' }
    mockMigrateSession.mockResolvedValue({ user: mockUser } as IronSession<SessionData>)
    mockGetFavoriteViews.mockResolvedValue(mockViews)

    await renderRoundPage()

    expect(mockGetFavoriteViews).toHaveBeenCalledWith(mockUser)
  })

  it('should not call getFavoriteViews when user is not authenticated', async () => {
    mockMigrateSession.mockResolvedValue({ user: null } as IronSession<SessionData>)

    await renderRoundPage()

    expect(mockGetFavoriteViews).not.toHaveBeenCalled()
  })
})
