import type { User } from '@/context/auth';
import { calculateCalorieGoal } from '@/utils/onboarding';

export type PantryGroup = 'protein' | 'carb' | 'fruit' | 'vegetable' | 'extra';

export type PantryFood = {
  id: string;
  label: string;
  group: PantryGroup;
  kcalPer100g: number;
  animal?: boolean;
  meat?: boolean;
  dairy?: boolean;
  gluten?: boolean;
  unitGrams?: number;
  unitLabel?: string;
};

export const PANTRY_GROUP_LABELS: Record<PantryGroup, string> = {
  protein: 'Proteínas', carb: 'Carboidratos', fruit: 'Frutas', vegetable: 'Verduras e legumes', extra: 'Complementos',
};

export const PANTRY_FOODS: PantryFood[] = [
  { id: 'chicken', label: 'Frango grelhado', group: 'protein', kcalPer100g: 165, animal: true, meat: true },
  { id: 'beef', label: 'Carne bovina magra', group: 'protein', kcalPer100g: 219, animal: true, meat: true },
  { id: 'fish', label: 'Peixe assado', group: 'protein', kcalPer100g: 150, animal: true, meat: true },
  { id: 'eggs', label: 'Ovos', group: 'protein', kcalPer100g: 143, animal: true, unitGrams: 50, unitLabel: 'un.' },
  { id: 'tofu', label: 'Tofu', group: 'protein', kcalPer100g: 76 },
  { id: 'lentils', label: 'Lentilha cozida', group: 'protein', kcalPer100g: 116 },
  { id: 'chickpeas', label: 'Grão-de-bico cozido', group: 'protein', kcalPer100g: 164 },
  { id: 'beans', label: 'Feijão cozido', group: 'protein', kcalPer100g: 76 },
  { id: 'yogurt', label: 'Iogurte natural', group: 'protein', kcalPer100g: 61, animal: true, dairy: true },

  { id: 'rice', label: 'Arroz cozido', group: 'carb', kcalPer100g: 130 },
  { id: 'bread', label: 'Pão integral', group: 'carb', kcalPer100g: 247, gluten: true, unitGrams: 25, unitLabel: 'fatia(s)' },
  { id: 'tapioca', label: 'Tapioca', group: 'carb', kcalPer100g: 230 },
  { id: 'oats', label: 'Aveia', group: 'carb', kcalPer100g: 389, gluten: true },
  { id: 'potato', label: 'Batata inglesa cozida', group: 'carb', kcalPer100g: 87 },
  { id: 'sweet-potato', label: 'Batata-doce cozida', group: 'carb', kcalPer100g: 86 },
  { id: 'pasta', label: 'Macarrão cozido', group: 'carb', kcalPer100g: 158, gluten: true },
  { id: 'corn-couscous', label: 'Cuscuz de milho', group: 'carb', kcalPer100g: 112 },

  { id: 'banana', label: 'Banana', group: 'fruit', kcalPer100g: 89, unitGrams: 90, unitLabel: 'un.' },
  { id: 'apple', label: 'Maçã', group: 'fruit', kcalPer100g: 52, unitGrams: 130, unitLabel: 'un.' },
  { id: 'papaya', label: 'Mamão', group: 'fruit', kcalPer100g: 43 },
  { id: 'orange', label: 'Laranja', group: 'fruit', kcalPer100g: 47, unitGrams: 130, unitLabel: 'un.' },
  { id: 'strawberry', label: 'Morango', group: 'fruit', kcalPer100g: 32 },
  { id: 'avocado', label: 'Abacate', group: 'fruit', kcalPer100g: 160 },

  { id: 'lettuce', label: 'Alface', group: 'vegetable', kcalPer100g: 15 },
  { id: 'tomato', label: 'Tomate', group: 'vegetable', kcalPer100g: 18 },
  { id: 'carrot', label: 'Cenoura', group: 'vegetable', kcalPer100g: 41 },
  { id: 'broccoli', label: 'Brócolis', group: 'vegetable', kcalPer100g: 35 },
  { id: 'zucchini', label: 'Abobrinha', group: 'vegetable', kcalPer100g: 17 },

  { id: 'olive-oil', label: 'Azeite', group: 'extra', kcalPer100g: 884 },
  { id: 'peanuts', label: 'Amendoim', group: 'extra', kcalPer100g: 567 },
  { id: 'chia', label: 'Chia', group: 'extra', kcalPer100g: 486 },
  { id: 'cheese', label: 'Queijo branco', group: 'extra', kcalPer100g: 264, animal: true, dairy: true },
  { id: 'milk', label: 'Leite', group: 'extra', kcalPer100g: 61, animal: true, dairy: true },
];

const DEFAULT_IDS = ['chicken', 'eggs', 'tofu', 'beans', 'yogurt', 'rice', 'bread', 'tapioca', 'potato', 'banana', 'apple', 'papaya', 'lettuce', 'tomato', 'carrot', 'broccoli', 'olive-oil', 'peanuts'];
const DAY_LABELS = [['seg', 'Segunda'], ['ter', 'Terça'], ['qua', 'Quarta'], ['qui', 'Quinta'], ['sex', 'Sexta'], ['sab', 'Sábado'], ['dom', 'Domingo']] as const;

export type NutriaMeal = {
  id: string;
  name: string;
  time: string;
  foods: string[];
  targetKcal: number;
  macros: { protein: number; carbs: number; fat: number };
};
export type NutriaDay = { key: string; label: string; meals: NutriaMeal[] };
export type NutriaPlan = {
  id: string;
  version: 1 | 2 | 3 | 4 | 5 | 6;
  createdAt: string;
  calorieTarget: number;
  goal: string;
  preferences: string[];
  pantry?: string[];
  macros: { protein: number; carbs: number; fat: number };
  days: NutriaDay[];
};

const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export function isFoodCompatible(food: PantryFood, user: User) {
  const preferences = normalize(user.restrictions ?? '');
  if (preferences.includes('vegana') && food.animal) return false;
  if (preferences.includes('vegetariana') && food.meat) return false;
  if (preferences.includes('sem lactose') && food.dairy) return false;
  if (preferences.includes('sem gluten') && food.gluten) return false;
  return true;
}

export function defaultPantryFor(user: User) {
  const compatible = PANTRY_FOODS.filter(food => isFoodCompatible(food, user));
  const defaults = compatible.filter(food => DEFAULT_IDS.includes(food.id)).map(food => food.id);
  for (const group of ['protein', 'carb'] as PantryGroup[]) {
    if (!defaults.some(id => compatible.find(food => food.id === id)?.group === group)) {
      const fallback = compatible.find(food => food.group === group);
      if (fallback) defaults.push(fallback.id);
    }
  }
  return defaults;
}

export function pantryError(ids: string[], user: User) {
  const selected = PANTRY_FOODS.filter(food => ids.includes(food.id) && isFoodCompatible(food, user));
  const missing = (['protein', 'carb'] as PantryGroup[]).filter(group => !selected.some(food => food.group === group));
  return missing.length ? `Selecione pelo menos uma opção em: ${missing.map(group => PANTRY_GROUP_LABELS[group]).join(', ')}.` : '';
}

function mealTargets(total: number) {
  const ratios = [0.22, 0.1, 0.33, 0.1];
  const values = ratios.map(ratio => Math.round(total * ratio / 10) * 10);
  return [...values, Math.max(total - values.reduce((sum, value) => sum + value, 0), 0)];
}

function macroTargets(total: number, goal: string) {
  const ratios = goal === 'Perder peso' ? { protein: 0.3, carbs: 0.4, fat: 0.3 }
    : goal === 'Ganhar massa' ? { protein: 0.25, carbs: 0.5, fat: 0.25 }
      : { protein: 0.25, carbs: 0.45, fat: 0.3 };
  return { protein: Math.round(total * ratios.protein / 4), carbs: Math.round(total * ratios.carbs / 4), fat: Math.round(total * ratios.fat / 9) };
}

function pick(pool: PantryFood[], offset: number) {
  return pool[offset % pool.length];
}

const PORTION_LIMITS: Record<string, { min: number; max: number }> = {
  chicken: { min: 80, max: 180 }, beef: { min: 80, max: 180 }, fish: { min: 90, max: 200 }, eggs: { min: 50, max: 150 },
  tofu: { min: 80, max: 200 }, lentils: { min: 80, max: 180 }, chickpeas: { min: 70, max: 180 }, beans: { min: 70, max: 160 }, yogurt: { min: 100, max: 200 },
  rice: { min: 70, max: 180 }, bread: { min: 25, max: 50 }, tapioca: { min: 40, max: 100 }, oats: { min: 20, max: 50 }, potato: { min: 100, max: 250 },
  'sweet-potato': { min: 100, max: 250 }, pasta: { min: 80, max: 180 }, 'corn-couscous': { min: 70, max: 180 },
  banana: { min: 90, max: 180 }, apple: { min: 130, max: 260 }, papaya: { min: 100, max: 250 }, orange: { min: 130, max: 260 }, strawberry: { min: 100, max: 250 }, avocado: { min: 50, max: 120 },
  lettuce: { min: 40, max: 100 }, tomato: { min: 60, max: 150 }, carrot: { min: 50, max: 120 }, broccoli: { min: 70, max: 150 }, zucchini: { min: 70, max: 150 },
  'olive-oil': { min: 5, max: 10 }, peanuts: { min: 10, max: 30 }, chia: { min: 5, max: 20 }, cheese: { min: 30, max: 60 }, milk: { min: 150, max: 250 },
};

function portion(food: PantryFood, rawGrams: number) {
  const limits = PORTION_LIMITS[food.id] ?? { min: 20, max: 200 };
  const bounded = Math.min(Math.max(rawGrams, limits.min), limits.max);
  if (food.unitGrams && food.unitLabel) {
    const units = Math.max(1, Math.round(bounded / food.unitGrams));
    const grams = Math.min(units * food.unitGrams, limits.max);
    return { text: `${Math.round(grams / food.unitGrams)} ${food.unitLabel} (aprox. ${grams} g)`, grams };
  }
  const grams = Math.round(bounded / 5) * 5;
  if (food.id === 'olive-oil') return { text: `${grams} ml`, grams };
  return { text: `${grams} g`, grams };
}

function composeMeal(target: number, items: { food: PantryFood; ratio: number; fixedGrams?: number }[]) {
  const merged = [...items.reduce((map, item) => {
    const existing = map.get(item.food.id);
    if (existing) {
      existing.ratio += item.ratio;
      existing.fixedGrams = (existing.fixedGrams ?? 0) + (item.fixedGrams ?? 0) || undefined;
    } else map.set(item.food.id, { ...item });
    return map;
  }, new Map<string, { food: PantryFood; ratio: number; fixedGrams?: number }>()).values()];
  const fixedKcal = merged.reduce((sum, item) => sum + (item.fixedGrams ? item.fixedGrams * item.food.kcalPer100g / 100 : 0), 0);
  const flexible = merged.filter(item => !item.fixedGrams);
  const flexibleRatio = flexible.reduce((sum, item) => sum + item.ratio, 0);
  const remainingKcal = Math.max(target - fixedKcal, target * 0.55);
  let estimatedKcal = 0;
  const foods = merged.map(item => {
    const desiredGrams = item.fixedGrams ?? (remainingKcal * item.ratio / flexibleRatio) / item.food.kcalPer100g * 100;
    const value = portion(item.food, desiredGrams);
    estimatedKcal += value.grams * item.food.kcalPer100g / 100;
    return `${item.food.label}: ${value.text}`;
  });
  return { foods, kcal: Math.max(1, Math.round(estimatedKcal / 5) * 5) };
}

export function generateNutriaPlan(user: User, requestedPantry?: string[]): NutriaPlan | null {
  const calorieTarget = calculateCalorieGoal(user);
  if (!calorieTarget) return null;
  const pantry = requestedPantry?.length ? requestedPantry : defaultPantryFor(user);
  if (pantryError(pantry, user)) return null;
  const selected = PANTRY_FOODS.filter(food => pantry.includes(food.id) && isFoodCompatible(food, user));
  const byGroup = (group: PantryGroup) => selected.filter(food => food.group === group);
  const proteins = byGroup('protein'), carbs = byGroup('carb'), fruits = byGroup('fruit'), vegetables = byGroup('vegetable'), extras = byGroup('extra');
  const targets = mealTargets(calorieTarget);
  const preferences = (user.restrictions ?? '').split(',').map(value => value.trim()).filter(value => value && normalize(value) !== 'nenhuma' && normalize(value) !== 'outras');
  const id = `nutria-${Date.now()}`;

  const mealFor = (day: number, meal: number): NutriaMeal => {
    const mainProteins = proteins.filter(food => food.id !== 'yogurt');
    const snackProteins = proteins.filter(food => ['eggs', 'tofu', 'yogurt'].includes(food.id));
    const breakfastCarbs = carbs.filter(food => ['bread', 'tapioca', 'oats', 'corn-couscous'].includes(food.id));
    const mainCarbs = carbs.filter(food => ['rice', 'potato', 'sweet-potato', 'pasta', 'corn-couscous'].includes(food.id));
    const protein = pick(mainProteins.length ? mainProteins : proteins, day + (meal === 4 ? 1 : 0));
    const breakfastProtein = pick(snackProteins.length ? snackProteins : proteins, day);
    const breakfastCarb = pick(breakfastCarbs.length ? breakfastCarbs : carbs, day + meal);
    const mainCarb = pick(mainCarbs.length ? mainCarbs : carbs, day * 2 + meal);
    const fruit = fruits.length ? pick(fruits, day + meal * 2) : null;
    const vegetable = vegetables.length ? pick(vegetables, day + meal) : null;
    const vegetable2 = vegetables.length > 1 ? pick(vegetables, day + meal + 1) : null;
    const snackProtein = snackProteins.length ? pick(snackProteins, day + meal) : null;
    const snackExtras = extras.filter(food => food.id !== 'olive-oil');
    const snackExtra = snackExtras.length ? pick(snackExtras, day + meal) : null;
    const mealExtras = extras.filter(food => ['olive-oil', 'cheese', 'chia'].includes(food.id));
    const mealExtra = mealExtras.length ? pick(mealExtras, day + meal) : null;
    type MealItem = { food: PantryFood; ratio: number; fixedGrams?: number };
    const compact = (items: (MealItem | null)[]) => items.filter((item): item is MealItem => item !== null);
    const definitions = [
      { name: 'Café da manhã', time: '07:00', items: compact([{ food: breakfastProtein, ratio: 0.38 }, { food: breakfastCarb, ratio: 0.42 }, fruit ? { food: fruit, ratio: 0.2 } : null]) },
      { name: 'Lanche da manhã', time: '10:00', items: compact([fruit ? { food: fruit, ratio: 0.4 } : { food: breakfastCarb, ratio: 0.4 }, { food: snackProtein ?? protein, ratio: 0.4 }, snackExtra ? { food: snackExtra, ratio: 0.2 } : null]) },
      { name: 'Almoço', time: '12:30', items: compact([{ food: protein, ratio: 0.45 }, { food: mainCarb, ratio: 0.47 }, vegetable ? { food: vegetable, ratio: 0, fixedGrams: 100 } : null, vegetable2 ? { food: vegetable2, ratio: 0, fixedGrams: 100 } : null, mealExtra ? { food: mealExtra, ratio: 0.08 } : null]) },
      { name: 'Lanche da tarde', time: '16:00', items: compact([fruit ? { food: fruit, ratio: 0.4 } : { food: breakfastCarb, ratio: 0.4 }, { food: snackProtein ?? protein, ratio: 0.4 }, snackExtra ? { food: snackExtra, ratio: 0.2 } : null]) },
      { name: 'Jantar', time: '19:30', items: compact([{ food: protein, ratio: 0.47 }, { food: mainCarb, ratio: 0.45 }, vegetable ? { food: vegetable, ratio: 0, fixedGrams: 100 } : null, vegetable2 ? { food: vegetable2, ratio: 0, fixedGrams: 100 } : null, mealExtra ? { food: mealExtra, ratio: 0.08 } : null]) },
    ];
    const definition = definitions[meal];
    const composed = composeMeal(targets[meal], definition.items);
    const macros = macroTargets(composed.kcal, user.goal);
    const targetKcal = macros.protein * 4 + macros.carbs * 4 + macros.fat * 9;
    return { id: `${DAY_LABELS[day][0]}-${meal}`, name: definition.name, time: definition.time, targetKcal, macros, foods: composed.foods };
  };

  return {
    id, version: 6, createdAt: new Date().toISOString(), calorieTarget, goal: user.goal, preferences, pantry: selected.map(food => food.id),
    macros: macroTargets(calorieTarget, user.goal),
    days: DAY_LABELS.map(([key, label], day) => ({ key, label, meals: targets.map((_, meal) => mealFor(day, meal)) })),
  };
}
