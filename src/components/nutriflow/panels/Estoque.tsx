import { useEffect, useState } from 'react'
import { CalendarClock, Package, Pencil, Plus, Trash2 } from 'lucide-react'
import { listStock, removeStock } from '../../../lib/api'
import { toast } from '../../../lib/toast'
import { fmtDate } from '../../../lib/uiHelpers'
import type { StockItem } from '../../../lib/types'
import { StockModal } from '../StockModal'
import { PanelSkeleton } from '../PanelSkeleton'

const WEEK = 7 * 24 * 60 * 60 * 1000

function statusOf(item: StockItem, now: number): 'ok' | 'soon' | 'expired' {
  if (!item.expiry_date) return 'ok'
  const t = new Date(item.expiry_date).getTime()
  if (t < now) return 'expired'
  if (t - now < WEEK) return 'soon'
  return 'ok'
}

export function Estoque() {
  const [stock, setStock] = useState<StockItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<StockItem | null | undefined>(undefined)

  async function refresh() {
    setStock(await listStock())
    setLoading(false)
  }

  useEffect(() => {
    refresh()
  }, [])

  async function handleRemove(item: StockItem) {
    if (!confirm(`Remover "${item.name}" do estoque?`)) return
    await removeStock(item.id)
    toast('ok', 'Ingrediente removido')
    refresh()
  }

  if (loading) return <PanelSkeleton />

  const now = Date.now()
  const soon = stock.filter((s) => statusOf(s, now) === 'soon').length
  const expired = stock.filter((s) => statusOf(s, now) === 'expired').length
  const dotColor = { ok: 'var(--acc)', soon: 'var(--yel)', expired: 'var(--red)' }

  return (
    <div>
      <div className="ph">
        <div>
          <h2>Estoque</h2>
          <p>Ingredientes que abastecem a geração de dietas pela IA</p>
        </div>
        <div className="ph-acts">
          <button className="btn btn-p btn-sm" onClick={() => setEditing(null)}>
            <Plus size={15} />
            Adicionar
          </button>
        </div>
      </div>

      <div className="stk-summary">
        <div className="stk-stat">
          <span className="stk-num">{stock.length}</span>
          <span className="stk-lbl">Ingredientes</span>
        </div>
        <div className="stk-stat">
          <span className="stk-num" style={{ color: soon ? 'var(--yel)' : 'var(--t3)' }}>{soon}</span>
          <span className="stk-lbl">A vencer</span>
        </div>
        <div className="stk-stat">
          <span className="stk-num" style={{ color: expired ? 'var(--red)' : 'var(--t3)' }}>{expired}</span>
          <span className="stk-lbl">Vencidos</span>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {!stock.length ? (
          <div className="emp">
            <div className="ei"><Package size={30} /></div>
            <h3>Estoque vazio</h3>
            <p>Adicione ingredientes para a IA montar os cardápios.</p>
          </div>
        ) : (
          stock.map((s) => {
            const st = statusOf(s, now)
            return (
              <div className="si" key={s.id}>
                <span className="si-dot" style={{ background: dotColor[st] }} />
                <div className="si-name">{s.name}</div>
                <div className="si-qty">
                  {s.quantity} {s.unit}
                </div>
                <div className="si-exp" style={{ color: st === 'expired' ? 'var(--red)' : st === 'soon' ? 'var(--yel)' : 'var(--t3)' }}>
                  <CalendarClock size={13} />
                  {s.expiry_date ? fmtDate(s.expiry_date) : 'sem validade'}
                </div>
                <div className="si-acts">
                  <button className="btn btn-s btn-sm icon-btn" onClick={() => setEditing(s)} aria-label="Editar">
                    <Pencil size={14} />
                  </button>
                  <button className="btn btn-d btn-sm icon-btn" onClick={() => handleRemove(s)} aria-label="Remover">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      <StockModal open={editing !== undefined} item={editing ?? null} onClose={() => setEditing(undefined)} onSaved={refresh} />
    </div>
  )
}
