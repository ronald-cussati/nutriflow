import { Info } from 'lucide-react'

// Ícone (i) com tooltip nativo (title) para esclarecer termos da plataforma
// sem poluir a tela — aparece só quando o usuário passa o mouse ou foca.
export function InfoTip({ text }: { text: string }) {
  return (
    <span className="info-tip" tabIndex={0} title={text} aria-label={text}>
      <Info size={13} />
    </span>
  )
}
