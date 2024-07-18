'use client'
import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react'


interface User {
  id: string
  name: string
  accessToken: string
}

interface UserContextType {
  user: User | null
  setUser: (user: User | null) => void
}

interface UserProviderProps {
    children: ReactNode[] | ReactNode
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // You could load the user from localStorage here if needed
    const loadUser = () => {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
    }
    loadUser()
  }, [])

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
