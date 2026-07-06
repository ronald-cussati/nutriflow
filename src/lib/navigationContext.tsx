import { createContext, useContext, useState, type ReactNode } from 'react'

type NavigationState = {
  goTo: (panel: string, patientId?: string) => void
  focusPatientId: string | null
  clearFocus: () => void
}

const NavigationContext = createContext<NavigationState | null>(null)

// Permite que um painel (ex.: Dashboard) navegue para outro (ex.: Pacientes)
// já apontando para um paciente específico — a ponte que liga as telas entre si.
export function NavigationProvider({
  onNavigate,
  children,
}: {
  onNavigate: (panel: string) => void
  children: ReactNode
}) {
  const [focusPatientId, setFocusPatientId] = useState<string | null>(null)

  function goTo(panel: string, patientId?: string) {
    setFocusPatientId(patientId ?? null)
    onNavigate(panel)
  }

  function clearFocus() {
    setFocusPatientId(null)
  }

  return (
    <NavigationContext.Provider value={{ goTo, focusPatientId, clearFocus }}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const ctx = useContext(NavigationContext)
  if (!ctx) throw new Error('useNavigation deve ser usado dentro de NavigationProvider')
  return ctx
}
