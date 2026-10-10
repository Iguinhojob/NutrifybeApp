import { useDiary } from '@/context/diary';
import { useAppLayout } from '@/hooks/useAppLayout';
import { usePremiumTheme } from '@/context/theme';
import { Ionicons } from '@expo/vector-icons';
import { localDateString } from '@/services/api';
import { formatFoodText } from '@/utils/foodNames';
import { ScrollView, Text, View } from 'react-native';

const dayKey = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : localDateString(new Date(value));

export default function HistoryScreen() {
  const { historyMeals, ready } = useDiary();
  const { colors: C } = usePremiumTheme();
  const { topPad } = useAppLayout();
  const days = historyMeals.reduce<Record<string, typeof historyMeals>>((result, meal) => {
    const key = meal.entryDate || dayKey(meal.createdAt);
    (result[key] ??= []).push(meal);
    return result;
  }, {});

  return <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 20, paddingTop: topPad, gap: 13, paddingBottom: 100 }}>
    <Text style={{ fontSize: 26, fontWeight: '900', color: C.text }}>Histórico alimentar</Text>
    <Text style={{ fontSize: 14, color: C.textMuted }}>O dia de hoje aparece aqui depois da virada da meia-noite.</Text>
    {!ready ? <View style={{ minHeight: 130, alignItems: 'center', justifyContent: 'center', gap: 9 }}><Ionicons name="sync-outline" size={28} color={C.primary} /><Text style={{ color: C.textMuted }}>Sincronizando histórico…</Text></View>
      : !Object.keys(days).length ? <View style={{ backgroundColor: C.surface, padding: 28, borderRadius: 20, alignItems: 'center', gap: 9 }}><Ionicons name="calendar-outline" size={36} color={C.textDim} /><Text style={{ color: C.text, fontWeight: '800' }}>Seu histórico ainda está vazio</Text><Text style={{ color: C.textMuted, textAlign: 'center' }}>Só mostramos registros que você realmente salvou.</Text></View>
      : Object.entries(days).sort(([a], [b]) => b.localeCompare(a)).map(([day, meals]) => <View key={day} style={{ backgroundColor: C.surface, borderRadius: 18, borderWidth: 1, borderColor: C.border, paddingHorizontal: 15, paddingTop: 14 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 11 }}><View><Text style={{ color: C.text, fontWeight: '900', textTransform: 'capitalize' }}>{new Date(`${day}T12:00:00`).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</Text><Text style={{ color: C.textMuted, fontSize: 11, marginTop: 3 }}>{meals.length} {meals.length === 1 ? 'refeição' : 'refeições'} registradas</Text></View><Text style={{ color: C.primary, fontWeight: '900' }}>{Math.round(meals.reduce((sum, meal) => sum + meal.calories, 0))} kcal</Text></View>
        {meals.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(meal => <View key={meal.id} style={{ borderTopWidth: 1, borderTopColor: C.border, paddingVertical: 12, flexDirection: 'row', gap: 9 }}><Ionicons name="restaurant-outline" size={17} color={C.primary} style={{ marginTop: 2 }} /><View style={{ flex: 1 }}><View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}><Text style={{ color: C.text, fontWeight: '800', flex: 1 }}>{meal.name}</Text><Text style={{ color: C.primary, fontSize: 12, fontWeight: '900' }}>{meal.calories} kcal</Text></View><Text style={{ color: C.textMuted, fontSize: 11, marginTop: 3 }}>{new Date(meal.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</Text>{meal.description ? <Text style={{ color: C.textMuted, fontSize: 12, lineHeight: 17, marginTop: 5 }}>{formatFoodText(meal.description)}</Text> : null}</View></View>)}
      </View>)}
  </ScrollView>;
}
