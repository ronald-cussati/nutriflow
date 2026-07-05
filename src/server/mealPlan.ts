import { createServerFn } from '@tanstack/react-start'
import { MEAL_KEYS, type Meals } from '../lib/types'

type GenerateMealPlanInput = {
  name: string
  age: number
  gender: string | null
  conditions: string[]
  restrictions: string[]
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
Notas: ${data.notes || 'Nenhuma'}
Estoque disponível: ${data.stock || 'Não informado'}

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
