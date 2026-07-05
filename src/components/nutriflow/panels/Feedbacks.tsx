import { useEffect, useState } from 'react'
import { listFeedbacks, listPatients } from '../../../lib/api'
import { useAuth } from '../../../lib/authContext'
import { CAN, type Feedback, type Patient } from '../../../lib/types'
import { fmtDate } from '../../../lib/uiHelpers'
import { FeedbackModal } from '../FeedbackModal'

export function Feedbacks() {
  const { profile } = useAuth()
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  async function refresh() {
    const [fb, p] = await Promise.all([listFeedbacks(), listPatients()])
    setFeedbacks(fb)
    setPatients(p.filter((x) => x.status === 'Internado'))
    setLoading(false)
  }

  useEffect(() => {
    refresh()
  }, [])

  if (loading) return <div className="emp">Carregando...</div>

  return (
    <div>
      <div className="ph">
        <div>
          <h2>Feedbacks</h2>
          <p>Aceitação alimentar dos pacientes</p>
        </div>
        <div className="ph-acts">
          {CAN.addFeedback(profile?.role) ? (
            <button className="btn btn-p btn-sm" onClick={() => setOpen(true)}>
              + Registrar Feedback
            </button>
          ) : null}
        </div>
      </div>
      <div className="card">
        {!feedbacks.length ? (
          <div className="emp">
            <div className="ei">💬</div>
            <h3>Nenhum feedback registrado</h3>
            <p>Feedbacks dos pacientes aparecerão aqui.</p>
          </div>
        ) : (
          feedbacks.map((f) => {
            const p = patients.find((pt) => pt.id === f.patient_id)
            const stars = '⭐'.repeat(f.rating) + '☆'.repeat(5 - f.rating)
            return (
              <div className="fb-item" key={f.id}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>
                    {p?.name || '—'} <span style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 400 }}>· {f.meal_type} · {fmtDate(f.date)}</span>
                  </div>
                  <div className="stars" style={{ fontSize: 14 }}>
                    {stars}
                  </div>
                </div>
                {f.notes ? <div style={{ fontSize: 13, color: 'var(--t2)' }}>{f.notes}</div> : null}
              </div>
            )
          })
        )}
      </div>

      <FeedbackModal open={open} patients={patients} onClose={() => setOpen(false)} onSaved={refresh} />
    </div>
  )
}
