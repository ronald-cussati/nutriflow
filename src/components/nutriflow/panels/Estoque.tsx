import { useEffect, useState } from 'react'
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
          <p>Ingredientes disponíveis no mês</p>
        </div>
        <div className="ph-acts">
          <button className="btn btn-p btn-sm" onClick={() => setEditing(null)}>
            + Adicionar Ingrediente
          </button>
        </div>
      </div>
      <div className="card">
        <div style={{ background: 'var(--bg)', border: '1px solid var(--b)', borderRadius: 'var(--r8)', overflow: 'hidden' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 13px',
              borderBottom: '1px solid var(--b)',
              background: 'rgba(255,255,255,.02)',
            }}
          >
            <div style={{ flex: 1, fontSize: 11, fontWeight: 600, color: 'var(--t3)', textTransform: 'uppercase' }}>Ingrediente</div>
            <div style={{ minWidth: 90, fontSize: 11, fontWeight: 600, color: 'var(--t3)', textTransform: 'uppercase' }}>Quantidade</div>
            <div style={{ minWidth: 95, fontSize: 11, fontWeight: 600, color: 'var(--t3)', textTransform: 'uppercase' }}>Validade</div>
            <div style={{ minWidth: 80 }} />
          </div>
          {!stock.length ? (
            <div className="emp">
              <div className="ei">📦</div>
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
                  <div className="si-name">{s.name}</div>
                  <div className="si-qty">
                    <span className={`bg ${expired ? 'bg-r' : expiring ? 'bg-y' : 'bg-g'}`}>
                      {s.quantity} {s.unit}
                    </span>
                  </div>
                  <div className="si-exp" style={{ color: expired ? 'var(--red)' : expiring ? 'var(--yel)' : 'var(--t3)' }}>
                    {s.expiry_date ? fmtDate(s.expiry_date) : '—'}
                  </div>
                  <div className="si-acts">
                    <button className="btn btn-b btn-sm" onClick={() => setEditing(s)}>
                      ✏️
                    </button>
                    <button className="btn btn-d btn-sm" onClick={() => handleRemove(s)}>
                      🗑️
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      <StockModal open={editing !== undefined} item={editing ?? null} onClose={() => setEditing(undefined)} onSaved={refresh} />
    </div>
  )
}
