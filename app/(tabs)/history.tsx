import { usePremiumTheme } from '@/context/theme';
import { useAppLayout } from '@/hooks/useAppLayout';
import { useAuth } from '@/context/auth';
import { DiaryAPI, recentLocalDates } from '@/services/api';
import { calculateCalorieGoal } from '@/utils/onboarding';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';

type DayRecord = { date: string; day: string; status: 'green' | 'yellow' | 'red' | 'empty'; label: string; calories: number };
const DAY_NAMES = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];

export default function HistoryScreen() {
  const { colors: C } = usePremiumTheme();
  const { topPad } = useAppLayout();
  const { user } = useAuth();
  const [history, setHistory] = useState<DayRecord[]>([]);
  const calorieGoal = calculateCalorieGoal({ weight: user?.weight || '', height: user?.height || '', birthDate: user?.birthDate || '', sexo: user?.sexo || '', activityLevel: user?.activityLevel || '', goal: user?.goal || '', targetWeight: user?.targetWeight || '' });

  useEffect(() => {
    Promise.all(recentLocalDates(7).map(async date => {
      const entries = await DiaryAPI.meals(date);
      const calories = Math.round(entries.reduce((sum, entry) => sum + Number(entry.calories), 0));
      const dayDate = new Date(`${date}T12:00:00`);
      const status = calories === 0 ? 'empty' : calories <= calorieGoal * 1.05 ? 'green' : calories <= calorieGoal * 1.25 ? 'yellow' : 'red';
      return { date: dayDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), day: DAY_NAMES[dayDate.getDay()], calories, status, label: status === 'empty' ? 'Sem dados' : status === 'green' ? 'Dentro da meta' : status === 'yellow' ? 'Acima da meta' : 'Muito acima' } as DayRecord;
    })).then(setHistory).catch(error => Alert.alert('Erro', error instanceof Error ? error.message : 'Não foi possível carregar o histórico.'));
  }, [calorieGoal]);

  const statusStyles = {
    green: { color: C.success, bg: C.surface2 },
    yellow: { color: C.warning, bg: C.yellowLight },
    red: { color: C.danger, bg: C.dangerLight },
    empty: { color: C.textMuted, bg: C.surface2 },
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 20, paddingTop: topPad, gap: 10 }}>
      <Text style={{ fontSize: 26, fontWeight: '800', color: C.text, letterSpacing: -0.5 }}>Histórico</Text>
      <Text style={{ fontSize: 14, color: C.textMuted, marginBottom: 8 }}>Calorias registradas nos últimos sete dias</Text>
      <View style={{ flexDirection: 'row', gap: 16, marginBottom: 4 }}>
        {[{ color: C.success, label: 'Dentro da meta' }, { color: C.warning, label: 'Acima' }, { color: C.textMuted, label: 'Sem dados' }].map(item => (
          <View key={item.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: item.color }} />
            <Text style={{ fontSize: 12, color: C.textMuted }}>{item.label}</Text>
          </View>
        ))}
      </View>
      {history.map(item => {
        const style = statusStyles[item.status];
        return <View key={item.date + item.day} style={{ backgroundColor: C.surface, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14,
          shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}>
          <View style={{ width: 5, height: 44, borderRadius: 3, backgroundColor: style.color }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: C.text }}>{item.day}</Text>
            <Text style={{ fontSize: 13, color: C.textMuted, marginTop: 2 }}>{item.date}</Text>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 4 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: C.text }}>{item.calories.toLocaleString('pt-BR')} kcal</Text>
            <View style={{ borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, backgroundColor: style.bg }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: style.color }}>{item.label}</Text>
            </View>
          </View>
        </View>;
      })}
    </ScrollView>
  );
}
