import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

export function Modal({
  open,
  onClose,
  title,
  large,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  large?: boolean
  children: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  if (!open || typeof document === 'undefined') return null

  // Renderiza via portal direto no <body>: evita que um ancestral com
  // transform/animation (o rise-in dos painéis) vire "containing block" e
  // prenda o modal fixed dentro de um retângulo menor em vez da viewport inteira.
  return createPortal(
    <div className="nf mo on">
      <div className="mo-backdrop" onClick={onClose} aria-hidden="true" />
      <div className={`mo-box ${large ? 'mo-box-lg' : ''}`}>
        <div className="mh">
          <div className="mt">{title}</div>
          <button type="button" className="mc" onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </button>
        </div>
        <div className="mb">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
