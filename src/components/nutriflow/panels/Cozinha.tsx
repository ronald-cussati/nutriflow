import { useEffect, useState } from 'react'
import { cycleMealStatus, listDailyMealsForDate, listPatients, todayStr } from '../../../lib/api'
import { toast } from '../../../lib/toast'
import { MEAL_WINDOWS, isInWindow, windowLabel } from '../../../lib/uiHelpers'
import type { DailyMeal, Patient } from '../../../lib/types'

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
    if (next === 'Entregue') {
      toast('ok', 'Refeição entregue', `${meal.type} — ${patientName}`)
    }
    refresh()
  }

  if (loading) return <div className="emp">Carregando...</div>

  return (
    <div>
      <div className="ph">
        <div>
          <h2>Cozinha</h2>
          <p>Controle de preparo e entrega de refeições</p>
        </div>
        <div className="ph-acts">
          <button className="btn btn-s btn-sm" onClick={refresh}>
            🔄 Atualizar
          </button>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <div
          style={{
            background: 'var(--acc-d)',
            border: '1px solid rgba(0,212,170,.2)',
            borderRadius: 'var(--r8)',
            padding: '8px 14px',
            fontSize: 12,
            color: 'var(--acc)',
          }}
        >
          🕐 {now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} ·{' '}
          {now.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
        </div>
        {Object.keys(MEAL_WINDOWS).map((t) => {
          const type = t as keyof typeof MEAL_WINDOWS
          const active = isInWindow(type)
          return (
            <div className={`bg ${active ? 'bg-g' : 'bg-n'}`} style={{ fontSize: 10 }} key={t}>
              {active ? '🟢' : '⚪'} {t} ({windowLabel(type)})
            </div>
          )
        })}
      </div>

      {!patients.length ? (
        <div className="emp">
          <div className="ei">🍽️</div>
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
                    <div className="kp-name">{p.name}</div>
                    <div className="kp-room">Quarto {p.room}</div>
                  </div>
                  <span className="bg bg-n">Sem plano aprovado</span>
                </div>
              </div>
            )
          }
          const visible = pMeals.filter((m) => {
            if (m.status === 'Entregue') return true
            const w = MEAL_WINDOWS[m.type]
            if (!w) return true
            const h = now.getHours() + now.getMinutes() / 60
            return h >= w[0] - 2
          })
          if (!visible.length) return null
          return (
            <div className="kp" key={p.id}>
              <div className="kph">
                <div>
                  <div className="kp-name">{p.name}</div>
                  <div className="kp-room">Quarto {p.room}</div>
                </div>
                <span className="bg bg-n" style={{ fontSize: 10 }}>
                  {pMeals.filter((m) => m.status === 'Entregue').length}/{pMeals.length} entregues
                </span>
              </div>
              <div className="chips">
                {visible.map((m) => {
                  const chipClass = m.status === 'Em Preparo' ? 'prep' : m.status === 'Pronta' ? 'pronto' : m.status === 'Entregue' ? 'entregue' : ''
                  const inWin = isInWindow(m.type)
                  return (
                    <div className={`chip ${chipClass}`} onClick={() => handleCycle(m, p.name)} title={m.items || 'Sem itens definidos'} key={m.id}>
                      <span className="cn">{m.type}</span>
                      <span className="cs">
                        {m.status}
                        {!inWin && m.status === 'Pendente' ? ' ⏰' : ''}
                      </span>
                    </div>
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
