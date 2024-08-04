import React, { createContext, useContext } from 'react'


const VotesContext = createContext<{
  votes: number[]
  expectedVotes: number
  setVotes: React.Dispatch<React.SetStateAction<number[]>>
    setExpectedVotes: (expected: number) => void
      } | undefined>(undefined)


function VotesProvider({ children }: { children: React.ReactNode }) {
  const [votes, setVotes] = React.useState<number[]>([])
  const [expectedVotes, setExpectedVotes] = React.useState<number>(0)

  const setExpectedVotesCallback = React.useCallback((expected: number) => {
    setExpectedVotes(expected)
  }, [])

  return (
    <VotesContext.Provider value={{ votes, setVotes, expectedVotes, setExpectedVotes: setExpectedVotesCallback }}>
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
