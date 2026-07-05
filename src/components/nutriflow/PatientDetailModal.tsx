import { AlertTriangle, HeartPulse, Pill, Utensils } from 'lucide-react'
import { Modal } from './Modal'
import { fmtDate, initials, riskBadgeClass } from '../../lib/uiHelpers'
import { MEAL_KEYS, MEAL_TYPES, type MealPlan, type Patient } from '../../lib/types'

function ChipList({ items, cls, empty }: { items: string[]; cls: string; empty: string }) {
  if (!items.length) return <span style={{ color: 'var(--t3)', fontSize: 12.5 }}>{empty}</span>
  return (
    <div className="chip-row">
      {items.map((i) => (
        <span className={`bg ${cls}`} key={i}>
          {i}
        </span>
      ))}
    </div>
  )
}

export function PatientDetailModal({
  open,
  patient,
  plan,
  onClose,
}: {
  open: boolean
  patient: Patient | null
  plan: MealPlan | null
  onClose: () => void
}) {
  if (!patient) return null
  return (
    <Modal open={open} onClose={onClose} title="Prontuário do paciente" large>
      <div className="pt-hero">
        <div className="pav" style={{ background: 'var(--acc-d)', color: 'var(--acc)', width: 54, height: 54, fontSize: 18 }}>
          {initials(patient.name)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 18, fontWeight: 600 }}>{patient.name}</div>
          <div style={{ fontSize: 12.5, color: 'var(--t3)', marginTop: 3 }}>
            Quarto {patient.room} · {patient.age} anos · {patient.gender || '—'} · internado em {fmtDate(patient.admission_date)}
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            <span className={`bg ${riskBadgeClass(patient.nutritional_risk)}`}>Risco {patient.nutritional_risk.toLowerCase()}</span>
            <span className="bg bg-b">Dieta {patient.diet_type}</span>
            <span className={`bg ${patient.status === 'Internado' ? 'bg-g' : 'bg-n'}`}>{patient.status}</span>
          </div>
        </div>
      </div>

      <div className="clin-grid">
        <div className="clin-box">
          <div className="clin-box-h"><HeartPulse size={15} /> Condições médicas</div>
          <ChipList items={patient.conditions} cls="bg-r" empty="Nenhuma registrada" />
        </div>
        <div className="clin-box">
          <div className="clin-box-h"><Pill size={15} /> Medicamentos</div>
          <ChipList items={patient.medications} cls="bg-b" empty="Nenhum registrado" />
        </div>
        <div className="clin-box">
          <div className="clin-box-h"><AlertTriangle size={15} /> Alergias</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div>
              <div style={{ fontSize: 10.5, color: 'var(--t3)', marginBottom: 5 }}>Medicamentos</div>
              <ChipList items={patient.drug_allergies} cls="bg-y" empty="Nenhuma" />
            </div>
            <div>
              <div style={{ fontSize: 10.5, color: 'var(--t3)', marginBottom: 5 }}>Alimentares</div>
              <ChipList items={patient.food_allergies} cls="bg-y" empty="Nenhuma" />
            </div>
          </div>
        </div>
        <div className="clin-box">
          <div className="clin-box-h"><Utensils size={15} /> Dieta & restrições</div>
          <div style={{ fontSize: 12.5, color: 'var(--t2)', marginBottom: 9 }}>
            Prescrição: <strong style={{ color: 'var(--t1)' }}>{patient.diet_type}</strong>
          </div>
          <ChipList items={patient.restrictions} cls="bg-n" empty="Sem restrições" />
        </div>
      </div>

      {patient.notes ? (
        <>
          <div className="section-label">Observações clínicas</div>
          <div className="clin-box" style={{ fontSize: 13, color: 'var(--t2)' }}>{patient.notes}</div>
        </>
      ) : null}

      {plan ? (
        <>
          <div className="section-label">
            Plano alimentar
            <span className={`bg ${plan.status === 'Aprovado' ? 'bg-g' : 'bg-y'}`} style={{ marginLeft: 6 }}>{plan.status}</span>
          </div>
          <div className="mp-grid">
            {MEAL_TYPES.map((label, i) => (
              <div className="mp-i" key={label}>
                <div className="mp-lbl">{label}</div>
                <div className="mp-txt">
                  {plan.meals[MEAL_KEYS[i]] || <span style={{ color: 'var(--t3)' }}>Não definido</span>}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </Modal>
  )
}
