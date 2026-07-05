import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { DEMO_ACCOUNTS } from './mockData'
import type { Profile } from './types'

// Sessão simbólica (demo self-contained) — mesma forma de `{ user: { id } }`
// usada pelo restante do app, sem dependência de backend de autenticação.
export type MockSession = { user: { id: string } }

type AuthState = {
  session: MockSession | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<string | null>
  quickSignIn: (email: string) => Promise<string | null>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)
const SESSION_KEY = 'nutriflow-demo-session'

function profileFor(userId: string): Profile | null {
  const acc = DEMO_ACCOUNTS.find((a) => a.id === userId)
  if (!acc) return null
  return { id: acc.id, name: acc.name, email: acc.email, role: acc.role }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<MockSession | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = window.localStorage.getItem(SESSION_KEY)
    if (stored) {
      const prof = profileFor(stored)
      if (prof) {
        setSession({ user: { id: stored } })
        setProfile(prof)
      }
    }
    setLoading(false)
  }, [])

  function establish(userId: string) {
    window.localStorage.setItem(SESSION_KEY, userId)
    setSession({ user: { id: userId } })
    setProfile(profileFor(userId))
  }

  async function signIn(email: string, password: string) {
    const acc = DEMO_ACCOUNTS.find((a) => a.email.toLowerCase() === email.trim().toLowerCase())
    if (!acc) return 'E-mail não encontrado. Use uma das contas de demonstração.'
    if (!password.trim()) return 'Informe a senha.'
    // Ambiente de demonstração: qualquer senha não vazia é aceita.
    establish(acc.id)
    return null
  }

  async function quickSignIn(email: string) {
    const acc = DEMO_ACCOUNTS.find((a) => a.email.toLowerCase() === email.toLowerCase())
    if (!acc) return 'Conta de demonstração inválida.'
    establish(acc.id)
    return null
  }

  async function signOut() {
    window.localStorage.removeItem(SESSION_KEY)
    setSession(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ session, profile, loading, signIn, quickSignIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
