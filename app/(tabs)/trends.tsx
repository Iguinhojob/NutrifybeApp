import { useAuth } from '@/context/auth';
import { usePremiumTheme } from '@/context/theme';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DATA = [1820, 1950, 2100, 2450, 1780, 2050, 1900];
const LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const MAX = Math.max(...DATA);
const MIN = Math.min(...DATA);
const CHART_HEIGHT = 140;
const avg = Math.round(DATA.reduce((a, b) => a + b, 0) / DATA.length);
const goal = 1900;
const percent = Math.round((DATA.filter(v => v <= goal).length / DATA.length) * 100);

function buildWellnessInsight(userGoal: string) {
  const done = DATA.filter(v => v <= goal).length;
  const consistency = Math.round((done / 7) * 100);
  const risk = consistency >= 70 ? 'baixo' : consistency >= 40 ? 'médio' : 'alto';
  const riskColor = risk === 'baixo' ? '#22C55E' : risk === 'médio' ? '#FFC107' : '#EF4444';
  const weekSummary = consistency >= 70
    ? `Excelente semana! Você manteve ${done} dias dentro da meta calórica.`
    : `Você ficou ${7 - done} dias acima da meta. Foque na consistência!`;
  return { consistency, risk, riskColor, done, weekSummary };
}

function LineChart({ colors }: { colors: any }) {
  const points = DATA.map((v, i) => ({
    x: (i / (DATA.length - 1)) * 100,
    y: 100 - ((v - MIN) / (MAX - MIN)) * 100,
    value: v,
  }));

  return (
    <View style={chart.container}>
      <View style={[chart.yAxis, { height: CHART_HEIGHT }]}>
        {[MAX, Math.round((MAX + MIN) / 2), MIN].map(v => (
          <Text key={v} style={[chart.yLabel, { color: colors.textDim }]}>{v}</Text>
        ))}
      </View>
      <View style={{ flex: 1 }}>
        <View style={[chart.area, { height: CHART_HEIGHT }]}>
          {points.map((p, i) => (
            <View key={i} style={[chart.point, { left: `${p.x}%` as any, top: `${p.y}%` as any }]}>
              <View style={[chart.dot, { backgroundColor: colors.purpleAccent, borderColor: colors.surface }]} />
            </View>
          ))}
          {points.slice(1).map((p, i) => {
            const prev = points[i];
            const dx = p.x - prev.x;
            const dy = p.y - prev.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            return (
              <View key={i} style={[chart.line, {
                left: `${prev.x}%` as any,
                top: `${prev.y}%` as any,
                width: `${len}%` as any,
                backgroundColor: colors.purpleAccent,
                transform: [{ rotate: `${angle}deg` }],
              }]} />
            );
          })}
        </View>
        <View style={chart.xAxis}>
          {LABELS.map(l => <Text key={l} style={[chart.xLabel, { color: colors.textDim }]}>{l}</Text>)}
        </View>
      </View>
    </View>
  );
}

export default function TrendsScreen() {
  const { user } = useAuth();
  const { colors, isDark } = usePremiumTheme();
  const s = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const insight = buildWellnessInsight(user?.goal || '');

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
      <Text style={s.title}>Evolução</Text>
      <Text style={s.subtitle}>Seu desempenho ao longo do tempo</Text>

      {/* Insight card */}
      <View style={[s.insightCard, { backgroundColor: colors.aiBannerBg, borderColor: colors.aiBannerBorder }]}>
        <View style={s.insightHeader}>
          <Ionicons name="sparkles-outline" size={16} color={colors.purpleAccent} />
          <Text style={[s.insightTitle, { color: colors.text }]}>Insight da semana</Text>
          <View style={[s.riskBadge, { backgroundColor: insight.riskColor + '20' }]}>
            <Text style={[s.riskText, { color: insight.riskColor }]}>Risco {insight.risk}</Text>
          </View>
        </View>
        <Text style={[s.insightText, { color: colors.textMuted }]}>{insight.weekSummary}</Text>
      </View>

      {/* Gráfico */}
      <View style={[s.card, { backgroundColor: colors.surface }]}>
        <Text style={s.cardTitle}>Calorias — Últimos 7 dias</Text>
        <LineChart colors={colors} />
      </View>

      {/* Stats */}
      <View style={s.statsRow}>
        {[
          { label: 'Média kcal/dia', value: String(avg), color: colors.purpleAccent },
          { label: 'Meta atingida', value: `${percent}%`, color: colors.gold, dark: true },
          { label: 'Meta kcal', value: String(goal), color: colors.text },
        ].map(stat => (
          <View key={stat.label} style={[s.statCard, { backgroundColor: stat.dark ? colors.text : colors.surface, borderColor: colors.border }]}>
            <Text style={[s.statValue, { color: stat.dark ? colors.bg : stat.color }]}>{stat.value}</Text>
            <Text style={[s.statLabel, { color: stat.dark ? colors.bg + 'aa' : colors.textMuted }]}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Resumo */}
      <View style={[s.card, { backgroundColor: colors.surface }]}>
        <Text style={s.cardTitle}>Resumo Semanal</Text>
        {[
          { label: 'Consistência', value: `${insight.consistency}%`, color: insight.riskColor },
          { label: 'Dias dentro da meta', value: `${insight.done}/7`, color: colors.primary },
          { label: 'Melhor dia', value: `${MIN} kcal`, color: colors.purpleAccent },
          { label: 'Pior dia', value: `${MAX} kcal`, color: '#EF4444' },
        ].map(item => (
          <View key={item.label} style={[s.summaryRow, { borderBottomColor: colors.border }]}>
            <Text style={[s.summaryLabel, { color: colors.text }]}>{item.label}</Text>
            <Text style={[s.summaryValue, { color: item.color }]}>{item.value}</Text>
          </View>
        ))}
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const chart = StyleSheet.create({
  container: { flexDirection: 'row', marginTop: 8 },
  yAxis: { justifyContent: 'space-between', paddingRight: 6 },
  yLabel: { fontSize: 10 },
  area: { position: 'relative', flex: 1 },
  point: { position: 'absolute', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, borderWidth: 2 },
  line: { position: 'absolute', height: 2, transformOrigin: 'left center' },
  xAxis: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  xLabel: { fontSize: 11 },
});

function createStyles(colors: any, isDark: boolean) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.bg },
    scroll: { padding: 20, paddingTop: 56, gap: 14 },
    title: { fontSize: 26, fontWeight: '900', color: colors.text, letterSpacing: -1 },
    subtitle: { fontSize: 14, color: colors.textMuted, fontWeight: '500' },
    insightCard: { borderRadius: 18, padding: 16, borderWidth: 1, gap: 8 },
    insightHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    insightTitle: { flex: 1, fontSize: 14, fontWeight: '800' },
    riskBadge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
    riskText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
    insightText: { fontSize: 13, lineHeight: 20, fontWeight: '500' },
    card: { borderRadius: 20, padding: 16, borderWidth: 1, borderColor: colors.border },
    cardTitle: { fontSize: 14, fontWeight: '800', color: colors.text, marginBottom: 8 },
    statsRow: { flexDirection: 'row', gap: 8 },
    statCard: { flex: 1, borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 1 },
    statValue: { fontSize: 18, fontWeight: '900' },
    statLabel: { fontSize: 10, fontWeight: '700', textAlign: 'center', marginTop: 4 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1 },
    summaryLabel: { fontSize: 14, fontWeight: '600' },
    summaryValue: { fontSize: 14, fontWeight: '800' },
  });
}
