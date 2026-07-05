import { useEffect, useState } from 'react'
import { Modal } from './Modal'
import { addFeedback } from '../../lib/api'
import { toast } from '../../lib/toast'
import { useAuth } from '../../lib/authContext'
import type { Patient } from '../../lib/types'

const MEAL_OPTIONS = ['Café da Manhã', 'Lanche da Manhã', 'Almoço', 'Lanche da Tarde', 'Jantar', 'Ceia']

export function FeedbackModal({
  open,
  patients,
  fixedPatientId,
  onClose,
  onSaved,
}: {
  open: boolean
  patients: Patient[]
  fixedPatientId?: string
  onClose: () => void
  onSaved: () => void
}) {
  const { session } = useAuth()
  const [patientId, setPatientId] = useState('')
  const [mealType, setMealType] = useState(MEAL_OPTIONS[0])
  const [rating, setRating] = useState('5')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setPatientId(fixedPatientId ?? patients[0]?.id ?? '')
    setMealType(MEAL_OPTIONS[0])
    setRating('5')
    setNotes('')
  }, [open, patients, fixedPatientId])

  async function handleSave() {
    if (!patientId) {
      toast('er', 'Selecione um paciente')
      return
    }
    setSaving(true)
    try {
      await addFeedback({
        patient_id: patientId,
        meal_type: mealType,
        rating: Number(rating),
        notes: notes.trim(),
        created_by: session!.user.id,
      })
      toast('ok', 'Feedback registrado')
      onSaved()
      onClose()
    } catch (e) {
      toast('er', 'Erro ao salvar', (e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Registrar Feedback">
      {!fixedPatientId ? (
        <div className="fg">
          <label>Paciente</label>
          <select className="fc" value={patientId} onChange={(e) => setPatientId(e.target.value)}>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      <div className="fr">
        <div className="fg">
          <label>Refeição</label>
          <select className="fc" value={mealType} onChange={(e) => setMealType(e.target.value)}>
            {MEAL_OPTIONS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </div>
        <div className="fg">
          <label>Avaliação</label>
          <select className="fc" value={rating} onChange={(e) => setRating(e.target.value)}>
            <option value="5">⭐⭐⭐⭐⭐ Excelente</option>
            <option value="4">⭐⭐⭐⭐ Bom</option>
            <option value="3">⭐⭐⭐ Regular</option>
            <option value="2">⭐⭐ Ruim</option>
            <option value="1">⭐ Muito ruim</option>
          </select>
        </div>
      </div>
      <div className="fg">
        <label>Observações</label>
        <textarea
          className="fc"
          placeholder="O paciente recusou... / Preferências..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
        <button className="btn btn-s" onClick={onClose}>
          Cancelar
        </button>
        <button className="btn btn-p" onClick={handleSave} disabled={saving}>
          Salvar Feedback
        </button>
      </div>
    </Modal>
  )
}
