export type Role =
  | 'medico'
  | 'nutricionista'
  | 'enfermeiro'
  | 'cozinheiro'
  | 'admin'
  | 'paciente'

export type Profile = {
  id: string
  name: string
  role: Role
}

export type Patient = {
  id: string
  user_id: string | null
  name: string
  age: number
  room: string
  gender: string | null
  conditions: string[]
  restrictions: string[]
  notes: string | null
  status: 'Internado' | 'Alta'
  admission_date: string
}

export const MEAL_TYPES = [
  'Café da Manhã',
  'Lanche da Manhã',
  'Almoço',
  'Lanche da Tarde',
  'Jantar',
  'Ceia',
] as const

export type MealType = (typeof MEAL_TYPES)[number]

export const MEAL_KEYS = [
  'breakfast',
  'morningSnack',
  'lunch',
  'afternoonSnack',
  'dinner',
  'supper',
] as const

export type MealKey = (typeof MEAL_KEYS)[number]

export type Meals = Record<MealKey, string>

export const EMPTY_MEALS: Meals = {
  breakfast: '',
  morningSnack: '',
  lunch: '',
  afternoonSnack: '',
  dinner: '',
  supper: '',
}

export function mealKeyFor(type: MealType): MealKey {
  return MEAL_KEYS[MEAL_TYPES.indexOf(type)]
}

export type MealPlan = {
  id: string
  patient_id: string
  status: 'Rascunho' | 'Aprovado'
  meals: Meals
}

export type DailyMeal = {
  id: string
  patient_id: string
  date: string
  type: MealType
  status: 'Pendente' | 'Em Preparo' | 'Pronta' | 'Entregue'
  items: string | null
}

export type StockItem = {
  id: string
  name: string
  quantity: number
  unit: string
  expiry_date: string | null
  month: string | null
}

export type Feedback = {
  id: string
  patient_id: string
  meal_type: string
  date: string
  rating: number
  notes: string | null
  created_at: string
}

export type Alert = {
  id: string
  type: string
  message: string
  patient_id: string | null
  created_at: string
}

export const ROLE_LABELS: Record<Role, string> = {
  medico: 'Médico',
  nutricionista: 'Nutricionista',
  enfermeiro: 'Enfermeiro',
  cozinheiro: 'Cozinheiro',
  admin: 'Admin',
  paciente: 'Paciente',
}

export const CAN = {
  createPatient: (r?: Role) => r === 'medico' || r === 'admin',
  editPatient: (r?: Role) => r === 'medico' || r === 'admin',
  giveDischarge: (r?: Role) => r === 'medico' || r === 'admin',
  editPlan: (r?: Role) => r === 'nutricionista' || r === 'admin',
  approvePlan: (r?: Role) => r === 'nutricionista' || r === 'admin',
  kitchen: (r?: Role) => r === 'cozinheiro' || r === 'admin',
  stock: (r?: Role) => r === 'cozinheiro' || r === 'admin',
  addFeedback: (r?: Role) => r === 'enfermeiro' || r === 'admin',
  manageUsers: (r?: Role) => r === 'admin' || r === 'medico',
}
