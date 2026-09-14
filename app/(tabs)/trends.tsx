import { usePremiumTheme } from '@/context/theme';
import { useState } from 'react';
import { LayoutChangeEvent, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DATA = [1820, 1950, 2100, 2450, 1780, 2050, 1900];
const LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const MAX_V = Math.max(...DATA), MIN_V = Math.min(...DATA), CHART_H = 130;
const avg = Math.round(DATA.reduce((a, b) => a + b, 0) / DATA.length);
const GOAL = 1900, done = DATA.filter(v => v <= GOAL).length;
const percent = Math.round((done / DATA.length) * 100);
const consistency = Math.round((done / 7) * 100);

function LineChart({ C }: { C: any }) {
  const [width, setWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);
  const points = width > 0 ? DATA.map((v, i) => ({ x: (i / (DATA.length - 1)) * width, y: CHART_H - ((v - MIN_V) / (MAX_V - MIN_V)) * CHART_H })) : [];
  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        <View style={{ width: 38, height: CHART_H, justifyContent: 'space-between', paddingBottom: 2 }}>
          {[MAX_V, Math.round((MAX_V + MIN_V) / 2), MIN_V].map(v => <Text key={v} style={{ fontSize: 9, color: C.textDim, textAlign: 'right' }}>{v}</Text>)}
        </View>
        <View style={{ flex: 1, height: CHART_H }} onLayout={onLayout}>
          {width > 0 && (
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
              {[0, 0.5, 1].map(f => <View key={f} style={{ position: 'absolute', top: f * CHART_H, left: 0, right: 0, height: 1, backgroundColor: C.border, opacity: 0.5 }} />)}
              {points.slice(1).map((p, i) => {
                const prev = points[i], dx = p.x - prev.x, dy = p.y - prev.y;
                const len = Math.sqrt(dx * dx + dy * dy), angle = Math.atan2(dy, dx) * (180 / Math.PI);
                return <View key={i} style={{ position: 'absolute', left: prev.x, top: prev.y, width: len, height: 2, backgroundColor: C.purple, borderRadius: 1, transformOrigin: 'left center', transform: [{ rotate: `${angle}deg` }] }} />;
              })}
              {points.map((p, i) => <View key={i} style={{ position: 'absolute', left: p.x - 5, top: p.y - 5, width: 10, height: 10, borderRadius: 5, backgroundColor: C.cyan, borderWidth: 2, borderColor: C.surface }} />)}
            </View>
          )}
        </View>
      </View>
      <View style={{ flexDirection: 'row', marginLeft: 38, marginTop: 6 }}>
        {LABELS.map(l => <Text key={l} style={{ flex: 1, fontSize: 10, color: C.textDim, textAlign: 'center' }}>{l}</Text>)}
      </View>
    </View>
  );
}

export default function TrendsScreen() {
  const { colors: C } = usePremiumTheme();
  const riskColor = consistency >= 70 ? C.success : consistency >= 40 ? C.warning : C.danger;
  const weekSummary = consistency >= 70 ? `Excelente semana! Você manteve ${done} dias dentro da meta calórica.` : `Você ficou ${7 - done} dias acima da meta. Foque na consistência!`;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 20, paddingTop: 56, gap: 14 }} showsVerticalScrollIndicator={false}>
      <Text style={{ fontSize: 26, fontWeight: '900', color: C.text, letterSpacing: -1 }}>Evolução</Text>
      <Text style={{ fontSize: 14, color: C.textMuted, fontWeight: '500' }}>Seu desempenho ao longo do tempo</Text>

      <View style={{ borderRadius: 18, padding: 16, borderWidth: 1, gap: 8, backgroundColor: C.surface, borderColor: C.border }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="sparkles-outline" size={16} color={C.purpleLight} />
          <Text style={{ flex: 1, fontSize: 14, fontWeight: '800', color: C.text }}>Insight da semana</Text>
          <View style={{ borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: riskColor + '25' }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: riskColor }}>{consistency >= 70 ? 'Risco baixo' : consistency >= 40 ? 'Risco médio' : 'Risco alto'}</Text>
          </View>
        </View>
        <Text style={{ fontSize: 13, lineHeight: 20, fontWeight: '500', color: C.textMuted }}>{weekSummary}</Text>
      </View>

      <View style={{ borderRadius: 20, padding: 16, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface }}>
        <Text style={{ fontSize: 14, fontWeight: '800', color: C.text, marginBottom: 12 }}>Calorias — Últimos 7 dias</Text>
        <LineChart C={C} />
      </View>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        {[
          { label: 'Média kcal/dia', value: String(avg),   highlight: false },
          { label: 'Meta atingida',  value: `${percent}%`, highlight: true  },
          { label: 'Meta kcal',      value: String(GOAL),  highlight: false },
        ].map(stat => (
          <View key={stat.label} style={{ flex: 1, borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: stat.highlight ? C.purple : C.border, backgroundColor: stat.highlight ? C.purple : C.surface }}>
            <Text style={{ fontSize: 18, fontWeight: '900', color: stat.highlight ? C.white : C.cyan }}>{stat.value}</Text>
            <Text style={{ fontSize: 10, fontWeight: '700', textAlign: 'center', marginTop: 4, color: stat.highlight ? C.white + 'bb' : C.textMuted }}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={{ borderRadius: 20, padding: 16, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface }}>
        <Text style={{ fontSize: 14, fontWeight: '800', color: C.text, marginBottom: 12 }}>Resumo Semanal</Text>
        {[
          { label: 'Consistência',        value: `${consistency}%`, color: riskColor },
          { label: 'Dias dentro da meta', value: `${done}/7`,       color: C.cyan },
          { label: 'Melhor dia',          value: `${MIN_V} kcal`,   color: C.purpleLight },
          { label: 'Pior dia',            value: `${MAX_V} kcal`,   color: C.danger },
        ].map((item, i, arr) => (
          <View key={item.label} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 11, ...(i < arr.length - 1 ? { borderBottomWidth: 1, borderBottomColor: C.border } : {}) }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: C.text }}>{item.label}</Text>
            <Text style={{ fontSize: 14, fontWeight: '800', color: item.color }}>{item.value}</Text>
          </View>
        ))}
      </View>
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}
