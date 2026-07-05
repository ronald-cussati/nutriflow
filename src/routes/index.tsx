import { createFileRoute } from '@tanstack/react-router'
import { useAuth } from '../lib/authContext'
import { Login } from '../components/nutriflow/Login'
import { AppShell } from '../components/nutriflow/AppShell'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="nf" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Carregando...
      </div>
    )
  }

  return session ? <AppShell /> : <Login />
}
