import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

type Theme = 'light' | 'dark'

function currentTheme(): Theme {
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    setTheme(currentTheme())
  }, [])

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    try {
      window.localStorage.setItem('nutriflow-theme', next)
    } catch {
      // ignora ambientes sem localStorage
    }
    setTheme(next)
  }

  return (
    <button
      type="button"
      className="theme-sw"
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
    >
      <span className="theme-sw-l">
        {theme === 'dark' ? <Moon size={15} /> : <Sun size={15} />}
        <span>{theme === 'dark' ? 'Tema escuro' : 'Tema claro'}</span>
      </span>
      <span className="theme-track">
        <span className="theme-knob">{theme === 'dark' ? <Moon size={11} /> : <Sun size={11} />}</span>
      </span>
    </button>
  )
}
