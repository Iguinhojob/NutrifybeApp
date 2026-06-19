import { useAuth } from '@/context/auth';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert, Modal, ScrollView, StyleSheet, Text,
  TextInput, TouchableOpacity, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const GREEN       = '#1B4332';
const GREEN_MID   = '#2D6A4F';
const ACCENT      = '#52B788';
const ACCENT_SOFT = '#D8F3DC';
const BG          = '#F6FBF7';
const SURFACE     = '#FFFFFF';
const MUTED       = '#74A88A';
const TEXT_DIM    = '#B0C4B8';
const BORDER      = '#E8F0EB';

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MEALS = ['Café da manhã', 'Almoço', 'Lanche', 'Jantar'];

const MACROS = [
  { label: 'Proteína', eaten: 98,  goal: 140, color: '#2D6A4F' },
  { label: 'Carbo',    eaten: 180, goal: 250, color: '#52B788' },
  { label: 'Gordura',  eaten: 44,  goal: 65,  color: '#95D5B2' },
];

const CAL_EATEN = 1240;
const CAL_GOAL  = 1840;

function getWeekDays() {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - today.getDay() + i);
    return d;
  });
}

export default function HomeScreen() {
  const { user } = useAuth();
  const today     = new Date();
  const weekDays  = getWeekDays();
  const firstName = user?.name?.split(' ')[0] || 'você';

  const [selectedDay, setSelectedDay] = useState(today.getDay());
  const [mealModal, setMealModal]     = useState(false);
  const [meals, setMeals]             = useState<Record<string, string>>({});

  const calPct = CAL_EATEN / CAL_GOAL;
  const remaining = CAL_GOAL - CAL_EATEN;

  return (
    <View style={s.screen}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>Olá, {firstName}</Text>
            <Text style={s.date}>
              {today.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </Text>
          </View>
          <TouchableOpacity style={s.avatar} onPress={() => router.push('/(tabs)/profile')}>
            <Text style={s.avatarLetter}>{user?.name?.[0]?.toUpperCase() || 'U'}</Text>
          </TouchableOpacity>
        </View>

        {/* ── Card principal: calorias ── */}
        <View style={s.calCard}>
          <View style={s.calTop}>
            <View>
              <Text style={s.calLabel}>Calorias hoje</Text>
              <View style={s.calRow}>
                <Text style={s.calEaten}>{CAL_EATEN}</Text>
                <Text style={s.calGoal}> / {CAL_GOAL} kcal</Text>
              </View>
            </View>
            <TouchableOpacity style={s.addBtn} onPress={() => setMealModal(true)}>
              <Ionicons name="add" size={20} color={SURFACE} />
            </TouchableOpacity>
          </View>

          {/* Barra de progresso */}
          <View style={s.calBarTrack}>
            <View style={[s.calBarFill, { width: `${calPct * 100}%` as any }]} />
          </View>

          <Text style={s.calRemaining}>{remaining} kcal restantes</Text>
        </View>

        {/* ── Macros ── */}
        <View style={s.macrosRow}>
          {MACROS.map(m => {
            const pct = m.eaten / m.goal;
            return (
              <View key={m.label} style={s.macroCard}>
                <Text style={[s.macroVal, { color: m.color }]}>{m.eaten}g</Text>
                <Text style={s.macroName}>{m.label}</Text>
                <View style={s.macroTrack}>
                  <View style={[s.macroFill, { width: `${pct * 100}%` as any, backgroundColor: m.color }]} />
                </View>
                <Text style={s.macroMeta}>{m.goal}g</Text>
              </View>
            );
          })}
        </View>

        {/* ── Calendário semanal ── */}
        <View style={s.weekCard}>
          <View style={s.weekHeader}>
            <Text style={s.weekTitle}>Esta semana</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/history')}>
              <Text style={s.weekLink}>Ver histórico</Text>
            </TouchableOpacity>
          </View>
          <View style={s.weekRow}>
            {weekDays.map((d, i) => {
              const isToday = i === today.getDay();
              const isSelected = i === selectedDay;
              return (
                <TouchableOpacity
                  key={i}
                  style={[s.dayCell, isSelected && s.dayCellActive]}
                  onPress={() => setSelectedDay(i)}
                >
                  <Text style={[s.dayName, isSelected && s.dayNameActive]}>{DAYS[i]}</Text>
                  <Text style={[s.dayNum, isSelected && s.dayNumActive]}>{d.getDate()}</Text>
                  {isToday && <View style={[s.todayDot, isSelected && s.todayDotActive]} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Atalhos ── */}
        <View style={s.shortcutsRow}>
          {[
            { icon: 'water-outline',              label: 'Água',     route: '/(tabs)/water'    },
            { icon: 'body-outline',               label: 'IMC',      route: '/(tabs)/bmi'      },
            { icon: 'stats-chart-outline',        label: 'Evolução', route: '/(tabs)/trends'   },
            { icon: 'chatbubble-ellipses-outline',label: 'NutrIA',   route: '/(tabs)/messages' },
          ].map(item => (
            <TouchableOpacity key={item.label} style={s.shortcut} onPress={() => router.push(item.route as any)}>
              <View style={s.shortcutIcon}>
                <Ionicons name={item.icon as any} size={22} color={GREEN_MID} />
              </View>
              <Text style={s.shortcutLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Resumo do dia ── */}
        <View style={s.summaryCard}>
          <Text style={s.summaryTitle}>Resumo do dia</Text>
          <View style={s.summaryRow}>
            <View style={s.summaryItem}>
              <Text style={s.summaryVal}>2/4</Text>
              <Text style={s.summaryLbl}>Refeições</Text>
            </View>
            <View style={s.summaryDivider} />
            <View style={s.summaryItem}>
              <Text style={s.summaryVal}>{user?.waterGoal || 2}L</Text>
              <Text style={s.summaryLbl}>Água</Text>
            </View>
            <View style={s.summaryDivider} />
            <View style={s.summaryItem}>
              <Text style={s.summaryVal}>{Math.round(calPct * 100)}%</Text>
              <Text style={s.summaryLbl}>Meta kcal</Text>
            </View>
            <View style={s.summaryDivider} />
            <View style={s.summaryItem}>
              <Text style={s.summaryVal}>{user?.weight || '—'}kg</Text>
              <Text style={s.summaryLbl}>Peso</Text>
            </View>
          </View>
        </View>

        {/* ── Dica do dia ── */}
        <View style={s.tipCard}>
          <View style={s.tipLeft}>
            <View style={s.tipDot} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.tipTitle}>Dica do dia</Text>
            <Text style={s.tipText}>
              Faltam <Text style={s.tipBold}>{remaining} kcal</Text> para sua meta. Um lanche com proteína agora pode ajudar.
            </Text>
          </View>
        </View>

        {/* ── Plano semanal ── */}
        <TouchableOpacity style={s.planBtn} onPress={() => router.push('/(tabs)/plan')} activeOpacity={0.85}>
          <Ionicons name="calendar-outline" size={18} color={SURFACE} />
          <Text style={s.planBtnText}>Ver plano alimentar</Text>
          <Ionicons name="chevron-forward" size={16} color={SURFACE} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Modal refeição ── */}
      <Modal visible={mealModal} animationType="slide" presentationStyle="pageSheet">
        <View style={s.modal}>
          <View style={s.modalHandle} />
          <Text style={s.modalTitle}>Registrar refeição</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {MEALS.map(meal => (
              <View key={meal} style={s.mealItem}>
                <Text style={s.mealLabel}>{meal}</Text>
                <TextInput
                  style={s.mealInput}
                  placeholder="Ex: Arroz, feijão, frango..."
                  value={meals[meal] || ''}
                  onChangeText={v => setMeals(m => ({ ...m, [meal]: v }))}
                  placeholderTextColor={TEXT_DIM}
                />
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity style={s.modalBtn} onPress={() => { Alert.alert('Sucesso', 'Refeições registradas!'); setMealModal(false); }}>
            <Text style={s.modalBtnText}>Registrar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.cancelBtn} onPress={() => setMealModal(false)}>
            <Text style={s.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BG },
  scroll: { padding: 20, paddingTop: 56 },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 24, fontWeight: '800', color: GREEN, letterSpacing: -0.5 },
  date: { fontSize: 13, color: MUTED, marginTop: 2, fontWeight: '500', textTransform: 'capitalize' },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: ACCENT_SOFT, alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { fontSize: 17, fontWeight: '800', color: GREEN },

  // Card calorias
  calCard: { backgroundColor: GREEN, borderRadius: 20, padding: 20, marginBottom: 12 },
  calTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  calLabel: { fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: '600', marginBottom: 4 },
  calRow: { flexDirection: 'row', alignItems: 'baseline' },
  calEaten: { fontSize: 36, fontWeight: '900', color: SURFACE, letterSpacing: -1 },
  calGoal: { fontSize: 16, color: 'rgba(255,255,255,0.5)', fontWeight: '600' },
  addBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  calBarTrack: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)', overflow: 'hidden', marginBottom: 10 },
  calBarFill: { height: 6, borderRadius: 3, backgroundColor: ACCENT },
  calRemaining: { fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: '600' },

  // Macros
  macrosRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  macroCard: { flex: 1, backgroundColor: SURFACE, borderRadius: 16, padding: 12, gap: 3 },
  macroVal: { fontSize: 17, fontWeight: '900' },
  macroName: { fontSize: 10, fontWeight: '700', color: MUTED },
  macroTrack: { height: 3, borderRadius: 2, backgroundColor: BORDER, overflow: 'hidden', marginTop: 4 },
  macroFill: { height: 3, borderRadius: 2 },
  macroMeta: { fontSize: 9, color: TEXT_DIM },

  // Semana
  weekCard: { backgroundColor: SURFACE, borderRadius: 20, padding: 16, marginBottom: 12 },
  weekHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  weekTitle: { fontSize: 15, fontWeight: '800', color: GREEN },
  weekLink: { fontSize: 13, color: ACCENT, fontWeight: '700' },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayCell: { alignItems: 'center', paddingVertical: 8, paddingHorizontal: 6, borderRadius: 12, gap: 4 },
  dayCellActive: { backgroundColor: GREEN },
  dayName: { fontSize: 10, fontWeight: '700', color: MUTED },
  dayNameActive: { color: 'rgba(255,255,255,0.7)' },
  dayNum: { fontSize: 15, fontWeight: '800', color: GREEN },
  dayNumActive: { color: SURFACE },
  todayDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: ACCENT },
  todayDotActive: { backgroundColor: SURFACE },

  // Atalhos
  shortcutsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  shortcut: { flex: 1, backgroundColor: SURFACE, borderRadius: 16, padding: 12, alignItems: 'center', gap: 6 },
  shortcutIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: ACCENT_SOFT, alignItems: 'center', justifyContent: 'center' },
  shortcutLabel: { fontSize: 10, fontWeight: '700', color: MUTED },

  // Resumo
  summaryCard: { backgroundColor: SURFACE, borderRadius: 20, padding: 18, marginBottom: 12 },
  summaryTitle: { fontSize: 15, fontWeight: '800', color: GREEN, marginBottom: 16 },
  summaryRow: { flexDirection: 'row', alignItems: 'center' },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryVal: { fontSize: 18, fontWeight: '900', color: GREEN },
  summaryLbl: { fontSize: 10, fontWeight: '600', color: MUTED, marginTop: 3 },
  summaryDivider: { width: 1, height: 32, backgroundColor: BORDER },

  // Dica
  tipCard: { backgroundColor: ACCENT_SOFT, borderRadius: 16, padding: 16, flexDirection: 'row', gap: 12, marginBottom: 12, alignItems: 'flex-start' },
  tipLeft: { paddingTop: 4 },
  tipDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: ACCENT },
  tipTitle: { fontSize: 13, fontWeight: '800', color: GREEN, marginBottom: 4 },
  tipText: { fontSize: 13, color: GREEN_MID, lineHeight: 20, fontWeight: '500' },
  tipBold: { fontWeight: '800', color: GREEN },

  // Plano
  planBtn: { backgroundColor: GREEN, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', gap: 10 },
  planBtnText: { fontSize: 15, fontWeight: '800', color: SURFACE },

  // Modal
  modal: { flex: 1, backgroundColor: BG, padding: 24, paddingTop: 16 },
  modalHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: BORDER, alignSelf: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: GREEN, marginBottom: 20 },
  mealItem: { marginBottom: 14 },
  mealLabel: { fontSize: 13, fontWeight: '700', color: GREEN, marginBottom: 6 },
  mealInput: { backgroundColor: SURFACE, borderRadius: 12, padding: 12, fontSize: 14, borderWidth: 1, borderColor: BORDER, color: GREEN },
  modalBtn: { backgroundColor: GREEN, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8 },
  modalBtnText: { fontSize: 16, fontWeight: '800', color: SURFACE },
  cancelBtn: { alignItems: 'center', padding: 12 },
  cancelText: { fontSize: 14, fontWeight: '600', color: MUTED },
});
