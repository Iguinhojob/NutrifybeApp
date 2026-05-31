import { useAuth } from '@/context/auth';
import { usePremiumTheme } from '@/context/theme';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const RANGES = [
  { label: 'Abaixo do peso', min: 0, max: 18.5, color: '#60A5FA' },
  { label: 'Peso normal', min: 18.5, max: 25, color: '#22C55E' },
  { label: 'Sobrepeso', min: 25, max: 30, color: '#FFC107' },
  { label: 'Obesidade I', min: 30, max: 35, color: '#F97316' },
  { label: 'Obesidade II+', min: 35, max: 100, color: '#EF4444' },
];

function getRange(bmi: number) {
  return RANGES.find(r => bmi >= r.min && bmi < r.max) || RANGES[RANGES.length - 1];
}

export default function BMIScreen() {
  const { user } = useAuth();
  const { colors, isDark } = usePremiumTheme();
  const s = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const w = parseFloat(user?.weight || '0');
  const h = parseFloat(user?.height || '0') / 100;
  const bmi = w && h ? parseFloat((w / (h * h)).toFixed(1)) : null;
  const range = bmi ? getRange(bmi) : null;

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.scroll}>
      <Text style={s.title}>Índice de Massa Corporal</Text>
      <Text style={s.subtitle}>Baseado nos seus dados de perfil</Text>

      {bmi ? (
        <>
          <View style={[s.bmiCard, { backgroundColor: range!.color + '20', borderColor: range!.color + '60' }]}>
            <Text style={[s.bmiValue, { color: range!.color }]}>{bmi}</Text>
            <Text style={[s.bmiLabel, { color: range!.color }]}>{range!.label}</Text>
            <View style={s.bmiDetails}>
              <Text style={[s.bmiDetail, { color: colors.textMuted }]}>Peso: {user?.weight}kg</Text>
              <Text style={[s.bmiDetail, { color: colors.textMuted }]}>Altura: {user?.height}cm</Text>
            </View>
          </View>

          {/* Barra de IMC */}
          <View style={[s.barCard, { backgroundColor: colors.surface }]}>
            <Text style={s.barTitle}>Escala de IMC</Text>
            <View style={s.bar}>
              {RANGES.map((r, i) => (
                <View key={i} style={[s.barSegment, { backgroundColor: r.color, flex: i === RANGES.length - 1 ? 1.5 : 1 }]} />
              ))}
            </View>
            <View style={s.barIndicatorRow}>
              <View style={[s.barIndicator, { left: `${Math.min(Math.max((bmi - 15) / 25 * 100, 2), 96)}%` as any }]}>
                <View style={[s.barIndicatorDot, { backgroundColor: range!.color }]} />
              </View>
            </View>
          </View>

          {/* Faixas */}
          <View style={[s.rangesCard, { backgroundColor: colors.surface }]}>
            <Text style={s.rangesTitle}>Classificação</Text>
            {RANGES.map((r, i) => (
              <View key={i} style={[s.rangeRow, bmi >= r.min && bmi < r.max && { backgroundColor: r.color + '15' }]}>
                <View style={[s.rangeDot, { backgroundColor: r.color }]} />
                <Text style={[s.rangeLabel, { color: colors.text }]}>{r.label}</Text>
                <Text style={[s.rangeValues, { color: colors.textMuted }]}>{r.min} – {r.max === 100 ? '≥35' : r.max}</Text>
                {bmi >= r.min && bmi < r.max && <Ionicons name="location" size={14} color={r.color} />}
              </View>
            ))}
          </View>
        </>
      ) : (
        <View style={s.emptyCard}>
          <Ionicons name="body-outline" size={48} color={colors.textDim} />
          <Text style={[s.emptyText, { color: colors.textMuted }]}>Complete seu perfil com peso e altura para calcular o IMC.</Text>
        </View>
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

function createStyles(colors: any, isDark: boolean) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.bg },
    scroll: { padding: 20, paddingTop: 56 },
    title: { fontSize: 26, fontWeight: '900', color: colors.text, letterSpacing: -1 },
    subtitle: { fontSize: 14, color: colors.textMuted, fontWeight: '500', marginBottom: 24 },
    bmiCard: { borderRadius: 24, padding: 28, alignItems: 'center', borderWidth: 2, marginBottom: 16, gap: 8 },
    bmiValue: { fontSize: 64, fontWeight: '900', letterSpacing: -2 },
    bmiLabel: { fontSize: 18, fontWeight: '800' },
    bmiDetails: { flexDirection: 'row', gap: 20, marginTop: 8 },
    bmiDetail: { fontSize: 14, fontWeight: '600' },
    barCard: { borderRadius: 18, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border },
    barTitle: { fontSize: 13, fontWeight: '700', color: colors.textMuted, marginBottom: 12 },
    bar: { flexDirection: 'row', height: 12, borderRadius: 6, overflow: 'hidden' },
    barSegment: { height: '100%' },
    barIndicatorRow: { position: 'relative', height: 16, marginTop: 4 },
    barIndicator: { position: 'absolute', alignItems: 'center' },
    barIndicatorDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: '#fff' },
    rangesCard: { borderRadius: 18, padding: 16, borderWidth: 1, borderColor: colors.border },
    rangesTitle: { fontSize: 13, fontWeight: '700', color: colors.textMuted, marginBottom: 12 },
    rangeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 8, borderRadius: 10 },
    rangeDot: { width: 10, height: 10, borderRadius: 5 },
    rangeLabel: { flex: 1, fontSize: 14, fontWeight: '600' },
    rangeValues: { fontSize: 13, fontWeight: '600' },
    emptyCard: { alignItems: 'center', gap: 12, padding: 40 },
    emptyText: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  });
}
