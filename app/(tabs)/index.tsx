import { useAuth } from '@/context/auth';
import { useAppLayout } from '@/hooks/useAppLayout';
import { usePremiumTheme } from '@/context/theme';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { calculateCalorieGoal } from '@/utils/onboarding';
import { DiaryAPI, type MealEntry } from '@/services/api';

const DAYS  = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MEALS = ['Café da manhã', 'Almoço', 'Lanche', 'Jantar'];

function getWeekDays() {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - today.getDay() + i);
    return d;
  });
}

// Anel de progresso simples com View
function CalRing({ eaten, goal, C }: { eaten: number; goal: number; C: any }) {
  const pct = Math.min(eaten / goal, 1);
  const remaining = goal - eaten;
  return (
    <View style={r.wrap}>
      {/* Anel externo (fundo) */}
      <View style={[r.ring, { borderColor: C.primaryLight }]}>
        {/* Preenchimento simulado com borda colorida no topo */}
        <View style={[r.ringFill, { borderTopColor: C.primary, borderRightColor: pct > 0.25 ? C.primary : C.primarySoft, borderBottomColor: pct > 0.5 ? C.primary : C.primarySoft, borderLeftColor: pct > 0.75 ? C.primary : C.primarySoft }]} />
        <View style={[r.inner, { backgroundColor: C.surface }]}>
          <Text style={[r.eaten, { color: C.text }]}>{eaten}</Text>
          <Text style={[r.unit, { color: C.textMuted }]}>kcal</Text>
          <Text style={[r.label, { color: C.textMuted }]}>consumidas</Text>
        </View>
      </View>
      <View style={r.stats}>
        <View style={r.statItem}>
          <Text style={[r.statVal, { color: C.primary }]}>{goal}</Text>
          <Text style={[r.statLbl, { color: C.textMuted }]}>Meta</Text>
        </View>
        <View style={[r.statDivider, { backgroundColor: C.border }]} />
        <View style={r.statItem}>
          <Text style={[r.statVal, { color: remaining > 0 ? C.warning : C.primary }]}>{Math.abs(remaining)}</Text>
          <Text style={[r.statLbl, { color: C.textMuted }]}>{remaining > 0 ? 'Restam' : 'Excesso'}</Text>
        </View>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const { user, notificacoes } = useAuth();
  const { colors: C } = usePremiumTheme();
  const { topPad } = useAppLayout();
  const today = new Date(), weekDays = getWeekDays();
  const firstName = user?.name?.split(' ')[0] || 'você';
  const calorieGoal = calculateCalorieGoal({
    weight: user?.weight || '', height: user?.height || '', birthDate: user?.birthDate || '',
    sexo: user?.sexo || '', activityLevel: user?.activityLevel || '', goal: user?.goal || '', targetWeight: user?.targetWeight || '',
  });
  const [selectedDay, setSelectedDay] = useState(today.getDay());
  const [mealModal, setMealModal]     = useState(false);
  const [meals, setMeals]             = useState<Record<string, { description: string; calories: string }>>({});
  const [mealEntries, setMealEntries] = useState<MealEntry[]>([]);
  const [savingMeals, setSavingMeals] = useState(false);
  const unread = notificacoes?.filter(n => !n.lida).length ?? 0;
  const eatenCalories = Math.round(mealEntries.reduce((total, entry) => total + Number(entry.calories), 0));
  const loadMeals = async () => setMealEntries(await DiaryAPI.meals());
  useEffect(() => { loadMeals().catch(() => {}); }, []);
  const saveMeals = async () => {
    const pending = MEALS.map(meal => ({ meal, ...meals[meal] }))
      .filter(item => item.description?.trim() && Number(item.calories) > 0);
    if (!pending.length) { Alert.alert('Refeição não registrada', 'Informe o alimento e as calorias de pelo menos uma refeição.'); return; }
    setSavingMeals(true);
    try {
      await Promise.all(pending.map(item => DiaryAPI.addMeal({ mealType: item.meal, description: item.description.trim(), calories: Number(item.calories) })));
      await loadMeals(); setMeals({}); setMealModal(false);
    } catch (error) {
      Alert.alert('Erro', error instanceof Error ? error.message : 'Não foi possível registrar as refeições.');
    } finally { setSavingMeals(false); }
  };
  const deleteMeal = async (id: number) => {
    try { await DiaryAPI.deleteMeal(id); await loadMeals(); }
    catch (error) { Alert.alert('Erro', error instanceof Error ? error.message : 'Não foi possível remover a refeição.'); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={[s.scroll, { paddingTop: topPad }]} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <View style={{ flex: 1 }}>
            <Text style={[s.greeting, { color: C.text }]} numberOfLines={1}>Olá, {firstName} 👋</Text>
            <Text style={[s.date, { color: C.textMuted }]}>{today.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <TouchableOpacity onPress={() => router.push('/notifications')} style={[s.avatar, { backgroundColor: C.primarySoft }]}>
              <Ionicons name="notifications-outline" size={20} color={C.primary} />
              {unread > 0 && <View style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: 4, backgroundColor: C.danger }} />}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(tabs)/profile')} style={[s.avatar, { backgroundColor: C.primary }]}>
              <Text style={s.avatarLetter}>{user?.name?.[0]?.toUpperCase() || 'U'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Card calorias com anel */}
        <View style={[s.card, { backgroundColor: C.surface }]}>
          <View style={s.cardHeader}>
            <Text style={[s.cardTitle, { color: C.text }]}>Calorias de hoje</Text>
            <TouchableOpacity style={[s.addBtn, { backgroundColor: C.primary }]} onPress={() => setMealModal(true)}>
              <Ionicons name="add" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
          <CalRing eaten={eatenCalories} goal={calorieGoal} C={C} />
        </View>

        {/* Calendário semanal */}
        <View style={[s.card, { backgroundColor: C.surface }]}>
          <View style={s.cardHeader}>
            <Text style={[s.cardTitle, { color: C.text }]}>Esta semana</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/history')}>
              <Text style={[s.cardLink, { color: C.primary }]}>Ver histórico</Text>
            </TouchableOpacity>
          </View>
          <View style={s.weekRow}>
            {weekDays.map((d, i) => {
              const isSelected = i === selectedDay;
              const isToday = i === today.getDay();
              return (
                <TouchableOpacity key={i} style={[s.dayCell, isSelected && { backgroundColor: C.primary }]} onPress={() => setSelectedDay(i)}>
                  <Text style={[s.dayName, { color: isSelected ? 'rgba(255,255,255,0.8)' : C.textMuted }]}>{DAYS[i]}</Text>
                  <Text style={[s.dayNum, { color: isSelected ? '#fff' : C.text }]}>{d.getDate()}</Text>
                  {isToday && <View style={[s.todayDot, { backgroundColor: isSelected ? '#fff' : C.primary }]} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Atalhos rápidos */}
        <View style={s.shortcutsRow}>
          {[
            { icon: 'water-outline'               as const, label: 'Água',     route: '/(tabs)/water'    },
            { icon: 'body-outline'                as const, label: 'IMC',      route: '/(tabs)/bmi'      },
            { icon: 'stats-chart-outline'         as const, label: 'Evolução', route: '/(tabs)/trends'   },
            { icon: 'fitness-outline'             as const, label: 'Medidas',  route: '/nutri/tracking'  },
          ].map(item => (
            <TouchableOpacity key={item.label} style={[s.shortcut, { backgroundColor: C.surface }]} onPress={() => router.push(item.route as any)}>
              <View style={[s.shortcutIcon, { backgroundColor: C.surface2 }]}>
                <Ionicons name={item.icon} size={20} color={C.primary} />
              </View>
              <Text style={[s.shortcutLabel, { color: C.textMuted }]} numberOfLines={1}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Refeições do dia */}
        <View style={[s.card, { backgroundColor: C.surface }]}>
          <View style={s.cardHeader}>
            <Text style={[s.cardTitle, { color: C.text }]}>Refeições de hoje</Text>
            <TouchableOpacity onPress={() => setMealModal(true)}>
              <Text style={[s.cardLink, { color: C.primary }]}>+ Adicionar</Text>
            </TouchableOpacity>
          </View>
          {mealEntries.map((meal, i) => (
            <View key={meal.id} style={[s.mealRow, i < mealEntries.length - 1 && { borderBottomWidth: 1, borderBottomColor: C.border }]}>
              <View style={[s.mealDot, { backgroundColor: C.primary }]}><Ionicons name="checkmark" size={12} color="#fff" /></View>
              <View style={{ flex: 1 }}>
                <Text style={[s.mealName, { color: C.text }]}>{meal.mealType}</Text>
                <Text style={[s.mealTime, { color: C.textDim }]} numberOfLines={2}>{meal.description}</Text>
              </View>
              <Text style={[s.mealKcal, { color: C.primary }]}>{Math.round(Number(meal.calories))} kcal</Text>
              <TouchableOpacity accessibilityLabel="Remover refeição" onPress={() => deleteMeal(meal.id)}>
                <Ionicons name="close-circle-outline" size={20} color={C.textMuted} />
              </TouchableOpacity>
            </View>
          ))}
          {!mealEntries.length && <Text style={{ color: C.textMuted, fontSize: 14, paddingVertical: 10 }}>Nenhuma refeição registrada hoje.</Text>}
        </View>

        {/* Botão plano */}
        <TouchableOpacity style={[s.planBtn, { backgroundColor: C.primary }]} onPress={() => router.push('/(tabs)/plan')} activeOpacity={0.85}>
          <Ionicons name="nutrition-outline" size={18} color="#fff" />
          <Text style={s.planBtnText}>Ver plano alimentar completo</Text>
          <Ionicons name="chevron-forward" size={16} color="#fff" style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modal registrar refeição */}
      <Modal visible={mealModal} animationType="slide" presentationStyle="pageSheet">
        <View style={[s.modal, { backgroundColor: C.bg }]}>
          <View style={[s.modalHandle, { backgroundColor: C.border }]} />
          <Text style={[s.modalTitle, { color: C.text }]}>Registrar refeição</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {MEALS.map(meal => (
              <View key={meal} style={s.mealItem}>
                <Text style={[s.mealItemLabel, { color: C.textMuted }]}>{meal}</Text>
                <View style={[s.mealFieldWrap, { backgroundColor: C.surface, borderColor: C.border }]}>
                  <TextInput style={[s.mealInput, { color: C.text }]} placeholder="Alimentos consumidos"
                    value={meals[meal]?.description || ''} onChangeText={v => setMeals(m => ({ ...m, [meal]: { description: v, calories: m[meal]?.calories || '' } }))}
                    placeholderTextColor={C.textDim} />
                </View>
                <View style={[s.mealFieldWrap, { backgroundColor: C.surface, borderColor: C.border, marginTop: 8 }]}>
                  <TextInput style={[s.mealInput, { color: C.text }]} placeholder="Calorias (kcal)" keyboardType="decimal-pad"
                    value={meals[meal]?.calories || ''} onChangeText={v => setMeals(m => ({ ...m, [meal]: { description: m[meal]?.description || '', calories: v.replace(',', '.') } }))}
                    placeholderTextColor={C.textDim} />
                </View>
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity disabled={savingMeals} style={[s.modalBtn, { backgroundColor: C.primary, opacity: savingMeals ? 0.6 : 1 }]}
            onPress={saveMeals}>
            <Text style={s.modalBtnText}>{savingMeals ? 'Salvando…' : 'Registrar'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.cancelBtn} onPress={() => setMealModal(false)}>
            <Text style={[s.cancelText, { color: C.textMuted }]}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  scroll:        { padding: 20 },
  header:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting:      { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  date:          { fontSize: 13, marginTop: 2, fontWeight: '400', textTransform: 'capitalize' },
  avatar:        { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  avatarLetter:  { fontSize: 17, fontWeight: '800', color: '#fff' },
  card:          { borderRadius: 20, padding: 18, marginBottom: 14,
                   shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 },
  cardHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  cardTitle:     { fontSize: 16, fontWeight: '700' },
  cardLink:      { fontSize: 13, fontWeight: '600' },
  addBtn:        { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  weekRow:       { flexDirection: 'row', justifyContent: 'space-between' },
  dayCell:       { flex: 1, minWidth: 40, alignItems: 'center', paddingVertical: 8, paddingHorizontal: 4, borderRadius: 12, gap: 4 },
  dayName:       { fontSize: 10, fontWeight: '600' },
  dayNum:        { fontSize: 15, fontWeight: '800' },
  todayDot:      { width: 4, height: 4, borderRadius: 2 },
  shortcutsRow:  { flexDirection: 'row', gap: 10, marginBottom: 14 },
  shortcut:      { flex: 1, minWidth: 72, borderRadius: 16, padding: 12, alignItems: 'center', gap: 6,
                   shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  shortcutIcon:  { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  shortcutLabel: { fontSize: 10, fontWeight: '600' },
  mealRow:       { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  mealDot:       { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  mealName:      { fontSize: 14, fontWeight: '600' },
  mealTime:      { fontSize: 12, marginTop: 1 },
  mealKcal:      { fontSize: 13, fontWeight: '700' },
  planBtn:       { borderRadius: 16, height: 54, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, gap: 10,
                   shadowColor: '#22C55E', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  planBtnText:   { fontSize: 15, fontWeight: '700', color: '#fff' },
  modal:         { flex: 1, padding: 24, paddingTop: 16 },
  modalHandle:   { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  modalTitle:    { fontSize: 20, fontWeight: '800', marginBottom: 20 },
  mealItem:      { marginBottom: 14 },
  mealItemLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  mealFieldWrap: { borderRadius: 12, borderWidth: 1 },
  mealInput:     { padding: 14, fontSize: 14 },
  modalBtn:      { borderRadius: 14, height: 52, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  modalBtnText:  { fontSize: 16, fontWeight: '700', color: '#fff' },
  cancelBtn:     { alignItems: 'center', padding: 14 },
  cancelText:    { fontSize: 14, fontWeight: '600' },
});

const r = StyleSheet.create({
  wrap:      { alignItems: 'center', gap: 16, paddingVertical: 8 },
  ring:      { width: 160, height: 160, borderRadius: 80, borderWidth: 12, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  ringFill:  { position: 'absolute', width: 160, height: 160, borderRadius: 80, borderWidth: 12, borderTopColor: '#22C55E', borderRightColor: '#22C55E', borderBottomColor: '#22C55E', borderLeftColor: '#DCFCE7' },
  inner:     { width: 112, height: 112, borderRadius: 56, alignItems: 'center', justifyContent: 'center', gap: 2 },
  eaten:     { fontSize: 28, fontWeight: '900', letterSpacing: -1 },
  unit:      { fontSize: 12, fontWeight: '600' },
  label:     { fontSize: 10, fontWeight: '500' },
  stats:     { flexDirection: 'row', gap: 32, alignItems: 'center' },
  statItem:  { alignItems: 'center', gap: 2 },
  statVal:   { fontSize: 18, fontWeight: '800' },
  statLbl:   { fontSize: 11, fontWeight: '500' },
  statDivider:{ width: 1, height: 28 },
});
