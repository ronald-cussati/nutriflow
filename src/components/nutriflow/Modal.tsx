import type { ReactNode } from 'react'

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
  if (!open) return null
  return (
    <div
      className="mo on"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className={`mb ${large ? 'mb-lg' : ''}`}>
        <div className="mh">
          <div className="mt">{title}</div>
          <div className="mc" onClick={onClose}>
            ✕
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}
