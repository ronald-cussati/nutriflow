import { useEffect, useState } from 'react'
import { MessageSquare, Plus, Star } from 'lucide-react'
import { listFeedbacks, listPatients } from '../../../lib/api'
import { useAuth } from '../../../lib/authContext'
import { CAN, type Feedback, type Patient } from '../../../lib/types'
import { fmtDate, initials } from '../../../lib/uiHelpers'
import { FeedbackModal } from '../FeedbackModal'

function Stars({ rating }: { rating: number }) {
  return (
    <span className="stars" title={`${rating} de 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={15} fill={n <= rating ? 'currentColor' : 'none'} stroke={n <= rating ? 'currentColor' : 'var(--t3)'} />
      ))}
    </span>
  )
}

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

  const aceitas = feedbacks.filter((f) => f.rating >= 4).length
  const parciais = feedbacks.filter((f) => f.rating === 3 || f.rating === 2).length
  const recusadas = feedbacks.filter((f) => f.rating <= 1).length

  return (
    <div>
      <div className="ph">
        <div>
          <h2>Feedbacks</h2>
          <p>Acompanhe a aceitação alimentar dos pacientes</p>
        </div>
        <div className="ph-acts">
          {CAN.addFeedback(profile?.role) ? (
            <button className="btn btn-p btn-sm" onClick={() => setOpen(true)}>
              <Plus size={15} />
              Registrar feedback
            </button>
          ) : null}
        </div>
      </div>

      {feedbacks.length ? (
        <div className="fb-stat">
          <div className="sc">
            <div className="sc-val" style={{ color: 'var(--acc)' }}>{aceitas}</div>
            <div className="sc-sub">Bem aceitas</div>
          </div>
          <div className="sc">
            <div className="sc-val" style={{ color: 'var(--yel)' }}>{parciais}</div>
            <div className="sc-sub">Aceitação parcial</div>
          </div>
          <div className="sc">
            <div className="sc-val" style={{ color: 'var(--red)' }}>{recusadas}</div>
            <div className="sc-sub">Recusadas</div>
          </div>
        </div>
      ) : null}

      <div className="card" style={{ padding: feedbacks.length ? 0 : 20, overflow: 'hidden' }}>
        {!feedbacks.length ? (
          <div className="emp">
            <div className="ei"><MessageSquare size={30} /></div>
            <h3>Nenhum feedback registrado</h3>
            <p>Os registros de aceitação alimentar aparecerão aqui.</p>
          </div>
        ) : (
          feedbacks.map((f) => {
            const p = patients.find((pt) => pt.id === f.patient_id)
            return (
              <div className="fb-item" key={f.id}>
                <div className="fb-av" style={{ background: 'var(--acc-d)', color: 'var(--acc)' }}>
                  {initials(p?.name || '—')}
                </div>
                <div className="fb-body">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 5 }}>
                    <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--t1)' }}>
                      {p?.name || '—'}{' '}
                      <span style={{ fontSize: 11.5, color: 'var(--t3)', fontWeight: 400 }}>· {f.meal_type} · {fmtDate(f.date)}</span>
                    </div>
                    <Stars rating={f.rating} />
                  </div>
                  {f.notes ? <div style={{ fontSize: 13, color: 'var(--t2)' }}>{f.notes}</div> : null}
                </div>
              </div>
            )
          })
        )}
      </div>

      <FeedbackModal open={open} patients={patients} onClose={() => setOpen(false)} onSaved={refresh} />
    </div>
  )
}
