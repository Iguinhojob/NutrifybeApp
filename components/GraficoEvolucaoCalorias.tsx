import { usePremiumTheme } from '@/context/theme';
import { calorieEvolution, nutritionNumber, type CalorieMeal, type PlannedMeal } from '@/utils/calorieEvolution';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

export type GraficoEvolucaoCaloriasProps = {
  refeicoes: CalorieMeal[];
  metaDiaria: number | null;
  macros: { protein: number; carbs: number; fat: number; fiber?: number };
  refeicoesPlanejadas?: PlannedMeal[];
  origemMeta?: string;
};

export function GraficoEvolucaoCalorias({ refeicoes, metaDiaria, macros, refeicoesPlanejadas = [], origemMeta }: GraficoEvolucaoCaloriasProps) {
  const { colors: C, isDark } = usePremiumTheme();
  const [width, setWidth] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [pulse, setPulse] = useState(0);
  const pulseValue = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const previous = useRef<{ total: number; goal: number | null } | null>(null);
  const evolution = useMemo(() => calorieEvolution(refeicoes, metaDiaria, refeicoesPlanejadas), [refeicoes, metaDiaria, refeicoesPlanejadas]);
  const { points, total, target, ratio, band } = evolution;
  const color = band === 'above' ? (isDark ? '#FDBA74' : '#B45309') : band === 'near' ? (isDark ? '#6EE7B7' : '#15803D') : band === 'progress' ? (isDark ? '#B794FF' : '#00879C') : (isDark ? '#B3ACC5' : '#667C86');
  const accent = isDark ? '#B794FF' : '#00879C';
  const maxValue = Math.ceil(Math.max(target ?? 0, total, 100) * 1.2 / 100) * 100;
  const selected = points.find(point => point.id === selectedId) ?? points.at(-1);
  const chartWidth = Math.max(140, width - 52);
  const spacing = Math.max(62, (chartWidth - 32) / Math.max(points.length, 1));
  const needsScroll = points.length * spacing + 32 > chartWidth + 1;
  const data = useMemo(() => [
    { value: 0, label: 'Início', hideDataPoint: true },
    ...points.map(point => ({ value: point.accumulated, label: point.name.length > 12 ? `${point.name.slice(0, 10)}…` : point.name,
      onPress: () => setSelectedId(point.id), dataPointColor: color,
      labelComponent: () => <Pressable accessibilityRole="button" accessibilityLabel={`${point.name}, ${nutritionNumber(point.calories)} kcal, acumulado ${nutritionNumber(point.accumulated)} kcal`} onPress={() => setSelectedId(point.id)} style={s.pointLabel}>
        <Text numberOfLines={1} style={[s.axisLabel, { color: C.textMuted }]}>{point.name}</Text>
        <Text style={[s.axisTime, { color: C.textMuted }]}>{point.time.label || 'Sem horário'}</Text>
      </Pressable>,
    })),
  ], [points, color, C.textMuted]);

  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then(value => { if (active) setReduceMotion(value); });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => { active = false; subscription.remove(); };
  }, []);
  useEffect(() => {
    const animation = Animated.timing(progress, { toValue: Math.min(ratio, 1), duration: reduceMotion ? 0 : 600, useNativeDriver: false });
    animation.start();
    return () => animation.stop();
  }, [ratio, progress, reduceMotion]);
  useEffect(() => {
    const old = previous.current;
    previous.current = { total, goal: target };
    if (!old || !target || old.goal !== target || old.total >= target || total < target || reduceMotion) return;
    const listener = pulseValue.addListener(({ value }) => setPulse(value));
    const animation = Animated.sequence([
      Animated.timing(pulseValue, { toValue: 1, duration: 300, useNativeDriver: false }),
      Animated.timing(pulseValue, { toValue: 0, duration: 450, useNativeDriver: false }),
      Animated.timing(pulseValue, { toValue: .6, duration: 250, useNativeDriver: false }),
      Animated.timing(pulseValue, { toValue: 0, duration: 350, useNativeDriver: false }),
    ]);
    animation.start();
    return () => { animation.stop(); pulseValue.removeListener(listener); pulseValue.setValue(0); setPulse(0); };
  }, [total, target, reduceMotion, pulseValue]);

  const macroRows = [{ label: 'Proteínas', value: macros.protein, color: isDark ? '#C4B5FD' : '#7C3AED' },
    { label: 'Carboidratos', value: macros.carbs, color: isDark ? '#67E8F9' : '#00879C' },
    { label: 'Gorduras', value: macros.fat, color: isDark ? '#FDBA74' : '#B45309' }];
  const macroMax = Math.max(1, ...macroRows.map(row => Number.isFinite(row.value) ? row.value : 0));
  return <View style={[s.card, { backgroundColor: C.surface, borderColor: C.border, boxShadow: isDark ? '0px 6px 22px rgba(0,0,0,0.20)' : '0px 6px 22px rgba(0,95,115,0.07)' }]}>
    <View style={s.heading}><View style={{ flex: 1 }}><Text style={[s.eyebrow, { color: accent }]}>SEU DIA EM CALORIAS</Text><Text style={[s.title, { color: C.text }]}>Cada refeição conta</Text></View><View style={[s.icon, { backgroundColor: C.primarySoft }]}><Ionicons name="analytics-outline" color={accent} size={23} /></View></View>
    <View style={s.summary}>
      <View style={s.energy}>
        <Text adjustsFontSizeToFit minimumFontScale={.7} numberOfLines={1} style={[s.amount, { color: C.text }]}>{nutritionNumber(total)}<Text style={[s.targetAmount, { color: C.textMuted }]}> / {target ? nutritionNumber(target) : '—'}</Text></Text>
        <View style={s.between}><Text style={[s.small, { color: C.textMuted }]}>kcal consumidas</Text><Text style={[s.percent, { color }]}>{target ? `${nutritionNumber(ratio * 100)}%` : '—'}</Text></View>
        <View accessibilityRole="progressbar" accessibilityLabel="Progresso da meta de calorias" accessibilityValue={{ min: 0, max: 100, now: Math.min(100, Math.round(ratio * 100)), text: target ? `${nutritionNumber(ratio * 100)} por cento da meta` : 'Meta não definida' }} style={[s.progress, { backgroundColor: C.surface2 }]}>
          <Animated.View style={[s.progressFill, { backgroundColor: color, width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
        </View>
        <Text style={[s.small, { color, marginTop: 7 }]}>{band === 'near' && ratio < 1 ? 'Quase lá' : ratio >= 1 ? 'Meta alcançada' : 'No seu ritmo'}</Text>
      </View>
      <View style={s.macros}>{macroRows.map(row => <View key={row.label} style={s.macroRow}>
        <View style={s.between}><Text style={[s.small, { color: C.textMuted }]}>{row.label}</Text><Text style={[s.macroAmount, { color: C.text }]}>{nutritionNumber(row.value, 1)} g</Text></View>
        <View style={[s.macroTrack, { backgroundColor: C.surface2 }]}><View style={{ backgroundColor: row.color, height: 4, borderRadius: 3, width: `${Math.min(100, Math.max(0, row.value || 0) / macroMax * 100)}%` }} /></View>
      </View>)}</View>
    </View>
    <View style={s.between}><Text style={[s.small, { color: C.textMuted }]}>ACUMULADO · kcal</Text></View>
    <View onLayout={event => setWidth(event.nativeEvent.layout.width)} style={s.chart}>
      {width > 0 && <LineChart key={points.length} data={points.length ? data : [{ value: 0 }, { value: 0 }]} areaChart curved={false}
        width={chartWidth} height={190} maxValue={maxValue} noOfSections={4} spacing={spacing} initialSpacing={16} endSpacing={16}
        color={color} thickness={3} startFillColor={color} endFillColor={C.surface} startOpacity={.28} endOpacity={0}
        isAnimated={!reduceMotion} animateOnDataChange={!reduceMotion} animationDuration={600} onDataChangeAnimationDuration={600}
        hideDataPoints={!points.length} dataPointsRadius={5} dataPointsColor={color} dataPointsWidth={10}
        yAxisLabelWidth={42} yAxisThickness={0} xAxisThickness={1} xAxisColor={C.border}
        yAxisTextStyle={{ fontSize: 10, color: C.textMuted }} xAxisLabelTextStyle={{ fontSize: 10, color: C.textMuted }}
        formatYLabel={label => nutritionNumber(Number(label))} rulesColor={C.border} rulesType="dashed" rulesThickness={.7}
        showReferenceLine1={target !== null} referenceLine1Position={target ?? 0}
        referenceLine1Config={{ color: pulse > 0 ? (isDark ? '#6EE7B7' : '#15803D') : accent, thickness: 1.5 + pulse * 2.5, type: 'dashed', dashWidth: 6, dashGap: 5,
          labelText: `Meta ${nutritionNumber(target ?? 0)} kcal`, labelTextStyle: { color: accent, fontWeight: '700', fontSize: 11, backgroundColor: C.surface, paddingHorizontal: 4 } }}
        hideOrigin showScrollIndicator={false} scrollToEnd={needsScroll} focusEnabled unFocusOnPressOut={false}
      />}
      {!points.length && <View style={s.empty}><View style={[s.emptyBadge, { backgroundColor: C.surface, borderColor: C.border }]}><Ionicons name="restaurant-outline" size={23} color={accent} /><Text style={[s.emptyText, { color: C.text }]}>Registre sua primeira refeição</Text></View></View>}
    </View>
    {selected && <View accessibilityLiveRegion="polite" style={[s.tooltip, { backgroundColor: C.surface2 }]}>
      <View style={s.between}><Text style={[s.tooltipName, { color: C.text }]}>{selected.name}</Text><Text style={[s.small, { color: C.textMuted }]}>{selected.time.label || 'Horário não registrado'}</Text></View>
      <Text style={[s.tooltipText, { color: C.textMuted }]}><Text style={{ fontWeight: '800', color }}>{nutritionNumber(selected.calories)} kcal</Text> na refeição · <Text style={{ fontWeight: '800', color: C.text }}>{nutritionNumber(selected.accumulated)} kcal</Text> acumuladas</Text>
    </View>}
    {!!points.length && <Text style={[s.hint, { color: C.textMuted }]}>Toque em um ponto ou no nome da refeição{needsScroll ? ' · deslize para ver todas' : ''}</Text>}
    <View style={[s.message, { backgroundColor: C.primarySoft }]}><Ionicons name={ratio >= 1 ? 'checkmark-circle-outline' : 'sparkles-outline'} size={20} color={color} /><View style={{ flex: 1 }}>
      <Text accessibilityLiveRegion="polite" style={[s.messageTitle, { color: C.text }]}>{evolution.message}</Text>
      {evolution.estimate !== null && <Text style={[s.messageDetail, { color: C.textMuted }]}>Para chegar na meta, ~{nutritionNumber(evolution.estimate)} kcal por refeição restante ({evolution.remaining}).</Text>}
    </View></View>
    <Text style={[s.footer, { color: C.textMuted }]}>{origemMeta === 'plano' ? 'Meta definida pelo plano alimentar' : 'Meta calculada automaticamente pelo app'}{macros.fiber != null ? ` · Fibras ${nutritionNumber(macros.fiber, 1)} g` : ''}</Text>
  </View>;
}

const s = StyleSheet.create({
  card: { padding: 18, borderRadius: 24, borderWidth: 1, gap: 16 }, heading: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  eyebrow: { fontSize: 10, letterSpacing: 1.4, fontWeight: '800' }, title: { fontSize: 20, fontWeight: '800', marginTop: 5 },
  icon: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  summary: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, alignItems: 'center' }, energy: { flexGrow: 1, flexBasis: 145 }, macros: { flexGrow: 1, flexBasis: 120, gap: 10 },
  amount: { fontSize: 30, fontWeight: '900', letterSpacing: -.8 }, targetAmount: { fontSize: 17, fontWeight: '600', letterSpacing: 0 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }, small: { fontSize: 11 }, percent: { fontSize: 13, fontWeight: '800' },
  progress: { height: 8, borderRadius: 5, overflow: 'hidden', marginTop: 12 }, progressFill: { height: 8, borderRadius: 5 }, macroRow: { gap: 5 }, macroAmount: { fontSize: 11, fontWeight: '800' }, macroTrack: { height: 4, borderRadius: 3, overflow: 'hidden' },
  editButton: { flexDirection: 'row', gap: 5, alignItems: 'center', paddingVertical: 8 }, chart: { minHeight: 247, paddingTop: 10, overflow: 'hidden' },
  pointLabel: { width: 65, minHeight: 42, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 2 }, axisLabel: { fontSize: 10, fontWeight: '600' }, axisTime: { fontSize: 9, marginTop: 3 },
  empty: { position: 'absolute', top: 95, left: 30, right: 0, alignItems: 'center' }, emptyBadge: { alignItems: 'center', gap: 9, padding: 14, borderRadius: 16, borderWidth: 1 }, emptyText: { fontSize: 12, fontWeight: '600' },
  tooltip: { padding: 12, borderRadius: 14, gap: 6 }, tooltipName: { fontSize: 13, fontWeight: '800', flexShrink: 1 }, tooltipText: { fontSize: 12, lineHeight: 19 }, hint: { fontSize: 10, textAlign: 'center', marginTop: -8 },
  message: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 13, borderRadius: 15 }, messageTitle: { fontSize: 13, fontWeight: '700', lineHeight: 19 }, messageDetail: { fontSize: 11, lineHeight: 17, marginTop: 4 }, footer: { fontSize: 10, lineHeight: 15, textAlign: 'center' },
});
