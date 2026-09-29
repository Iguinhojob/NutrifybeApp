export type FoodCategory = 'Pratos básicos' | 'Proteínas' | 'Café e lanches' | 'Frutas' | 'Legumes e verduras';

export type FoodCatalogItem = {
  id: string;
  name: string;
  aliases: string[];
  category: FoodCategory;
  portion: { singular: string; plural: string; grams: number };
  per100g: { calories: number; carbs: number; protein: number; fat: number };
};

export type CalculatedFood = {
  foodId: string;
  name: string;
  quantity: number;
  portionLabel: string;
  grams: number;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
};

export const FOOD_CATALOG: FoodCatalogItem[] = [
  { id: 'rice', name: 'Arroz branco cozido', aliases: ['arroz'], category: 'Pratos básicos', portion: { singular: 'colher de sopa cheia', plural: 'colheres de sopa cheias', grams: 25 }, per100g: { calories: 128, carbs: 28.1, protein: 2.5, fat: 0.2 } },
  { id: 'beans', name: 'Feijão carioca cozido', aliases: ['feijao', 'feijão'], category: 'Pratos básicos', portion: { singular: 'concha média', plural: 'conchas médias', grams: 80 }, per100g: { calories: 76, carbs: 13.6, protein: 4.8, fat: 0.5 } },
  { id: 'pasta', name: 'Macarrão cozido', aliases: ['massa', 'macarrao'], category: 'Pratos básicos', portion: { singular: 'colher de servir', plural: 'colheres de servir', grams: 80 }, per100g: { calories: 157, carbs: 30.9, protein: 5.8, fat: 0.9 } },
  { id: 'potato', name: 'Batata inglesa cozida', aliases: ['batata'], category: 'Pratos básicos', portion: { singular: 'unidade média', plural: 'unidades médias', grams: 100 }, per100g: { calories: 52, carbs: 11.9, protein: 1.2, fat: 0 } },
  { id: 'sweet-potato', name: 'Batata-doce cozida', aliases: ['batata doce'], category: 'Pratos básicos', portion: { singular: 'pedaço médio', plural: 'pedaços médios', grams: 100 }, per100g: { calories: 77, carbs: 18.4, protein: 0.6, fat: 0.1 } },
  { id: 'couscous', name: 'Cuscuz de milho cozido', aliases: ['cuscuz'], category: 'Pratos básicos', portion: { singular: 'colher de sopa cheia', plural: 'colheres de sopa cheias', grams: 30 }, per100g: { calories: 113, carbs: 25.3, protein: 2.2, fat: 0.7 } },
  { id: 'chicken', name: 'Peito de frango grelhado', aliases: ['frango', 'peito'], category: 'Proteínas', portion: { singular: 'filé médio', plural: 'filés médios', grams: 100 }, per100g: { calories: 159, carbs: 0, protein: 32, fat: 2.5 } },
  { id: 'beef', name: 'Carne bovina grelhada', aliases: ['carne', 'bife', 'patinho'], category: 'Proteínas', portion: { singular: 'bife médio', plural: 'bifes médios', grams: 100 }, per100g: { calories: 219, carbs: 0, protein: 35.9, fat: 7.3 } },
  { id: 'ground-beef', name: 'Carne moída refogada', aliases: ['carne moida', 'carne moída'], category: 'Proteínas', portion: { singular: 'colher de servir', plural: 'colheres de servir', grams: 70 }, per100g: { calories: 212, carbs: 0, protein: 26.7, fat: 10.9 } },
  { id: 'fish', name: 'Peixe grelhado', aliases: ['peixe', 'tilapia', 'tilápia'], category: 'Proteínas', portion: { singular: 'filé médio', plural: 'filés médios', grams: 100 }, per100g: { calories: 128, carbs: 0, protein: 26, fat: 2.5 } },
  { id: 'egg', name: 'Ovo cozido', aliases: ['ovo'], category: 'Proteínas', portion: { singular: 'unidade', plural: 'unidades', grams: 50 }, per100g: { calories: 146, carbs: 0.6, protein: 13.3, fat: 9.5 } },
  { id: 'french-bread', name: 'Pão francês', aliases: ['pao', 'pão', 'pao frances'], category: 'Café e lanches', portion: { singular: 'unidade', plural: 'unidades', grams: 50 }, per100g: { calories: 300, carbs: 58.6, protein: 8, fat: 3.1 } },
  { id: 'whole-bread', name: 'Pão de forma integral', aliases: ['pao integral', 'pão integral'], category: 'Café e lanches', portion: { singular: 'fatia', plural: 'fatias', grams: 25 }, per100g: { calories: 253, carbs: 49.9, protein: 9.4, fat: 3.7 } },
  { id: 'tapioca', name: 'Tapioca pronta', aliases: ['beiju'], category: 'Café e lanches', portion: { singular: 'unidade média', plural: 'unidades médias', grams: 60 }, per100g: { calories: 289, carbs: 71.9, protein: 0.4, fat: 0.2 } },
  { id: 'cheese', name: 'Queijo minas frescal', aliases: ['queijo', 'minas'], category: 'Café e lanches', portion: { singular: 'fatia média', plural: 'fatias médias', grams: 30 }, per100g: { calories: 264, carbs: 3.2, protein: 17.4, fat: 20.2 } },
  { id: 'milk', name: 'Leite integral', aliases: ['leite'], category: 'Café e lanches', portion: { singular: 'copo de 200 ml', plural: 'copos de 200 ml', grams: 200 }, per100g: { calories: 61, carbs: 4.9, protein: 2.9, fat: 3.3 } },
  { id: 'yogurt', name: 'Iogurte natural', aliases: ['iogurte'], category: 'Café e lanches', portion: { singular: 'pote de 170 g', plural: 'potes de 170 g', grams: 170 }, per100g: { calories: 51, carbs: 1.9, protein: 4.1, fat: 3 } },
  { id: 'oats', name: 'Aveia em flocos', aliases: ['aveia'], category: 'Café e lanches', portion: { singular: 'colher de sopa', plural: 'colheres de sopa', grams: 15 }, per100g: { calories: 394, carbs: 66.6, protein: 13.9, fat: 8.5 } },
  { id: 'peanuts', name: 'Amendoim torrado', aliases: ['amendoim'], category: 'Café e lanches', portion: { singular: 'punhado pequeno', plural: 'punhados pequenos', grams: 25 }, per100g: { calories: 606, carbs: 18.7, protein: 22.5, fat: 54 } },
  { id: 'sugar', name: 'Açúcar', aliases: ['acucar', 'açúcar'], category: 'Café e lanches', portion: { singular: 'colher de chá', plural: 'colheres de chá', grams: 5 }, per100g: { calories: 387, carbs: 99.6, protein: 0, fat: 0 } },
  { id: 'olive-oil', name: 'Azeite ou óleo', aliases: ['azeite', 'oleo', 'óleo'], category: 'Café e lanches', portion: { singular: 'colher de chá', plural: 'colheres de chá', grams: 5 }, per100g: { calories: 884, carbs: 0, protein: 0, fat: 100 } },
  { id: 'banana', name: 'Banana-prata', aliases: ['banana'], category: 'Frutas', portion: { singular: 'unidade média', plural: 'unidades médias', grams: 70 }, per100g: { calories: 98, carbs: 26, protein: 1.3, fat: 0.1 } },
  { id: 'apple', name: 'Maçã com casca', aliases: ['maca', 'maçã'], category: 'Frutas', portion: { singular: 'unidade média', plural: 'unidades médias', grams: 130 }, per100g: { calories: 56, carbs: 15.2, protein: 0.3, fat: 0 } },
  { id: 'papaya', name: 'Mamão papaia', aliases: ['mamao', 'mamão'], category: 'Frutas', portion: { singular: 'meia unidade', plural: 'meias unidades', grams: 150 }, per100g: { calories: 40, carbs: 10.4, protein: 0.5, fat: 0.1 } },
  { id: 'orange', name: 'Laranja-pera', aliases: ['laranja'], category: 'Frutas', portion: { singular: 'unidade média', plural: 'unidades médias', grams: 140 }, per100g: { calories: 37, carbs: 8.9, protein: 1, fat: 0.1 } },
  { id: 'avocado', name: 'Abacate', aliases: ['abacate'], category: 'Frutas', portion: { singular: 'colher de sopa cheia', plural: 'colheres de sopa cheias', grams: 45 }, per100g: { calories: 96, carbs: 6, protein: 1.2, fat: 8.4 } },
  { id: 'lettuce', name: 'Alface', aliases: ['salada'], category: 'Legumes e verduras', portion: { singular: 'prato de sobremesa', plural: 'pratos de sobremesa', grams: 30 }, per100g: { calories: 15, carbs: 2.9, protein: 1.7, fat: 0.1 } },
  { id: 'tomato', name: 'Tomate', aliases: ['tomate'], category: 'Legumes e verduras', portion: { singular: 'unidade média', plural: 'unidades médias', grams: 100 }, per100g: { calories: 15, carbs: 3.1, protein: 1.1, fat: 0.2 } },
  { id: 'broccoli', name: 'Brócolis cozido', aliases: ['brocolis', 'brócolis'], category: 'Legumes e verduras', portion: { singular: 'colher de servir', plural: 'colheres de servir', grams: 60 }, per100g: { calories: 25, carbs: 4.4, protein: 2.1, fat: 0.5 } },
  { id: 'carrot', name: 'Cenoura cozida', aliases: ['cenoura'], category: 'Legumes e verduras', portion: { singular: 'colher de servir', plural: 'colheres de servir', grams: 45 }, per100g: { calories: 30, carbs: 6.7, protein: 0.8, fat: 0.2 } },
];

export const normalizeFoodSearch = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

export function calculateFood(food: FoodCatalogItem, quantity: number): CalculatedFood {
  const factor = food.portion.grams * quantity / 100;
  return {
    foodId: food.id,
    name: food.name,
    quantity,
    portionLabel: quantity <= 1 ? food.portion.singular : food.portion.plural,
    grams: Math.round(food.portion.grams * quantity),
    calories: Math.round(food.per100g.calories * factor),
    carbs: Math.round(food.per100g.carbs * factor * 10) / 10,
    protein: Math.round(food.per100g.protein * factor * 10) / 10,
    fat: Math.round(food.per100g.fat * factor * 10) / 10,
  };
}

export const formatFoodQuantity = (quantity: number) => {
  if (Number.isInteger(quantity)) return quantity.toLocaleString('pt-BR');
  const whole = Math.floor(quantity);
  return whole ? `${whole}½` : '½';
};
