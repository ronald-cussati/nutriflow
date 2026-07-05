import { Modal } from './Modal'
import { fmtDate } from '../../lib/uiHelpers'
import { MEAL_KEYS, MEAL_TYPES, type MealPlan, type Patient } from '../../lib/types'

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
    <Modal open={open} onClose={onClose} title={patient.name} large>
      <div className="g2" style={{ marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 4 }}>INFORMAÇÕES</div>
          <div style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 2 }}>
            <div>
              Quarto: <strong style={{ color: 'var(--t1)' }}>{patient.room}</strong>
            </div>
            <div>
              Idade: <strong style={{ color: 'var(--t1)' }}>{patient.age} anos</strong>
            </div>
            <div>
              Sexo: <strong style={{ color: 'var(--t1)' }}>{patient.gender || '—'}</strong>
            </div>
            <div>
              Internação: <strong style={{ color: 'var(--t1)' }}>{fmtDate(patient.admission_date)}</strong>
            </div>
            <div>
              Status:{' '}
              <span className={`bg ${patient.status === 'Internado' ? 'bg-g' : 'bg-y'}`}>{patient.status}</span>
            </div>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 4 }}>CONDIÇÕES</div>
          <div style={{ marginBottom: 10 }}>
            {patient.conditions.length ? (
              patient.conditions.map((c) => (
                <span className="bg bg-r" style={{ margin: 2 }} key={c}>
                  {c}
                </span>
              ))
            ) : (
              <span style={{ color: 'var(--t3)' }}>Nenhuma</span>
            )}
          </div>
          <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 4, marginTop: 8 }}>RESTRIÇÕES</div>
          <div>
            {patient.restrictions.length ? (
              patient.restrictions.map((r) => (
                <span className="bg bg-y" style={{ margin: 2 }} key={r}>
                  {r}
                </span>
              ))
            ) : (
              <span style={{ color: 'var(--t3)' }}>Nenhuma</span>
            )}
          </div>
        </div>
      </div>
      {patient.notes ? (
        <div className="fg">
          <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 6 }}>NOTAS MÉDICAS</div>
          <div
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--b)',
              borderRadius: 'var(--r8)',
              padding: 12,
              fontSize: 13,
              color: 'var(--t2)',
            }}
          >
            {patient.notes}
          </div>
        </div>
      ) : null}
      {plan ? (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 6 }}>
            PLANO ALIMENTAR — <span className={`bg ${plan.status === 'Aprovado' ? 'bg-g' : 'bg-y'}`}>{plan.status}</span>
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
        </div>
      ) : null}
    </Modal>
  )
}
