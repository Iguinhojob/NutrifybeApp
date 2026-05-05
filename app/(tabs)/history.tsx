import { Colors } from '@/constants/theme';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const HISTORY = [
  { date: '14/07', day: 'Segunda', status: 'green', label: 'Ótimo', calories: '1.820 kcal' },
  { date: '15/07', day: 'Terça', status: 'green', label: 'Ótimo', calories: '1.950 kcal' },
  { date: '16/07', day: 'Quarta', status: 'yellow', label: 'Regular', calories: '2.100 kcal' },
  { date: '17/07', day: 'Quinta', status: 'red', label: 'Ruim', calories: '2.450 kcal' },
  { date: '18/07', day: 'Sexta', status: 'green', label: 'Ótimo', calories: '1.780 kcal' },
  { date: '19/07', day: 'Sábado', status: 'yellow', label: 'Regular', calories: '2.050 kcal' },
  { date: '20/07', day: 'Domingo', status: 'green', label: 'Ótimo', calories: '1.900 kcal' },
];

const STATUS_COLOR: Record<string, string> = {
  green: Colors.green,
  yellow: Colors.yellow,
  red: Colors.red,
};

export default function HistoryScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Histórico</Text>
      <Text style={styles.subtitle}>Acompanhe sua evolução diária</Text>

      <View style={styles.legend}>
        {[{ color: Colors.green, label: 'Bom' }, { color: Colors.yellow, label: 'Regular' }, { color: Colors.red, label: 'Ruim' }].map(l => (
          <View key={l.label} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: l.color }]} />
            <Text style={styles.legendText}>{l.label}</Text>
          </View>
        ))}
      </View>

      {HISTORY.map((item, i) => (
        <View key={i} style={styles.card}>
          <View style={[styles.indicator, { backgroundColor: STATUS_COLOR[item.status] }]} />
          <View style={styles.info}>
            <Text style={styles.dayName}>{item.day}</Text>
            <Text style={styles.dateText}>{item.date}</Text>
          </View>
          <View style={styles.right}>
            <Text style={styles.calories}>{item.calories}</Text>
            <Text style={[styles.statusLabel, { color: STATUS_COLOR[item.status] }]}>{item.label}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingTop: 56, gap: 10 },
  title: { fontSize: 26, fontWeight: 'bold', color: Colors.text },
  subtitle: { fontSize: 14, color: Colors.textSecondary, marginBottom: 8 },
  legend: { flexDirection: 'row', gap: 16, marginBottom: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 13, color: Colors.textSecondary },
  card: { backgroundColor: Colors.card, borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 1 },
  indicator: { width: 6, height: 48, borderRadius: 3 },
  info: { flex: 1 },
  dayName: { fontSize: 15, fontWeight: '700', color: Colors.text },
  dateText: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  right: { alignItems: 'flex-end' },
  calories: { fontSize: 14, fontWeight: '600', color: Colors.text },
  statusLabel: { fontSize: 12, fontWeight: '600', marginTop: 2 },
});
