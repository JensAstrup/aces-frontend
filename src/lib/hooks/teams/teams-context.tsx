'use client'

import React, { createContext, ReactNode, useContext, useState } from 'react'

import Team from '@aces/interfaces/team'


interface TeamsContextProps {
  teams: Team[]
  selectedTeam: Team | null
  setTeam: (team: Team | null) => void
}

const TeamsContext = createContext<TeamsContextProps | undefined>(undefined)

interface TeamsProviderProps {
  children: ReactNode
  teams: Team[]
}

const TeamsProvider: React.FC<TeamsProviderProps> = ({ children, teams }) => {
  const [selectedTeam, setTeam] = useState<Team | null>(() => teams[0] || null)

  return (
    <TeamsContext.Provider value={{ teams, selectedTeam, setTeam }}>
      {children}
    </TeamsContext.Provider>
  )
}

const useTeams = (): TeamsContextProps => {
  const context = useContext(TeamsContext)
  if (!context) {
    throw new Error('useTeams must be used within a TeamsProvider')
  }
  return context
}

export default useTeams
export { TeamsProvider }
