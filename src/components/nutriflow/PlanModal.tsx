import { useEffect, useState } from 'react'
import { Save, Sparkles } from 'lucide-react'
import { Modal } from './Modal'
import { listStock, savePlanMeals } from '../../lib/api'
import { generateMealPlan } from '../../server/mealPlan'
import { compatibleStock, generateFallbackPlan } from '../../lib/aiFallback'
import { toast } from '../../lib/toast'
import { MEAL_KEYS, MEAL_TYPES, type MealPlan, type Meals, type Patient, type StockItem } from '../../lib/types'

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
  const [aiGenerated, setAiGenerated] = useState(false)
  const [score, setScore] = useState<number | null>(null)
  const [used, setUsed] = useState<string[]>([])
  const [stock, setStock] = useState<StockItem[]>([])
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    if (!open) return
    setMeals(plan?.meals ?? null)
    setAiGenerated(plan?.generated_by_ai ?? false)
    setScore(plan?.score ?? null)
    setUsed([])
    listStock().then(setStock)
  }, [open, plan])

  if (!patient || !plan || !meals) {
    return open ? (
      <Modal open={open} onClose={onClose} title="Plano alimentar" large>
        <div className="emp">Carregando...</div>
      </Modal>
    ) : null
  }

  const available = patient ? compatibleStock(patient, stock).all : []

  async function handleGenerate() {
    if (!patient) return
    setGenerating(true)
    try {
      const stockText = stock.map((s) => `${s.name} (${s.quantity}${s.unit})`).join(', ')
      const local = generateFallbackPlan(patient, stock)
      let result: Meals
      try {
        result = await generateMealPlan({
          data: {
            name: patient.name,
            age: patient.age,
            gender: patient.gender,
            conditions: patient.conditions,
            restrictions: patient.restrictions,
            medications: patient.medications,
            drug_allergies: patient.drug_allergies,
            food_allergies: patient.food_allergies,
            diet_type: patient.diet_type,
            nutritional_risk: patient.nutritional_risk,
            notes: patient.notes,
            stock: stockText,
          },
        })
        toast('ok', 'Dieta gerada pela IA', 'Revise as sugestões e aprove')
      } catch {
        result = local.meals
        toast('in', 'Dieta gerada (modo offline)', 'IA indisponível — usei o gerador clínico local')
      }
      setMeals(result)
      setAiGenerated(true)
      setScore(local.score)
      setUsed(local.ingredients.length ? local.ingredients : available.slice(0, 8))
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
      await savePlanMeals(plan!.id, meals, { generated_by_ai: aiGenerated, score })
      toast('ok', 'Plano salvo')
      onSaved()
      onClose()
    } catch (e) {
      toast('er', 'Erro ao salvar', (e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={`Plano — ${patient.name}`} large>
      <div className="plan-meta">
        <span className="bg bg-b">Quarto {patient.room}</span>
        <span className="bg bg-n">Dieta {patient.diet_type}</span>
        {patient.food_allergies.map((a) => (
          <span className="bg bg-y" key={a}>Alergia: {a}</span>
        ))}
        {aiGenerated ? <span className="bg bg-p"><Sparkles size={12} /> Gerado por IA</span> : null}
        {score != null ? <span className="bg bg-g">Score {score}/100</span> : null}
      </div>

      {canEdit ? (
        <div className="ai-hero">
          <div className="ai-hero-icon"><Sparkles size={18} /></div>
          <div className="ai-hero-body">
            <div className="ai-hero-title">Gerar dieta com IA</div>
            <p>Monta o cardápio do dia usando só o que há na cozinha, respeitando o quadro clínico.</p>
          </div>
          <button className="btn btn-ai" onClick={handleGenerate} disabled={generating}>
            <Sparkles size={15} />
            {generating ? 'Gerando...' : 'Gerar'}
          </button>
        </div>
      ) : null}

      {used.length ? (
        <div className="ai-basis">
          <span className="ai-basis-label">Ingredientes do estoque usados</span>
          <div className="chip-row">
            {used.map((i) => (
              <span className="bg bg-g" key={i}>{i}</span>
            ))}
          </div>
        </div>
      ) : null}

      {MEAL_TYPES.map((label, i) => {
        const key = MEAL_KEYS[i]
        return (
          <div className="fg" key={key}>
            <label>{label}</label>
            <textarea
              className="fc"
              style={{ minHeight: 54 }}
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
          <button className="btn btn-p" onClick={handleSave} disabled={saving}>
            <Save size={15} />
            {saving ? 'Salvando...' : 'Salvar plano'}
          </button>
        ) : null}
      </div>
    </Modal>
  )
}
