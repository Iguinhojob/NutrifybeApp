import { usePremiumTheme } from '@/context/theme';
import { useAppLayout } from '@/hooks/useAppLayout';
import { useState } from 'react';
import { LayoutChangeEvent, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DATA   = [1820, 1950, 2100, 2450, 1780, 2050, 1900];
const LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const MAX_V  = Math.max(...DATA), MIN_V = Math.min(...DATA), CHART_H = 130;
const avg    = Math.round(DATA.reduce((a, b) => a + b, 0) / DATA.length);
const GOAL   = 1900, done = DATA.filter(v => v <= GOAL).length;
const pct    = Math.round((done / DATA.length) * 100);
const consistency = Math.round((done / 7) * 100);

function LineChart({ C }: { C: any }) {
  const [width, setWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);
  const points = width > 0 ? DATA.map((v, i) => ({
    x: (i / (DATA.length - 1)) * width,
    y: CHART_H - ((v - MIN_V) / (MAX_V - MIN_V)) * CHART_H,
  })) : [];

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        <View style={{ width: 44, height: CHART_H, justifyContent: 'space-between', paddingBottom: 2 }}>
          {[MAX_V, Math.round((MAX_V + MIN_V) / 2), MIN_V].map(v => (
            <Text key={v} style={{ fontSize: 9, color: C.textDim, textAlign: 'right' }}>{v}</Text>
          ))}
        </View>
        <View style={{ flex: 1, height: CHART_H }} onLayout={onLayout}>
          {width > 0 && (
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
              {[0, 0.5, 1].map(f => (
                <View key={f} style={{ position: 'absolute', top: f * CHART_H, left: 0, right: 0, height: 1, backgroundColor: C.border }} />
              ))}
              {points.slice(1).map((p, i) => {
                const prev = points[i], dx = p.x - prev.x, dy = p.y - prev.y;
                const len = Math.sqrt(dx * dx + dy * dy), angle = Math.atan2(dy, dx) * (180 / Math.PI);
                return <View key={i} style={{ position: 'absolute', left: prev.x, top: prev.y, width: len, height: 2.5, backgroundColor: C.primary, borderRadius: 2, transformOrigin: 'left center', transform: [{ rotate: `${angle}deg` }] }} />;
              })}
              {points.map((p, i) => (
                <View key={i} style={{ position: 'absolute', left: p.x - 5, top: p.y - 5, width: 10, height: 10, borderRadius: 5, backgroundColor: C.surface, borderWidth: 2.5, borderColor: C.primary }} />
              ))}
            </View>
          )}
        </View>
      </View>
      <View style={{ flexDirection: 'row', marginLeft: 44, marginTop: 8 }}>
        {LABELS.map(l => <Text key={l} style={{ flex: 1, fontSize: 10, color: C.textMuted, textAlign: 'center' }}>{l}</Text>)}
      </View>
    </View>
  );
}

export default function TrendsScreen() {
  const { colors: C } = usePremiumTheme();
  const { topPad } = useAppLayout();
  const riskColor = consistency >= 70 ? C.success : consistency >= 40 ? C.warning : C.danger;

  const card = { backgroundColor: C.surface, borderRadius: 20, padding: 18, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 } as const;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 20, paddingTop: topPad }} showsVerticalScrollIndicator={false}>
      <Text style={{ fontSize: 26, fontWeight: '800', color: C.text, letterSpacing: -0.5, marginBottom: 4 }}>Evolução</Text>
      <Text style={{ fontSize: 14, color: C.textMuted, marginBottom: 20 }}>Seu desempenho ao longo do tempo</Text>

      {/* Insight */}
      <View style={[card, { backgroundColor: C.surface2, borderLeftWidth: 4, borderLeftColor: riskColor }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <Ionicons name="bulb-outline" size={16} color={riskColor} />
          <Text style={{ fontSize: 14, fontWeight: '700', color: C.text, flex: 1 }}>Insight da semana</Text>
          <View style={{ borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, backgroundColor: riskColor + '20' }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: riskColor }}>
              {consistency >= 70 ? 'Ótimo' : consistency >= 40 ? 'Regular' : 'Atenção'}
            </Text>
          </View>
        </View>
        <Text style={{ fontSize: 13, color: C.textMuted, lineHeight: 20 }}>
          {consistency >= 70 ? `Excelente! Você manteve ${done} dias dentro da meta calórica.` : `Você ficou ${7 - done} dias acima da meta. Foque na consistência!`}
        </Text>
      </View>

      {/* Gráfico */}
      <View style={card}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 16 }}>Calorias — Últimos 7 dias</Text>
        <LineChart C={C} />
      </View>

      {/* Stats */}
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
        {[
          { label: 'Média/dia',     value: `${avg}`,   sub: 'kcal',  highlight: false },
          { label: 'Meta atingida', value: `${pct}%`,  sub: `${done}/7 dias`, highlight: true  },
          { label: 'Meta diária',   value: `${GOAL}`,  sub: 'kcal',  highlight: false },
        ].map(stat => (
          <View key={stat.label} style={[{ flex: 1, borderRadius: 16, padding: 14, alignItems: 'center', gap: 2 },
            stat.highlight ? { backgroundColor: C.primary } : { backgroundColor: C.surface, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }]}>
            <Text style={{ fontSize: 20, fontWeight: '900', color: stat.highlight ? '#fff' : C.primary }}>{stat.value}</Text>
            <Text style={{ fontSize: 10, fontWeight: '600', color: stat.highlight ? 'rgba(255,255,255,0.8)' : C.textMuted, textAlign: 'center' }}>{stat.label}</Text>
            <Text style={{ fontSize: 9, color: stat.highlight ? 'rgba(255,255,255,0.6)' : C.textDim }}>{stat.sub}</Text>
          </View>
        ))}
      </View>

      {/* Resumo */}
      <View style={card}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 12 }}>Resumo Semanal</Text>
        {[
          { label: 'Consistência',        value: `${consistency}%`, color: riskColor },
          { label: 'Dias dentro da meta', value: `${done}/7`,       color: C.primary },
          { label: 'Melhor dia',          value: `${MIN_V} kcal`,   color: C.blue },
          { label: 'Pior dia',            value: `${MAX_V} kcal`,   color: C.danger },
        ].map((item, i, arr) => (
          <View key={item.label} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12,
            ...(i < arr.length - 1 ? { borderBottomWidth: 1, borderBottomColor: C.border } : {}) }}>
            <Text style={{ fontSize: 14, color: C.textMuted }}>{item.label}</Text>
            <Text style={{ fontSize: 14, fontWeight: '700', color: item.color }}>{item.value}</Text>
          </View>
        ))}
      </View>
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}
