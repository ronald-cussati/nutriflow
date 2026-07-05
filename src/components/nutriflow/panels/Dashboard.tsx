import { useEffect, useState } from 'react'
import { listAlerts, listDailyMealsForDate, listPatients, listPlans, listStock, todayStr } from '../../../lib/api'
import type { Alert, Patient } from '../../../lib/types'

export function Dashboard() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [stats, setStats] = useState({ plans: 0, drafts: 0, meals: 0, delivered: 0, stock: 0 })
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const [p, plans, daily, stock, al] = await Promise.all([
        listPatients(),
        listPlans(),
        listDailyMealsForDate(todayStr()),
        listStock(),
        listAlerts(),
      ])
      setPatients(p)
      setStats({
        plans: plans.filter((pl) => pl.status === 'Aprovado').length,
        drafts: plans.filter((pl) => pl.status === 'Rascunho').length,
        meals: daily.length,
        delivered: daily.filter((d) => d.status === 'Entregue').length,
        stock: stock.length,
      })
      setAlerts(al)
      setLoading(false)
    })()
  }, [])

  const internados = patients.filter((p) => p.status === 'Internado')

  if (loading) return <div className="emp">Carregando...</div>

  return (
    <div>
      <div className="sg">
        <div className="sc" data-icon="🏥">
          <div className="sc-lbl">Pacientes Internados</div>
          <div className="sc-val">{internados.length}</div>
          <div className="sc-sub">Total no hospital</div>
        </div>
        <div className="sc" data-icon="📋">
          <div className="sc-lbl">Planos Aprovados</div>
          <div className="sc-val">{stats.plans}</div>
          <div className="sc-sub">{stats.drafts} aguardando</div>
        </div>
        <div className="sc" data-icon="🍽️">
          <div className="sc-lbl">Refeições Hoje</div>
          <div className="sc-val">{stats.meals}</div>
          <div className="sc-sub">{stats.delivered} entregues</div>
        </div>
        <div className="sc" data-icon="📦">
          <div className="sc-lbl">Itens no Estoque</div>
          <div className="sc-val">{stats.stock}</div>
          <div className="sc-sub">Mês atual</div>
        </div>
      </div>
      <div className="g2">
        <div className="card">
          <div className="ch">
            <div>
              <div className="ct">⚠️ Alertas</div>
              <div className="cs">Eventos recentes</div>
            </div>
          </div>
          {alerts.length ? (
            alerts.map((a) => (
              <div className="alert-i" key={a.id}>
                <div
                  className="alert-dot"
                  style={{ background: a.type === 'warning' ? 'var(--yel)' : 'var(--acc2)' }}
                />
                <div>
                  <div className="alert-txt">{a.message}</div>
                  <div className="alert-time">{new Date(a.created_at).toLocaleString('pt-BR')}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="emp">
              <div className="ei">✅</div>
              <p>Sem alertas no momento</p>
            </div>
          )}
        </div>
        <div className="card">
          <div className="ch">
            <div>
              <div className="ct">📋 Pacientes Internados</div>
              <div className="cs">Resumo rápido</div>
            </div>
          </div>
          {internados.length ? (
            internados.map((p) => (
              <div className="alert-i" key={p.id}>
                <div className="alert-dot" style={{ background: 'var(--acc)' }} />
                <div>
                  <div className="alert-txt">
                    {p.name} — Quarto {p.room}
                  </div>
                  <div className="alert-time">{p.conditions.join(', ') || 'Sem condições registradas'}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="emp">
              <div className="ei">🏥</div>
              <p>Nenhum paciente internado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
