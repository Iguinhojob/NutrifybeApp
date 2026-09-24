import { usePremiumTheme } from '@/context/theme';
import { useAppLayout } from '@/hooks/useAppLayout';
import { useAuth } from '@/context/auth';
import { DiaryAPI, recentLocalDates } from '@/services/api';
import { calculateCalorieGoal } from '@/utils/onboarding';
import { useEffect, useState } from 'react';
import { Alert, LayoutChangeEvent, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type DayCalories = { date: string; label: string; calories: number };
const CHART_H = 130;

function LineChart({ C, data }: { C: any; data: DayCalories[] }) {
  const [width, setWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);
  const values = data.map(item => item.calories);
  const max = Math.max(1, ...values), min = Math.min(0, ...values), range = Math.max(1, max - min);
  const points = width > 0 ? values.map((value, i) => ({ x: data.length > 1 ? (i / (data.length - 1)) * width : width / 2, y: CHART_H - ((value - min) / range) * CHART_H })) : [];

  return <View>
    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
      <View style={{ width: 44, height: CHART_H, justifyContent: 'space-between', paddingBottom: 2 }}>
        {[max, Math.round((max + min) / 2), min].map(value => <Text key={value} style={{ fontSize: 9, color: C.textDim, textAlign: 'right' }}>{value}</Text>)}
      </View>
      <View style={{ flex: 1, height: CHART_H }} onLayout={onLayout}>
        {width > 0 && <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          {[0, 0.5, 1].map(f => <View key={f} style={{ position: 'absolute', top: f * CHART_H, left: 0, right: 0, height: 1, backgroundColor: C.border }} />)}
          {points.slice(1).map((point, i) => {
            const previous = points[i], dx = point.x - previous.x, dy = point.y - previous.y;
            const length = Math.sqrt(dx * dx + dy * dy), angle = Math.atan2(dy, dx) * 180 / Math.PI;
            return <View key={i} style={{ position: 'absolute', left: previous.x, top: previous.y, width: length, height: 2.5, backgroundColor: C.primary, borderRadius: 2, transformOrigin: 'left center', transform: [{ rotate: `${angle}deg` }] }} />;
          })}
          {points.map((point, i) => <View key={i} style={{ position: 'absolute', left: point.x - 5, top: point.y - 5, width: 10, height: 10, borderRadius: 5, backgroundColor: C.surface, borderWidth: 2.5, borderColor: C.primary }} />)}
        </View>}
      </View>
    </View>
    <View style={{ flexDirection: 'row', marginLeft: 44, marginTop: 8 }}>
      {data.map(item => <Text key={item.date} style={{ flex: 1, fontSize: 9, color: C.textMuted, textAlign: 'center' }}>{item.label}</Text>)}
    </View>
  </View>;
}

export default function TrendsScreen() {
  const { colors: C } = usePremiumTheme();
  const { topPad } = useAppLayout();
  const { user } = useAuth();
  const [days, setDays] = useState<DayCalories[]>([]);
  const calorieGoal = calculateCalorieGoal({ weight: user?.weight || '', height: user?.height || '', birthDate: user?.birthDate || '', sexo: user?.sexo || '', activityLevel: user?.activityLevel || '', goal: user?.goal || '', targetWeight: user?.targetWeight || '' });

  useEffect(() => {
    Promise.all(recentLocalDates(7).map(async date => {
      const entries = await DiaryAPI.meals(date);
      const day = new Date(`${date}T12:00:00`);
      return { date, label: day.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''), calories: Math.round(entries.reduce((sum, entry) => sum + Number(entry.calories), 0)) };
    })).then(setDays).catch(error => Alert.alert('Erro', error instanceof Error ? error.message : 'Não foi possível carregar a evolução.'));
  }, []);

  const loggedDays = days.filter(day => day.calories > 0);
  const done = loggedDays.filter(day => day.calories <= calorieGoal).length;
  const average = loggedDays.length ? Math.round(loggedDays.reduce((sum, day) => sum + day.calories, 0) / loggedDays.length) : 0;
  const percentage = loggedDays.length ? Math.round(done / loggedDays.length * 100) : 0;
  const consistency = Math.round(done / 7 * 100);
  const riskColor = consistency >= 70 ? C.success : consistency >= 40 ? C.warning : C.danger;
  const bestDay = loggedDays.length ? Math.min(...loggedDays.map(day => day.calories)) : 0;
  const worstDay = loggedDays.length ? Math.max(...loggedDays.map(day => day.calories)) : 0;
  const card = { backgroundColor: C.surface, borderRadius: 20, padding: 18, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 } as const;

  return <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 20, paddingTop: topPad }} showsVerticalScrollIndicator={false}>
    <Text style={{ fontSize: 26, fontWeight: '800', color: C.text, letterSpacing: -0.5, marginBottom: 4 }}>Evolução</Text>
    <Text style={{ fontSize: 14, color: C.textMuted, marginBottom: 20 }}>Com base nas refeições registradas nos últimos sete dias</Text>

    <View style={[card, { backgroundColor: C.surface2, borderLeftWidth: 4, borderLeftColor: riskColor }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <Ionicons name="bulb-outline" size={16} color={riskColor} />
        <Text style={{ fontSize: 14, fontWeight: '700', color: C.text, flex: 1 }}>Resumo da semana</Text>
        <View style={{ borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, backgroundColor: riskColor + '20' }}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: riskColor }}>{loggedDays.length ? `${done} de ${loggedDays.length} dias na meta` : 'Sem registros'}</Text>
        </View>
      </View>
      <Text style={{ fontSize: 13, color: C.textMuted, lineHeight: 20 }}>
        {loggedDays.length ? `Meta diária de ${calorieGoal.toLocaleString('pt-BR')} kcal. ${7 - loggedDays.length} ${7 - loggedDays.length === 1 ? 'dia sem registro' : 'dias sem registro'} nesta semana.` : 'Registre suas refeições para acompanhar sua evolução.'}
      </Text>
    </View>

    <View style={card}>
      <Text style={{ fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 16 }}>Calorias dos últimos sete dias</Text>
      <LineChart C={C} data={days} />
    </View>

    <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
      {[
        { label: 'Média registrada', value: `${average.toLocaleString('pt-BR')}`, sub: 'kcal/dia', highlight: false },
        { label: 'Dias dentro da meta', value: `${percentage}%`, sub: `${done}/${loggedDays.length}`, highlight: true },
        { label: 'Meta diária', value: calorieGoal.toLocaleString('pt-BR'), sub: 'kcal', highlight: false },
      ].map(stat => <View key={stat.label} style={[{ flex: 1, borderRadius: 16, padding: 14, alignItems: 'center', gap: 2 },
        stat.highlight ? { backgroundColor: C.primary } : { backgroundColor: C.surface, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }]}>
        <Text style={{ fontSize: 20, fontWeight: '900', color: stat.highlight ? '#fff' : C.primary }}>{stat.value}</Text>
        <Text style={{ fontSize: 10, fontWeight: '600', color: stat.highlight ? 'rgba(255,255,255,0.8)' : C.textMuted, textAlign: 'center' }}>{stat.label}</Text>
        <Text style={{ fontSize: 9, color: stat.highlight ? 'rgba(255,255,255,0.6)' : C.textDim }}>{stat.sub}</Text>
      </View>)}
    </View>

    <View style={card}>
      <Text style={{ fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 12 }}>Resumo dos registros</Text>
      {[
        { label: 'Consistência semanal', value: `${consistency}%`, color: riskColor },
        { label: 'Dias dentro da meta', value: `${done}/7`, color: C.primary },
        { label: 'Menor consumo registrado', value: `${bestDay.toLocaleString('pt-BR')} kcal`, color: C.blue },
        { label: 'Maior consumo registrado', value: `${worstDay.toLocaleString('pt-BR')} kcal`, color: C.danger },
      ].map((item, i, all) => <View key={item.label} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12,
        ...(i < all.length - 1 ? { borderBottomWidth: 1, borderBottomColor: C.border } : {}) }}>
        <Text style={{ fontSize: 14, color: C.textMuted }}>{item.label}</Text>
        <Text style={{ fontSize: 14, fontWeight: '700', color: item.color }}>{item.value}</Text>
      </View>)}
    </View>
    <View style={{ height: 100 }} />
  </ScrollView>;
}
