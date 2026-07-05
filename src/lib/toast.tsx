import { useEffect, useState } from 'react'

export type ToastKind = 'ok' | 'er' | 'wa' | 'in'

type ToastEntry = { id: number; kind: ToastKind; title: string; msg?: string }

let listeners: Array<(t: ToastEntry) => void> = []
let counter = 0

export function toast(kind: ToastKind, title: string, msg?: string) {
  const entry = { id: ++counter, kind, title, msg }
  listeners.forEach((l) => l(entry))
}

const ICONS: Record<ToastKind, string> = { ok: '✅', er: '❌', wa: '⚠️', in: 'ℹ️' }

export function ToastHost() {
  const [toasts, setToasts] = useState<ToastEntry[]>([])

  useEffect(() => {
    const listener = (entry: ToastEntry) => {
      setToasts((prev) => [...prev, entry])
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== entry.id))
      }, 3500)
    }
    listeners.push(listener)
    return () => {
      listeners = listeners.filter((l) => l !== listener)
    }
  }, [])

  return (
    <div id="tc">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.kind}`}>
          <div className="toast-ico">{ICONS[t.kind]}</div>
          <div>
            <div className="toast-t">{t.title}</div>
            {t.msg ? <div className="toast-m">{t.msg}</div> : null}
          </div>
        </div>
      ))}
    </div>
  )
}
