import type { Alert, DailyMeal, Feedback, MealPlan, Patient, Profile, StockItem } from './types'
import {
  seedAlerts,
  seedDailyMeals,
  seedFeedbacks,
  seedPatients,
  seedPlans,
  seedProfiles,
  seedStock,
} from './mockData'

// Store self-contained para a demonstração: estado em memória persistido em
// localStorage. Nenhuma dependência de backend externo — ideal para apresentar
// offline com zero risco de indisponibilidade.

export type DbShape = {
  profiles: Profile[]
  patients: Patient[]
  plans: MealPlan[]
  dailyMeals: DailyMeal[]
  stock: StockItem[]
  feedbacks: Feedback[]
  alerts: Alert[]
}

const STORAGE_KEY = 'nutriflow-demo-db'
const VERSION_KEY = 'nutriflow-demo-version'
const SCHEMA_VERSION = '2'

function freshDb(): DbShape {
  return {
    profiles: seedProfiles(),
    patients: seedPatients(),
    plans: seedPlans(),
    dailyMeals: seedDailyMeals(),
    stock: seedStock(),
    feedbacks: seedFeedbacks(),
    alerts: seedAlerts(),
  }
}

let memory: DbShape | null = null

function load(): DbShape {
  if (memory) return memory
  if (typeof window === 'undefined') {
    memory = freshDb()
    return memory
  }
  const version = window.localStorage.getItem(VERSION_KEY)
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (raw && version === SCHEMA_VERSION) {
    try {
      memory = JSON.parse(raw) as DbShape
      return memory
    } catch {
      // cai para o seed
    }
  }
  memory = freshDb()
  persist()
  window.localStorage.setItem(VERSION_KEY, SCHEMA_VERSION)
  return memory
}

function persist() {
  if (typeof window === 'undefined' || !memory) return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(memory))
}

export function db(): DbShape {
  return load()
}

export function commit() {
  persist()
}

export function resetDb() {
  memory = freshDb()
  persist()
  if (typeof window !== 'undefined') window.localStorage.setItem(VERSION_KEY, SCHEMA_VERSION)
}

let idCounter = 0
export function newId(prefix: string) {
  idCounter += 1
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`
}

// Simula a latência de rede para dar a sensação de app real (bem curta).
export function delay<T>(value: T, ms = 120): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}
