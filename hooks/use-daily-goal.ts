import { useAuth } from '@/context/auth';
import { useDiary } from '@/context/diary';
import { calculateCalorieGoal } from '@/utils/onboarding';

/**
 * Meta calórica do dia, com a mesma regra já usada no gráfico da aba Evolução:
 * o plano alimentar do nutricionista tem prioridade; sem plano, vale a estimativa
 * calculada pelo app a partir do perfil (ou a meta devolvida pela API).
 */
export function useDailyGoal() {
  const { user } = useAuth();
  const { calorieTarget } = useDiary();
  const calculated = user ? calculateCalorieGoal(user) : 0;
  const fromPlan = calorieTarget?.origem === 'plano';
  const goal = fromPlan ? calorieTarget!.calorias : calculated || calorieTarget?.calorias || 0;
  return { goal, fromPlan };
}
