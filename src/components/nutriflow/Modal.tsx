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

  // Monta o portal dentro do .nf já existente na página para herdar as CSS vars
  // sem criar um segundo elemento .nf com fundo gradiente por cima de tudo.
  const nfRoot = document.querySelector('.nf') ?? document.body

  return createPortal(
    <div className="mo on">
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
    nfRoot,
  )
}

