import type { Meals, Patient } from './types'

// Gerador determinístico usado quando a API do Gemini não está disponível
// (offline, sem chave, ou quota excedida). Compõe um plano coerente a partir
// das condições clínicas, restrições e tipo de dieta do paciente — assim a
// demonstração de "Gerar Dieta com IA" nunca falha na apresentação.

type Profile = {
  base: string[]
  avoid: string[]
}

function clinicalProfile(patient: Patient): Profile {
  const cond = patient.conditions.map((c) => c.toLowerCase()).join(' ')
  const restr = patient.restrictions.map((c) => c.toLowerCase()).join(' ')
  const all = `${cond} ${restr} ${patient.diet_type.toLowerCase()}`
  const avoid: string[] = []
  const base: string[] = []

  if (all.includes('renal') || all.includes('potássio') || all.includes('potassio')) {
    avoid.push('banana', 'laranja', 'tomate', 'batata', 'folhas verde-escuras')
    base.push('legumes cozidos com água descartada', 'proteína de alto valor biológico em porção controlada')
  }
  if (all.includes('diab')) {
    avoid.push('açúcar', 'doces', 'sucos adoçados')
    base.push('carboidratos complexos', 'fibras', 'adoçante quando necessário')
  }
  if (all.includes('hiperten') || all.includes('sódio') || all.includes('sodio') || all.includes('hipossód')) {
    avoid.push('sal em excesso', 'embutidos', 'enlatados')
    base.push('temperos naturais (ervas, alho, limão)')
  }
  if (all.includes('celía') || all.includes('celia') || all.includes('glúten') || all.includes('gluten')) {
    avoid.push('trigo', 'pães comuns', 'aveia contaminada')
    base.push('tapioca', 'arroz', 'milho')
  }
  if (all.includes('disfagia') || all.includes('pastosa')) {
    base.push('preparações pastosas e homogêneas', 'líquidos espessados')
  }
  if (patient.food_allergies.length) {
    avoid.push(...patient.food_allergies.map((f) => f.toLowerCase()))
  }
  return { base, avoid }
}

export function generateFallbackPlan(patient: Patient): { meals: Meals; score: number } {
  const { base, avoid } = clinicalProfile(patient)
  const pastosa = patient.diet_type === 'Pastosa'
  const note = base.length ? ` (${base.slice(0, 2).join('; ')})` : ''

  const meals: Meals = pastosa
    ? {
        breakfast: 'Mingau de aveia sem grumos + banana amassada + chá morno espessado',
        morningSnack: 'Purê de maçã sem casca',
        lunch: 'Purê de batata-doce + carne moída bem cozida e desfiada + creme de legumes' + note,
        afternoonSnack: 'Vitamina de frutas espessada',
        dinner: 'Creme de abóbora com frango desfiado',
        supper: 'Iogurte cremoso natural',
      }
    : {
        breakfast: 'Pão adequado à dieta (1 fatia) + proteína magra (ovo ou queijo branco) + bebida quente sem açúcar',
        morningSnack: 'Fruta permitida em porção controlada + oleaginosas (se liberadas)',
        lunch: 'Porção de carboidrato + proteína magra grelhada + legumes cozidos' + note,
        afternoonSnack: 'Iogurte natural + 1 fibra (aveia/chia, se permitido)',
        dinner: 'Sopa ou preparação leve com proteína + vegetais cozidos',
        supper: 'Chá sem açúcar + porção pequena de proteína (queijo branco)',
      }

  // Score simbólico: parte de 90 e desconta pela severidade/risco.
  let score = 90
  if (patient.nutritional_risk === 'Alto') score -= 16
  else if (patient.nutritional_risk === 'Moderado') score -= 8
  score -= Math.min(avoid.length, 6)
  score = Math.max(60, Math.min(95, score))

  return { meals, score }
}
