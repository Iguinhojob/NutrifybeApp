import { useAuth } from '@/context/auth';
import { usePremiumTheme } from '@/context/theme';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function WaterScreen() {
  const { user } = useAuth();
  const { colors, isDark } = usePremiumTheme();
  const s = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const goalMl = (parseFloat(user?.waterGoal || '2') * 1000);
  const [currentMl, setCurrentMl] = useState(600);
  const percent = Math.min(Math.round((currentMl / goalMl) * 100), 100);

  const add = (ml: number) => setCurrentMl(prev => Math.min(prev + ml, goalMl + 400));
  const reset = () => setCurrentMl(0);

  const STEPS = [150, 200, 300, 500];

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.scroll}>
      <Text style={s.title}>Hidratação</Text>
      <Text style={s.subtitle}>Meta diária: {goalMl}ml</Text>

      {/* Círculo de progresso */}
      <View style={s.circleWrap}>
        <View style={s.circleOuter}>
          <View style={[s.circleFill, { height: `${percent}%` as any }]} />
          <View style={s.circleContent}>
            <Ionicons name="water" size={32} color={colors.purpleAccent} />
            <Text style={s.circleValue}>{currentMl}ml</Text>
            <Text style={s.circlePercent}>{percent}%</Text>
          </View>
        </View>
      </View>

      {/* Status */}
      <View style={[s.statusCard, { backgroundColor: currentMl >= goalMl ? colors.mintBannerBg : colors.surface, borderColor: currentMl >= goalMl ? colors.mintBannerBorder : colors.border }]}>
        <Ionicons name={currentMl >= goalMl ? 'checkmark-circle' : 'water-outline'} size={20} color={currentMl >= goalMl ? colors.primary : colors.purpleAccent} />
        <Text style={[s.statusText, { color: colors.text }]}>
          {currentMl >= goalMl ? 'Meta atingida! 🎉' : `Faltam ${goalMl - currentMl}ml para a meta`}
        </Text>
      </View>

      {/* Botões de adição */}
      <Text style={s.sectionLabel}>Adicionar</Text>
      <View style={s.stepsRow}>
        {STEPS.map(ml => (
          <TouchableOpacity key={ml} style={[s.stepBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => add(ml)}>
            <Ionicons name="add" size={16} color={colors.purpleAccent} />
            <Text style={[s.stepText, { color: colors.text }]}>{ml}ml</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Histórico simulado */}
      <Text style={s.sectionLabel}>Registros de hoje</Text>
      {[
        { time: '07:30', ml: 200 },
        { time: '09:15', ml: 200 },
        { time: '11:00', ml: 200 },
      ].map((r, i) => (
        <View key={i} style={[s.recordRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="water-outline" size={16} color={colors.purpleAccent} />
          <Text style={[s.recordTime, { color: colors.textMuted }]}>{r.time}</Text>
          <Text style={[s.recordMl, { color: colors.text }]}>{r.ml}ml</Text>
        </View>
      ))}

      <TouchableOpacity style={[s.resetBtn, { borderColor: colors.border }]} onPress={reset}>
        <Text style={[s.resetText, { color: colors.textMuted }]}>Resetar dia</Text>
      </TouchableOpacity>

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
    circleWrap: { alignItems: 'center', marginBottom: 20 },
    circleOuter: { width: 180, height: 180, borderRadius: 90, backgroundColor: colors.surface, borderWidth: 3, borderColor: colors.purpleAccent + '40', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
    circleFill: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.purpleAccent + '30' },
    circleContent: { alignItems: 'center', gap: 4 },
    circleValue: { fontSize: 28, fontWeight: '900', color: colors.text },
    circlePercent: { fontSize: 14, color: colors.textMuted, fontWeight: '700' },
    statusCard: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, padding: 14, borderWidth: 1, marginBottom: 24 },
    statusText: { fontSize: 14, fontWeight: '600' },
    sectionLabel: { fontSize: 13, fontWeight: '700', color: colors.textMuted, marginBottom: 10 },
    stepsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
    stepBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, borderRadius: 14, padding: 14, borderWidth: 1 },
    stepText: { fontSize: 14, fontWeight: '700' },
    recordRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 12, padding: 12, borderWidth: 1, marginBottom: 8 },
    recordTime: { flex: 1, fontSize: 13, fontWeight: '600' },
    recordMl: { fontSize: 14, fontWeight: '700' },
    resetBtn: { borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, marginTop: 8 },
    resetText: { fontSize: 14, fontWeight: '600' },
  });
}
