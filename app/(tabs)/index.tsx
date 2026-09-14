import { useAuth } from '@/context/auth';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { D, GRAD } from '@/constants/darkTheme';

const DAYS  = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MEALS = ['Café da manhã', 'Almoço', 'Lanche', 'Jantar'];
const MACROS = [
  { label: 'Proteína', eaten: 98,  goal: 140, color: D.cyan },
  { label: 'Carbo',    eaten: 180, goal: 250, color: D.purpleLight },
  { label: 'Gordura',  eaten: 44,  goal: 65,  color: D.textMuted },
];
const CAL_EATEN = 1240, CAL_GOAL = 1840;

function getWeekDays() {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => { const d = new Date(today); d.setDate(today.getDate() - today.getDay() + i); return d; });
}

export default function HomeScreen() {
  const { user } = useAuth();
  const today = new Date(), weekDays = getWeekDays();
  const firstName = user?.name?.split(' ')[0] || 'você';
  const [selectedDay, setSelectedDay] = useState(today.getDay());
  const [mealModal, setMealModal]     = useState(false);
  const [meals, setMeals]             = useState<Record<string, string>>({});
  const calPct = CAL_EATEN / CAL_GOAL, remaining = CAL_GOAL - CAL_EATEN;

  return (
    <View style={s.screen}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>Olá, {firstName} 👋</Text>
            <Text style={s.date}>{today.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
            <LinearGradient colors={GRAD} start={{x:0,y:0}} end={{x:1,y:1}} style={s.avatar}>
              <Text style={s.avatarLetter}>{user?.name?.[0]?.toUpperCase() || 'U'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Card calorias */}
        <LinearGradient colors={GRAD} start={{x:0,y:0}} end={{x:1,y:0}} style={s.calCard}>
          <View style={s.calTop}>
            <View>
              <Text style={s.calLabel}>Calorias hoje</Text>
              <View style={s.calRow}>
                <Text style={s.calEaten}>{CAL_EATEN}</Text>
                <Text style={s.calGoal}> / {CAL_GOAL} kcal</Text>
              </View>
            </View>
            <TouchableOpacity style={s.addBtn} onPress={() => setMealModal(true)}>
              <Ionicons name="add" size={20} color={D.white} />
            </TouchableOpacity>
          </View>
          <View style={s.calBarTrack}>
            <View style={[s.calBarFill, { width: `${calPct * 100}%` as any }]} />
          </View>
          <Text style={s.calRemaining}>{remaining} kcal restantes</Text>
        </LinearGradient>

        {/* Macros */}
        <View style={s.macrosRow}>
          {MACROS.map(m => (
            <View key={m.label} style={s.macroCard}>
              <Text style={[s.macroVal, { color: m.color }]}>{m.eaten}g</Text>
              <Text style={s.macroName}>{m.label}</Text>
              <View style={s.macroTrack}>
                <View style={[s.macroFill, { width: `${(m.eaten/m.goal)*100}%` as any, backgroundColor: m.color }]} />
              </View>
              <Text style={s.macroMeta}>{m.goal}g</Text>
            </View>
          ))}
        </View>

        {/* Calendário */}
        <View style={s.weekCard}>
          <View style={s.weekHeader}>
            <Text style={s.weekTitle}>Esta semana</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/history')}>
              <Text style={s.weekLink}>Ver histórico</Text>
            </TouchableOpacity>
          </View>
          <View style={s.weekRow}>
            {weekDays.map((d, i) => {
              const isSelected = i === selectedDay;
              return (
                <TouchableOpacity key={i} style={[s.dayCell, isSelected && s.dayCellActive]} onPress={() => setSelectedDay(i)}>
                  <Text style={[s.dayName, isSelected && s.dayNameActive]}>{DAYS[i]}</Text>
                  <Text style={[s.dayNum,  isSelected && s.dayNumActive]}>{d.getDate()}</Text>
                  {i === today.getDay() && <View style={[s.todayDot, isSelected && s.todayDotActive]} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Atalhos */}
        <View style={s.shortcutsRow}>
          {[
            { icon: 'water-outline',               label: 'Água',     route: '/(tabs)/water'    },
            { icon: 'body-outline',                label: 'IMC',      route: '/(tabs)/bmi'      },
            { icon: 'stats-chart-outline',         label: 'Evolução', route: '/(tabs)/trends'   },
            { icon: 'chatbubble-ellipses-outline', label: 'NutrIA',   route: '/(tabs)/messages' },
          ].map(item => (
            <TouchableOpacity key={item.label} style={s.shortcut} onPress={() => router.push(item.route as any)}>
              <View style={s.shortcutIcon}>
                <Ionicons name={item.icon as any} size={22} color={D.cyan} />
              </View>
              <Text style={s.shortcutLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Resumo */}
        <View style={s.summaryCard}>
          <Text style={s.summaryTitle}>Resumo do dia</Text>
          <View style={s.summaryRow}>
            {[
              { val: '2/4',                        lbl: 'Refeições' },
              { val: `${user?.waterGoal || 2}L`,   lbl: 'Água' },
              { val: `${Math.round(calPct*100)}%`, lbl: 'Meta kcal' },
              { val: `${user?.weight || '—'}kg`,   lbl: 'Peso' },
            ].map((item, i, arr) => (
              <View key={i} style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}>
                <View style={s.summaryItem}>
                  <Text style={s.summaryVal}>{item.val}</Text>
                  <Text style={s.summaryLbl}>{item.lbl}</Text>
                </View>
                {i < arr.length - 1 && <View style={s.summaryDivider} />}
              </View>
            ))}
          </View>
        </View>

        {/* Dica */}
        <View style={s.tipCard}>
          <View style={s.tipDot} />
          <View style={{ flex: 1 }}>
            <Text style={s.tipTitle}>Dica do dia</Text>
            <Text style={s.tipText}>Faltam <Text style={s.tipBold}>{remaining} kcal</Text> para sua meta. Um lanche com proteína agora pode ajudar.</Text>
          </View>
        </View>

        {/* Plano */}
        <LinearGradient colors={GRAD} start={{x:0,y:0}} end={{x:1,y:0}} style={s.planBtn}>
          <TouchableOpacity onPress={() => router.push('/(tabs)/plan')} activeOpacity={0.85} style={s.planBtnInner}>
            <Ionicons name="calendar-outline" size={18} color={D.white} />
            <Text style={s.planBtnText}>Ver plano alimentar</Text>
            <Ionicons name="chevron-forward" size={16} color={D.white} style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
        </LinearGradient>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modal */}
      <Modal visible={mealModal} animationType="slide" presentationStyle="pageSheet">
        <View style={s.modal}>
          <View style={s.modalHandle} />
          <Text style={s.modalTitle}>Registrar refeição</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {MEALS.map(meal => (
              <View key={meal} style={s.mealItem}>
                <Text style={s.mealLabel}>{meal}</Text>
                <View style={s.mealFieldWrap}>
                  <TextInput style={s.mealInput} placeholder="Ex: Arroz, feijão, frango..."
                    value={meals[meal] || ''} onChangeText={v => setMeals(m => ({ ...m, [meal]: v }))}
                    placeholderTextColor={D.textDim} />
                </View>
              </View>
            ))}
          </ScrollView>
          <LinearGradient colors={GRAD} start={{x:0,y:0}} end={{x:1,y:0}} style={s.modalBtn}>
            <TouchableOpacity onPress={() => { Alert.alert('Sucesso', 'Refeições registradas!'); setMealModal(false); }} style={s.modalBtnInner}>
              <Text style={s.modalBtnText}>Registrar</Text>
            </TouchableOpacity>
          </LinearGradient>
          <TouchableOpacity style={s.cancelBtn} onPress={() => setMealModal(false)}>
            <Text style={s.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: D.bg },
  scroll: { padding: 20, paddingTop: 56 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 22, fontWeight: '800', color: D.text, letterSpacing: -0.5 },
  date: { fontSize: 13, color: D.textMuted, marginTop: 2, fontWeight: '500', textTransform: 'capitalize' },
  avatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { fontSize: 17, fontWeight: '800', color: D.white },
  calCard: { borderRadius: 20, padding: 20, marginBottom: 12 },
  calTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  calLabel: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '600', marginBottom: 4 },
  calRow: { flexDirection: 'row', alignItems: 'baseline' },
  calEaten: { fontSize: 36, fontWeight: '900', color: D.white, letterSpacing: -1 },
  calGoal: { fontSize: 16, color: 'rgba(255,255,255,0.6)', fontWeight: '600' },
  addBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  calBarTrack: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.25)', overflow: 'hidden', marginBottom: 10 },
  calBarFill: { height: 6, borderRadius: 3, backgroundColor: D.white },
  calRemaining: { fontSize: 12, color: 'rgba(255,255,255,0.65)', fontWeight: '600' },
  macrosRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  macroCard: { flex: 1, backgroundColor: D.surface, borderRadius: 16, padding: 12, gap: 3, borderWidth: 1, borderColor: D.border },
  macroVal: { fontSize: 17, fontWeight: '900' },
  macroName: { fontSize: 10, fontWeight: '700', color: D.textMuted },
  macroTrack: { height: 3, borderRadius: 2, backgroundColor: D.border, overflow: 'hidden', marginTop: 4 },
  macroFill: { height: 3, borderRadius: 2 },
  macroMeta: { fontSize: 9, color: D.textDim },
  weekCard: { backgroundColor: D.surface, borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: D.border },
  weekHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  weekTitle: { fontSize: 15, fontWeight: '800', color: D.text },
  weekLink: { fontSize: 13, color: D.cyan, fontWeight: '700' },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayCell: { alignItems: 'center', paddingVertical: 8, paddingHorizontal: 6, borderRadius: 12, gap: 4 },
  dayCellActive: { backgroundColor: D.purple },
  dayName: { fontSize: 10, fontWeight: '700', color: D.textMuted },
  dayNameActive: { color: 'rgba(255,255,255,0.8)' },
  dayNum: { fontSize: 15, fontWeight: '800', color: D.text },
  dayNumActive: { color: D.white },
  todayDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: D.cyan },
  todayDotActive: { backgroundColor: D.white },
  shortcutsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  shortcut: { flex: 1, backgroundColor: D.surface, borderRadius: 16, padding: 12, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: D.border },
  shortcutIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: D.surface2, alignItems: 'center', justifyContent: 'center' },
  shortcutLabel: { fontSize: 10, fontWeight: '700', color: D.textMuted },
  summaryCard: { backgroundColor: D.surface, borderRadius: 20, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: D.border },
  summaryTitle: { fontSize: 15, fontWeight: '800', color: D.text, marginBottom: 16 },
  summaryRow: { flexDirection: 'row', alignItems: 'center' },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryVal: { fontSize: 18, fontWeight: '900', color: D.cyan },
  summaryLbl: { fontSize: 10, fontWeight: '600', color: D.textMuted, marginTop: 3 },
  summaryDivider: { width: 1, height: 32, backgroundColor: D.border },
  tipCard: { backgroundColor: D.surface2, borderRadius: 16, padding: 16, flexDirection: 'row', gap: 12, marginBottom: 12, alignItems: 'flex-start', borderWidth: 1, borderColor: D.border },
  tipDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: D.cyan, marginTop: 4 },
  tipTitle: { fontSize: 13, fontWeight: '800', color: D.text, marginBottom: 4 },
  tipText: { fontSize: 13, color: D.textMuted, lineHeight: 20, fontWeight: '500' },
  tipBold: { fontWeight: '800', color: D.purpleLight },
  planBtn: { borderRadius: 16, overflow: 'hidden' },
  planBtnInner: { paddingVertical: 16, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', gap: 10 },
  planBtnText: { fontSize: 15, fontWeight: '800', color: D.white },
  modal: { flex: 1, backgroundColor: D.bg, padding: 24, paddingTop: 16 },
  modalHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: D.border, alignSelf: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: D.text, marginBottom: 20 },
  mealItem: { marginBottom: 14 },
  mealLabel: { fontSize: 13, fontWeight: '700', color: D.cyan, marginBottom: 6 },
  mealFieldWrap: { backgroundColor: D.surface, borderRadius: 12, borderWidth: 1, borderColor: D.border },
  mealInput: { padding: 12, fontSize: 14, color: D.text },
  modalBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 8 },
  modalBtnInner: { padding: 16, alignItems: 'center' },
  modalBtnText: { fontSize: 16, fontWeight: '800', color: D.white },
  cancelBtn: { alignItems: 'center', padding: 12 },
  cancelText: { fontSize: 14, fontWeight: '600', color: D.textMuted },
});
