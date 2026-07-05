import { useRef, useState } from 'react'
import { Leaf, LogIn, ShieldAlert, Sparkles } from 'lucide-react'
import { useAuth } from '../../lib/authContext'
import { DEMO_ACCOUNTS } from '../../lib/mockData'
import { ROLE_LABELS } from '../../lib/types'
import { avatarColor, bgForRole, initials } from '../../lib/uiHelpers'

const QUICK = DEMO_ACCOUNTS.filter((a) => a.role !== 'paciente')

export function Login() {
  const { signIn, quickSignIn } = useAuth()
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const blobsRef = useRef<HTMLDivElement>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const err = await signIn(email, pass)
    setLoading(false)
    if (err) setError(err)
  }

  async function handleQuick(mail: string) {
    setError(null)
    await quickSignIn(mail)
  }

  function handleMove(e: React.MouseEvent) {
    const el = blobsRef.current
    if (!el) return
    const x = (e.clientX / window.innerWidth - 0.5) * 2
    const y = (e.clientY / window.innerHeight - 0.5) * 2
    const blobs = el.querySelectorAll<HTMLElement>('.blob')
    blobs.forEach((b, i) => {
      const depth = (i + 1) * 14
      b.style.transform = `translate(${x * depth}px, ${y * depth}px)`
    })
  }

  return (
    <div className="nf">
      <div id="login-screen" onMouseMove={handleMove}>
        <div className="nf-blobs" ref={blobsRef}>
          <div className="blob b1" />
          <div className="blob b2" />
          <div className="blob b3" />
        </div>
        <div className="login-box">
          <div className="l-logo">
            <div className="l-icon">
              <Leaf size={28} />
            </div>
            <h1>NutriFlow AI</h1>
            <p>Gestão nutricional hospitalar inteligente</p>
          </div>
          {error ? (
            <div className="login-error">
              <ShieldAlert size={16} />
              {error}
            </div>
          ) : null}
          <form onSubmit={handleLogin}>
            <div className="fg">
              <label>E-mail</label>
              <input
                className="fc"
                type="email"
                placeholder="voce@nutriflow.app"
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
              <LogIn size={16} />
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="ql-title">
            <Sparkles size={12} style={{ verticalAlign: '-2px', marginRight: 5 }} />
            Acesso rápido — contas de demonstração
          </div>
          <div className="ql-grid">
            {QUICK.map((a) => (
              <button key={a.id} className="ql-chip" onClick={() => handleQuick(a.email)} type="button">
                <span className="ql-av" style={{ background: bgForRole(a.role), color: avatarColor(a.role) }}>
                  {initials(a.name)}
                </span>
                <span className="ql-info">
                  <span className="ql-role">{ROLE_LABELS[a.role]}</span>
                  <span className="ql-mail">{a.email}</span>
                </span>
              </button>
            ))}
          </div>
          <div className="login-hint">Ambiente de demonstração · qualquer senha é aceita</div>
        </div>
      </div>
    </div>
  )
}
