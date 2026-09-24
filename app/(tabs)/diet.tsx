import { usePremiumTheme } from '@/context/theme';
import { useAppLayout } from '@/hooks/useAppLayout';
import { DiaryAPI, localDateString, type MealEntry } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const DAY_NAMES = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
function thisWeekDates() {
  const today = new Date();
  const mondayOffset = (today.getDay() + 6) % 7;
  return DAY_NAMES.map((_, index) => {
    const date = new Date(today); date.setDate(today.getDate() - mondayOffset + index);
    return localDateString(date);
  });
}

export default function DietScreen() {
  const { colors: C } = usePremiumTheme();
  const { topPad } = useAppLayout();
  const dates = useMemo(thisWeekDates, []);
  const todayIndex = (new Date().getDay() + 6) % 7;
  const [selectedDay, setSelectedDay] = useState(todayIndex);
  const [entries, setEntries] = useState<MealEntry[]>([]);
  const selectedDate = dates[selectedDay];
  const totalKcal = Math.round(entries.reduce((sum, meal) => sum + Number(meal.calories), 0));
  const card = { backgroundColor: C.surface, borderRadius: 18, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 } as const;

  useEffect(() => {
    DiaryAPI.meals(selectedDate).then(setEntries).catch(error => Alert.alert('Erro', error instanceof Error ? error.message : 'Não foi possível carregar as refeições.'));
  }, [selectedDate]);

  return <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 20, paddingTop: topPad }}>
    <Text style={{ fontSize: 26, fontWeight: '800', color: C.text, letterSpacing: -0.5, marginBottom: 4 }}>Diário alimentar</Text>
    <Text style={{ fontSize: 14, color: C.textMuted, marginBottom: 20 }}>Refeições e calorias que você registrou nesta semana</Text>

    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
      {DAY_NAMES.map((day, index) => <TouchableOpacity key={day} style={{ paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999, marginRight: 8,
        backgroundColor: selectedDay === index ? C.primary : C.surface }} onPress={() => setSelectedDay(index)}>
        <Text style={{ fontSize: 14, fontWeight: '700', color: selectedDay === index ? '#fff' : C.textMuted }}>{day}</Text>
      </TouchableOpacity>)}
    </ScrollView>

    <View style={[card, { backgroundColor: C.primary, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
      <View>
        <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: '600' }}>Calorias registradas</Text>
        <Text style={{ fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: -1 }}>{totalKcal.toLocaleString('pt-BR')} kcal</Text>
      </View>
      <Ionicons name="restaurant-outline" size={28} color="#fff" />
    </View>

    {entries.map(meal => <View key={meal.id} style={card}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: C.primary, textTransform: 'uppercase', letterSpacing: 0.5 }}>{meal.mealType}</Text>
        <View style={{ backgroundColor: C.surface2, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: C.primaryDark }}>{Math.round(Number(meal.calories))} kcal</Text>
        </View>
      </View>
      <Text style={{ fontSize: 14, color: C.text, lineHeight: 20 }}>{meal.description}</Text>
      <Text style={{ fontSize: 11, color: C.textMuted, marginTop: 8 }}>{new Date(meal.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</Text>
    </View>)}

    {!entries.length && <View style={card}>
      <Text style={{ fontSize: 14, color: C.textMuted, lineHeight: 21, marginBottom: 14 }}>Nenhuma refeição registrada neste dia. Seus registros aparecerão aqui depois de adicionados.</Text>
      <TouchableOpacity onPress={() => router.push('/(tabs)')} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Ionicons name="add-circle-outline" size={19} color={C.primary} />
        <Text style={{ fontSize: 14, fontWeight: '700', color: C.primary }}>Adicionar refeição</Text>
      </TouchableOpacity>
    </View>}
    <View style={{ height: 100 }} />
  </ScrollView>;
}
