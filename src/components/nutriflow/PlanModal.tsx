import { useEffect, useState } from 'react'
import { Save, Sparkles } from 'lucide-react'
import { Modal } from './Modal'
import { listStock, savePlanMeals } from '../../lib/api'
import { generateMealPlan } from '../../server/mealPlan'
import { generateFallbackPlan } from '../../lib/aiFallback'
import { toast } from '../../lib/toast'
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
  const [aiGenerated, setAiGenerated] = useState(false)
  const [score, setScore] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    if (!open) return
    setMeals(plan?.meals ?? null)
    setAiGenerated(plan?.generated_by_ai ?? false)
    setScore(plan?.score ?? null)
  }, [open, plan])

  if (!patient || !plan || !meals) {
    return open ? (
      <Modal open={open} onClose={onClose} title="Plano alimentar" large>
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
      let result: Meals
      let generatedScore: number
      try {
        // Caminho principal: IA real (Gemini) via server function.
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
        generatedScore = generateFallbackPlan(patient).score
        toast('ok', 'IA gerou o plano', 'Revise as sugestões e salve')
      } catch {
        // Fallback determinístico: garante que a demonstração nunca falhe.
        const fb = generateFallbackPlan(patient)
        result = fb.meals
        generatedScore = fb.score
        toast('in', 'Plano gerado (modo offline)', 'IA indisponível — usei o gerador clínico local')
      }
      setMeals(result)
      setAiGenerated(true)
      setScore(generatedScore)
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
    <Modal open={open} onClose={onClose} title={`Plano — ${patient.name}`} large>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: -10, marginBottom: 16 }}>
        <span className="bg bg-b">Quarto {patient.room}</span>
        <span className="bg bg-n">Dieta {patient.diet_type}</span>
        {patient.food_allergies.map((a) => (
          <span className="bg bg-y" key={a}>Alergia: {a}</span>
        ))}
        {aiGenerated ? <span className="bg bg-p"><Sparkles size={12} /> Gerado por IA</span> : null}
        {score != null ? <span className="bg bg-g">Score {score}/100</span> : null}
      </div>

      {canEdit ? (
        <div className="ai-panel">
          <div className="ai-panel-h"><Sparkles size={16} /> Assistente de dieta com IA</div>
          <ul>
            <li>A IA analisa condições, medicações, alergias e o estoque disponível.</li>
            <li>Respeita rigorosamente restrições e alergias antes de sugerir as refeições.</li>
            <li>Você revisa, ajusta o texto e aprova — a decisão final é sempre da equipe.</li>
          </ul>
          <button className="btn btn-ai btn-sm" style={{ marginTop: 12 }} onClick={handleGenerate} disabled={generating}>
            <Sparkles size={15} />
            {generating ? 'Gerando dieta...' : 'Gerar dieta com IA'}
          </button>
        </div>
      ) : null}

      {MEAL_TYPES.map((label, i) => {
        const key = MEAL_KEYS[i]
        return (
          <div className="fg" key={key}>
            <label>{label}</label>
            <textarea
              className="fc"
              style={{ minHeight: 62 }}
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
