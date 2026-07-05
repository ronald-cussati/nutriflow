import { useEffect, useState } from 'react'
import { Modal } from './Modal'
import { createPatient, updatePatient } from '../../lib/api'
import { toast } from '../../lib/toast'
import type { Patient } from '../../lib/types'

export function PatientModal({
  open,
  patient,
  onClose,
  onSaved,
}: {
  open: boolean
  patient: Patient | null
  onClose: () => void
  onSaved: () => void
}) {
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [room, setRoom] = useState('')
  const [gender, setGender] = useState('Masculino')
  const [conditions, setConditions] = useState('')
  const [restrictions, setRestrictions] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setName(patient?.name ?? '')
    setAge(patient ? String(patient.age) : '')
    setRoom(patient?.room ?? '')
    setGender(patient?.gender ?? 'Masculino')
    setConditions(patient?.conditions.join(', ') ?? '')
    setRestrictions(patient?.restrictions.join(', ') ?? '')
    setNotes(patient?.notes ?? '')
  }, [open, patient])

  async function handleSave() {
    if (!name.trim() || !age || !room.trim()) {
      toast('er', 'Campos obrigatórios', 'Preencha nome, idade e quarto')
      return
    }
    setSaving(true)
    try {
      const data = {
        name: name.trim(),
        age: Number(age),
        room: room.trim(),
        gender,
        conditions: conditions.split(',').map((s) => s.trim()).filter(Boolean),
        restrictions: restrictions.split(',').map((s) => s.trim()).filter(Boolean),
        notes: notes.trim(),
      }
      if (patient) {
        await updatePatient(patient.id, data)
        toast('ok', 'Paciente atualizado')
      } else {
        await createPatient(data)
        toast('ok', 'Paciente cadastrado', 'Plano rascunho criado automaticamente')
      }
      onSaved()
      onClose()
    } catch (e) {
      toast('er', 'Erro ao salvar', (e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={patient ? 'Editar Paciente' : 'Novo Paciente'} large>
      <div className="fr">
        <div className="fg">
          <label>Nome completo *</label>
          <input className="fc" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="fg">
          <label>Idade *</label>
          <input className="fc" type="number" min={0} max={150} value={age} onChange={(e) => setAge(e.target.value)} />
        </div>
      </div>
      <div className="fr">
        <div className="fg">
          <label>Quarto/Leito *</label>
          <input className="fc" value={room} onChange={(e) => setRoom(e.target.value)} />
        </div>
        <div className="fg">
          <label>Sexo</label>
          <select className="fc" value={gender} onChange={(e) => setGender(e.target.value)}>
            <option>Masculino</option>
            <option>Feminino</option>
            <option>Outro</option>
          </select>
        </div>
      </div>
      <div className="fg">
        <label>Condições médicas (vírgula para separar)</label>
        <input
          className="fc"
          placeholder="ex: Diabetes tipo 2, Hipertensão"
          value={conditions}
          onChange={(e) => setConditions(e.target.value)}
        />
      </div>
      <div className="fg">
        <label>Restrições alimentares (vírgula para separar)</label>
        <input
          className="fc"
          placeholder="ex: Sem glúten, Baixo sódio"
          value={restrictions}
          onChange={(e) => setRestrictions(e.target.value)}
        />
      </div>
      <div className="fg">
        <label>Notas médicas</label>
        <textarea
          className="fc"
          placeholder="Observações adicionais..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
        <button className="btn btn-s" onClick={onClose}>
          Cancelar
        </button>
        <button className="btn btn-p" onClick={handleSave} disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar Paciente'}
        </button>
      </div>
    </Modal>
  )
}
