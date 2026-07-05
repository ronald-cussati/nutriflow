import type { MealType, Role } from './types'

export function initials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
}

export function fmtDate(d: string | null | undefined) {
  if (!d) return '—'
  const p = d.split('-')
  return `${p[2]}/${p[1]}/${p[0]}`
}

export function avatarColor(r?: Role) {
  const map: Record<Role, string> = {
    medico: '#ff4d6d',
    nutricionista: '#00d4aa',
    enfermeiro: '#4f8ef7',
    cozinheiro: '#ffb347',
    admin: '#b464ff',
    paciente: '#7a9bbf',
  }
  return r ? map[r] : '#7a9bbf'
}

export function bgForRole(r?: Role) {
  const map: Record<Role, string> = {
    medico: 'rgba(255,77,109,.15)',
    nutricionista: 'rgba(0,212,170,.15)',
    enfermeiro: 'rgba(79,142,247,.15)',
    cozinheiro: 'rgba(255,179,71,.15)',
    admin: 'rgba(180,100,255,.15)',
    paciente: 'rgba(122,155,191,.15)',
  }
  return r ? map[r] : 'rgba(255,255,255,.08)'
}

export function roleBadgeClass(r?: Role) {
  const map: Record<Role, string> = {
    medico: 'bg-r',
    nutricionista: 'bg-g',
    enfermeiro: 'bg-b',
    cozinheiro: 'bg-y',
    admin: 'bg-p',
    paciente: 'bg-n',
  }
  return r ? map[r] : 'bg-n'
}

export const MEAL_WINDOWS: Record<MealType, [number, number]> = {
  'Café da Manhã': [6, 9],
  'Lanche da Manhã': [9, 10.5],
  'Almoço': [11, 13.5],
  'Lanche da Tarde': [14.5, 16],
  'Jantar': [18, 20],
  'Ceia': [20.5, 22],
}

export function isInWindow(type: MealType) {
  const w = MEAL_WINDOWS[type]
  if (!w) return true
  const now = new Date()
  const h = now.getHours() + now.getMinutes() / 60
  return h >= w[0] && h <= w[1]
}

export function windowLabel(type: MealType) {
  const w = MEAL_WINDOWS[type]
  if (!w) return ''
  const fmt = (f: number) => {
    const h = Math.floor(f)
    const m = Math.round((f - h) * 60)
    return `${String(h).padStart(2, '0')}h${m ? String(m).padStart(2, '0') : '00'}`
  }
  return `${fmt(w[0])}–${fmt(w[1])}`
}
