import { useAuth } from '@/context/auth';
import { usePremiumTheme } from '@/context/theme';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert, Modal, ScrollView, StyleSheet, Text,
  TextInput, TouchableOpacity, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MEALS = ['Café da manhã', 'Almoço', 'Lanche', 'Jantar'];

const MACRO_DATA = { protein: { eaten: 98, goal: 140, color: '#7C5CBF', label: 'Proteína', unit: 'g' },
  carbs:   { eaten: 180, goal: 250, color: '#22C55E', label: 'Carbo', unit: 'g' },
  fat:     { eaten: 44, goal: 65, color: '#F59E0B', label: 'Gordura', unit: 'g' },
};
const CAL_EATEN = 1240;
const CAL_GOAL  = 1840;
const CAL_PCT   = Math.min(CAL_EATEN / CAL_GOAL, 1);

function getWeekDays() {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - today.getDay() + i);
    return d;
  });
}

// Ring SVG-free — barra circular simulada com View arredondado
function CalorieRing({ pct, colors }: { pct: number; colors: any }) {
  const size = 148;
  const stroke = 12;
  const inner = size - stroke * 2;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Anel base */}
      <View style={{
        position: 'absolute', width: size, height: size, borderRadius: size / 2,
        borderWidth: stroke, borderColor: colors.surface3,
      }} />
      {/* Arco de progresso — segmento superior usando overflow clip trick */}
      <View style={{
        position: 'absolute', width: size, height: size, borderRadius: size / 2,
        borderWidth: stroke,
        borderColor: 'transparent',
        borderTopColor: '#7C5CBF',
        borderRightColor: pct > 0.25 ? '#7C5CBF' : 'transparent',
        borderBottomColor: pct > 0.5  ? '#7C5CBF' : 'transparent',
        borderLeftColor:  pct > 0.75 ? '#7C5CBF' : 'transparent',
        transform: [{ rotate: '-90deg' }],
      }} />
      <View style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 28, fontWeight: '900', color: colors.text }}>{CAL_EATEN}</Text>
        <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: '600' }}>de {CAL_GOAL} kcal</Text>
        <Text style={{ fontSize: 10, color: colors.textDim, marginTop: 2 }}>
          {CAL_GOAL - CAL_EATEN} restam
        </Text>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const { user } = useAuth();
  const { colors, isDark } = usePremiumTheme();
  const s = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const today = new Date();
  const weekDays = getWeekDays();
  const [selectedDay, setSelectedDay] = useState(today.getDay());
  const [mealModal, setMealModal] = useState(false);
  const [meals, setMeals] = useState<Record<string, string>>({});

  const firstName = user?.name?.split(' ')[0] || 'você';

  const handleRegister = () => {
    Alert.alert('Sucesso', 'Refeições registradas!');
    setMealModal(false);
  };

  return (
    <View style={s.screen}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>Olá, {firstName} 👋</Text>
            <Text style={s.subGreet}>
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </Text>
          </View>
          <TouchableOpacity style={s.avatarBtn} onPress={() => router.push('/(tabs)/profile')}>
            <Text style={s.avatarText}>{user?.name?.[0]?.toUpperCase() || 'U'}</Text>
          </TouchableOpacity>
        </View>

        {/* Cartão de calorias do dia */}
        <View style={s.calCard}>
          <View style={s.calLeft}>
            <View style={s.calBadge}>
              <Ionicons name="flame-outline" size={13} color="#171232" />
              <Text style={s.calBadgeText}>Hoje</Text>
            </View>
            <Text style={s.calCardTitle}>{'Calorias\ndo dia'}</Text>
            <TouchableOpacity
              style={s.calCta}
              onPress={() => setMealModal(true)}
            >
              <Text style={s.calCtaText}>+ Registrar</Text>
            </TouchableOpacity>
          </View>
          <CalorieRing pct={CAL_PCT} colors={colors} />
        </View>

        {/* Macros */}
        <View style={s.macrosRow}>
          {Object.values(MACRO_DATA).map(m => {
            const pct = Math.min(m.eaten / m.goal, 1);
            return (
              <View key={m.label} style={s.macroCard}>
                <Text style={[s.macroValue, { color: m.color }]}>{m.eaten}{m.unit}</Text>
                <Text style={s.macroLabel}>{m.label}</Text>
                <View style={s.macroBar}>
                  <View style={[s.macroFill, { width: `${pct * 100}%` as any, backgroundColor: m.color }]} />
                </View>
                <Text style={s.macroGoal}>Meta {m.goal}{m.unit}</Text>
              </View>
            );
          })}
        </View>

        {/* Atalhos rápidos */}
        <View style={s.grid}>
          {[
            { icon: 'water-outline',             label: 'Água',    route: '/(tabs)/water' },
            { icon: 'body-outline',               label: 'IMC',     route: '/(tabs)/bmi' },
            { icon: 'stats-chart-outline',        label: 'Evolução',route: '/(tabs)/trends' },
            { icon: 'chatbubble-ellipses-outline',label: 'NutrIA',  route: '/(tabs)/messages' },
          ].map(item => (
            <TouchableOpacity
              key={item.label}
              style={s.gridItem}
              onPress={() => router.push(item.route as any)}
            >
              <View style={s.gridIcon}>
                <Ionicons name={item.icon as any} size={22} color={colors.primary} />
              </View>
              <Text style={s.gridLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Calendário semanal */}
        <Text style={s.sectionTitle}>Esta semana</Text>
        <View style={s.weekRow}>
          {weekDays.map((d, i) => (
            <TouchableOpacity
              key={i}
              style={[s.dayBubble, selectedDay === i && s.dayBubbleActive]}
              onPress={() => setSelectedDay(i)}
            >
              <Text style={[s.dayLbl, selectedDay === i && s.dayLblActive]}>{DAYS_SHORT[i]}</Text>
              <Text style={[s.dayNum, selectedDay === i && s.dayNumActive]}>{d.getDate()}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Copiloto nutricional */}
        <View style={[s.tipCard, { backgroundColor: colors.aiBannerBg, borderColor: colors.aiBannerBorder }]}>
          <View style={s.tipHeader}>
            <Ionicons name="leaf-outline" size={17} color={colors.success} />
            <Text style={[s.tipTitle, { color: colors.text }]}>Dica nutricional</Text>
          </View>
          <Text style={[s.tipText, { color: colors.textMuted }]}>
            Você ainda precisa de <Text style={{ fontWeight: '800', color: colors.text }}>
              {CAL_GOAL - CAL_EATEN} kcal
            </Text> para atingir sua meta de hoje. Considere um lanche proteico no período da tarde.
          </Text>
        </View>

        {/* Resumo do dia */}
        <View style={[s.summaryCard, { backgroundColor: colors.surface }]}>
          <Text style={s.summaryTitle}>Resumo do dia</Text>
          <View style={s.summaryKpis}>
            {[
              { icon: 'restaurant-outline',      label: 'Refeições', value: '2/4' },
              { icon: 'water-outline',           label: 'Água',      value: `${user?.waterGoal || 2}L` },
              { icon: 'checkmark-done-outline',  label: 'Meta kcal', value: `${Math.round(CAL_PCT * 100)}%` },
            ].map(k => (
              <View key={k.label} style={s.kpi}>
                <Ionicons name={k.icon as any} size={20} color={colors.primary} />
                <Text style={s.kpiValue}>{k.value}</Text>
                <Text style={s.kpiLabel}>{k.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Métricas corporais */}
        <View style={s.metricsRow}>
          {[
            { label: 'Peso', value: `${user?.weight || '—'}kg` },
            { label: 'Meta',  value: `${user?.targetWeight || '—'}kg` },
            { label: 'IMC',  value: user?.weight && user?.height
                ? (parseFloat(user.weight) / Math.pow(parseFloat(user.height) / 100, 2)).toFixed(1)
                : '—' },
          ].map(m => (
            <View key={m.label} style={[s.metricCard, { backgroundColor: colors.surface }]}>
              <Text style={s.metricValue}>{m.value}</Text>
              <Text style={s.metricLabel}>{m.label}</Text>
            </View>
          ))}
        </View>

        {/* CTA plano semanal */}
        <TouchableOpacity style={[s.planBtn, { backgroundColor: colors.ctaContrastBg }]} onPress={() => router.push('/(tabs)/plan')}>
          <Ionicons name="calendar-outline" size={18} color={colors.ctaContrastText} />
          <Text style={[s.planBtnText, { color: colors.ctaContrastText }]}>Ver plano alimentar da semana</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.ctaContrastText} />
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modal registrar refeição */}
      <Modal visible={mealModal} animationType="slide" presentationStyle="pageSheet">
        <View style={[s.modal, { backgroundColor: colors.bg }]}>
          <View style={s.modalHandle} />
          <Text style={[s.modalTitle, { color: colors.text }]}>Registrar Refeições</Text>
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            {MEALS.map(meal => (
              <View key={meal} style={s.mealInput}>
                <Text style={[s.mealLabel, { color: colors.text }]}>{meal}</Text>
                <TextInput
                  style={[s.mealField, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                  placeholder="Ex: Arroz, feijão, frango..."
                  value={meals[meal] || ''}
                  onChangeText={v => setMeals(m => ({ ...m, [meal]: v }))}
                  placeholderTextColor={colors.textDim}
                />
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity style={[s.modalBtn, { backgroundColor: colors.ctaContrastBg }]} onPress={handleRegister}>
            <Text style={[s.modalBtnText, { color: colors.ctaContrastText }]}>Registrar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.cancelBtn} onPress={() => setMealModal(false)}>
            <Text style={[s.cancelText, { color: colors.textMuted }]}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

function createStyles(colors: ReturnType<typeof usePremiumTheme>['colors'], isDark: boolean) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.bg },
    scroll: { padding: 20, paddingTop: 56 },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    greeting: { fontSize: 22, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
    subGreet: { fontSize: 12, color: colors.textMuted, marginTop: 2, fontWeight: '500', textTransform: 'capitalize' },
    avatarBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.purpleSoft, alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontSize: 16, fontWeight: '800', color: colors.text },

    calCard: {
      backgroundColor: colors.surface3,
      borderRadius: 24, padding: 20, marginBottom: 14,
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      borderWidth: 1, borderColor: colors.purpleAccent + '40',
    },
    calLeft: { flex: 1, gap: 10 },
    calBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.gold, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
    calBadgeText: { fontSize: 11, fontWeight: '800', color: '#171232' },
    calCardTitle: { fontSize: 26, fontWeight: '900', color: colors.text, letterSpacing: -1, lineHeight: 30 },
    calCta: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.gold, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7, alignSelf: 'flex-start' },
    calCtaText: { fontSize: 13, fontWeight: '800', color: '#171232' },

    macrosRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    macroCard: { flex: 1, backgroundColor: colors.surface, borderRadius: 18, padding: 14, borderWidth: 1, borderColor: colors.border, gap: 4 },
    macroValue: { fontSize: 18, fontWeight: '900' },
    macroLabel: { fontSize: 10, fontWeight: '700', color: colors.textMuted },
    macroBar: { height: 4, borderRadius: 2, backgroundColor: colors.surface3, overflow: 'hidden', marginTop: 2 },
    macroFill: { height: 4, borderRadius: 2 },
    macroGoal: { fontSize: 9, color: colors.textDim, marginTop: 2 },

    grid: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    gridItem: { flex: 1, backgroundColor: colors.surface, borderRadius: 18, padding: 12, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: colors.border },
    gridIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
    gridLabel: { fontSize: 10, fontWeight: '700', color: colors.textMuted },

    sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 12 },
    weekRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    dayBubble: { alignItems: 'center', padding: 8, borderRadius: 14, flex: 1, marginHorizontal: 2 },
    dayBubbleActive: { backgroundColor: colors.text },
    dayLbl: { fontSize: 10, color: colors.textMuted, fontWeight: '600' },
    dayLblActive: { color: colors.bg },
    dayNum: { fontSize: 15, fontWeight: '800', color: colors.text, marginTop: 2 },
    dayNumActive: { color: colors.bg },

    tipCard: { borderRadius: 18, padding: 16, marginBottom: 16, borderWidth: 1, gap: 8 },
    tipHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    tipTitle: { fontSize: 14, fontWeight: '800' },
    tipText: { fontSize: 13, lineHeight: 20, fontWeight: '500' },

    summaryCard: { borderRadius: 20, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
    summaryTitle: { fontSize: 15, fontWeight: '800', color: colors.text, marginBottom: 14 },
    summaryKpis: { flexDirection: 'row', justifyContent: 'space-around' },
    kpi: { alignItems: 'center', gap: 4 },
    kpiValue: { fontSize: 20, fontWeight: '900', color: colors.text },
    kpiLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },

    metricsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    metricCard: { flex: 1, borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
    metricValue: { fontSize: 18, fontWeight: '900', color: colors.text },
    metricLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '600', marginTop: 2 },

    planBtn: { borderRadius: 999, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    planBtnText: { fontSize: 14, fontWeight: '800', flex: 1, textAlign: 'center' },

    modal: { flex: 1, padding: 24, paddingTop: 16 },
    modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#ccc', alignSelf: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 22, fontWeight: '900', marginBottom: 20, letterSpacing: -0.5 },
    mealInput: { marginBottom: 14 },
    mealLabel: { fontSize: 13, fontWeight: '700', marginBottom: 6 },
    mealField: { borderRadius: 14, padding: 12, fontSize: 15, borderWidth: 1 },
    modalBtn: { borderRadius: 999, padding: 16, alignItems: 'center', marginTop: 8 },
    modalBtnText: { fontSize: 16, fontWeight: '800' },
    cancelBtn: { alignItems: 'center', padding: 12 },
    cancelText: { fontSize: 15, fontWeight: '600' },
  });
}
