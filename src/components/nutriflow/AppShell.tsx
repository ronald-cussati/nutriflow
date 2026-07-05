import { useState } from 'react'
import { useAuth } from '../../lib/authContext'
import { ROLE_LABELS, type Role } from '../../lib/types'
import { avatarColor, bgForRole, initials } from '../../lib/uiHelpers'
import { ToastHost } from '../../lib/toast'
import { Dashboard } from './panels/Dashboard'
import { Pacientes } from './panels/Pacientes'
import { Planos } from './panels/Planos'
import { Cozinha } from './panels/Cozinha'
import { Estoque } from './panels/Estoque'
import { Feedbacks } from './panels/Feedbacks'
import { Usuarios } from './panels/Usuarios'
import { MeuPlano } from './panels/MeuPlano'

type NavItem = { id: string; icon: string; label: string; roles: Role[] }

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', icon: '📊', label: 'Dashboard', roles: ['medico', 'nutricionista', 'enfermeiro', 'admin'] },
  { id: 'meu-plano', icon: '🍽️', label: 'Meu Plano', roles: ['paciente'] },
  { id: 'pacientes', icon: '🏥', label: 'Pacientes', roles: ['medico', 'nutricionista', 'enfermeiro', 'admin'] },
  { id: 'planos', icon: '📋', label: 'Planos Alimentares', roles: ['medico', 'nutricionista', 'admin'] },
  { id: 'cozinha', icon: '🍽️', label: 'Cozinha', roles: ['cozinheiro', 'admin'] },
  { id: 'estoque', icon: '📦', label: 'Estoque', roles: ['cozinheiro', 'admin'] },
  { id: 'feedbacks', icon: '💬', label: 'Feedbacks', roles: ['nutricionista', 'enfermeiro', 'medico', 'admin'] },
  { id: 'usuarios', icon: '👥', label: 'Usuários', roles: ['admin', 'medico'] },
]

const PANELS: Record<string, React.ComponentType> = {
  dashboard: Dashboard,
  'meu-plano': MeuPlano,
  pacientes: Pacientes,
  planos: Planos,
  cozinha: Cozinha,
  estoque: Estoque,
  feedbacks: Feedbacks,
  usuarios: Usuarios,
}

export function AppShell() {
  const { profile, signOut } = useAuth()
  const role = profile?.role
  const visible = NAV_ITEMS.filter((n) => role && n.roles.includes(role))
  const [panel, setPanel] = useState(visible[0]?.id ?? 'dashboard')

  const activeItem = NAV_ITEMS.find((n) => n.id === panel)
  const Panel = PANELS[panel] ?? Dashboard

  if (!profile) return <div className="emp">Carregando perfil...</div>

  return (
    <div className="nf">
      <ToastHost />
      <div id="app" className="on">
        <div id="sidebar">
          <div className="s-head">
            <div className="s-logo">
              <div className="ico">🥗</div>
              <div className="s-logo-t">
                <h2>NutriFlow</h2>
                <span>AI Hospital Nutrition</span>
              </div>
            </div>
          </div>
          <div className="s-user">
            <div className="u-av" style={{ background: bgForRole(role), color: avatarColor(role) }}>
              {initials(profile.name)}
            </div>
            <div style={{ minWidth: 0 }}>
              <div className="u-name">{profile.name}</div>
              <div className="u-role">{ROLE_LABELS[profile.role]}</div>
            </div>
          </div>
          <div className="s-nav">
            {visible.map((item) => (
              <div key={item.id} className={`nav-i ${panel === item.id ? 'on' : ''}`} onClick={() => setPanel(item.id)}>
                <span className="ni">{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>
          <div className="s-foot">
            <button className="btn btn-s btn-full btn-sm" onClick={signOut}>
              ⬅ Sair
            </button>
          </div>
        </div>

        <div id="main">
          <div id="topbar">
            <div className="tb-title">{activeItem?.label ?? ''}</div>
          </div>
          <div id="content">
            <Panel />
          </div>
        </div>
      </div>
    </div>
  )
}
