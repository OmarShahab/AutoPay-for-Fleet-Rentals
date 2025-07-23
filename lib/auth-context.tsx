'use client'
import React, { createContext, useContext, useState, useEffect } from 'react'

interface User {
  username: string
  role: string
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => boolean
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    const token = localStorage.getItem('bike_admin_token')
    if (token) {
      const { validateSession } = require('./auth')
      const sessionUser = validateSession(token)
      if (sessionUser) {
        setUser(sessionUser)
      } else {
        localStorage.removeItem('bike_admin_token')
      }
    }
    setIsLoading(false)
  }, [])

  const login = (username: string, password: string): boolean => {
    const { validateCredentials, createSession } = require('./auth')
    const validUser = validateCredentials(username, password)
    
    if (validUser) {
      const token = createSession(validUser)
      localStorage.setItem('bike_admin_token', token)
      setUser(validUser)
      return true
    }
    return false
  }

  const logout = () => {
    localStorage.removeItem('bike_admin_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
