import { useEffect, useState } from 'react'
import { Activity, AlertTriangle, BedDouble, Bell, CheckCircle2, ChevronRight, ClipboardList, TrendingUp } from 'lucide-react'
import { PanelSkeleton } from '../PanelSkeleton'
import { InfoTip } from '../InfoTip'
import { listAlerts, listFeedbacks, listPatients, listPlans } from '../../../lib/api'
import { useAuth } from '../../../lib/authContext'
import { useNavigation } from '../../../lib/navigationContext'
import { CAN, type Alert, type Patient } from '../../../lib/types'

export function Dashboard() {
  const { profile } = useAuth()
  const { goTo } = useNavigation()
  const [patients, setPatients] = useState<Patient[]>([])
  const [stats, setStats] = useState({ plans: 0, drafts: 0, highRisk: 0, acceptance: 0 })
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const [p, plans, fb, al] = await Promise.all([
        listPatients(),
        listPlans(),
        listFeedbacks(),
        listAlerts(),
      ])
      const internados = p.filter((x) => x.status === 'Internado')
      const acceptance = fb.length
        ? Math.round((fb.reduce((s, f) => s + f.rating, 0) / (fb.length * 5)) * 100)
        : 0
      setPatients(p)
      setStats({
        plans: plans.filter((pl) => pl.status === 'Aprovado').length,
        drafts: plans.filter((pl) => pl.status === 'Rascunho').length,
        highRisk: internados.filter((x) => x.nutritional_risk === 'Alto').length,
        acceptance,
      })
      setAlerts(al)
      setLoading(false)
    })()
  }, [])

  const internados = patients.filter((p) => p.status === 'Internado')
  const canViewPlanos = CAN.viewPlanos(profile?.role)

  if (loading) return <PanelSkeleton />

  return (
    <div>
      <div className="ph">
        <div>
          <h1>Visão geral</h1>
          <p>Panorama do cuidado nutricional · {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>
      <div className="sg">
        <button type="button" className="sc" onClick={() => goTo('pacientes')}>
          <div className="sc-ico"><BedDouble size={20} /></div>
          <div className="sc-lbl">Pacientes internados</div>
          <div className="sc-val">{internados.length}</div>
          <div className="sc-sub">Sob acompanhamento nutricional</div>
        </button>
        {canViewPlanos ? (
          <button type="button" className="sc" onClick={() => goTo('planos')}>
            <div className="sc-ico"><ClipboardList size={20} /></div>
            <div className="sc-lbl">Planos aprovados</div>
            <div className="sc-val">{stats.plans}</div>
            <div className="sc-sub">{stats.drafts} em rascunho</div>
          </button>
        ) : (
          <div className="sc">
            <div className="sc-ico"><ClipboardList size={20} /></div>
            <div className="sc-lbl">Planos aprovados</div>
            <div className="sc-val">{stats.plans}</div>
            <div className="sc-sub">{stats.drafts} em rascunho</div>
          </div>
        )}
        <button type="button" className="sc" onClick={() => goTo('pacientes')}>
          <div className="sc-ico" style={{ background: 'var(--red-d)', color: 'var(--red)' }}><AlertTriangle size={20} /></div>
          <div className="sc-lbl">Risco nutricional alto</div>
          <div className="sc-val">{stats.highRisk}</div>
          <div className="sc-sub">Requerem atenção prioritária</div>
        </button>
        <div className="sc">
          <div className="sc-ico" style={{ background: 'var(--acc2-d)', color: 'var(--acc2)' }}><TrendingUp size={20} /></div>
          <div className="sc-lbl">
            Taxa de aceitação
            <InfoTip text="Percentual médio de aceitação das refeições avaliadas nos feedbacks registrados pela equipe." />
          </div>
          <div className="sc-val">{stats.acceptance}%</div>
          <div className="sc-sub">Média das refeições avaliadas</div>
        </div>
      </div>
      <div className="g2">
        <div className="card">
          <div className="ch">
            <div>
              <div className="ct"><Bell size={16} /> Alertas recentes</div>
              <div className="cs">Eventos que pedem sua atenção</div>
            </div>
          </div>
          {alerts.length ? (
            alerts.map((a) => (
              <div className="alert-i" key={a.id}>
                <div
                  className="alert-dot"
                  style={{ background: a.type === 'danger' ? 'var(--red)' : a.type === 'warning' ? 'var(--yel)' : 'var(--acc2)' }}
                />
                <div>
                  <div className="alert-txt">{a.message}</div>
                  <div className="alert-time">{new Date(a.created_at).toLocaleString('pt-BR')}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="emp">
              <div className="ei"><CheckCircle2 size={30} /></div>
              <p>Sem alertas no momento</p>
            </div>
          )}
        </div>
        <div className="card">
          <div className="ch">
            <div>
              <div className="ct"><Activity size={16} /> Pacientes internados</div>
              <div className="cs">Clique para abrir o prontuário</div>
            </div>
          </div>
          {internados.length ? (
            internados.map((p) => (
              <button type="button" className="alert-i" key={p.id} onClick={() => goTo('pacientes', p.id)}>
                <div
                  className="alert-dot"
                  style={{ background: p.nutritional_risk === 'Alto' ? 'var(--red)' : p.nutritional_risk === 'Moderado' ? 'var(--yel)' : 'var(--acc)' }}
                />
                <div>
                  <div className="alert-txt">
                    {p.name} · Quarto {p.room}
                  </div>
                  <div className="alert-time">{p.conditions.join(', ') || 'Sem condições registradas'} — dieta {p.diet_type}</div>
                </div>
                <ChevronRight size={16} className="alert-chevron" />
              </button>
            ))
          ) : (
            <div className="emp">
              <div className="ei"><BedDouble size={30} /></div>
              <p>Nenhum paciente internado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
