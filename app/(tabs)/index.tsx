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
const CHIPS = ['Todos', 'Planos', 'Mulher', 'Homem', 'Qualidade'];

function getWeekDays() {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - today.getDay() + i);
    return d;
  });
}

function buildWellnessInsight(goal: string) {
  const scores = [4, 5, 3, 5, 4, 2, 5];
  const done = scores.filter(s => s >= 4).length;
  const consistency = Math.round((done / 7) * 100);
  const risk = consistency >= 70 ? 'baixo' : consistency >= 40 ? 'médio' : 'alto';
  const riskColor = risk === 'baixo' ? '#22C55E' : risk === 'médio' ? '#FFC107' : '#EF4444';
  return { consistency, risk, riskColor, done };
}

export default function HomeScreen() {
  const { user } = useAuth();
  const { colors, isDark } = usePremiumTheme();
  const s = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const today = new Date();
  const weekDays = getWeekDays();
  const [selectedDay, setSelectedDay] = useState(today.getDay());
  const [activeChip, setActiveChip] = useState('Todos');
  const [mealModal, setMealModal] = useState(false);
  const [meals, setMeals] = useState<Record<string, string>>({});

  const insight = buildWellnessInsight(user?.goal || '');
  const firstName = user?.name?.split(' ')[0] || 'você';
  const now = today.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const handleRegister = () => {
    Alert.alert('Sucesso', 'Refeições registradas!');
    setMealModal(false);
  };

  return (
    <View style={s.screen}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Search pill */}
        <View style={s.searchPill}>
          <Ionicons name="search-outline" size={16} color={colors.textMuted} />
          <Text style={s.searchText}>Buscar alimentos, receitas...</Text>
          <View style={s.searchActions}>
            <TouchableOpacity style={s.searchIcon}>
              <Ionicons name="camera-outline" size={18} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={s.searchIcon}>
              <Ionicons name="mic-outline" size={18} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Saudação */}
        <View style={s.greetRow}>
          <View>
            <Text style={s.greeting}>Olá, {firstName} 👋</Text>
            <Text style={s.status}>Plano ativo · Último acesso {now}</Text>
          </View>
          <TouchableOpacity style={s.avatarBtn} onPress={() => router.push('/(tabs)/profile')}>
            <Text style={s.avatarText}>{user?.name?.[0]?.toUpperCase() || 'U'}</Text>
          </TouchableOpacity>
        </View>

        {/* Chips horizontais */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipsScroll}>
          {CHIPS.map(c => (
            <TouchableOpacity
              key={c}
              style={[s.chip, activeChip === c && s.chipActive]}
              onPress={() => setActiveChip(c)}
            >
              <Text style={[s.chipText, activeChip === c && s.chipTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured card com gradiente simulado */}
        <View style={s.featuredCard}>
          <View style={s.featuredBadge}>
            <Text style={s.featuredBadgeText}>✦ Destaque</Text>
          </View>
          <Text style={s.featuredTitle}>{'Seu plano\nda semana'}</Text>
          <View style={s.featuredMetrics}>
            <View style={s.featuredMetric}>
              <Text style={s.featuredMetricVal}>1.840</Text>
              <Text style={s.featuredMetricLbl}>kcal/dia</Text>
            </View>
            <View style={s.featuredMetric}>
              <Text style={s.featuredMetricVal}>{insight.consistency}%</Text>
              <Text style={s.featuredMetricLbl}>consistência</Text>
            </View>
          </View>
          <TouchableOpacity style={s.featuredCta} onPress={() => router.push('/(tabs)/plan')}>
            <Text style={s.featuredCtaText}>Ver progresso</Text>
            <Ionicons name="arrow-forward" size={14} color="#171232" />
          </TouchableOpacity>
        </View>

        {/* Grid de atalhos */}
        <View style={s.grid}>
          {[
            { icon: 'water-outline', label: 'Água', onPress: () => router.push('/(tabs)/water') },
            { icon: 'body-outline', label: 'IMC', onPress: () => router.push('/(tabs)/bmi') },
            { icon: 'stats-chart-outline', label: 'Evolução', onPress: () => router.push('/(tabs)/trends') },
            { icon: 'chatbubble-ellipses-outline', label: 'NutrIA', onPress: () => router.push('/(tabs)/messages') },
          ].map(item => (
            <TouchableOpacity key={item.label} style={s.gridItem} onPress={item.onPress}>
              <View style={s.gridIcon}>
                <Ionicons name={item.icon as any} size={22} color={colors.text} />
              </View>
              <Text style={s.gridLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Cards de insight */}
        <View style={s.insightRow}>
          <View style={[s.insightCard, { backgroundColor: colors.surface }]}>
            <View style={[s.insightDot, { backgroundColor: insight.riskColor }]} />
            <Text style={s.insightTitle}>Consistência</Text>
            <Text style={[s.insightValue, { color: insight.riskColor }]}>{insight.consistency}%</Text>
            <Text style={s.insightSub}>{insight.done}/7 dias</Text>
          </View>
          <View style={[s.insightCard, { backgroundColor: colors.surface }]}>
            <View style={[s.insightDot, { backgroundColor: insight.riskColor }]} />
            <Text style={s.insightTitle}>Risco abandono</Text>
            <Text style={[s.insightValue, { color: insight.riskColor, textTransform: 'capitalize' }]}>{insight.risk}</Text>
            <Text style={s.insightSub}>Esta semana</Text>
          </View>
        </View>

        {/* Copiloto da semana */}
        <View style={[s.copiloCard, { backgroundColor: colors.aiBannerBg, borderColor: colors.aiBannerBorder }]}>
          <View style={s.copiloHeader}>
            <Ionicons name="sparkles-outline" size={18} color={colors.purpleAccent} />
            <Text style={[s.copiloTitle, { color: colors.text }]}>Copiloto da semana</Text>
          </View>
          <Text style={[s.copiloText, { color: colors.textMuted }]}>
            {insight.consistency >= 70
              ? `Ótima semana! Você manteve ${insight.done} dias dentro da meta. Continue assim!`
              : `Você ficou ${7 - insight.done} dias fora da meta. Pequenos ajustes fazem grande diferença.`}
          </Text>
        </View>

        {/* Seletor de dias */}
        <Text style={s.sectionTitle}>Esta semana</Text>
        <View style={s.weekRow}>
          {weekDays.map((d, i) => (
            <TouchableOpacity
              key={i}
              style={[s.dayBubble, selectedDay === i && s.dayBubbleActive]}
              onPress={() => setSelectedDay(i)}
            >
              <Text style={[s.dayBubbleLabel, selectedDay === i && s.dayBubbleLabelActive]}>{DAYS_SHORT[i]}</Text>
              <Text style={[s.dayBubbleNum, selectedDay === i && s.dayBubbleNumActive]}>{d.getDate()}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Resumo de hoje */}
        <View style={[s.summaryCard, { backgroundColor: colors.surface }]}>
          <Text style={s.summaryTitle}>Resumo de hoje</Text>
          <View style={s.summaryKpis}>
            {[
              { label: 'Planejadas', value: '4', icon: 'calendar-outline' },
              { label: 'Feitas', value: '2', icon: 'checkmark-circle-outline' },
              { label: 'Água', value: `${user?.waterGoal || 2}L`, icon: 'water-outline' },
            ].map(k => (
              <View key={k.label} style={s.kpi}>
                <Ionicons name={k.icon as any} size={20} color={colors.purpleAccent} />
                <Text style={s.kpiValue}>{k.value}</Text>
                <Text style={s.kpiLabel}>{k.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Métricas */}
        <View style={s.metricsRow}>
          {[
            { label: 'Peso', value: `${user?.weight || '—'}kg` },
            { label: 'Meta', value: `${user?.targetWeight || '—'}kg` },
            { label: 'IMC', value: user?.weight && user?.height ? (parseFloat(user.weight) / Math.pow(parseFloat(user.height) / 100, 2)).toFixed(1) : '—' },
          ].map(m => (
            <View key={m.label} style={[s.metricCard, { backgroundColor: colors.surface }]}>
              <Text style={s.metricValue}>{m.value}</Text>
              <Text style={s.metricLabel}>{m.label}</Text>
            </View>
          ))}
        </View>

        {/* Botão registrar refeição */}
        <TouchableOpacity style={[s.registerBtn, { backgroundColor: colors.ctaContrastBg }]} onPress={() => setMealModal(true)}>
          <Ionicons name="add-circle-outline" size={20} color={colors.ctaContrastText} />
          <Text style={[s.registerBtnText, { color: colors.ctaContrastText }]}>Registrar refeição</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modal de registro */}
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
    searchPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, borderColor: colors.border, marginBottom: 20, gap: 8 },
    searchText: { flex: 1, fontSize: 14, color: colors.textDim, fontWeight: '500' },
    searchActions: { flexDirection: 'row', gap: 8 },
    searchIcon: { width: 32, height: 32, borderRadius: 999, backgroundColor: colors.surface3, alignItems: 'center', justifyContent: 'center' },
    greetRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    greeting: { fontSize: 22, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
    status: { fontSize: 12, color: colors.textMuted, marginTop: 2, fontWeight: '500' },
    avatarBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.purpleSoft, alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontSize: 16, fontWeight: '800', color: colors.text },
    chipsScroll: { marginBottom: 16 },
    chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, marginRight: 8 },
    chipActive: { backgroundColor: colors.chipActiveBg, borderColor: colors.purpleAccent },
    chipText: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
    chipTextActive: { color: colors.text },
    featuredCard: { backgroundColor: colors.surface3, borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: colors.purpleAccent + '40' },
    featuredBadge: { backgroundColor: colors.gold, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', marginBottom: 12 },
    featuredBadgeText: { fontSize: 11, fontWeight: '800', color: '#171232' },
    featuredTitle: { fontSize: 28, fontWeight: '900', color: colors.text, letterSpacing: -1, lineHeight: 32, marginBottom: 16 },
    featuredMetrics: { flexDirection: 'row', gap: 24, marginBottom: 16 },
    featuredMetric: {},
    featuredMetricVal: { fontSize: 22, fontWeight: '900', color: colors.text },
    featuredMetricLbl: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },
    featuredCta: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.gold, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8, alignSelf: 'flex-start' },
    featuredCtaText: { fontSize: 13, fontWeight: '800', color: '#171232' },
    grid: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    gridItem: { flex: 1, backgroundColor: colors.surface, borderRadius: 18, padding: 14, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: colors.border },
    gridIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.surface3, alignItems: 'center', justifyContent: 'center' },
    gridLabel: { fontSize: 11, fontWeight: '700', color: colors.textMuted },
    insightRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    insightCard: { flex: 1, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: colors.border },
    insightDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 8 },
    insightTitle: { fontSize: 12, fontWeight: '700', color: colors.textMuted, marginBottom: 4 },
    insightValue: { fontSize: 22, fontWeight: '900' },
    insightSub: { fontSize: 11, color: colors.textDim, marginTop: 2 },
    copiloCard: { borderRadius: 18, padding: 16, marginBottom: 20, borderWidth: 1, gap: 8 },
    copiloHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    copiloTitle: { fontSize: 14, fontWeight: '800' },
    copiloText: { fontSize: 13, lineHeight: 20, fontWeight: '500' },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 12 },
    weekRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    dayBubble: { alignItems: 'center', padding: 8, borderRadius: 14, flex: 1, marginHorizontal: 2 },
    dayBubbleActive: { backgroundColor: colors.text },
    dayBubbleLabel: { fontSize: 10, color: colors.textMuted, fontWeight: '600' },
    dayBubbleLabelActive: { color: colors.bg },
    dayBubbleNum: { fontSize: 15, fontWeight: '800', color: colors.text, marginTop: 2 },
    dayBubbleNumActive: { color: colors.bg },
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
    registerBtn: { borderRadius: 999, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    registerBtnText: { fontSize: 15, fontWeight: '800' },
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
