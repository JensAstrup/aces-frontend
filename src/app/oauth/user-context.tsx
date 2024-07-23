'use client'
import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react'


interface User {
  id: string
  name: string
  accessToken: string
}

interface UserProviderProps {
    children: ReactNode[] | ReactNode
}

const UserContext = createContext<User | null>(null)

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // You could load the user from localStorage here if needed
    const loadUser = () => {
      const accessToken = localStorage.getItem('accessToken')
      if (accessToken) {
        setUser({ id: '', name: '', accessToken })
      }
    }
    loadUser()
  }, [])

  return (
    <UserContext.Provider value={user}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  return useContext(UserContext)
}

export default UserProvider
export type { User }
