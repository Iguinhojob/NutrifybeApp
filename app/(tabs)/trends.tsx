import { useAuth } from '@/context/auth';
import { usePremiumTheme } from '@/context/theme';
import { useMemo, useState } from 'react';
import { LayoutChangeEvent, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DATA = [1820, 1950, 2100, 2450, 1780, 2050, 1900];
const LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const MAX_V = Math.max(...DATA);
const MIN_V = Math.min(...DATA);
const CHART_H = 130;
const avg = Math.round(DATA.reduce((a, b) => a + b, 0) / DATA.length);
const GOAL = 1900;
const percent = Math.round((DATA.filter(v => v <= GOAL).length / DATA.length) * 100);

function buildInsight() {
  const done = DATA.filter(v => v <= GOAL).length;
  const consistency = Math.round((done / 7) * 100);
  const risk = consistency >= 70 ? 'baixo' : consistency >= 40 ? 'médio' : 'alto';
  const riskColor = risk === 'baixo' ? '#22C55E' : risk === 'médio' ? '#F59E0B' : '#EF4444';
  const weekSummary = consistency >= 70
    ? `Excelente semana! Você manteve ${done} dias dentro da meta calórica.`
    : `Você ficou ${7 - done} dias acima da meta. Foque na consistência!`;
  return { consistency, risk, riskColor, done, weekSummary };
}

function LineChart({ colors }: { colors: any }) {
  const [width, setWidth] = useState(0);

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const points = width > 0
    ? DATA.map((v, i) => ({
        x: (i / (DATA.length - 1)) * width,
        y: CHART_H - ((v - MIN_V) / (MAX_V - MIN_V)) * CHART_H,
        value: v,
      }))
    : [];

  return (
    <View>
      {/* Y labels + chart area */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        {/* Y axis */}
        <View style={{ width: 38, height: CHART_H, justifyContent: 'space-between', paddingBottom: 2 }}>
          {[MAX_V, Math.round((MAX_V + MIN_V) / 2), MIN_V].map(v => (
            <Text key={v} style={{ fontSize: 9, color: colors.textDim, textAlign: 'right' }}>{v}</Text>
          ))}
        </View>

        {/* Chart */}
        <View style={{ flex: 1, height: CHART_H }} onLayout={onLayout}>
          {width > 0 && (
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
              {/* Linhas de grade */}
              {[0, 0.5, 1].map(f => (
                <View key={f} style={{
                  position: 'absolute',
                  top: f * CHART_H,
                  left: 0, right: 0,
                  height: 1,
                  backgroundColor: colors.border,
                  opacity: 0.5,
                }} />
              ))}

              {/* Segmentos de linha */}
              {points.slice(1).map((p, i) => {
                const prev = points[i];
                const dx = p.x - prev.x;
                const dy = p.y - prev.y;
                const len = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx) * (180 / Math.PI);
                return (
                  <View key={i} style={{
                    position: 'absolute',
                    left: prev.x,
                    top: prev.y,
                    width: len,
                    height: 2,
                    backgroundColor: colors.primary,
                    borderRadius: 1,
                    transformOrigin: 'left center',
                    transform: [{ rotate: `${angle}deg` }],
                  }} />
                );
              })}

              {/* Pontos */}
              {points.map((p, i) => (
                <View key={i} style={{
                  position: 'absolute',
                  left: p.x - 5,
                  top: p.y - 5,
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: colors.primary,
                  borderWidth: 2,
                  borderColor: colors.surface,
                }} />
              ))}
            </View>
          )}
        </View>
      </View>

      {/* X labels */}
      <View style={{ flexDirection: 'row', marginLeft: 38, marginTop: 6 }}>
        {LABELS.map(l => (
          <Text key={l} style={{ flex: 1, fontSize: 10, color: colors.textDim, textAlign: 'center' }}>{l}</Text>
        ))}
      </View>
    </View>
  );
}

export default function TrendsScreen() {
  const { user } = useAuth();
  const { colors, isDark } = usePremiumTheme();
  const s = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const insight = buildInsight();

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
      <Text style={s.title}>Evolução</Text>
      <Text style={s.subtitle}>Seu desempenho ao longo do tempo</Text>

      {/* Insight */}
      <View style={[s.insightCard, { backgroundColor: colors.aiBannerBg, borderColor: colors.aiBannerBorder }]}>
        <View style={s.insightHeader}>
          <Ionicons name="sparkles-outline" size={16} color={colors.purpleAccent} />
          <Text style={s.insightTitle}>Insight da semana</Text>
          <View style={[s.riskBadge, { backgroundColor: insight.riskColor + '25' }]}>
            <Text style={[s.riskText, { color: insight.riskColor }]}>Risco {insight.risk}</Text>
          </View>
        </View>
        <Text style={s.insightText}>{insight.weekSummary}</Text>
      </View>

      {/* Gráfico */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Calorias — Últimos 7 dias</Text>
        <LineChart colors={colors} />
      </View>

      {/* Stats */}
      <View style={s.statsRow}>
        {[
          { label: 'Média kcal/dia', value: String(avg), highlight: false },
          { label: 'Meta atingida',  value: `${percent}%`, highlight: true },
          { label: 'Meta kcal',      value: String(GOAL), highlight: false },
        ].map(stat => (
          <View key={stat.label} style={[s.statCard, stat.highlight && { backgroundColor: colors.text }]}>
            <Text style={[s.statValue, { color: stat.highlight ? colors.gold : colors.primary }]}>{stat.value}</Text>
            <Text style={[s.statLabel, { color: stat.highlight ? colors.bg + 'bb' : colors.textMuted }]}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Resumo */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Resumo Semanal</Text>
        {[
          { label: 'Consistência',        value: `${insight.consistency}%`, color: insight.riskColor },
          { label: 'Dias dentro da meta', value: `${insight.done}/7`,       color: colors.primary },
          { label: 'Melhor dia',          value: `${MIN_V} kcal`,           color: colors.purpleAccent },
          { label: 'Pior dia',            value: `${MAX_V} kcal`,           color: colors.danger },
        ].map((item, i, arr) => (
          <View key={item.label} style={[s.summaryRow, i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
            <Text style={s.summaryLabel}>{item.label}</Text>
            <Text style={[s.summaryValue, { color: item.color }]}>{item.value}</Text>
          </View>
        ))}
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

function createStyles(colors: any, isDark: boolean) {
  return StyleSheet.create({
    screen:       { flex: 1, backgroundColor: colors.bg },
    scroll:       { padding: 20, paddingTop: 56, gap: 14 },
    title:        { fontSize: 26, fontWeight: '900', color: colors.text, letterSpacing: -1 },
    subtitle:     { fontSize: 14, color: colors.textMuted, fontWeight: '500' },
    insightCard:  { borderRadius: 18, padding: 16, borderWidth: 1, gap: 8 },
    insightHeader:{ flexDirection: 'row', alignItems: 'center', gap: 8 },
    insightTitle: { flex: 1, fontSize: 14, fontWeight: '800', color: colors.text },
    riskBadge:    { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
    riskText:     { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
    insightText:  { fontSize: 13, lineHeight: 20, fontWeight: '500', color: colors.textMuted },
    card:         { borderRadius: 20, padding: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
    cardTitle:    { fontSize: 14, fontWeight: '800', color: colors.text, marginBottom: 12 },
    statsRow:     { flexDirection: 'row', gap: 8 },
    statCard:     { flex: 1, borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
    statValue:    { fontSize: 18, fontWeight: '900' },
    statLabel:    { fontSize: 10, fontWeight: '700', textAlign: 'center', marginTop: 4, color: colors.textMuted },
    summaryRow:   { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 11 },
    summaryLabel: { fontSize: 14, fontWeight: '600', color: colors.text },
    summaryValue: { fontSize: 14, fontWeight: '800' },
  });
}
