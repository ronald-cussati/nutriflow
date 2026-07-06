import { useEffect, useState } from 'react'
import { ChefHat, CheckCircle2, Clock, Flame, RefreshCw, UtensilsCrossed, XCircle } from 'lucide-react'
import { cycleMealStatus, listDailyMealsForDate, listPatients, setMealStatus, todayStr } from '../../../lib/api'
import { toast } from '../../../lib/toast'
import { MEAL_WINDOWS, isInWindow, windowLabel } from '../../../lib/uiHelpers'
import type { DailyMeal, MealStatus, Patient } from '../../../lib/types'
import { PanelSkeleton } from '../PanelSkeleton'

function statusIcon(status: MealStatus) {
  if (status === 'Em Preparo') return <Flame size={13} />
  if (status === 'Pronta') return <UtensilsCrossed size={13} />
  if (status === 'Entregue') return <CheckCircle2 size={13} />
  if (status === 'Recusada') return <XCircle size={13} />
  return <Clock size={13} />
}

export function Cozinha() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [daily, setDaily] = useState<DailyMeal[]>([])
  const [now, setNow] = useState(new Date())
  const [loading, setLoading] = useState(true)

  async function refresh() {
    const [p, d] = await Promise.all([listPatients(), listDailyMealsForDate(todayStr())])
    setPatients(p.filter((x) => x.status === 'Internado'))
    setDaily(d)
    setLoading(false)
  }

  useEffect(() => {
    refresh()
    const t1 = setInterval(() => setNow(new Date()), 30000)
    const t2 = setInterval(refresh, 60000)
    return () => {
      clearInterval(t1)
      clearInterval(t2)
    }
  }, [])

  async function handleCycle(meal: DailyMeal, patientName: string) {
    const next = await cycleMealStatus(meal)
    if (next === 'Entregue') toast('ok', 'Refeição entregue', `${meal.type} — ${patientName}`)
    if (next === 'Em Preparo') toast('in', 'Em preparo', `${meal.type} — ${patientName}`)
    refresh()
  }

  async function handleRefuse(meal: DailyMeal, patientName: string) {
    await setMealStatus(meal.id, 'Recusada')
    toast('wa', 'Refeição recusada', `${meal.type} — ${patientName}`)
    refresh()
  }

  if (loading) return <PanelSkeleton />

  return (
    <div>
      <div className="ph">
        <div>
          <h1>Cozinha</h1>
          <p>Preparo e entrega das refeições em tempo real</p>
        </div>
        <div className="ph-acts">
          <button className="btn btn-s btn-sm" onClick={refresh}>
            <RefreshCw size={14} />
            Atualizar
          </button>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        <div className="bg bg-g" style={{ padding: '8px 13px' }}>
          <Clock size={13} /> {now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} ·{' '}
          {now.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
        </div>
        {Object.keys(MEAL_WINDOWS).map((t) => {
          const type = t as keyof typeof MEAL_WINDOWS
          const active = isInWindow(type)
          return (
            <div className={`bg ${active ? 'bg-g' : 'bg-n'}`} key={t}>
              {t} ({windowLabel(type)})
            </div>
          )
        })}
      </div>

      {!patients.length ? (
        <div className="emp">
          <div className="ei"><ChefHat size={30} /></div>
          <h3>Nenhum paciente internado</h3>
        </div>
      ) : (
        patients.map((p) => {
          const pMeals = daily.filter((d) => d.patient_id === p.id)
          if (!pMeals.length) {
            return (
              <div className="kp" key={p.id}>
                <div className="kph">
                  <div>
                    <div className="kp-name"><UtensilsCrossed size={15} /> {p.name}</div>
                    <div className="kp-room">Quarto {p.room}</div>
                  </div>
                  <span className="bg bg-n">Sem plano aprovado</span>
                </div>
              </div>
            )
          }
          const visible = pMeals.filter((m) => {
            if (m.status === 'Entregue' || m.status === 'Recusada') return true
            const w = MEAL_WINDOWS[m.type]
            if (!w) return true
            const h = now.getHours() + now.getMinutes() / 60
            return h >= w[0] - 2
          })
          if (!visible.length) return null
          const done = pMeals.filter((m) => m.status === 'Entregue').length
          return (
            <div className="kp" key={p.id}>
              <div className="kph">
                <div>
                  <div className="kp-name"><UtensilsCrossed size={15} /> {p.name}</div>
                  <div className="kp-room">Quarto {p.room} · dieta {p.diet_type}</div>
                </div>
                <span className="bg bg-n">
                  {done}/{pMeals.length} entregues
                </span>
              </div>
              <div className="chips">
                {visible.map((m) => {
                  const chipClass =
                    m.status === 'Em Preparo' ? 'prep'
                    : m.status === 'Pronta' ? 'pronto'
                    : m.status === 'Entregue' ? 'entregue'
                    : m.status === 'Recusada' ? 'recusada'
                    : ''
                  return (
                    <button
                      type="button"
                      className={`chip ${chipClass}`}
                      onClick={() => handleCycle(m, p.name)}
                      onContextMenu={(e) => {
                        e.preventDefault()
                        handleRefuse(m, p.name)
                      }}
                      title={`${m.items || 'Sem itens definidos'}\n(clique: avançar status · clique direito: recusar)`}
                      aria-label={`${m.type}: ${m.status}. Ativar para avançar o status.`}
                      key={m.id}
                    >
                      <span className="cn">{m.type}</span>
                      <span className="cs">
                        {statusIcon(m.status)}
                        {m.status}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
