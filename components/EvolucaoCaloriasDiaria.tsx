import { useAuth } from '@/context/auth';
import { useDiary } from '@/context/diary';
import { usePremiumTheme } from '@/context/theme';
import { calculateCalorieGoal } from '@/utils/onboarding';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { GraficoEvolucaoCalorias } from './GraficoEvolucaoCalorias';

export function EvolucaoCaloriasDiaria() {
  const { user } = useAuth();
  const { colors: C } = usePremiumTheme();
  const { mealsToday, ready, calorieTarget, goalLoading, goalError, refreshCalorieTarget } = useDiary();
  useFocusEffect(useCallback(() => { void refreshCalorieTarget(); }, [refreshCalorieTarget]));
  const macros = useMemo(() => mealsToday.reduce((sum, meal) => ({
    protein: sum.protein + (meal.protein ?? 0), carbs: sum.carbs + (meal.carbs ?? 0),
    fat: sum.fat + (meal.fat ?? 0), fiber: sum.fiber + (meal.fiber ?? 0),
  }), { protein: 0, carbs: 0, fat: 0, fiber: 0 }), [mealsToday]);
  const calculatedGoal = user ? calculateCalorieGoal(user) : 0;
  const target = calorieTarget?.origem === 'plano'
    ? calorieTarget.calorias
    : calculatedGoal || calorieTarget?.calorias || null;

  return <View style={{ gap: 10 }}>
    {!ready || (goalLoading && !calorieTarget) ? <View style={{ minHeight: 230, borderRadius: 24, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: C.surface }}><ActivityIndicator color={C.primary} /><Text style={{ color: C.textMuted }}>Carregando seu dia…</Text></View> : <GraficoEvolucaoCalorias
      refeicoes={mealsToday} metaDiaria={target} macros={macros} refeicoesPlanejadas={calorieTarget?.refeicoes}
      origemMeta={calorieTarget?.origem === 'plano' ? 'plano' : 'calculada'} />}
    {!!goalError && <Pressable accessibilityRole="button" disabled={goalLoading} onPress={() => void refreshCalorieTarget()} style={{ borderRadius: 14, padding: 14, backgroundColor: C.surface2 }}><Text style={{ color: C.textMuted, fontSize: 12 }}>{goalLoading ? 'Tentando novamente…' : goalError}</Text></Pressable>}
  </View>;
}
