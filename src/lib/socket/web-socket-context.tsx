import React, { createContext, useContext, useState } from 'react'


interface WebSocketContextType {
  isConnected: boolean | null
  setIsConnected: (connected: boolean | null) => void
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined)

const useWebSocket = () => {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider')
  }
  return context
}

const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(true)

  return (
    <WebSocketContext.Provider value={{ isConnected, setIsConnected }}>
      {children}
    </WebSocketContext.Provider>
  )
}

export { WebSocketProvider, useWebSocket }
