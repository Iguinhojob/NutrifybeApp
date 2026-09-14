import { usePremiumTheme } from '@/context/theme';
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
  const { colors: C } = usePremiumTheme();
  const STATUS_COLOR: Record<string, string> = { green: C.success, yellow: C.warning, red: C.danger };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 20, paddingTop: 56, gap: 10 }}>
      <Text style={{ fontSize: 26, fontWeight: '900', color: C.text, letterSpacing: -1 }}>Histórico</Text>
      <Text style={{ fontSize: 14, color: C.textMuted, fontWeight: '500', marginBottom: 8 }}>Acompanhe sua evolução diária</Text>
      <View style={{ flexDirection: 'row', gap: 16, marginBottom: 4 }}>
        {[{ color: C.success, label: 'Bom' }, { color: C.warning, label: 'Regular' }, { color: C.danger, label: 'Ruim' }].map(l => (
          <View key={l.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: l.color }} />
            <Text style={{ fontSize: 13, color: C.textMuted }}>{l.label}</Text>
          </View>
        ))}
      </View>
      {HISTORY.map((item, i) => (
        <View key={i} style={{ backgroundColor: C.surface, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: C.border }}>
          <View style={{ width: 5, height: 48, borderRadius: 3, backgroundColor: STATUS_COLOR[item.status] }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: C.text }}>{item.day}</Text>
            <Text style={{ fontSize: 13, color: C.textMuted, marginTop: 2 }}>{item.date}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: C.text }}>{item.calories}</Text>
            <Text style={{ fontSize: 12, fontWeight: '700', marginTop: 2, color: STATUS_COLOR[item.status] }}>{item.label}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
