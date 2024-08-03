import React, { createContext, useContext } from 'react'



interface VotesState {
  votes: number[]
  isLoading: boolean
}

const VotesContext = createContext<{
  votes: number[]
  setVotes: React.Dispatch<React.SetStateAction<number[]>>
} | undefined>(undefined)


function VotesProvider({ children }: { children: React.ReactNode }) {
  const [votes, setVotes] = React.useState<number[]>([])

  return (
    <VotesContext.Provider value={{ votes, setVotes }}>
      {children}
    </VotesContext.Provider>

  )
}


function useVotes() {
  const context = useContext(VotesContext)
  if (context === undefined) {
    throw new Error('useVotes must be used within a VotesProvider')
  }
  return context
}

export { VotesProvider, useVotes }
