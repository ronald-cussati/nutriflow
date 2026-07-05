import { MEAL_KEYS, type Meals, type Patient, type StockItem } from './types'

// Gerador clínico determinístico usado quando o Gemini está indisponível
// (offline / sem chave / quota). Compõe as refeições EXCLUSIVAMENTE a partir
// dos ingredientes disponíveis no estoque da cozinha, filtrando alergias e
// restrições — garantindo que a demonstração nunca falhe e que o cardápio
// reflita de fato o que existe na cozinha.

type Category = 'carb' | 'protein' | 'veg' | 'fruit' | 'dairy' | 'egg' | 'light'

const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  carb: ['arroz', 'pão', 'pao', 'macarrão', 'macarrao', 'batata', 'aveia', 'tapioca', 'mandioca', 'milho', 'biscoito', 'polvilho', 'farinha', 'purê', 'pure'],
  protein: ['frango', 'peixe', 'pescada', 'carne', 'boi', 'peito', 'filé', 'file', 'atum', 'feijão', 'feijao', 'lentilha', 'grão', 'grao', 'proteína', 'proteina'],
  veg: ['abobrinha', 'cenoura', 'chuchu', 'legume', 'abóbora', 'abobora', 'espinafre', 'couve', 'alface', 'vagem', 'brócolis', 'brocolis', 'beterraba', 'repolho', 'tomate'],
  fruit: ['maçã', 'maca', 'banana', 'mamão', 'mamao', 'melão', 'melao', 'laranja', 'pera', 'fruta', 'manga'],
  dairy: ['iogurte', 'leite', 'queijo', 'requeijão', 'requeijao', 'coalhada'],
  egg: ['ovo'],
  light: ['gelatina', 'chá', 'cha', 'café', 'cafe', 'suco', 'sopa'],
}

// Alergias/intolerâncias → termos de ingredientes que devem ser evitados.
const ALLERGEN_EXPANSION: Record<string, string[]> = {
  glúten: ['pão', 'pao', 'macarrão', 'macarrao', 'aveia', 'farinha', 'biscoito', 'trigo', 'cevada'],
  gluten: ['pão', 'pao', 'macarrão', 'macarrao', 'aveia', 'farinha', 'biscoito', 'trigo', 'cevada'],
  lactose: ['iogurte', 'leite', 'queijo', 'requeijão', 'requeijao', 'coalhada'],
  ovo: ['ovo'],
}

function normalize(s: string) {
  return s.toLowerCase().trim()
}

function categorize(name: string): Category | null {
  const n = normalize(name)
  for (const cat of Object.keys(CATEGORY_KEYWORDS) as Category[]) {
    if (CATEGORY_KEYWORDS[cat].some((k) => n.includes(k))) return cat
  }
  return null
}

// Retorna os itens de estoque compatíveis com o quadro do paciente, agrupados por categoria.
export function compatibleStock(patient: Patient, stock: StockItem[]) {
  const avoid = new Set<string>()
  for (const a of [...patient.food_allergies, ...patient.restrictions]) {
    const key = normalize(a)
    avoid.add(key)
    for (const [allergen, terms] of Object.entries(ALLERGEN_EXPANSION)) {
      if (key.includes(allergen)) terms.forEach((t) => avoid.add(t))
    }
  }

  const today = Date.now()
  const groups: Record<Category, string[]> = { carb: [], protein: [], veg: [], fruit: [], dairy: [], egg: [], light: [] }
  const all: string[] = []

  for (const item of stock) {
    const n = normalize(item.name)
    const expired = item.expiry_date ? new Date(item.expiry_date).getTime() < today : false
    if (expired) continue
    if ([...avoid].some((term) => term && n.includes(term))) continue
    const cat = categorize(item.name)
    if (!cat) continue
    groups[cat].push(item.name)
    all.push(item.name)
  }
  return { groups, all }
}

export function generateFallbackPlan(
  patient: Patient,
  stock: StockItem[],
): { meals: Meals; score: number; ingredients: string[] } {
  const { groups, all } = compatibleStock(patient, stock)
  const pastosa = patient.diet_type === 'Pastosa' || patient.restrictions.some((r) => /pastos|disfagia/i.test(r))
  const used = new Set<string>()

  const pick = (cat: Category) => {
    const list = groups[cat]
    if (!list.length) return null
    const item = list[used.size % list.length]
    used.add(item)
    return item
  }
  const prep = (name: string | null) => {
    if (!name) return null
    if (pastosa) return `${name} (preparo pastoso)`
    return name
  }

  if (!all.length) {
    const empty = MEAL_KEYS.reduce((acc, k) => {
      acc[k] = 'Reponha o estoque da cozinha — sem ingredientes compatíveis disponíveis.'
      return acc
    }, {} as Meals)
    return { meals: empty, score: 0, ingredients: [] }
  }

  const carb = () => pick('carb') ?? pick('light')
  const protein = () => pick('protein') ?? pick('egg') ?? pick('dairy')
  const veg = () => pick('veg')
  const light = () => pick('light') ?? pick('fruit') ?? pick('dairy')
  const cooked = (name: string | null) => (name ? (pastosa ? `${name} (preparo pastoso)` : `${name} cozida`) : null)

  const line = (parts: Array<string | null>) => parts.filter(Boolean).join(pastosa ? ', ' : ' + ') || 'Conforme disponibilidade do estoque'

  const meals: Meals = {
    breakfast: line([groups.dairy[0] ?? pick('egg'), prep(carb())]),
    morningSnack: line([pick('fruit') ?? pick('light')]),
    lunch: line([prep(carb()), prep(protein()), cooked(veg())]),
    afternoonSnack: line([light()]),
    dinner: line([prep(protein()), cooked(veg()), groups.carb[0] ? `${groups.carb[0]} (porção leve)` : null]),
    supper: line([groups.dairy[0] ?? pick('light')]),
  }

  // Score simbólico: cobertura de refeições e categorias, ajustado pelo risco.
  const categoriesPresent = (Object.keys(groups) as Category[]).filter((c) => groups[c].length).length
  let score = 62 + categoriesPresent * 5
  if (patient.nutritional_risk === 'Alto') score -= 6
  else if (patient.nutritional_risk === 'Moderado') score -= 3
  score = Math.max(60, Math.min(96, score))

  return { meals, score, ingredients: [...used] }
}
