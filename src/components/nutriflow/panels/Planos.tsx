import { useEffect, useState } from 'react'
import { approvePlan, draftPlan, listPatients, listPlans } from '../../../lib/api'
import { toast } from '../../../lib/toast'
import { useAuth } from '../../../lib/authContext'
import { CAN, MEAL_KEYS, MEAL_TYPES, type MealPlan, type Patient } from '../../../lib/types'
import { initials } from '../../../lib/uiHelpers'
import { PlanModal } from '../PlanModal'

export function Planos() {
  const { profile } = useAuth()
  const role = profile?.role
  const [patients, setPatients] = useState<Patient[]>([])
  const [plans, setPlans] = useState<MealPlan[]>([])
  const [filter, setFilter] = useState('')
  const [editing, setEditing] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)

  async function refresh() {
    const [p, pl] = await Promise.all([listPatients(), listPlans()])
    setPatients(p.filter((x) => x.status === 'Internado'))
    setPlans(pl)
    setLoading(false)
  }

  useEffect(() => {
    refresh()
  }, [])

  async function handleApprove(plan: MealPlan, patient: Patient) {
    const hasMeals = MEAL_KEYS.some((k) => plan.meals[k])
    if (!hasMeals) {
      toast('er', 'Plano vazio', 'Defina ao menos uma refeição antes de aprovar')
      return
    }
    await approvePlan(plan, patient)
    toast('ok', 'Plano aprovado!', `Refeições geradas para ${patient.name}`)
    refresh()
  }

  async function handleDraft(planId: string) {
    await draftPlan(planId)
    toast('wa', 'Plano em rascunho', 'Edite e aprove novamente')
    refresh()
  }

  const filtered = patients.filter((p) => {
    const plan = plans.find((pl) => pl.patient_id === p.id)
    if (filter && plan?.status !== filter) return false
    return true
  })

  if (loading) return <div className="emp">Carregando...</div>

  return (
    <div>
      <div className="ph">
        <div>
          <h2>Planos Alimentares</h2>
          <p>Gerenciar e aprovar planos nutricionais</p>
        </div>
        <div className="ph-acts">
          <div className="filters">
            <select className="fc" style={{ width: 140 }} value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="">Todos status</option>
              <option value="Rascunho">Rascunho</option>
              <option value="Aprovado">Aprovado</option>
            </select>
          </div>
        </div>
      </div>
      {!filtered.length ? (
        <div className="emp">
          <div className="ei">📋</div>
          <h3>Nenhum plano encontrado</h3>
        </div>
      ) : (
        filtered.map((p) => {
          const plan = plans.find((pl) => pl.patient_id === p.id)
          if (!plan) return null
          const coverage = MEAL_KEYS.filter((k) => plan.meals[k]).length
          return (
            <div className="card" key={p.id}>
              <div className="ch">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="pav" style={{ background: 'var(--acc-d)', color: 'var(--acc)', width: 38, height: 38, fontSize: 14 }}>
                    {initials(p.name)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>
                      Quarto {p.room} · {coverage}/6 refeições definidas
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className={`bg ${plan.status === 'Aprovado' ? 'bg-g' : 'bg-y'}`}>{plan.status}</span>
                  {CAN.editPlan(role) ? (
                    <button className="btn btn-s btn-sm" onClick={() => setEditing(p)}>
                      ✏️ Editar
                    </button>
                  ) : null}
                  {CAN.approvePlan(role) && plan.status === 'Rascunho' ? (
                    <button className="btn btn-p btn-sm" onClick={() => handleApprove(plan, p)}>
                      ✅ Aprovar
                    </button>
                  ) : null}
                  {CAN.approvePlan(role) && plan.status === 'Aprovado' ? (
                    <button className="btn btn-w btn-sm" onClick={() => handleDraft(plan.id)}>
                      🔄 Rascunho
                    </button>
                  ) : null}
                </div>
              </div>
              <div className="mp-grid">
                {MEAL_TYPES.map((label, i) => (
                  <div className="mp-i" key={label}>
                    <div className="mp-lbl">{label}</div>
                    <div className="mp-txt">
                      {plan.meals[MEAL_KEYS[i]] || <span style={{ color: 'var(--t3)', fontStyle: 'italic' }}>Não definido</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })
      )}

      <PlanModal
        open={!!editing}
        patient={editing}
        plan={editing ? plans.find((pl) => pl.patient_id === editing.id) ?? null : null}
        canEdit={CAN.editPlan(role)}
        onClose={() => setEditing(null)}
        onSaved={refresh}
      />
    </div>
  )
}
