import { usePremiumTheme } from '@/context/theme';
import { useAppLayout } from '@/hooks/useAppLayout';
import { ScrollView, Text, View } from 'react-native';

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
  const { topPad } = useAppLayout();
  const STATUS: Record<string, { color: string; bg: string }> = {
    green:  { color: C.success,  bg: C.surface2 },
    yellow: { color: C.warning,  bg: C.yellowLight },
    red:    { color: C.danger,   bg: C.dangerLight },
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 20, paddingTop: topPad, gap: 10 }}>
      <Text style={{ fontSize: 26, fontWeight: '800', color: C.text, letterSpacing: -0.5 }}>Histórico</Text>
      <Text style={{ fontSize: 14, color: C.textMuted, marginBottom: 8 }}>Acompanhe sua evolução diária</Text>

      {/* Legenda */}
      <View style={{ flexDirection: 'row', gap: 16, marginBottom: 4 }}>
        {[{ color: C.success, label: 'Bom' }, { color: C.warning, label: 'Regular' }, { color: C.danger, label: 'Ruim' }].map(l => (
          <View key={l.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: l.color }} />
            <Text style={{ fontSize: 13, color: C.textMuted }}>{l.label}</Text>
          </View>
        ))}
      </View>

      {HISTORY.map((item, i) => (
        <View key={i} style={{ backgroundColor: C.surface, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14,
          shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}>
          <View style={{ width: 5, height: 44, borderRadius: 3, backgroundColor: STATUS[item.status].color }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: C.text }}>{item.day}</Text>
            <Text style={{ fontSize: 13, color: C.textMuted, marginTop: 2 }}>{item.date}</Text>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 4 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: C.text }}>{item.calories}</Text>
            <View style={{ borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, backgroundColor: STATUS[item.status].bg }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: STATUS[item.status].color }}>{item.label}</Text>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
