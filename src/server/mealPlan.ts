import { createServerFn } from '@tanstack/react-start'
import { MEAL_KEYS, type Meals } from '../lib/types'

type GenerateMealPlanInput = {
  name: string
  age: number
  gender: string | null
  conditions: string[]
  restrictions: string[]
  medications: string[]
  drug_allergies: string[]
  food_allergies: string[]
  diet_type: string
  nutritional_risk: string
  notes: string | null
  stock: string
}

export const generateMealPlan = createServerFn({ method: 'POST' })
  .validator((data: unknown) => data as GenerateMealPlanInput)
  .handler(async ({ data }): Promise<Meals> => {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY não configurada no servidor')
    }

    const prompt = `Você é um nutricionista clínico especializado em nutrição hospitalar. Gere um plano alimentar diário personalizado para o seguinte paciente:

Paciente: ${data.name}, ${data.age} anos, ${data.gender ?? 'não informado'}
Condições médicas: ${data.conditions.join(', ') || 'Nenhuma'}
Restrições alimentares: ${data.restrictions.join(', ') || 'Nenhuma'}
Tipo de dieta prescrita: ${data.diet_type || 'Livre'}
Risco nutricional: ${data.nutritional_risk || 'Baixo'}
Medicamentos em uso: ${data.medications.join(', ') || 'Nenhum'}
Alergias a medicamentos: ${data.drug_allergies.join(', ') || 'Nenhuma'}
Alergias/intolerâncias alimentares: ${data.food_allergies.join(', ') || 'Nenhuma'}
Notas: ${data.notes || 'Nenhuma'}

INGREDIENTES DISPONÍVEIS NA COZINHA (use SOMENTE estes): ${data.stock || 'Nenhum informado'}

REGRAS OBRIGATÓRIAS:
1. Monte as refeições EXCLUSIVAMENTE com os ingredientes disponíveis na cozinha listados acima. Não inclua nada que não esteja nessa lista.
2. Jamais inclua alimentos aos quais o paciente tem alergia/intolerância.
3. Respeite rigorosamente o tipo de dieta e as restrições.
4. Se algum ingrediente da lista for incompatível com o quadro do paciente, simplesmente não o utilize.
Mantenha cada refeição curta e objetiva (uma linha).

Responda SOMENTE em JSON, sem markdown, sem texto extra. Formato exato:
{"breakfast":"...","morningSnack":"...","lunch":"...","afternoonSnack":"...","dinner":"...","supper":"..."}

Cada valor deve ser uma descrição clara da refeição com quantidades (ex: "Pão integral (2 fatias) + Queijo branco (30g) + Chá verde sem açúcar"). Respeite rigorosamente as restrições. Seja específico e prático.`

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      },
    )

    if (!resp.ok) {
      throw new Error(`Gemini API error: ${resp.status} ${await resp.text()}`)
    }

    const json = await resp.json()
    const text: string = json.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    const cleaned = text.replace(/```json|```/g, '').trim()

    let parsed: Record<string, string>
    try {
      parsed = JSON.parse(cleaned)
    } catch {
      throw new Error('A IA retornou uma resposta em formato inesperado')
    }

    const meals = {} as Meals
    for (const key of MEAL_KEYS) meals[key] = parsed[key] ?? ''
    return meals
  })
