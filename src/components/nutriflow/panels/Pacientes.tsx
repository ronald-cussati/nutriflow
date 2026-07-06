import { useEffect, useState } from 'react'
import { BedDouble, ChevronRight, ClipboardList, Eye, LogOut, Lock, Pencil, Search, UserPlus } from 'lucide-react'
import { dischargePatient, listPatients, listPlans } from '../../../lib/api'
import { toast } from '../../../lib/toast'
import { useAuth } from '../../../lib/authContext'
import { useNavigation } from '../../../lib/navigationContext'
import { CAN, type MealPlan, type Patient } from '../../../lib/types'
import { initials, riskBadgeClass } from '../../../lib/uiHelpers'
import { PatientModal } from '../PatientModal'
import { PlanModal } from '../PlanModal'
import { PatientDetailModal } from '../PatientDetailModal'
import { PanelSkeleton } from '../PanelSkeleton'

export function Pacientes() {
  const { profile } = useAuth()
  const { focusPatientId, clearFocus } = useNavigation()
  const role = profile?.role
  const [patients, setPatients] = useState<Patient[]>([])
  const [plans, setPlans] = useState<MealPlan[]>([])
  const [tab, setTab] = useState<'internados' | 'alta'>('internados')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const [editing, setEditing] = useState<Patient | null | undefined>(undefined)
  const [planFor, setPlanFor] = useState<Patient | null>(null)
  const [detailFor, setDetailFor] = useState<Patient | null>(null)

  async function refresh() {
    const [p, pl] = await Promise.all([listPatients(), listPlans()])
    setPatients(p)
    setPlans(pl)
    setLoading(false)
  }

  useEffect(() => {
    refresh()
  }, [])

  // Chegou aqui a partir de outro painel (ex.: Dashboard) apontando um paciente — abre o prontuário direto.
  useEffect(() => {
    if (!focusPatientId || !patients.length) return
    const target = patients.find((p) => p.id === focusPatientId)
    if (target) {
      setTab(target.status === 'Internado' ? 'internados' : 'alta')
      setDetailFor(target)
    }
    clearFocus()
  }, [focusPatientId, patients])

  async function handleDischarge(p: Patient) {
    if (!confirm('Confirmar alta médica deste paciente?')) return
    await dischargePatient(p)
    toast('ok', 'Alta concedida', `${p.name} recebeu alta`)
    refresh()
  }

  const filtered = patients.filter((p) => {
    const match = p.name.toLowerCase().includes(search.toLowerCase()) || p.room.toLowerCase().includes(search.toLowerCase())
    if (tab === 'internados') return p.status === 'Internado' && match
    return p.status === 'Alta' && match
  })

  if (loading) return <PanelSkeleton />

  return (
    <div>
      <div className="ph">
        <div>
          <h1>Pacientes</h1>
          <p>Prontuário clínico e acompanhamento nutricional</p>
        </div>
        <div className="ph-acts">
          <div className="search-wrap">
            <Search size={15} />
            <input className="fc" style={{ width: 220 }} placeholder="Buscar por nome ou quarto..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {CAN.createPatient(role) ? (
            <button className="btn btn-p btn-sm" onClick={() => setEditing(null)}>
              <UserPlus size={15} />
              Novo paciente
            </button>
          ) : (
            <span className="bg bg-n" title="Cadastro e edição de pacientes são feitos pela equipe médica">
              <Lock size={12} />
              Somente consulta
            </span>
          )}
        </div>
      </div>
      <div className="tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'internados'}
          className={`tab ${tab === 'internados' ? 'on' : ''}`}
          onClick={() => setTab('internados')}
        >
          Internados
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'alta'}
          className={`tab ${tab === 'alta' ? 'on' : ''}`}
          onClick={() => setTab('alta')}
        >
          Histórico / Alta
        </button>
      </div>
      {!filtered.length ? (
        <div className="emp">
          <div className="ei"><BedDouble size={30} /></div>
          <h3>Nenhum paciente {tab === 'internados' ? 'internado' : 'com alta'}</h3>
          <p>Nenhum registro encontrado com os filtros atuais.</p>
        </div>
      ) : (
        filtered.map((p) => {
          const plan = plans.find((pl) => pl.patient_id === p.id)
          const status = plan?.status ?? '—'
          return (
            <div className="pc" key={p.id}>
              <button type="button" className="pc-main" onClick={() => setDetailFor(p)}>
                <div className="pav" style={{ background: 'var(--acc-d)', color: 'var(--acc)' }}>
                  {initials(p.name)}
                </div>
                <div className="pi">
                  <div className="pn">{p.name}</div>
                  <div className="pm">
                    Quarto {p.room} · {p.age} anos · {p.gender || '—'}
                  </div>
                  <div className="pm" style={{ marginTop: 6 }}>
                    <span className={`bg ${riskBadgeClass(p.nutritional_risk)}`}>Risco {p.nutritional_risk.toLowerCase()}</span>
                    <span className="bg bg-n">Dieta {p.diet_type}</span>
                    {p.conditions.slice(0, 2).map((c) => (
                      <span className="bg bg-n" key={c}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
                <ChevronRight size={16} className="pc-chevron" />
              </button>
              <div className="pc-status">
                <span className={`bg ${status === 'Aprovado' ? 'bg-g' : status === 'Rascunho' ? 'bg-y' : 'bg-n'}`}>{status}</span>
                <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 6 }}>{p.status === 'Alta' ? 'Alta médica' : 'Internado'}</div>
              </div>
              <div className="pa">
                <button className="btn btn-b btn-sm" onClick={() => setDetailFor(p)}>
                  <Eye size={14} />
                  Ver
                </button>
                {CAN.editPatient(role) && p.status === 'Internado' ? (
                  <button className="btn btn-s btn-sm" onClick={() => setEditing(p)}>
                    <Pencil size={14} />
                    Editar
                  </button>
                ) : null}
                {CAN.giveDischarge(role) && p.status === 'Internado' ? (
                  <button className="btn btn-w btn-sm" onClick={() => handleDischarge(p)}>
                    <LogOut size={14} />
                    Alta
                  </button>
                ) : null}
                {CAN.editPlan(role) && p.status === 'Internado' ? (
                  <button className="btn btn-p btn-sm" onClick={() => setPlanFor(p)}>
                    <ClipboardList size={14} />
                    Plano
                  </button>
                ) : null}
              </div>
            </div>
          )
        })
      )}

      <PatientModal open={editing !== undefined} patient={editing ?? null} onClose={() => setEditing(undefined)} onSaved={refresh} />
      <PlanModal
        open={!!planFor}
        patient={planFor}
        plan={planFor ? plans.find((pl) => pl.patient_id === planFor.id) ?? null : null}
        canEdit={CAN.editPlan(role)}
        onClose={() => setPlanFor(null)}
        onSaved={refresh}
      />
      <PatientDetailModal
        open={!!detailFor}
        patient={detailFor}
        plan={detailFor ? plans.find((pl) => pl.patient_id === detailFor.id) ?? null : null}
        onClose={() => setDetailFor(null)}
      />
    </div>
  )
}
