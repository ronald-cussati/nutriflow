import { useEffect, useState } from 'react'
import { Modal } from './Modal'
import { savePlanMeals } from '../../lib/api'
import { generateMealPlan } from '../../server/mealPlan'
import { toast } from '../../lib/toast'
import { listStock } from '../../lib/api'
import { MEAL_KEYS, MEAL_TYPES, type MealPlan, type Meals, type Patient } from '../../lib/types'

export function PlanModal({
  open,
  patient,
  plan,
  canEdit,
  onClose,
  onSaved,
}: {
  open: boolean
  patient: Patient | null
  plan: MealPlan | null
  canEdit: boolean
  onClose: () => void
  onSaved: () => void
}) {
  const [meals, setMeals] = useState<Meals | null>(null)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    if (!open) return
    setMeals(plan?.meals ?? null)
  }, [open, plan])

  if (!patient || !plan || !meals) {
    return open ? (
      <Modal open={open} onClose={onClose} title="Plano Alimentar" large>
        <div className="emp">Carregando...</div>
      </Modal>
    ) : null
  }

  async function handleGenerate() {
    if (!patient) return
    setGenerating(true)
    try {
      const stockItems = await listStock()
      const stockText = stockItems.map((s) => `${s.name} (${s.quantity}${s.unit})`).join(', ')
      const result = await generateMealPlan({
        data: {
          name: patient.name,
          age: patient.age,
          gender: patient.gender,
          conditions: patient.conditions,
          restrictions: patient.restrictions,
          notes: patient.notes,
          stock: stockText,
        },
      })
      setMeals(result)
      toast('ok', 'IA gerou o plano', 'Revise e salve o plano alimentar')
    } catch (e) {
      toast('er', 'Erro na geração', (e as Error).message)
    } finally {
      setGenerating(false)
    }
  }

  async function handleSave() {
    if (!meals) return
    setSaving(true)
    try {
      await savePlanMeals(plan!.id, meals)
      toast('ok', 'Plano salvo com sucesso')
      onSaved()
      onClose()
    } catch (e) {
      toast('er', 'Erro ao salvar', (e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={`Plano: ${patient.name}`} large>
      <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: -12, marginBottom: 16 }}>
        Quarto {patient.room} · {patient.conditions.join(', ') || 'Sem condições'} · Restrições:{' '}
        {patient.restrictions.join(', ') || 'Nenhuma'}
      </div>
      {MEAL_TYPES.map((label, i) => {
        const key = MEAL_KEYS[i]
        return (
          <div className="fg" key={key}>
            <label>{label}</label>
            <textarea
              className="fc"
              style={{ minHeight: 60 }}
              value={meals[key]}
              disabled={!canEdit}
              onChange={(e) => setMeals({ ...meals, [key]: e.target.value })}
            />
          </div>
        )
      })}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
        <button className="btn btn-s" onClick={onClose}>
          Fechar
        </button>
        {canEdit ? (
          <button className="btn btn-b" onClick={handleGenerate} disabled={generating}>
            {generating ? 'Gerando...' : '🤖 Gerar com IA'}
          </button>
        ) : null}
        {canEdit ? (
          <button className="btn btn-p" onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : '💾 Salvar'}
          </button>
        ) : null}
      </div>
    </Modal>
  )
}
