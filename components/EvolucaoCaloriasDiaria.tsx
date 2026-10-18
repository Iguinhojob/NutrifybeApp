import { useAuth } from '@/context/auth';
import { useDiary } from '@/context/diary';
import { usePremiumTheme } from '@/context/theme';
import { calculateCalorieGoal } from '@/utils/onboarding';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import GraficoCalorias from './GraficoCalorias';

export function EvolucaoCaloriasDiaria() {
  const { user } = useAuth();
  const { colors: C, isDark } = usePremiumTheme();
  const { caloriesToday, ready, calorieTarget, goalLoading, goalError, refreshCalorieTarget } = useDiary();
  useFocusEffect(useCallback(() => { void refreshCalorieTarget(); }, [refreshCalorieTarget]));
  const calculatedGoal = user ? calculateCalorieGoal(user) : 0;
  const savedGoal = calorieTarget?.origem === 'plano' ? 0 : calorieTarget?.calorias || 0;
  const target = calculatedGoal || savedGoal || null;

  return <View style={{ gap: 10 }}>
    {!ready || (goalLoading && !calorieTarget) ? <View style={{ minHeight: 230, borderRadius: 24, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: C.surface }}><ActivityIndicator color={C.primary} /><Text style={{ color: C.textMuted }}>Carregando seu dia…</Text></View> : <GraficoCalorias consumido={caloriesToday} meta={target ?? 0} escuro={isDark} />}
    {!!goalError && <Pressable accessibilityRole="button" disabled={goalLoading} onPress={() => void refreshCalorieTarget()} style={{ borderRadius: 14, padding: 14, backgroundColor: C.surface2 }}><Text style={{ color: C.textMuted, fontSize: 12 }}>{goalLoading ? 'Tentando novamente…' : goalError}</Text></Pressable>}
  </View>;
}
