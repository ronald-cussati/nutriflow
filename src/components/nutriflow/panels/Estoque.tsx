import { useEffect, useState } from 'react'
import { CalendarClock, Package, Pencil, Plus, Trash2 } from 'lucide-react'
import { listStock, removeStock } from '../../../lib/api'
import { toast } from '../../../lib/toast'
import { fmtDate } from '../../../lib/uiHelpers'
import type { StockItem } from '../../../lib/types'
import { StockModal } from '../StockModal'

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

  if (loading) return <div className="emp">Carregando...</div>

  const today = new Date()

  return (
    <div>
      <div className="ph">
        <div>
          <h2>Estoque</h2>
          <p>Ingredientes disponíveis para o preparo das refeições</p>
        </div>
        <div className="ph-acts">
          <button className="btn btn-p btn-sm" onClick={() => setEditing(null)}>
            <Plus size={15} />
            Adicionar ingrediente
          </button>
        </div>
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {!stock.length ? (
          <div className="emp">
            <div className="ei"><Package size={30} /></div>
            <h3>Estoque vazio</h3>
            <p>Adicione ingredientes ao estoque do mês.</p>
          </div>
        ) : (
          stock.map((s) => {
            const exp = s.expiry_date ? new Date(s.expiry_date) : null
            const expiring = exp ? exp.getTime() - today.getTime() < 7 * 24 * 60 * 60 * 1000 : false
            const expired = exp ? exp.getTime() < today.getTime() : false
            return (
              <div className="si" key={s.id}>
                <div className="si-name">
                  <span className="si-ico"><Package size={16} /></span>
                  {s.name}
                </div>
                <div className="si-qty">
                  <span className={`bg ${expired ? 'bg-r' : expiring ? 'bg-y' : 'bg-g'}`}>
                    {s.quantity} {s.unit}
                  </span>
                </div>
                <div className="si-exp" style={{ color: expired ? 'var(--red)' : expiring ? 'var(--yel)' : 'var(--t3)' }}>
                  <CalendarClock size={13} />
                  {s.expiry_date ? fmtDate(s.expiry_date) : '—'}
                  {expired ? ' · vencido' : expiring ? ' · a vencer' : ''}
                </div>
                <div className="si-acts">
                  <button className="btn btn-b btn-sm icon-btn" onClick={() => setEditing(s)} aria-label="Editar">
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
