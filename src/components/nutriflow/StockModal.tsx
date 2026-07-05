import { useEffect, useState } from 'react'
import { Modal } from './Modal'
import { saveStock } from '../../lib/api'
import { toast } from '../../lib/toast'
import type { StockItem } from '../../lib/types'

export function StockModal({
  open,
  item,
  onClose,
  onSaved,
}: {
  open: boolean
  item: StockItem | null
  onClose: () => void
  onSaved: () => void
}) {
  const [name, setName] = useState('')
  const [qty, setQty] = useState('')
  const [unit, setUnit] = useState('kg')
  const [exp, setExp] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setName(item?.name ?? '')
    setQty(item ? String(item.quantity) : '')
    setUnit(item?.unit ?? 'kg')
    setExp(item?.expiry_date ?? '')
  }, [open, item])

  async function handleSave() {
    if (!name.trim() || !qty) {
      toast('er', 'Campos obrigatórios', 'Preencha nome e quantidade')
      return
    }
    setSaving(true)
    try {
      await saveStock(item?.id ?? null, {
        name: name.trim(),
        quantity: Number(qty),
        unit,
        expiry_date: exp || null,
        month: new Date().toISOString().slice(0, 7),
      })
      toast('ok', 'Estoque atualizado')
      onSaved()
      onClose()
    } catch (e) {
      toast('er', 'Erro ao salvar', (e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={item ? 'Editar Ingrediente' : 'Novo Ingrediente'}>
      <div className="fg">
        <label>Nome do ingrediente *</label>
        <input className="fc" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="fr">
        <div className="fg">
          <label>Quantidade *</label>
          <input className="fc" type="number" min={0} step="0.01" value={qty} onChange={(e) => setQty(e.target.value)} />
        </div>
        <div className="fg">
          <label>Unidade *</label>
          <select className="fc" value={unit} onChange={(e) => setUnit(e.target.value)}>
            <option>kg</option>
            <option>g</option>
            <option>L</option>
            <option>ml</option>
            <option>unidade</option>
          </select>
        </div>
      </div>
      <div className="fg">
        <label>Data de validade</label>
        <input className="fc" type="date" value={exp} onChange={(e) => setExp(e.target.value)} />
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
        <button className="btn btn-s" onClick={onClose}>
          Cancelar
        </button>
        <button className="btn btn-p" onClick={handleSave} disabled={saving}>
          Salvar
        </button>
      </div>
    </Modal>
  )
}
