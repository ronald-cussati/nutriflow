import { useEffect, useState } from 'react'
import { BedDouble, ClipboardList, MessageSquare } from 'lucide-react'
import { getMyPatient, getPlanForPatient, listDailyMealsForDate, todayStr } from '../../../lib/api'
import { useAuth } from '../../../lib/authContext'
import { MEAL_KEYS, MEAL_TYPES, type DailyMeal, type MealPlan, type Patient } from '../../../lib/types'
import { FeedbackModal } from '../FeedbackModal'
import { PanelSkeleton } from '../PanelSkeleton'

export function MeuPlano() {
  const { session } = useAuth()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [plan, setPlan] = useState<MealPlan | null>(null)
  const [daily, setDaily] = useState<DailyMeal[]>([])
  const [loading, setLoading] = useState(true)
  const [fbOpen, setFbOpen] = useState(false)

  async function refresh() {
    if (!session) return
    const p = await getMyPatient(session.user.id)
    setPatient(p)
    if (p) {
      const [pl, d] = await Promise.all([getPlanForPatient(p.id), listDailyMealsForDate(todayStr())])
      setPlan(pl)
      setDaily(d.filter((m) => m.patient_id === p.id))
    }
    setLoading(false)
  }

  useEffect(() => {
    refresh()
  }, [session])

  if (loading) return <PanelSkeleton />

  if (!patient) {
    return (
      <div className="emp">
        <div className="ei"><BedDouble size={30} /></div>
        <h3>Nenhum registro de paciente vinculado</h3>
        <p>Peça para a equipe do hospital vincular seu login ao seu prontuário.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="ph">
        <div>
          <h2>Meu Plano Alimentar</h2>
          <p>
            Quarto {patient.room} · {patient.status}
          </p>
        </div>
        <div className="ph-acts">
          <button className="btn btn-p btn-sm" onClick={() => setFbOpen(true)}>
            <MessageSquare size={15} />
            Dar feedback
          </button>
        </div>
      </div>

      {!plan || plan.status !== 'Aprovado' ? (
        <div className="emp">
          <div className="ei"><ClipboardList size={30} /></div>
          <h3>Seu plano ainda não foi aprovado</h3>
          <p>Assim que a nutricionista aprovar, ele aparece aqui.</p>
        </div>
      ) : (
        <div className="card">
          <div className="ch">
            <div>
              <div className="ct">Plano do dia</div>
              <div className="cs">Aprovado pela equipe de nutrição</div>
            </div>
          </div>
          <div className="mp-grid">
            {MEAL_TYPES.map((label, i) => {
              const key = MEAL_KEYS[i]
              const dm = daily.find((d) => d.type === label)
              return (
                <div className="mp-i" key={label}>
                  <div className="mp-lbl">
                    {label} {dm ? <span className="bg bg-n" style={{ marginLeft: 6, fontSize: 9 }}>{dm.status}</span> : null}
                  </div>
                  <div className="mp-txt">{plan.meals[key] || <span style={{ color: 'var(--t3)' }}>Não definido</span>}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <FeedbackModal
        open={fbOpen}
        patients={[patient]}
        fixedPatientId={patient.id}
        onClose={() => setFbOpen(false)}
        onSaved={refresh}
      />
    </div>
  )
}
