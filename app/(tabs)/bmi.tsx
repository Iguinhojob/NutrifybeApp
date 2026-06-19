import { useAuth } from '@/context/auth';
import { usePremiumTheme } from '@/context/theme';
import { useMemo, useState } from 'react';
import { LayoutChangeEvent, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const RANGES = [
  { label: 'Abaixo do peso', min: 0,    max: 18.5, color: '#60A5FA' },
  { label: 'Peso normal',    min: 18.5, max: 25,   color: '#22C55E' },
  { label: 'Sobrepeso',      min: 25,   max: 30,   color: '#F59E0B' },
  { label: 'Obesidade I',    min: 30,   max: 35,   color: '#F97316' },
  { label: 'Obesidade II+',  min: 35,   max: 100,  color: '#EF4444' },
];

function getRange(bmi: number) {
  return RANGES.find(r => bmi >= r.min && bmi < r.max) ?? RANGES[RANGES.length - 1];
}

// Mapeia IMC 14–40 para 0–100%
function bmiToPercent(bmi: number) {
  return Math.min(Math.max((bmi - 14) / (40 - 14), 0), 1);
}

function BMIBar({ bmi, range }: { bmi: number; range: typeof RANGES[0] }) {
  const [barWidth, setBarWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setBarWidth(e.nativeEvent.layout.width);
  const indicatorLeft = barWidth > 0 ? bmiToPercent(bmi) * barWidth - 6 : 0;

  return (
    <View>
      <View style={bar.track} onLayout={onLayout}>
        {RANGES.map((r, i) => (
          <View
            key={i}
            style={[bar.segment, {
              backgroundColor: r.color,
              flex: i === RANGES.length - 1 ? 1.5 : 1,
            }]}
          />
        ))}
        {barWidth > 0 && (
          <View style={[bar.indicator, { left: indicatorLeft }]}>
            <View style={[bar.indicatorDot, { backgroundColor: range.color }]} />
          </View>
        )}
      </View>
      {/* Labels min/max */}
      <View style={bar.scaleRow}>
        <Text style={bar.scaleLabel}>14</Text>
        <Text style={bar.scaleLabel}>18.5</Text>
        <Text style={bar.scaleLabel}>25</Text>
        <Text style={bar.scaleLabel}>30</Text>
        <Text style={bar.scaleLabel}>35+</Text>
      </View>
    </View>
  );
}

const bar = StyleSheet.create({
  track:        { flexDirection: 'row', height: 14, borderRadius: 7, overflow: 'visible', position: 'relative' },
  segment:      { height: '100%' },
  indicator:    { position: 'absolute', top: -4, alignItems: 'center' },
  indicatorDot: { width: 22, height: 22, borderRadius: 11, borderWidth: 3, borderColor: '#fff', boxShadow: '0px 2px 4px rgba(0,0,0,0.2)', elevation: 4 },
  scaleRow:     { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  scaleLabel:   { fontSize: 10, color: '#9c97a2', fontWeight: '600' },
});

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
      <Text style={s.title}>IMC</Text>
      <Text style={s.subtitle}>Índice de Massa Corporal</Text>

      {bmi && range ? (
        <>
          {/* Card principal */}
          <View style={[s.bmiCard, { backgroundColor: range.color + '18', borderColor: range.color + '50' }]}>
            <Text style={[s.bmiValue, { color: range.color }]}>{bmi}</Text>
            <View style={[s.bmiLabelBadge, { backgroundColor: range.color + '25' }]}>
              <Text style={[s.bmiLabelText, { color: range.color }]}>{range.label}</Text>
            </View>
            <View style={s.bmiMeta}>
              <View style={s.bmiMetaItem}>
                <Ionicons name="barbell-outline" size={14} color={colors.textMuted} />
                <Text style={s.bmiMetaText}>{user?.weight} kg</Text>
              </View>
              <View style={s.bmiMetaDivider} />
              <View style={s.bmiMetaItem}>
                <Ionicons name="resize-outline" size={14} color={colors.textMuted} />
                <Text style={s.bmiMetaText}>{user?.height} cm</Text>
              </View>
              {user?.targetWeight && (
                <>
                  <View style={s.bmiMetaDivider} />
                  <View style={s.bmiMetaItem}>
                    <Ionicons name="flag-outline" size={14} color={colors.textMuted} />
                    <Text style={s.bmiMetaText}>Meta: {user.targetWeight} kg</Text>
                  </View>
                </>
              )}
            </View>
          </View>

          {/* Barra */}
          <View style={s.card}>
            <Text style={s.cardTitle}>Escala de IMC</Text>
            <BMIBar bmi={bmi} range={range} />
          </View>

          {/* Faixas */}
          <View style={s.card}>
            <Text style={s.cardTitle}>Classificação</Text>
            {RANGES.map((r, i) => {
              const active = bmi >= r.min && bmi < r.max;
              return (
                <View key={i} style={[s.rangeRow, active && { backgroundColor: r.color + '12' }]}>
                  <View style={[s.rangeDot, { backgroundColor: r.color }]} />
                  <Text style={s.rangeLabel}>{r.label}</Text>
                  <Text style={s.rangeVal}>{r.min} – {r.max >= 100 ? '≥35' : r.max}</Text>
                  {active && <Ionicons name="checkmark-circle" size={16} color={r.color} />}
                </View>
              );
            })}
          </View>

          {/* Dica */}
          <View style={[s.tipCard, { backgroundColor: colors.aiBannerBg, borderColor: colors.aiBannerBorder }]}>
            <Ionicons name="sparkles-outline" size={16} color={colors.purpleAccent} />
            <Text style={s.tipText}>
              {bmi < 18.5
                ? 'Seu IMC indica abaixo do peso. Considere aumentar a ingestão calórica com alimentos nutritivos.'
                : bmi < 25
                ? 'Parabéns! Seu IMC está na faixa ideal. Continue mantendo hábitos saudáveis.'
                : bmi < 30
                ? 'Seu IMC indica sobrepeso. Um déficit calórico moderado e exercícios podem ajudar.'
                : 'Seu IMC indica obesidade. Recomendamos acompanhamento com um nutricionista.'}
            </Text>
          </View>
        </>
      ) : (
        <View style={s.emptyCard}>
          <Ionicons name="body-outline" size={56} color={colors.textDim} />
          <Text style={s.emptyTitle}>Dados incompletos</Text>
          <Text style={s.emptyText}>Complete seu perfil com peso e altura para calcular o IMC.</Text>
          <TouchableOpacity
            style={[s.emptyBtn, { backgroundColor: colors.ctaContrastBg }]}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <Text style={[s.emptyBtnText, { color: colors.ctaContrastText }]}>Ir para o Perfil</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

function createStyles(colors: any, isDark: boolean) {
  return StyleSheet.create({
    screen:         { flex: 1, backgroundColor: colors.bg },
    scroll:         { padding: 20, paddingTop: 56, gap: 14 },
    title:          { fontSize: 26, fontWeight: '900', color: colors.text, letterSpacing: -1 },
    subtitle:       { fontSize: 14, color: colors.textMuted, fontWeight: '500' },
    bmiCard:        { borderRadius: 24, padding: 28, alignItems: 'center', borderWidth: 2, gap: 10 },
    bmiValue:       { fontSize: 72, fontWeight: '900', letterSpacing: -3, lineHeight: 76 },
    bmiLabelBadge:  { borderRadius: 999, paddingHorizontal: 16, paddingVertical: 6 },
    bmiLabelText:   { fontSize: 15, fontWeight: '800' },
    bmiMeta:        { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
    bmiMetaItem:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
    bmiMetaText:    { fontSize: 13, color: colors.textMuted, fontWeight: '600' },
    bmiMetaDivider: { width: 1, height: 14, backgroundColor: colors.border },
    card:           { backgroundColor: colors.surface, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: colors.border, gap: 4 },
    cardTitle:      { fontSize: 13, fontWeight: '800', color: colors.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
    rangeRow:       { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 8, borderRadius: 10 },
    rangeDot:       { width: 10, height: 10, borderRadius: 5 },
    rangeLabel:     { flex: 1, fontSize: 14, fontWeight: '600', color: colors.text },
    rangeVal:       { fontSize: 12, fontWeight: '600', color: colors.textMuted },
    tipCard:        { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderRadius: 16, padding: 14, borderWidth: 1 },
    tipText:        { flex: 1, fontSize: 13, color: colors.textMuted, lineHeight: 20, fontWeight: '500' },
    emptyCard:      { alignItems: 'center', gap: 12, padding: 40 },
    emptyTitle:     { fontSize: 18, fontWeight: '800', color: colors.text },
    emptyText:      { fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
    emptyBtn:       { borderRadius: 999, paddingHorizontal: 24, paddingVertical: 14, marginTop: 8 },
    emptyBtnText:   { fontSize: 15, fontWeight: '800' },
  });
}
