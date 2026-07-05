import { useRef, useState } from 'react'
import { ArrowLeft, KeyRound, Leaf, LogIn, ShieldAlert } from 'lucide-react'
import { useAuth } from '../../lib/authContext'
import { DEMO_ACCOUNTS } from '../../lib/mockData'
import { ROLE_LABELS } from '../../lib/types'
import { avatarColor, bgForRole, roleIcon } from '../../lib/uiHelpers'

const QUICK = DEMO_ACCOUNTS.filter((a) => a.role !== 'paciente')

export function Login() {
  const { signIn, quickSignIn } = useAuth()
  const [mode, setMode] = useState<'quick' | 'manual'>('quick')
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [pendingRole, setPendingRole] = useState<string | null>(null)
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
    setPendingRole(mail)
    const err = await quickSignIn(mail)
    if (err) {
      setError(err)
      setPendingRole(null)
    }
  }

  function handleMove(e: React.MouseEvent) {
    const el = blobsRef.current
    if (!el) return
    const x = (e.clientX / window.innerWidth - 0.5) * 2
    const y = (e.clientY / window.innerHeight - 0.5) * 2
    el.querySelectorAll<HTMLElement>('.blob').forEach((b, i) => {
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
              <Leaf size={26} />
            </div>
            <h1>NutriFlow AI</h1>
            <p>Nutrição hospitalar guiada por IA</p>
          </div>

          {error ? (
            <div className="login-error">
              <ShieldAlert size={16} />
              {error}
            </div>
          ) : null}

          {mode === 'quick' ? (
            <>
              <div className="ql-caption">Escolha um perfil para entrar</div>
              <div className="ql-grid">
                {QUICK.map((a) => {
                  const Icon = roleIcon(a.role)
                  const busy = pendingRole === a.email
                  return (
                    <button
                      key={a.id}
                      type="button"
                      className="ql-chip"
                      onClick={() => handleQuick(a.email)}
                      disabled={!!pendingRole}
                    >
                      <span className="ql-av" style={{ background: bgForRole(a.role), color: avatarColor(a.role) }}>
                        <Icon size={20} />
                      </span>
                      <span className="ql-role">{busy ? 'Entrando…' : ROLE_LABELS[a.role]}</span>
                    </button>
                  )
                })}
              </div>
              <button type="button" className="link-btn" onClick={() => setMode('manual')}>
                <KeyRound size={13} />
                Entrar com e-mail e senha
              </button>
            </>
          ) : (
            <>
              <form onSubmit={handleLogin}>
                <div className="fg">
                  <label>E-mail</label>
                  <input
                    className="fc"
                    type="email"
                    placeholder="voce@nutriflow.app"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoFocus
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
              <button type="button" className="link-btn" onClick={() => setMode('quick')}>
                <ArrowLeft size={13} />
                Usar um perfil de demonstração
              </button>
            </>
          )}

          <div className="login-hint">Ambiente de demonstração</div>
        </div>
      </div>
    </div>
  )
}
