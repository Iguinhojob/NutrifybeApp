import { usePremiumTheme } from '@/context/theme';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { GRAD } from '@/constants/darkTheme';

const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const PLAN: Record<string, { name: string; time: string; foods: string[]; kcal: number; origin: 'IA' | 'Nutricionista' | 'Pendente'; done: boolean }[]> = {
  Seg: [{ name: 'Café da manhã', time: '07:00', foods: ['Aveia com frutas', 'Mel', 'Café preto'], kcal: 320, origin: 'IA', done: true }, { name: 'Almoço', time: '12:30', foods: ['Arroz integral', 'Feijão', 'Frango grelhado', 'Salada verde'], kcal: 680, origin: 'Nutricionista', done: true }, { name: 'Lanche', time: '16:00', foods: ['Iogurte grego', 'Granola'], kcal: 210, origin: 'IA', done: false }, { name: 'Jantar', time: '19:30', foods: ['Salmão assado', 'Legumes no vapor'], kcal: 520, origin: 'Nutricionista', done: false }],
  Ter: [{ name: 'Café da manhã', time: '07:00', foods: ['Ovos mexidos', 'Torrada integral'], kcal: 350, origin: 'IA', done: false }, { name: 'Almoço', time: '12:30', foods: ['Macarrão integral', 'Atum', 'Tomate'], kcal: 620, origin: 'IA', done: false }, { name: 'Lanche', time: '16:00', foods: ['Banana', 'Pasta de amendoim'], kcal: 240, origin: 'Pendente', done: false }, { name: 'Jantar', time: '19:30', foods: ['Sopa de legumes', 'Frango desfiado'], kcal: 480, origin: 'Pendente', done: false }],
  Qua: [{ name: 'Café da manhã', time: '07:00', foods: ['Smoothie de frutas', 'Proteína em pó'], kcal: 290, origin: 'IA', done: false }, { name: 'Almoço', time: '12:30', foods: ['Tilápia grelhada', 'Purê de batata doce'], kcal: 590, origin: 'Nutricionista', done: false }, { name: 'Lanche', time: '16:00', foods: ['Mix de castanhas', 'Frutas secas'], kcal: 180, origin: 'IA', done: false }, { name: 'Jantar', time: '19:30', foods: ['Omelete de espinafre', 'Queijo cottage'], kcal: 440, origin: 'IA', done: false }],
  Qui: [{ name: 'Café da manhã', time: '07:00', foods: ['Panqueca de banana', 'Mel'], kcal: 380, origin: 'Pendente', done: false }, { name: 'Almoço', time: '12:30', foods: ['Carne moída', 'Arroz', 'Feijão'], kcal: 720, origin: 'Nutricionista', done: false }, { name: 'Lanche', time: '16:00', foods: ['Maçã', 'Queijo branco'], kcal: 160, origin: 'IA', done: false }, { name: 'Jantar', time: '19:30', foods: ['Frango ao forno', 'Batata doce'], kcal: 560, origin: 'IA', done: false }],
  Sex: [{ name: 'Café da manhã', time: '07:00', foods: ['Tapioca', 'Frango', 'Queijo'], kcal: 340, origin: 'IA', done: false }, { name: 'Almoço', time: '12:30', foods: ['Peixe grelhado', 'Quinoa', 'Salada'], kcal: 580, origin: 'Nutricionista', done: false }, { name: 'Lanche', time: '16:00', foods: ['Vitamina de abacate'], kcal: 220, origin: 'IA', done: false }, { name: 'Jantar', time: '19:30', foods: ['Wrap integral', 'Atum', 'Legumes'], kcal: 460, origin: 'IA', done: false }],
  Sáb: [{ name: 'Café da manhã', time: '08:00', foods: ['Açaí', 'Granola', 'Frutas'], kcal: 420, origin: 'Pendente', done: false }, { name: 'Almoço', time: '13:00', foods: ['Churrasco magro', 'Salada verde'], kcal: 650, origin: 'Pendente', done: false }, { name: 'Lanche', time: '16:30', foods: ['Barra de proteína'], kcal: 200, origin: 'IA', done: false }, { name: 'Jantar', time: '20:00', foods: ['Sopa de lentilha', 'Pão integral'], kcal: 480, origin: 'Pendente', done: false }],
  Dom: [{ name: 'Café da manhã', time: '08:30', foods: ['Pão integral', 'Ovos', 'Abacate'], kcal: 400, origin: 'IA', done: false }, { name: 'Almoço', time: '13:00', foods: ['Frango assado', 'Arroz', 'Feijão'], kcal: 700, origin: 'Nutricionista', done: false }, { name: 'Lanche', time: '16:00', foods: ['Iogurte', 'Chia', 'Mel'], kcal: 190, origin: 'IA', done: false }, { name: 'Jantar', time: '19:30', foods: ['Salada completa', 'Atum', 'Ovos'], kcal: 420, origin: 'IA', done: false }],
};
const ORIGIN_COLORS: Record<string, string> = { IA: '#A78BDA', Nutricionista: '#34D399', Pendente: '#FBBF24' };

export default function PlanScreen() {
  const { colors } = usePremiumTheme();
  const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  const [selectedDay, setSelectedDay] = useState(todayIdx);
  const [expanded, setExpanded]       = useState<number | null>(0);
  const [planState, setPlanState]     = useState(PLAN);
  const dayKey    = DAYS[selectedDay];
  const meals     = planState[dayKey];
  const totalKcal = meals.reduce((a, m) => a + m.kcal, 0);

  const toggleDone = (idx: number) => setPlanState(prev => ({ ...prev, [dayKey]: prev[dayKey].map((m, i) => i === idx ? { ...m, done: !m.done } : m) }));

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[s.title, { color: colors.text }]}>Plano Alimentar</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.daysScroll}>
          {DAYS.map((d, i) => (
            <TouchableOpacity key={d} style={[s.dayBtn, { backgroundColor: colors.surface, borderColor: colors.border }, selectedDay === i && s.dayBtnActive]} onPress={() => { setSelectedDay(i); setExpanded(null); }}>
              <Text style={[s.dayText, { color: colors.textMuted }, selectedDay === i && { color: '#fff' }]}>{d}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Macros */}
        <View style={[s.macrosCard, { backgroundColor: colors.surface, borderColor: colors.cyan + '40' }]}>
          <Text style={[s.macrosTitle, { color: colors.textMuted }]}>Macros estimados</Text>
          <View style={s.macrosRow}>
            {[
              { label: 'Proteína',    value: `${Math.round(totalKcal * 0.3 / 4)}g`,  color: colors.purpleLight },
              { label: 'Carboidrato', value: `${Math.round(totalKcal * 0.45 / 4)}g`, color: colors.warning },
              { label: 'Gordura',     value: `${Math.round(totalKcal * 0.25 / 9)}g`, color: colors.danger },
              { label: 'kcal total',  value: String(totalKcal),                       color: colors.cyan },
            ].map(m => (
              <View key={m.label} style={s.macroItem}>
                <Text style={[s.macroValue, { color: m.color }]}>{m.value}</Text>
                <Text style={[s.macroLabel, { color: colors.textMuted }]}>{m.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {meals.map((meal, i) => (
          <View key={i} style={[s.mealCard, { backgroundColor: colors.surface, borderColor: meal.done ? colors.cyan + '40' : colors.border }]}>
            <TouchableOpacity style={s.mealHeader} onPress={() => setExpanded(expanded === i ? null : i)}>
              <View style={s.mealLeft}>
                <TouchableOpacity style={[s.checkBtn, { borderColor: colors.border }, meal.done && { backgroundColor: colors.cyan, borderColor: colors.cyan }]} onPress={() => toggleDone(i)}>
                  {meal.done && <Ionicons name="checkmark" size={14} color="#fff" />}
                </TouchableOpacity>
                <View>
                  <Text style={[s.mealName, { color: colors.text }, meal.done && { textDecorationLine: 'line-through', color: colors.textMuted }]}>{meal.name}</Text>
                  <Text style={[s.mealTime, { color: colors.textMuted }]}>{meal.time} · {meal.kcal} kcal</Text>
                </View>
              </View>
              <View style={s.mealRight}>
                <View style={[s.originBadge, { backgroundColor: ORIGIN_COLORS[meal.origin] + '25' }]}>
                  <Text style={[s.originText, { color: ORIGIN_COLORS[meal.origin] }]}>{meal.origin}</Text>
                </View>
                <Ionicons name={expanded === i ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textMuted} />
              </View>
            </TouchableOpacity>
            {expanded === i && (
              <View style={[s.mealBody, { borderTopColor: colors.border }]}>
                {meal.foods.map((f, fi) => (
                  <View key={fi} style={s.foodItem}>
                    <View style={[s.foodDot, { backgroundColor: colors.cyan }]} />
                    <Text style={[s.foodText, { color: colors.textMuted }]}>{f}</Text>
                  </View>
                ))}
                <TouchableOpacity style={[s.nutrIaBtn, { backgroundColor: colors.surface2, borderColor: colors.cyan + '40' }]} onPress={() => router.push('/(tabs)/messages')}>
                  <Ionicons name="sparkles-outline" size={14} color={colors.cyan} />
                  <Text style={[s.nutrIaBtnText, { color: colors.cyan }]}>Sugerir com NutrIA</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}

        <View style={s.actionsRow}>
          <TouchableOpacity style={[s.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => router.push('/(tabs)/messages')}>
            <Ionicons name="person-outline" size={16} color={colors.text} />
            <Text style={[s.actionBtnText, { color: colors.text }]}>Nutricionista</Text>
          </TouchableOpacity>
          <LinearGradient colors={GRAD} start={{x:0,y:0}} end={{x:1,y:0}} style={s.actionBtnGrad}>
            <TouchableOpacity style={s.actionBtnGradInner} onPress={() => router.push('/(tabs)/messages')}>
              <Ionicons name="sparkles-outline" size={16} color="#fff" />
              <Text style={s.actionBtnGradText}>NutrIA</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  scroll:          { padding: 20, paddingTop: 56 },
  title:           { fontSize: 26, fontWeight: '900', letterSpacing: -1, marginBottom: 16 },
  daysScroll:      { marginBottom: 16 },
  dayBtn:          { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999, marginRight: 8, borderWidth: 1 },
  dayBtnActive:    { backgroundColor: '#7C5CBF', borderColor: '#7C5CBF' },
  dayText:         { fontSize: 14, fontWeight: '700' },
  macrosCard:      { borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1.5 },
  macrosTitle:     { fontSize: 13, fontWeight: '700', marginBottom: 12 },
  macrosRow:       { flexDirection: 'row', justifyContent: 'space-between' },
  macroItem:       { alignItems: 'center' },
  macroValue:      { fontSize: 16, fontWeight: '900' },
  macroLabel:      { fontSize: 11, fontWeight: '600', marginTop: 2 },
  mealCard:        { borderRadius: 18, marginBottom: 10, borderWidth: 1, overflow: 'hidden' },
  mealHeader:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  mealLeft:        { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  checkBtn:        { width: 26, height: 26, borderRadius: 8, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  mealName:        { fontSize: 15, fontWeight: '700' },
  mealTime:        { fontSize: 12, marginTop: 2 },
  mealRight:       { flexDirection: 'row', alignItems: 'center', gap: 8 },
  originBadge:     { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  originText:      { fontSize: 11, fontWeight: '700' },
  mealBody:        { paddingHorizontal: 16, paddingBottom: 16, gap: 6, borderTopWidth: 1 },
  foodItem:        { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 2 },
  foodDot:         { width: 6, height: 6, borderRadius: 3 },
  foodText:        { fontSize: 14, fontWeight: '500' },
  nutrIaBtn:       { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, alignSelf: 'flex-start', marginTop: 8 },
  nutrIaBtnText:   { fontSize: 12, fontWeight: '700' },
  actionsRow:      { flexDirection: 'row', gap: 10, marginTop: 8, marginBottom: 10 },
  actionBtn:       { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, padding: 14, borderWidth: 1 },
  actionBtnText:   { fontSize: 14, fontWeight: '700' },
  actionBtnGrad:   { flex: 1, borderRadius: 14, overflow: 'hidden' },
  actionBtnGradInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14 },
  actionBtnGradText:  { fontSize: 14, fontWeight: '700', color: '#fff' },
});
