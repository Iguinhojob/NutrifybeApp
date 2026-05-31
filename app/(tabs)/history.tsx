import { usePremiumTheme } from '@/context/theme';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const HISTORY = [
  { date: '14/07', day: 'Segunda',  status: 'green',  label: 'Ótimo',   calories: '1.820 kcal' },
  { date: '15/07', day: 'Terça',    status: 'green',  label: 'Ótimo',   calories: '1.950 kcal' },
  { date: '16/07', day: 'Quarta',   status: 'yellow', label: 'Regular', calories: '2.100 kcal' },
  { date: '17/07', day: 'Quinta',   status: 'red',    label: 'Ruim',    calories: '2.450 kcal' },
  { date: '18/07', day: 'Sexta',    status: 'green',  label: 'Ótimo',   calories: '1.780 kcal' },
  { date: '19/07', day: 'Sábado',   status: 'yellow', label: 'Regular', calories: '2.050 kcal' },
  { date: '20/07', day: 'Domingo',  status: 'green',  label: 'Ótimo',   calories: '1.900 kcal' },
];

export default function HistoryScreen() {
  const { colors, isDark } = usePremiumTheme();
  const s = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const STATUS_COLOR: Record<string, string> = {
    green:  colors.green,
    yellow: colors.yellow,
    red:    colors.red,
  };

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.scroll}>
      <Text style={s.title}>Histórico</Text>
      <Text style={s.subtitle}>Acompanhe sua evolução diária</Text>

      <View style={s.legend}>
        {[
          { color: colors.green,  label: 'Bom' },
          { color: colors.yellow, label: 'Regular' },
          { color: colors.red,    label: 'Ruim' },
        ].map(l => (
          <View key={l.label} style={s.legendItem}>
            <View style={[s.dot, { backgroundColor: l.color }]} />
            <Text style={s.legendText}>{l.label}</Text>
          </View>
        ))}
      </View>

      {HISTORY.map((item, i) => (
        <View key={i} style={s.card}>
          <View style={[s.indicator, { backgroundColor: STATUS_COLOR[item.status] }]} />
          <View style={s.info}>
            <Text style={s.dayName}>{item.day}</Text>
            <Text style={s.dateText}>{item.date}</Text>
          </View>
          <View style={s.right}>
            <Text style={s.calories}>{item.calories}</Text>
            <Text style={[s.statusLabel, { color: STATUS_COLOR[item.status] }]}>{item.label}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

function createStyles(colors: any, isDark: boolean) {
  return StyleSheet.create({
    screen:      { flex: 1, backgroundColor: colors.bg },
    scroll:      { padding: 20, paddingTop: 56, gap: 10 },
    title:       { fontSize: 26, fontWeight: '900', color: colors.text, letterSpacing: -1 },
    subtitle:    { fontSize: 14, color: colors.textMuted, fontWeight: '500', marginBottom: 8 },
    legend:      { flexDirection: 'row', gap: 16, marginBottom: 4 },
    legendItem:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
    dot:         { width: 10, height: 10, borderRadius: 5 },
    legendText:  { fontSize: 13, color: colors.textMuted },
    card:        { backgroundColor: colors.surface, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: colors.border },
    indicator:   { width: 5, height: 48, borderRadius: 3 },
    info:        { flex: 1 },
    dayName:     { fontSize: 15, fontWeight: '700', color: colors.text },
    dateText:    { fontSize: 13, color: colors.textMuted, marginTop: 2 },
    right:       { alignItems: 'flex-end' },
    calories:    { fontSize: 14, fontWeight: '700', color: colors.text },
    statusLabel: { fontSize: 12, fontWeight: '700', marginTop: 2 },
  });
}
