export type CalorieMeal = { id: string; name: string; calories: number; createdAt: string; referenceId?: string };
export type PlannedMeal = { indice: number; nome: string; horario: string };
export const nutritionNumber = (value: number, decimals = 0) => (Number.isFinite(value) ? value : 0).toLocaleString('pt-BR', { maximumFractionDigits: decimals });
const normalize = (name: string) => name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
function category(name: string) {
  const text = normalize(name);
  if (/cafe|breakfast/.test(text)) return 'breakfast';
  if (/almoco|lunch/.test(text)) return 'lunch';
  if (/jantar|dinner/.test(text)) return 'dinner';
  if (/ceia/.test(text)) return 'supper';
  if (/lanche|snack/.test(text)) return 'snack';
  return text;
}
const fallbackHour: Record<string, number> = { breakfast: 8, lunch: 12, snack: 16, dinner: 19, supper: 22 };
function mealTime(meal: CalorieMeal, plan: PlannedMeal[]) {
  if (meal.createdAt.includes('T')) {
    const time = new Date(meal.createdAt);
    if (Number.isFinite(time.getTime())) return { order: time.getHours() * 60 + time.getMinutes() + time.getSeconds() / 60, label: time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }), estimated: false };
  }
  const planned = plan.find(item => normalize(item.nome) === normalize(meal.name));
  const clock = planned?.horario.match(/^(\d{1,2}):(\d{2})$/);
  return { order: clock ? Number(clock[1]) * 60 + Number(clock[2]) : (fallbackHour[category(meal.name)] ?? 23) * 60, label: '', estimated: true };
}
export function calorieEvolution(meals: CalorieMeal[], goal: number | null, plan: PlannedMeal[] = []) {
  let accumulated = 0;
  const points = meals.filter(meal => Number.isFinite(meal.calories) && meal.calories >= 0)
    .map((meal, index) => ({ ...meal, index, time: mealTime(meal, plan) }))
    .sort((a, b) => a.time.order - b.time.order || Number(a.id) - Number(b.id) || a.index - b.index)
    .map(meal => { accumulated += meal.calories; return { ...meal, accumulated: Math.round(accumulated * 10) / 10 }; });
  const remainingPlan = [...plan];
  for (const meal of points) {
    let match = remainingPlan.findIndex(item => meal.referenceId?.startsWith('nutrifybe:prescribed-meals:') && meal.referenceId.endsWith(`:${item.indice}`));
    if (match < 0) match = remainingPlan.findIndex(item => normalize(item.nome) === normalize(meal.name));
    if (match < 0) match = remainingPlan.findIndex(item => category(item.nome) === category(meal.name));
    if (match >= 0) remainingPlan.splice(match, 1);
  }
  const target = goal != null && Number.isFinite(goal) && goal > 0 ? goal : null;
  const total = Math.round(accumulated * 10) / 10;
  const ratio = target ? total / target : 0;
  const band = ratio > 1 ? 'above' : ratio >= .9 ? 'near' : ratio >= .5 ? 'progress' : 'neutral';
  const missing = target ? Math.max(0, target - total) : 0;
  const message = target == null ? 'Defina uma meta para acompanhar seu progresso.' : ratio > 1
    ? `Você passou ${nutritionNumber(total - target)} kcal da meta hoje`
    : ratio === 1 ? 'Meta atingida!' : `Faltam ${nutritionNumber(missing)} kcal para sua meta`;
  return { points, total, target, ratio, band, message, remaining: remainingPlan.length,
    estimate: missing > 0 && remainingPlan.length > 0 ? Math.round(missing / remainingPlan.length) : null };
}
