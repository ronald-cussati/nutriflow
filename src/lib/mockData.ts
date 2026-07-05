import {
  EMPTY_MEALS,
  type Alert,
  type DailyMeal,
  type Feedback,
  type MealPlan,
  type Patient,
  type Profile,
  type StockItem,
} from './types'

// Contas simbólicas de demonstração. Qualquer senha é aceita (ambiente de demo);
// os chips de acesso rápido no login já preenchem tudo.
export type DemoAccount = Profile & { password: string }

export const DEMO_ACCOUNTS: DemoAccount[] = [
  { id: 'u-admin', name: 'Dra. Helena Prado', email: 'admin@nutriflow.app', role: 'admin', password: 'nutri123' },
  { id: 'u-medico', name: 'Dr. Rafael Antunes', email: 'medico@nutriflow.app', role: 'medico', password: 'nutri123' },
  { id: 'u-nutri', name: 'Nut. Marina Costa', email: 'nutricionista@nutriflow.app', role: 'nutricionista', password: 'nutri123' },
  { id: 'u-cozinha', name: 'Chef Bruno Lima', email: 'cozinheiro@nutriflow.app', role: 'cozinheiro', password: 'nutri123' },
  { id: 'u-enfermeiro', name: 'Enf. Paula Rocha', email: 'enfermeiro@nutriflow.app', role: 'enfermeiro', password: 'nutri123' },
  { id: 'u-paciente', name: 'João Pedro Oliveira', email: 'paciente@nutriflow.app', role: 'paciente', password: 'nutri123' },
]

function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}
function isoDaysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}
function monthStr() {
  return new Date().toISOString().slice(0, 7)
}
function inDays(n: number) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

export function seedProfiles(): Profile[] {
  return DEMO_ACCOUNTS.map((a) => ({ id: a.id, name: a.name, email: a.email, role: a.role }))
}

export function seedPatients(): Patient[] {
  return [
    {
      id: 'p-joao',
      user_id: 'u-paciente',
      name: 'João Pedro Oliveira',
      age: 45,
      room: '205-B',
      gender: 'Masculino',
      conditions: ['Insuficiência renal crônica', 'Anemia'],
      restrictions: ['Baixo potássio', 'Restrição proteica', 'Controle hídrico'],
      medications: ['Eritropoetina', 'Carbonato de cálcio'],
      drug_allergies: [],
      food_allergies: [],
      diet_type: 'Especial',
      nutritional_risk: 'Alto',
      notes: 'Controle hídrico rigoroso. Monitorar fósforo e potássio séricos.',
      status: 'Internado',
      admission_date: daysAgo(6),
    },
    {
      id: 'p-ana',
      user_id: null,
      name: 'Ana Beatriz Costa',
      age: 32,
      room: '412-A',
      gender: 'Feminino',
      conditions: ['Doença celíaca', 'Diabetes tipo 1'],
      restrictions: ['Sem glúten', 'Contagem de carboidratos'],
      medications: ['Insulina NPH', 'Insulina regular'],
      drug_allergies: ['Penicilina'],
      food_allergies: ['Glúten', 'Aveia'],
      diet_type: 'Diabética',
      nutritional_risk: 'Alto',
      notes: 'Reação anafilática a glúten. Toda a bandeja deve ser certificada sem glúten.',
      status: 'Internado',
      admission_date: daysAgo(3),
    },
    {
      id: 'p-carlos',
      user_id: null,
      name: 'Carlos Eduardo Ramos',
      age: 72,
      room: '108-C',
      gender: 'Masculino',
      conditions: ['AVC isquêmico', 'Disfagia'],
      restrictions: ['Consistência pastosa', 'Líquidos espessados'],
      medications: ['AAS', 'Atorvastatina', 'Enalapril'],
      drug_allergies: [],
      food_allergies: [],
      diet_type: 'Pastosa',
      nutritional_risk: 'Alto',
      notes: 'Disfagia moderada. Supervisão de enfermagem durante as refeições.',
      status: 'Internado',
      admission_date: daysAgo(9),
    },
    {
      id: 'p-maria',
      user_id: null,
      name: 'Maria Silva Santos',
      age: 68,
      room: '301-A',
      gender: 'Feminino',
      conditions: ['Diabetes tipo 2', 'Hipertensão arterial'],
      restrictions: ['Baixo sódio', 'Baixo açúcar'],
      medications: ['Metformina', 'Losartana'],
      drug_allergies: ['Dipirona'],
      food_allergies: [],
      diet_type: 'Hipossódica',
      nutritional_risk: 'Moderado',
      notes: 'Boa aceitação alimentar. Estimular ingestão de fibras.',
      status: 'Internado',
      admission_date: daysAgo(2),
    },
    {
      id: 'p-fernanda',
      user_id: null,
      name: 'Fernanda Mendes Lima',
      age: 54,
      room: '210-B',
      gender: 'Feminino',
      conditions: ['Pós-operatório de bariátrica'],
      restrictions: ['Fracionamento em 6 refeições', 'Baixo açúcar'],
      medications: ['Polivitamínico', 'Ômega 3'],
      drug_allergies: [],
      food_allergies: ['Lactose'],
      diet_type: 'Branda',
      nutritional_risk: 'Moderado',
      notes: 'Evoluir consistência conforme tolerância.',
      status: 'Internado',
      admission_date: daysAgo(1),
    },
  ]
}

export function seedPlans(): MealPlan[] {
  return [
    {
      id: 'plan-joao',
      patient_id: 'p-joao',
      status: 'Aprovado',
      generated_by_ai: true,
      score: 72,
      meals: {
        breakfast: '1 fatia de pão branco (sem farelo) + 1 col. chá de margarina sem sal + 1 ovo mexido + chá de camomila (80 ml)',
        morningSnack: '1 porção de gelatina sem corante (40 kcal) + 2 biscoitos de água e sal',
        lunch: '4 col. sopa de arroz branco + 60 g de frango grelhado + cenoura e abobrinha cozidas + 100 ml de água',
        afternoonSnack: '1 xícara (120 ml) de sopa rala de legumes de baixo potássio + 1 fatia de pão branco torrado',
        dinner: '4 col. sopa de macarrão + 50 g de peixe branco grelhado + chuchu e vagem cozidos + 1 fatia fina de melão',
        supper: '1 pote (80 g) de iogurte natural desnatado + 2 biscoitos de polvilho + chá de erva-doce (50 ml)',
      },
    },
    {
      id: 'plan-ana',
      patient_id: 'p-ana',
      status: 'Aprovado',
      generated_by_ai: true,
      score: 88,
      meals: {
        breakfast: 'Tapioca (2 col.) com queijo branco + café com leite sem açúcar',
        morningSnack: '1 fruta com baixo índice glicêmico (maçã)',
        lunch: 'Arroz integral + feijão + filé de frango grelhado + salada verde à vontade',
        afternoonSnack: 'Iogurte natural sem lactose + castanhas (sem glúten)',
        dinner: 'Omelete de legumes + purê de abóbora',
        supper: 'Chá + 1 fatia de queijo branco',
      },
    },
    {
      id: 'plan-carlos',
      patient_id: 'p-carlos',
      status: 'Aprovado',
      generated_by_ai: false,
      score: 65,
      meals: {
        breakfast: 'Mingau de aveia sem grumos + banana amassada',
        morningSnack: 'Purê de maçã',
        lunch: 'Purê de batata + carne moída bem cozida e desfiada + creme de legumes',
        afternoonSnack: 'Vitamina de frutas espessada',
        dinner: 'Creme de abóbora com frango desfiado',
        supper: 'Iogurte cremoso',
      },
    },
    {
      id: 'plan-maria',
      patient_id: 'p-maria',
      status: 'Rascunho',
      generated_by_ai: false,
      score: null,
      meals: { ...EMPTY_MEALS },
    },
    {
      id: 'plan-fernanda',
      patient_id: 'p-fernanda',
      status: 'Rascunho',
      generated_by_ai: true,
      score: 85,
      meals: {
        breakfast: 'Iogurte proteico sem lactose + 1 col. de aveia',
        morningSnack: 'Gelatina diet',
        lunch: 'Purê de batata-doce + frango desfiado + legumes bem cozidos',
        afternoonSnack: 'Vitamina de mamão sem açúcar',
        dinner: 'Sopa cremosa de legumes com proteína',
        supper: 'Chá + 1 fatia de queijo branco',
      },
    },
  ]
}

export function seedDailyMeals(): DailyMeal[] {
  const today = new Date().toISOString().slice(0, 10)
  const meals: Array<Omit<DailyMeal, 'id'>> = [
    { patient_id: 'p-joao', date: today, type: 'Café da Manhã', status: 'Entregue', items: 'Pão branco + ovo mexido + chá' },
    { patient_id: 'p-joao', date: today, type: 'Lanche da Manhã', status: 'Entregue', items: 'Gelatina + biscoito' },
    { patient_id: 'p-joao', date: today, type: 'Almoço', status: 'Em Preparo', items: 'Arroz + frango + legumes' },
    { patient_id: 'p-joao', date: today, type: 'Lanche da Tarde', status: 'Pendente', items: 'Sopa de legumes' },
    { patient_id: 'p-joao', date: today, type: 'Jantar', status: 'Pendente', items: 'Macarrão + peixe branco' },
    { patient_id: 'p-joao', date: today, type: 'Ceia', status: 'Pendente', items: 'Iogurte + biscoito de polvilho' },
    { patient_id: 'p-ana', date: today, type: 'Café da Manhã', status: 'Entregue', items: 'Tapioca com queijo' },
    { patient_id: 'p-ana', date: today, type: 'Almoço', status: 'Pronta', items: 'Arroz integral + frango + salada' },
    { patient_id: 'p-ana', date: today, type: 'Jantar', status: 'Pendente', items: 'Omelete de legumes' },
    { patient_id: 'p-carlos', date: today, type: 'Café da Manhã', status: 'Entregue', items: 'Mingau de aveia' },
    { patient_id: 'p-carlos', date: today, type: 'Almoço', status: 'Em Preparo', items: 'Purê + carne desfiada' },
    { patient_id: 'p-carlos', date: today, type: 'Jantar', status: 'Pendente', items: 'Creme de abóbora' },
  ]
  return meals.map((m, i) => ({ ...m, id: `dm-${i}` }))
}

export function seedStock(): StockItem[] {
  const month = monthStr()
  const items: Array<Omit<StockItem, 'id'>> = [
    { name: 'Arroz branco', quantity: 25, unit: 'kg', expiry_date: inDays(120), month },
    { name: 'Peito de frango', quantity: 18, unit: 'kg', expiry_date: inDays(4), month },
    { name: 'Peixe branco (pescada)', quantity: 9, unit: 'kg', expiry_date: inDays(2), month },
    { name: 'Ovos', quantity: 240, unit: 'unidade', expiry_date: inDays(20), month },
    { name: 'Abobrinha', quantity: 12, unit: 'kg', expiry_date: inDays(1), month },
    { name: 'Iogurte natural desnatado', quantity: 40, unit: 'unidade', expiry_date: inDays(10), month },
    { name: 'Gelatina sem corante', quantity: 60, unit: 'unidade', expiry_date: inDays(200), month },
    { name: 'Aveia em flocos finos', quantity: 6, unit: 'kg', expiry_date: inDays(-2), month },
  ]
  return items.map((it, i) => ({ ...it, id: `st-${i}` }))
}

export function seedFeedbacks(): Feedback[] {
  return [
    {
      id: 'fb-0',
      patient_id: 'p-joao',
      meal_type: 'Café da Manhã',
      date: new Date().toISOString().slice(0, 10),
      rating: 4,
      notes: 'O paciente relatou boa aceitação, consumiu cerca de 90%.',
      created_at: isoDaysAgo(0),
    },
    {
      id: 'fb-1',
      patient_id: 'p-carlos',
      meal_type: 'Almoço',
      date: daysAgo(1),
      rating: 3,
      notes: 'Aceitação parcial. Cansaço durante a alimentação (disfagia).',
      created_at: isoDaysAgo(1),
    },
    {
      id: 'fb-2',
      patient_id: 'p-ana',
      meal_type: 'Jantar',
      date: daysAgo(1),
      rating: 5,
      notes: 'Ótima aceitação. Elogiou o preparo sem glúten.',
      created_at: isoDaysAgo(1),
    },
  ]
}

export function seedAlerts(): Alert[] {
  return [
    { id: 'al-0', type: 'danger', message: 'João Pedro Oliveira — Risco nutricional alto (Quarto 205-B)', patient_id: 'p-joao', created_at: isoDaysAgo(0) },
    { id: 'al-1', type: 'danger', message: 'Ana Beatriz Costa — Alergia grave a glúten sinalizada', patient_id: 'p-ana', created_at: isoDaysAgo(0) },
    { id: 'al-2', type: 'warning', message: 'Estoque: Aveia em flocos finos está vencida', patient_id: null, created_at: isoDaysAgo(0) },
    { id: 'al-3', type: 'info', message: 'Plano aprovado: Ana Beatriz Costa', patient_id: 'p-ana', created_at: isoDaysAgo(1) },
    { id: 'al-4', type: 'info', message: 'Maria Silva Santos — Plano alimentar aguardando definição', patient_id: 'p-maria', created_at: isoDaysAgo(1) },
  ]
}
