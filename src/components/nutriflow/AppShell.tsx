import { useState } from 'react'
import {
  ChefHat,
  ClipboardList,
  LayoutDashboard,
  Leaf,
  LogOut,
  MessageSquare,
  Package,
  Users,
  Utensils,
  type LucideIcon,
} from 'lucide-react'
import { useAuth } from '../../lib/authContext'
import { ROLE_LABELS, type Role } from '../../lib/types'
import { avatarColor, bgForRole, initials } from '../../lib/uiHelpers'
import { ToastHost } from '../../lib/toast'
import ThemeToggle from '../ThemeToggle'
import { Dashboard } from './panels/Dashboard'
import { Pacientes } from './panels/Pacientes'
import { Planos } from './panels/Planos'
import { Cozinha } from './panels/Cozinha'
import { Estoque } from './panels/Estoque'
import { Feedbacks } from './panels/Feedbacks'
import { Usuarios } from './panels/Usuarios'
import { MeuPlano } from './panels/MeuPlano'

type NavItem = { id: string; icon: LucideIcon; label: string; roles: Role[] }

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['medico', 'nutricionista', 'enfermeiro', 'cozinheiro', 'admin'] },
  { id: 'meu-plano', icon: Utensils, label: 'Meu Plano', roles: ['paciente'] },
  { id: 'pacientes', icon: Users, label: 'Pacientes', roles: ['medico', 'nutricionista', 'enfermeiro', 'cozinheiro', 'admin'] },
  { id: 'planos', icon: ClipboardList, label: 'Planos Alimentares', roles: ['medico', 'nutricionista', 'admin'] },
  { id: 'cozinha', icon: ChefHat, label: 'Cozinha', roles: ['cozinheiro', 'admin'] },
  { id: 'estoque', icon: Package, label: 'Estoque', roles: ['cozinheiro', 'admin'] },
  { id: 'feedbacks', icon: MessageSquare, label: 'Feedbacks', roles: ['nutricionista', 'enfermeiro', 'medico', 'admin'] },
  { id: 'usuarios', icon: Users, label: 'Usuários', roles: ['admin'] },
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
  const ActiveIcon = activeItem?.icon ?? LayoutDashboard

  if (!profile) return <div className="emp">Carregando perfil...</div>

  return (
    <div className="nf">
      <ToastHost />
      <div id="app">
        <div id="sidebar">
          <div className="s-head">
            <div className="s-logo">
              <div className="ico">
                <Leaf size={20} />
              </div>
              <div className="s-logo-t">
                <h2>NutriFlow</h2>
                <span>Nutrição Hospitalar · IA</span>
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
            <div className="s-nav-label">Navegação</div>
            {visible.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.id} className={`nav-i ${panel === item.id ? 'on' : ''}`} onClick={() => setPanel(item.id)}>
                  <span className="ni">
                    <Icon size={18} />
                  </span>
                  <span>{item.label}</span>
                </div>
              )
            })}
          </div>
          <div className="s-foot">
            <ThemeToggle />
            <button className="btn btn-s btn-full btn-sm" onClick={signOut}>
              <LogOut size={15} />
              Sair
            </button>
          </div>
        </div>

        <div id="main">
          <div id="topbar">
            <div className="tb-title">
              <ActiveIcon size={19} />
              {activeItem?.label ?? ''}
            </div>
          </div>
          <div id="content">
            <Panel />
          </div>
        </div>
      </div>
    </div>
  )
}
