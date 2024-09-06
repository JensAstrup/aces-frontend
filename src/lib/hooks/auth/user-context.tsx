'use client'
import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react'

import User from '@aces/interfaces/user'



interface UserContextType {
  user: User | null
  isLoading: boolean
  error: Error | null
}

interface UserProviderProps {
  children: ReactNode[] | ReactNode
}

const UserContext = createContext<UserContextType>({ user: null, isLoading: true, error: null })

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const loadUser = () => {
      try {
        setIsLoading(true)
      }
      catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'))
      }
      finally {
        setIsLoading(false)
      }
    }
    loadUser()
  }, [])

  return (
    <UserContext.Provider value={{ user, isLoading, error }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  return useContext(UserContext)
}

export default UserProvider
export { UserContext }
export type { UserContextType, UserProviderProps }
