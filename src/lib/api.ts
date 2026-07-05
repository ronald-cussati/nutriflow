import { supabase } from './supabaseClient'
import {
  MEAL_KEYS,
  MEAL_TYPES,
  EMPTY_MEALS,
  type DailyMeal,
  type Feedback,
  type MealPlan,
  type Patient,
  type Profile,
  type StockItem,
  type Alert,
} from './types'

export function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

// ── Patients ──
export async function listPatients() {
  const { data, error } = await supabase.from('patients').select('*').order('name')
  if (error) throw error
  return data as Patient[]
}

export async function createPatient(input: Omit<Patient, 'id' | 'user_id' | 'status' | 'admission_date'>) {
  const { data, error } = await supabase
    .from('patients')
    .insert({ ...input, status: 'Internado', admission_date: todayStr() })
    .select()
    .single()
  if (error) throw error
  const patient = data as Patient

  await supabase.from('meal_plans').insert({ patient_id: patient.id, status: 'Rascunho', meals: EMPTY_MEALS })
  await addAlert('info', `Novo paciente internado: ${patient.name} (${patient.room})`, patient.id)
  return patient
}

export async function updatePatient(id: string, patch: Partial<Patient>) {
  const { error } = await supabase.from('patients').update(patch).eq('id', id)
  if (error) throw error
}

export async function dischargePatient(patient: Patient) {
  await supabase.from('patients').update({ status: 'Alta' }).eq('id', patient.id)
  const { data: plan } = await supabase
    .from('meal_plans')
    .select('*')
    .eq('patient_id', patient.id)
    .maybeSingle()
  if (plan?.status === 'Aprovado') {
    await supabase.from('meal_plans').update({ status: 'Rascunho' }).eq('id', plan.id)
  }
  await addAlert('info', `Alta médica: ${patient.name} (${patient.room})`, patient.id)
}

export async function getMyPatient(userId: string) {
  const { data, error } = await supabase.from('patients').select('*').eq('user_id', userId).maybeSingle()
  if (error) throw error
  return data as Patient | null
}

// ── Meal plans ──
export async function getPlanForPatient(patientId: string) {
  const { data, error } = await supabase
    .from('meal_plans')
    .select('*')
    .eq('patient_id', patientId)
    .maybeSingle()
  if (error) throw error
  return data as MealPlan | null
}

export async function listPlans() {
  const { data, error } = await supabase.from('meal_plans').select('*')
  if (error) throw error
  return data as MealPlan[]
}

export async function savePlanMeals(planId: string, meals: MealPlan['meals']) {
  const { error } = await supabase
    .from('meal_plans')
    .update({ meals, updated_at: new Date().toISOString() })
    .eq('id', planId)
  if (error) throw error
}

export async function approvePlan(plan: MealPlan, patient: Patient) {
  await supabase
    .from('meal_plans')
    .update({ status: 'Aprovado', approved_at: new Date().toISOString() })
    .eq('id', plan.id)
  await generateDailyMealsForPatient(patient, plan)
  await addAlert('info', `Plano aprovado: ${patient.name}`, patient.id)
}

export async function draftPlan(planId: string) {
  const { error } = await supabase.from('meal_plans').update({ status: 'Rascunho' }).eq('id', planId)
  if (error) throw error
}

// ── Daily meals ──
export async function listDailyMealsForDate(date: string) {
  const { data, error } = await supabase.from('daily_meals').select('*').eq('date', date)
  if (error) throw error
  return data as DailyMeal[]
}

export async function generateDailyMealsForPatient(patient: Patient, plan: MealPlan) {
  const date = todayStr()
  const existing = await listDailyMealsForDate(date)
  const rows = MEAL_TYPES.filter(
    (type) => !existing.some((d) => d.patient_id === patient.id && d.type === type),
  ).map((type, _i) => {
    const key = MEAL_KEYS[MEAL_TYPES.indexOf(type)]
    return {
      patient_id: patient.id,
      date,
      type,
      status: 'Pendente' as const,
      items: plan.meals[key] || '',
    }
  })
  if (rows.length) {
    const { error } = await supabase.from('daily_meals').insert(rows)
    if (error) throw error
  }
}

export async function cycleMealStatus(meal: DailyMeal) {
  const cycle: Record<DailyMeal['status'], DailyMeal['status']> = {
    Pendente: 'Em Preparo',
    'Em Preparo': 'Pronta',
    Pronta: 'Entregue',
    Entregue: 'Pendente',
  }
  const next = cycle[meal.status]
  const { error } = await supabase.from('daily_meals').update({ status: next }).eq('id', meal.id)
  if (error) throw error
  return next
}

// ── Stock ──
export async function listStock() {
  const { data, error } = await supabase.from('stock').select('*').order('name')
  if (error) throw error
  return data as StockItem[]
}

export async function saveStock(id: string | null, input: Omit<StockItem, 'id'>) {
  if (id) {
    const { error } = await supabase.from('stock').update(input).eq('id', id)
    if (error) throw error
  } else {
    const { error } = await supabase.from('stock').insert(input)
    if (error) throw error
  }
}

export async function removeStock(id: string) {
  const { error } = await supabase.from('stock').delete().eq('id', id)
  if (error) throw error
}

// ── Feedbacks ──
export async function listFeedbacks() {
  const { data, error } = await supabase
    .from('feedbacks')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Feedback[]
}

export async function addFeedback(input: {
  patient_id: string
  meal_type: string
  rating: number
  notes: string
  created_by: string
}) {
  const { error } = await supabase.from('feedbacks').insert({ ...input, date: todayStr() })
  if (error) throw error
}

// ── Alerts ──
export async function listAlerts() {
  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)
  if (error) throw error
  return data as Alert[]
}

export async function addAlert(type: string, message: string, patientId: string | null) {
  await supabase.from('alerts').insert({ type, message, patient_id: patientId })
}

// ── Profiles (Usuários) ──
export async function listProfiles() {
  const { data, error } = await supabase.from('profiles').select('id, name, role')
  if (error) throw error
  return data as Profile[]
}
