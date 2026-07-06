import { useEffect, useState } from 'react'
import { Activity, HeartPulse, Pill, Utensils } from 'lucide-react'
import { Modal } from './Modal'
import { InfoTip } from './InfoTip'
import { createPatient, updatePatient } from '../../lib/api'
import { toast } from '../../lib/toast'
import { DIET_TYPES, RISK_LEVELS, type DietType, type Patient, type RiskLevel } from '../../lib/types'

function splitList(v: string) {
  return v.split(',').map((s) => s.trim()).filter(Boolean)
}

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
  const [dietType, setDietType] = useState<DietType>('Livre')
  const [risk, setRisk] = useState<RiskLevel>('Baixo')
  const [conditions, setConditions] = useState('')
  const [restrictions, setRestrictions] = useState('')
  const [medications, setMedications] = useState('')
  const [drugAllergies, setDrugAllergies] = useState('')
  const [foodAllergies, setFoodAllergies] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setName(patient?.name ?? '')
    setAge(patient ? String(patient.age) : '')
    setRoom(patient?.room ?? '')
    setGender(patient?.gender ?? 'Masculino')
    setDietType(patient?.diet_type ?? 'Livre')
    setRisk(patient?.nutritional_risk ?? 'Baixo')
    setConditions(patient?.conditions.join(', ') ?? '')
    setRestrictions(patient?.restrictions.join(', ') ?? '')
    setMedications(patient?.medications.join(', ') ?? '')
    setDrugAllergies(patient?.drug_allergies.join(', ') ?? '')
    setFoodAllergies(patient?.food_allergies.join(', ') ?? '')
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
        diet_type: dietType,
        nutritional_risk: risk,
        conditions: splitList(conditions),
        restrictions: splitList(restrictions),
        medications: splitList(medications),
        drug_allergies: splitList(drugAllergies),
        food_allergies: splitList(foodAllergies),
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
    <Modal open={open} onClose={onClose} title={patient ? 'Editar paciente' : 'Novo paciente'} large>
      <div className="section-label"><Activity size={13} /> Identificação</div>
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
          <label>Quarto / Leito *</label>
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

      <div className="section-label"><HeartPulse size={13} /> Quadro clínico</div>
      <div className="fr">
        <div className="fg">
          <label>
            Tipo de dieta prescrita
            <InfoTip text="Consistência/composição da alimentação definida pela equipe clínica — orienta o que a IA pode sugerir no plano." />
          </label>
          <select className="fc" value={dietType} onChange={(e) => setDietType(e.target.value as DietType)}>
            {DIET_TYPES.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div className="fg">
          <label>
            Risco nutricional
            <InfoTip text="Classificação de prioridade clínica: Alto exige atenção prioritária da equipe, Moderado requer acompanhamento, Baixo é rotina." />
          </label>
          <select className="fc" value={risk} onChange={(e) => setRisk(e.target.value as RiskLevel)}>
            {RISK_LEVELS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="fg">
        <label>Condições médicas / comorbidades</label>
        <input
          className="fc"
          placeholder="ex: Diabetes tipo 2, Hipertensão, Insuficiência renal"
          value={conditions}
          onChange={(e) => setConditions(e.target.value)}
        />
        <div className="field-hint">Separe cada item por vírgula.</div>
      </div>

      <div className="section-label"><Pill size={13} /> Medicações & alergias</div>
      <div className="fg">
        <label>Medicamentos em uso</label>
        <input
          className="fc"
          placeholder="ex: Metformina, Losartana, Insulina"
          value={medications}
          onChange={(e) => setMedications(e.target.value)}
        />
      </div>
      <div className="fr">
        <div className="fg">
          <label>Alergias a medicamentos</label>
          <input
            className="fc"
            placeholder="ex: Penicilina, Dipirona"
            value={drugAllergies}
            onChange={(e) => setDrugAllergies(e.target.value)}
          />
        </div>
        <div className="fg">
          <label>Alergias / intolerâncias alimentares</label>
          <input
            className="fc"
            placeholder="ex: Glúten, Lactose, Amendoim"
            value={foodAllergies}
            onChange={(e) => setFoodAllergies(e.target.value)}
          />
        </div>
      </div>

      <div className="section-label"><Utensils size={13} /> Dieta & observações</div>
      <div className="fg">
        <label>Restrições alimentares</label>
        <input
          className="fc"
          placeholder="ex: Baixo sódio, Sem açúcar, Consistência pastosa"
          value={restrictions}
          onChange={(e) => setRestrictions(e.target.value)}
        />
      </div>
      <div className="fg">
        <label>Observações clínicas</label>
        <textarea
          className="fc"
          placeholder="Observações relevantes para a equipe..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 10 }}>
        <button className="btn btn-s" onClick={onClose}>
          Cancelar
        </button>
        <button className="btn btn-p" onClick={handleSave} disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar paciente'}
        </button>
      </div>
    </Modal>
  )
}
