import { commit, db, delay, newId } from './store'
import {
  MEAL_KEYS,
  MEAL_TYPES,
  EMPTY_MEALS,
  type DailyMeal,
  type MealPlan,
  type MealStatus,
  type Patient,
  type Profile,
  type Role,
  type StockItem,
} from './types'

export function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

type NewPatientInput = Omit<Patient, 'id' | 'user_id' | 'status' | 'admission_date'>

// ── Patients ──
export async function listPatients() {
  const rows = [...db().patients].sort((a, b) => a.name.localeCompare(b.name))
  return delay(rows)
}

export async function createPatient(input: NewPatientInput) {
  const patient: Patient = {
    ...input,
    id: newId('p'),
    user_id: null,
    status: 'Internado',
    admission_date: todayStr(),
  }
  db().patients.push(patient)
  db().plans.push({
    id: newId('plan'),
    patient_id: patient.id,
    status: 'Rascunho',
    meals: { ...EMPTY_MEALS },
    generated_by_ai: false,
    score: null,
  })
  pushAlert('info', `Novo paciente internado: ${patient.name} (${patient.room})`, patient.id)
  commit()
  return delay(patient)
}

export async function updatePatient(id: string, patch: Partial<Patient>) {
  const p = db().patients.find((x) => x.id === id)
  if (p) Object.assign(p, patch)
  commit()
  return delay(undefined)
}

export async function dischargePatient(patient: Patient) {
  const p = db().patients.find((x) => x.id === patient.id)
  if (p) p.status = 'Alta'
  const plan = db().plans.find((pl) => pl.patient_id === patient.id)
  if (plan?.status === 'Aprovado') plan.status = 'Rascunho'
  pushAlert('info', `Alta médica: ${patient.name} (${patient.room})`, patient.id)
  commit()
  return delay(undefined)
}

export async function getMyPatient(userId: string) {
  return delay(db().patients.find((p) => p.user_id === userId) ?? null)
}

// ── Meal plans ──
export async function getPlanForPatient(patientId: string) {
  return delay(db().plans.find((pl) => pl.patient_id === patientId) ?? null)
}

export async function listPlans() {
  return delay([...db().plans])
}

export async function savePlanMeals(planId: string, meals: MealPlan['meals'], meta?: { generated_by_ai?: boolean; score?: number | null }) {
  const plan = db().plans.find((pl) => pl.id === planId)
  if (plan) {
    plan.meals = meals
    if (meta?.generated_by_ai !== undefined) plan.generated_by_ai = meta.generated_by_ai
    if (meta?.score !== undefined) plan.score = meta.score
  }
  commit()
  return delay(undefined)
}

export async function approvePlan(plan: MealPlan, patient: Patient) {
  const p = db().plans.find((pl) => pl.id === plan.id)
  if (p) p.status = 'Aprovado'
  await generateDailyMealsForPatient(patient, plan)
  pushAlert('info', `Plano aprovado: ${patient.name}`, patient.id)
  commit()
  return delay(undefined)
}

export async function draftPlan(planId: string) {
  const p = db().plans.find((pl) => pl.id === planId)
  if (p) p.status = 'Rascunho'
  commit()
  return delay(undefined)
}

// ── Daily meals ──
export async function listDailyMealsForDate(date: string) {
  return delay(db().dailyMeals.filter((d) => d.date === date))
}

export async function generateDailyMealsForPatient(patient: Patient, plan: MealPlan) {
  const date = todayStr()
  const existing = db().dailyMeals
  const rows = MEAL_TYPES.filter(
    (type) => !existing.some((d) => d.patient_id === patient.id && d.type === type && d.date === date),
  ).map((type) => {
    const key = MEAL_KEYS[MEAL_TYPES.indexOf(type)]
    return {
      id: newId('dm'),
      patient_id: patient.id,
      date,
      type,
      status: 'Pendente' as MealStatus,
      items: plan.meals[key] || '',
    }
  })
  db().dailyMeals.push(...rows)
  commit()
  return delay(undefined)
}

const NEXT_STATUS: Record<MealStatus, MealStatus> = {
  Pendente: 'Em Preparo',
  'Em Preparo': 'Pronta',
  Pronta: 'Entregue',
  Entregue: 'Pendente',
  Recusada: 'Pendente',
}

export async function cycleMealStatus(meal: DailyMeal) {
  const m = db().dailyMeals.find((d) => d.id === meal.id)
  const next = NEXT_STATUS[meal.status]
  if (m) m.status = next
  commit()
  return delay(next)
}

export async function setMealStatus(mealId: string, status: MealStatus) {
  const m = db().dailyMeals.find((d) => d.id === mealId)
  if (m) m.status = status
  commit()
  return delay(undefined)
}

// ── Stock ──
export async function listStock() {
  return delay([...db().stock].sort((a, b) => a.name.localeCompare(b.name)))
}

export async function saveStock(id: string | null, input: Omit<StockItem, 'id'>) {
  if (id) {
    const s = db().stock.find((x) => x.id === id)
    if (s) Object.assign(s, input)
  } else {
    db().stock.push({ ...input, id: newId('st') })
  }
  commit()
  return delay(undefined)
}

export async function removeStock(id: string) {
  db().stock = db().stock.filter((s) => s.id !== id)
  commit()
  return delay(undefined)
}

// ── Feedbacks ──
export async function listFeedbacks() {
  return delay(
    [...db().feedbacks].sort((a, b) => (a.created_at < b.created_at ? 1 : -1)),
  )
}

export async function addFeedback(input: {
  patient_id: string
  meal_type: string
  rating: number
  notes: string
  created_by: string
}) {
  db().feedbacks.push({
    id: newId('fb'),
    patient_id: input.patient_id,
    meal_type: input.meal_type,
    rating: input.rating,
    notes: input.notes,
    date: todayStr(),
    created_at: new Date().toISOString(),
  })
  commit()
  return delay(undefined)
}

// ── Alerts ──
export async function listAlerts() {
  return delay(
    [...db().alerts].sort((a, b) => (a.created_at < b.created_at ? 1 : -1)).slice(0, 6),
  )
}

function pushAlert(type: string, message: string, patientId: string | null) {
  db().alerts.unshift({
    id: newId('al'),
    type,
    message,
    patient_id: patientId,
    created_at: new Date().toISOString(),
  })
}

export async function addAlert(type: string, message: string, patientId: string | null) {
  pushAlert(type, message, patientId)
  commit()
  return delay(undefined)
}

// ── Profiles (Usuários) ──
export async function listProfiles() {
  return delay([...db().profiles])
}

export async function createProfile(input: { name: string; email: string; role: Role; patientId?: string }) {
  const profile: Profile = { id: newId('u'), name: input.name, email: input.email, role: input.role }
  db().profiles.push(profile)
  if (input.role === 'paciente' && input.patientId) {
    const patient = db().patients.find((p) => p.id === input.patientId)
    if (patient) patient.user_id = profile.id
  }
  commit()
  return delay(profile)
}

export async function updateProfile(id: string, patch: { name: string; role: Role }) {
  const p = db().profiles.find((x) => x.id === id)
  if (p) Object.assign(p, patch)
  commit()
  return delay(undefined)
}

export async function deleteProfile(id: string) {
  db().profiles = db().profiles.filter((p) => p.id !== id)
  const patient = db().patients.find((p) => p.user_id === id)
  if (patient) patient.user_id = null
  commit()
  return delay(undefined)
}
