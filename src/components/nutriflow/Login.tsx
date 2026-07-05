import { useState } from 'react'
import { useAuth } from '../../lib/authContext'

export function Login() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const err = await signIn(email, pass)
    setLoading(false)
    if (err) setError('Credenciais inválidas. Verifique email e senha.')
  }

  return (
    <div className="nf">
      <div id="login-screen">
        <div className="login-box">
          <div className="l-logo">
            <div className="l-icon">🥗</div>
            <h1>NutriFlow AI</h1>
            <p>Sistema Inteligente de Gestão Nutricional Hospitalar</p>
          </div>
          {error ? <div className="login-error">{error}</div> : null}
          <form onSubmit={handleLogin}>
            <div className="fg">
              <label>Email</label>
              <input
                className="fc"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="fg">
              <label>Senha</label>
              <input
                className="fc"
                type="password"
                placeholder="••••••••"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                required
              />
            </div>
            <button className="btn btn-p btn-full btn-lg" type="submit" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
