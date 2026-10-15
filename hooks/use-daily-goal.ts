import { useAuth } from '@/context/auth';
import { useDiary } from '@/context/diary';
import { calculateCalorieGoal } from '@/utils/onboarding';

/**
 * A meta do dia vem do perfil ou da meta salva. Calorias prescritas pertencem
 * a cada refeição e nunca substituem o objetivo diário.
 */
export function useDailyGoal() {
  const { user } = useAuth();
  const { calorieTarget } = useDiary();
  const calculated = user ? calculateCalorieGoal(user) : 0;
  const fromPlan = false;
  const savedGoal = calorieTarget?.origem === 'plano' ? 0 : calorieTarget?.calorias || 0;
  const goal = calculated || savedGoal;
  return { goal, fromPlan };
}
