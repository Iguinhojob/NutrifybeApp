import { useAuth } from '@/context/auth';
import { usePremiumTheme } from '@/context/theme';
import { useAppLayout } from '@/hooks/useAppLayout';
import { useState } from 'react';
import { LayoutChangeEvent, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const RANGES = [
  { label: 'Abaixo do peso', min: 0,    max: 18.5, color: '#60A5FA' },
  { label: 'Peso normal',    min: 18.5, max: 25,   color: '#22C55E' },
  { label: 'Sobrepeso',      min: 25,   max: 30,   color: '#F97316' },
  { label: 'Obesidade I',    min: 30,   max: 35,   color: '#EF4444' },
  { label: 'Obesidade II+',  min: 35,   max: 100,  color: '#7F1D1D' },
];

function getRange(bmi: number) { return RANGES.find(r => bmi >= r.min && bmi < r.max) ?? RANGES[RANGES.length - 1]; }
function bmiToPercent(bmi: number) { return Math.min(Math.max((bmi - 14) / (40 - 14), 0), 1); }

function BMIBar({ bmi, range, C }: { bmi: number; range: typeof RANGES[0]; C: any }) {
  const [barWidth, setBarWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setBarWidth(e.nativeEvent.layout.width);
  const left = barWidth > 0 ? bmiToPercent(bmi) * barWidth - 11 : 0;
  return (
    <View>
      <View style={{ flexDirection: 'row', height: 12, borderRadius: 6, overflow: 'visible' }} onLayout={onLayout}>
        {RANGES.map((r, i) => <View key={i} style={{ height: '100%', backgroundColor: r.color, flex: i === RANGES.length - 1 ? 1.5 : 1 }} />)}
        {barWidth > 0 && (
          <View style={{ position: 'absolute', top: -5, left, width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff', borderWidth: 3, borderColor: range.color,
            shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 }} />
        )}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
        {['14', '18.5', '25', '30', '35+'].map(v => <Text key={v} style={{ fontSize: 10, color: C.textMuted, fontWeight: '600' }}>{v}</Text>)}
      </View>
    </View>
  );
}

export default function BMIScreen() {
  const { colors: C } = usePremiumTheme();
  const { topPad } = useAppLayout();
  const { user } = useAuth();
  const w = parseFloat(user?.weight || '0'), h = parseFloat(user?.height || '0') / 100;
  const bmi   = w && h ? parseFloat((w / (h * h)).toFixed(1)) : null;
  const range = bmi ? getRange(bmi) : null;

  const card = { backgroundColor: C.surface, borderRadius: 20, padding: 18, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 } as const;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 20, paddingTop: topPad }}>
      <Text style={{ fontSize: 26, fontWeight: '800', color: C.text, letterSpacing: -0.5, marginBottom: 4 }}>IMC</Text>
      <Text style={{ fontSize: 14, color: C.textMuted, marginBottom: 20 }}>Índice de Massa Corporal</Text>

      {bmi && range ? (
        <>
          {/* Card principal */}
          <View style={[card, { alignItems: 'center', paddingVertical: 28, borderTopWidth: 4, borderTopColor: range.color }]}>
            <Text style={{ fontSize: 72, fontWeight: '900', color: range.color, letterSpacing: -3, lineHeight: 76 }} adjustsFontSizeToFit numberOfLines={1} minimumFontScale={0.5}>{bmi}</Text>
            <View style={{ borderRadius: 999, paddingHorizontal: 16, paddingVertical: 6, backgroundColor: range.color + '18', marginTop: 8 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: range.color }}>{range.label}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 20, marginTop: 16 }}>
              {[{ icon: 'barbell-outline' as const, text: `${user?.weight} kg` }, { icon: 'resize-outline' as const, text: `${user?.height} cm` }].map((m, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name={m.icon} size={14} color={C.textMuted} />
                  <Text style={{ fontSize: 13, color: C.textMuted, fontWeight: '600' }}>{m.text}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Escala */}
          <View style={card}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 16 }}>Escala de IMC</Text>
            <BMIBar bmi={bmi} range={range} C={C} />
          </View>

          {/* Classificação */}
          <View style={card}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 12 }}>Classificação</Text>
            {RANGES.map((r, i) => {
              const active = bmi >= r.min && bmi < r.max;
              return (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 8, borderRadius: 10,
                  ...(active ? { backgroundColor: r.color + '12' } : {}),
                  ...(i < RANGES.length - 1 ? { borderBottomWidth: 1, borderBottomColor: C.border } : {}) }}>
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: r.color }} />
                  <Text style={{ flex: 1, fontSize: 14, color: active ? C.text : C.textMuted, fontWeight: active ? '700' : '500' }}>{r.label}</Text>
                  <Text style={{ fontSize: 12, color: C.textDim }}>{r.min} – {r.max >= 100 ? '≥35' : r.max}</Text>
                  {active && <Ionicons name="checkmark-circle" size={16} color={r.color} />}
                </View>
              );
            })}
          </View>

          {/* Dica */}
          <View style={[card, { flexDirection: 'row', gap: 12, alignItems: 'flex-start' }]}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="leaf-outline" size={18} color={C.primary} />
            </View>
            <Text style={{ flex: 1, fontSize: 13, color: C.textMuted, lineHeight: 20 }}>
              {bmi < 18.5 ? 'Seu IMC indica abaixo do peso. Considere aumentar a ingestão calórica com alimentos nutritivos.'
                : bmi < 25 ? 'Parabéns! Seu IMC está na faixa ideal. Continue mantendo hábitos saudáveis.'
                : bmi < 30 ? 'Seu IMC indica sobrepeso. Um déficit calórico moderado e exercícios podem ajudar.'
                : 'Seu IMC indica obesidade. Recomendamos acompanhamento com um nutricionista.'}
            </Text>
          </View>
        </>
      ) : (
        <View style={[card, { alignItems: 'center', paddingVertical: 40, gap: 12 }]}>
          <Ionicons name="body-outline" size={56} color={C.border} />
          <Text style={{ fontSize: 18, fontWeight: '700', color: C.text }}>Dados incompletos</Text>
          <Text style={{ fontSize: 14, color: C.textMuted, textAlign: 'center', lineHeight: 22 }}>Complete seu perfil com peso e altura para calcular o IMC.</Text>
          <TouchableOpacity style={{ backgroundColor: C.primary, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 14, marginTop: 8 }}
            onPress={() => router.push('/(tabs)/profile')}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>Ir para o Perfil</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}
