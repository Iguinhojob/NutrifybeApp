import { Colors } from '@/constants/theme';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const DATA = [1820, 1950, 2100, 2450, 1780, 2050, 1900];
const LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const MAX = Math.max(...DATA);
const MIN = Math.min(...DATA);
const CHART_HEIGHT = 140;

function LineChart() {
  const points = DATA.map((v, i) => ({
    x: (i / (DATA.length - 1)) * 100,
    y: 100 - ((v - MIN) / (MAX - MIN)) * 100,
    value: v,
  }));

  return (
    <View style={chart.container}>
      <View style={chart.yAxis}>
        {[MAX, Math.round((MAX + MIN) / 2), MIN].map(v => (
          <Text key={v} style={chart.yLabel}>{v}</Text>
        ))}
      </View>
      <View style={{ flex: 1 }}>
        <View style={[chart.area, { height: CHART_HEIGHT }]}>
          {points.map((p, i) => (
            <View key={i} style={[chart.point, { left: `${p.x}%` as any, top: `${p.y}%` as any }]}>
              <View style={chart.dot} />
              <Text style={chart.valueLabel}>{p.value}</Text>
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
                transform: [{ rotate: `${angle}deg` }],
              }]} />
            );
          })}
        </View>
        <View style={chart.xAxis}>
          {LABELS.map(l => <Text key={l} style={chart.xLabel}>{l}</Text>)}
        </View>
      </View>
    </View>
  );
}

const avg = Math.round(DATA.reduce((a, b) => a + b, 0) / DATA.length);
const goal = 1900;
const percent = Math.round((DATA.filter(v => v <= goal).length / DATA.length) * 100);

export default function TrendsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Tendências</Text>
      <Text style={styles.subtitle}>Seu desempenho ao longo do tempo</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Calorias — Últimos 7 dias</Text>
        <LineChart />
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{avg}</Text>
          <Text style={styles.statLabel}>Média kcal/dia</Text>
        </View>
        <View style={[styles.statCard, styles.statCardHighlight]}>
          <Text style={[styles.statValue, { color: Colors.white }]}>{percent}%</Text>
          <Text style={[styles.statLabel, { color: Colors.primaryLight }]}>Meta atingida</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{goal}</Text>
          <Text style={styles.statLabel}>Meta kcal</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Resumo Semanal</Text>
        {[
          { label: 'Dias dentro da meta', value: `${DATA.filter(v => v <= goal).length}/7`, color: Colors.green },
          { label: 'Melhor dia', value: `${MIN} kcal`, color: Colors.primary },
          { label: 'Pior dia', value: `${MAX} kcal`, color: Colors.red },
        ].map(item => (
          <View key={item.label} style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{item.label}</Text>
            <Text style={[styles.summaryValue, { color: item.color }]}>{item.value}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const chart = StyleSheet.create({
  container: { flexDirection: 'row', marginTop: 8 },
  yAxis: { justifyContent: 'space-between', paddingRight: 6, height: CHART_HEIGHT },
  yLabel: { fontSize: 10, color: Colors.textSecondary },
  area: { position: 'relative', flex: 1 },
  point: { position: 'absolute', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary, borderWidth: 2, borderColor: Colors.white },
  valueLabel: { fontSize: 9, color: Colors.textSecondary, marginTop: 2 },
  line: { position: 'absolute', height: 2, backgroundColor: Colors.primary, transformOrigin: 'left center' },
  xAxis: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  xLabel: { fontSize: 11, color: Colors.textSecondary },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingTop: 56, gap: 16 },
  title: { fontSize: 26, fontWeight: 'bold', color: Colors.text },
  subtitle: { fontSize: 14, color: Colors.textSecondary },
  card: { backgroundColor: Colors.card, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, backgroundColor: Colors.card, borderRadius: 14, padding: 14, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 1 },
  statCardHighlight: { backgroundColor: Colors.primary },
  statValue: { fontSize: 20, fontWeight: 'bold', color: Colors.primary },
  statLabel: { fontSize: 11, color: Colors.textSecondary, textAlign: 'center', marginTop: 4 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.border },
  summaryLabel: { fontSize: 14, color: Colors.text },
  summaryValue: { fontSize: 14, fontWeight: '700' },
});
