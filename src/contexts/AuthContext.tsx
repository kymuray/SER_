import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth, authReady } from '../services/firebase'

export const RESPONSAVEL_UID = '7NBwLe6iDrfENDbmgwTqSCtwWyl2'

type AuthContextData = {
  user: User | null
  loading: boolean
  isResponsavel: boolean
}

const AuthContext = createContext<AuthContextData | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let unsubscribe: (() => void) | undefined
    let active = true

    authReady.then(() => {
      if (!active) return
      unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser)
        setLoading(false)
      })
    }).catch(() => {
      if (active) setLoading(false)
    })

    return () => {
      active = false
      unsubscribe?.()
    }
  }, [])

  const value = {
    user,
    loading,
    isResponsavel: user?.uid === RESPONSAVEL_UID,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth precisa ser usado dentro de AuthProvider.')
  }

  return context
}
