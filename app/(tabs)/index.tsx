import { useAuth } from '@/context/auth';
import { useAppLayout } from '@/hooks/useAppLayout';
import { usePremiumTheme } from '@/context/theme';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DAYS  = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MEALS = ['Café da manhã', 'Almoço', 'Lanche', 'Jantar'];
const CAL_EATEN = 1240, CAL_GOAL = 1840;

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
        <View style={[r.ringFill, { borderTopColor: C.primary, borderRightColor: pct > 0.25 ? C.primary : C.primaryLight, borderBottomColor: pct > 0.5 ? C.primary : C.primaryLight, borderLeftColor: pct > 0.75 ? C.primary : C.primaryLight }]} />
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
          <Text style={[r.statVal, { color: remaining > 0 ? C.orange : C.primary }]}>{Math.abs(remaining)}</Text>
          <Text style={[r.statLbl, { color: C.textMuted }]}>{remaining > 0 ? 'Restam' : 'Excesso'}</Text>
        </View>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const { user } = useAuth();
  const { colors: C } = usePremiumTheme();
  const { topPad } = useAppLayout();
  const today = new Date(), weekDays = getWeekDays();
  const firstName = user?.name?.split(' ')[0] || 'você';
  const [selectedDay, setSelectedDay] = useState(today.getDay());
  const [mealModal, setMealModal]     = useState(false);
  const [meals, setMeals]             = useState<Record<string, string>>({});

  const MACROS = [
    { label: 'Proteína', eaten: 98,  goal: 140, color: '#3B82F6', bg: '#EFF6FF' },
    { label: 'Carboidr.', eaten: 180, goal: 250, color: '#F97316', bg: '#FFF7ED' },
    { label: 'Gordura',  eaten: 44,  goal: 65,  color: '#EAB308', bg: '#FEFCE8' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={[s.scroll, { paddingTop: topPad }]} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <View style={{ flex: 1 }}>
            <Text style={[s.greeting, { color: C.text }]} numberOfLines={1}>Olá, {firstName} 👋</Text>
            <Text style={[s.date, { color: C.textMuted }]}>{today.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/profile')} style={[s.avatar, { backgroundColor: C.primary }]}>
            <Text style={s.avatarLetter}>{user?.name?.[0]?.toUpperCase() || 'U'}</Text>
          </TouchableOpacity>
        </View>

        {/* Card calorias com anel */}
        <View style={[s.card, { backgroundColor: C.surface }]}>
          <View style={s.cardHeader}>
            <Text style={[s.cardTitle, { color: C.text }]}>Calorias de hoje</Text>
            <TouchableOpacity style={[s.addBtn, { backgroundColor: C.primary }]} onPress={() => setMealModal(true)}>
              <Ionicons name="add" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
          <CalRing eaten={CAL_EATEN} goal={CAL_GOAL} C={C} />
        </View>

        {/* Macros */}
        <View style={s.macrosRow}>
          {MACROS.map(m => (
            <View key={m.label} style={[s.macroCard, { backgroundColor: C.surface }]}>
              <View style={[s.macroDot, { backgroundColor: m.color }]} />
              <Text style={[s.macroVal, { color: C.text }]}>{m.eaten}g</Text>
              <Text style={[s.macroName, { color: C.textMuted }]}>{m.label}</Text>
              <View style={[s.macroBar, { backgroundColor: C.border }]}>
                <View style={[s.macroFill, { width: `${(m.eaten / m.goal) * 100}%` as any, backgroundColor: m.color }]} />
              </View>
              <Text style={[s.macroGoal, { color: C.textDim }]}>/ {m.goal}g</Text>
            </View>
          ))}
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
            { icon: 'chatbubble-ellipses-outline' as const, label: 'NutrIA',   route: '/(tabs)/messages' },
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
          {[
            { name: 'Café da manhã', time: '07:30', kcal: 320, done: true  },
            { name: 'Almoço',        time: '12:30', kcal: 680, done: true  },
            { name: 'Lanche',        time: '16:00', kcal: 210, done: false },
            { name: 'Jantar',        time: '19:30', kcal: 520, done: false },
          ].map((meal, i, arr) => (
            <View key={i} style={[s.mealRow, i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: C.border }]}>
              <View style={[s.mealDot, { backgroundColor: meal.done ? C.primary : C.border }]}>
                {meal.done && <Ionicons name="checkmark" size={12} color="#fff" />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.mealName, { color: meal.done ? C.text : C.textMuted }]}>{meal.name}</Text>
                <Text style={[s.mealTime, { color: C.textDim }]}>{meal.time}</Text>
              </View>
              <Text style={[s.mealKcal, { color: meal.done ? C.primary : C.textMuted }]}>{meal.kcal} kcal</Text>
            </View>
          ))}
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
                  <TextInput style={[s.mealInput, { color: C.text }]} placeholder="Ex: Arroz, feijão, frango..."
                    value={meals[meal] || ''} onChangeText={v => setMeals(m => ({ ...m, [meal]: v }))}
                    placeholderTextColor={C.textDim} />
                </View>
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity style={[s.modalBtn, { backgroundColor: C.primary }]}
            onPress={() => { Alert.alert('Sucesso', 'Refeições registradas!'); setMealModal(false); }}>
            <Text style={s.modalBtnText}>Registrar</Text>
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
  macrosRow:     { flexDirection: 'row', gap: 10, marginBottom: 14 },
  macroCard:     { flex: 1, borderRadius: 16, padding: 12, gap: 4,
                   shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  macroDot:      { width: 8, height: 8, borderRadius: 4 },
  macroVal:      { fontSize: 16, fontWeight: '800' },
  macroName:     { fontSize: 10, fontWeight: '600' },
  macroBar:      { height: 4, borderRadius: 2, overflow: 'hidden', marginTop: 2 },
  macroFill:     { height: 4, borderRadius: 2 },
  macroGoal:     { fontSize: 9 },
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
