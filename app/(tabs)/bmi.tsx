import { useAuth } from '@/context/auth';
import { usePremiumTheme } from '@/context/theme';
import { useState } from 'react';
import { LayoutChangeEvent, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { GRAD } from '@/constants/darkTheme';

const RANGES = [
  { label: 'Abaixo do peso', min: 0,    max: 18.5, color: '#60A5FA' },
  { label: 'Peso normal',    min: 18.5, max: 25,   color: '#34D399' },
  { label: 'Sobrepeso',      min: 25,   max: 30,   color: '#FBBF24' },
  { label: 'Obesidade I',    min: 30,   max: 35,   color: '#F97316' },
  { label: 'Obesidade II+',  min: 35,   max: 100,  color: '#F87171' },
];

function getRange(bmi: number) { return RANGES.find(r => bmi >= r.min && bmi < r.max) ?? RANGES[RANGES.length - 1]; }
function bmiToPercent(bmi: number) { return Math.min(Math.max((bmi - 14) / (40 - 14), 0), 1); }

function BMIBar({ bmi, range, C }: { bmi: number; range: typeof RANGES[0]; C: any }) {
  const [barWidth, setBarWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setBarWidth(e.nativeEvent.layout.width);
  const indicatorLeft = barWidth > 0 ? bmiToPercent(bmi) * barWidth - 6 : 0;
  return (
    <View>
      <View style={{ flexDirection: 'row', height: 14, borderRadius: 7, overflow: 'visible', position: 'relative' }} onLayout={onLayout}>
        {RANGES.map((r, i) => <View key={i} style={{ height: '100%', backgroundColor: r.color, flex: i === RANGES.length - 1 ? 1.5 : 1 }} />)}
        {barWidth > 0 && (
          <View style={{ position: 'absolute', top: -4, left: indicatorLeft, alignItems: 'center' }}>
            <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 3, borderColor: C.surface, backgroundColor: range.color }} />
          </View>
        )}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
        {['14', '18.5', '25', '30', '35+'].map(v => <Text key={v} style={{ fontSize: 10, color: C.textDim, fontWeight: '600' }}>{v}</Text>)}
      </View>
    </View>
  );
}

export default function BMIScreen() {
  const { colors: C } = usePremiumTheme();
  const { user } = useAuth();
  const w = parseFloat(user?.weight || '0'), h = parseFloat(user?.height || '0') / 100;
  const bmi   = w && h ? parseFloat((w / (h * h)).toFixed(1)) : null;
  const range = bmi ? getRange(bmi) : null;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 20, paddingTop: 56, gap: 14 }}>
      <Text style={{ fontSize: 26, fontWeight: '900', color: C.text, letterSpacing: -1 }}>IMC</Text>
      <Text style={{ fontSize: 14, color: C.textMuted, fontWeight: '500' }}>Índice de Massa Corporal</Text>

      {bmi && range ? (
        <>
          <View style={{ borderRadius: 24, padding: 28, alignItems: 'center', borderWidth: 2, gap: 10, backgroundColor: range.color + '18', borderColor: range.color + '50' }}>
            <Text style={{ fontSize: 72, fontWeight: '900', letterSpacing: -3, lineHeight: 76, color: range.color }}>{bmi}</Text>
            <View style={{ borderRadius: 999, paddingHorizontal: 16, paddingVertical: 6, backgroundColor: range.color + '25' }}>
              <Text style={{ fontSize: 15, fontWeight: '800', color: range.color }}>{range.label}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
              {[{ icon: 'barbell-outline' as const, text: `${user?.weight} kg` }, { icon: 'resize-outline' as const, text: `${user?.height} cm` }].map((m, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  {i > 0 && <View style={{ width: 1, height: 14, backgroundColor: C.border }} />}
                  <Ionicons name={m.icon} size={14} color={C.textMuted} />
                  <Text style={{ fontSize: 13, color: C.textMuted, fontWeight: '600' }}>{m.text}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={{ backgroundColor: C.surface, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: C.border, gap: 4 }}>
            <Text style={{ fontSize: 13, fontWeight: '800', color: C.cyan, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Escala de IMC</Text>
            <BMIBar bmi={bmi} range={range} C={C} />
          </View>

          <View style={{ backgroundColor: C.surface, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: C.border, gap: 4 }}>
            <Text style={{ fontSize: 13, fontWeight: '800', color: C.cyan, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Classificação</Text>
            {RANGES.map((r, i) => {
              const active = bmi >= r.min && bmi < r.max;
              return (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 8, borderRadius: 10, ...(active ? { backgroundColor: r.color + '12' } : {}) }}>
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: r.color }} />
                  <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color: C.text }}>{r.label}</Text>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: C.textMuted }}>{r.min} – {r.max >= 100 ? '≥35' : r.max}</Text>
                  {active && <Ionicons name="checkmark-circle" size={16} color={r.color} />}
                </View>
              );
            })}
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderRadius: 16, padding: 14, borderWidth: 1, backgroundColor: C.surface, borderColor: C.border }}>
            <Ionicons name="leaf-outline" size={16} color={C.success} />
            <Text style={{ flex: 1, fontSize: 13, color: C.textMuted, lineHeight: 20, fontWeight: '500' }}>
              {bmi < 18.5 ? 'Seu IMC indica abaixo do peso. Considere aumentar a ingestão calórica com alimentos nutritivos.'
                : bmi < 25 ? 'Parabéns! Seu IMC está na faixa ideal. Continue mantendo hábitos saudáveis.'
                : bmi < 30 ? 'Seu IMC indica sobrepeso. Um déficit calórico moderado e exercícios podem ajudar.'
                : 'Seu IMC indica obesidade. Recomendamos acompanhamento com um nutricionista.'}
            </Text>
          </View>
        </>
      ) : (
        <View style={{ alignItems: 'center', gap: 12, padding: 40 }}>
          <Ionicons name="body-outline" size={56} color={C.textDim} />
          <Text style={{ fontSize: 18, fontWeight: '800', color: C.text }}>Dados incompletos</Text>
          <Text style={{ fontSize: 14, color: C.textMuted, textAlign: 'center', lineHeight: 22 }}>Complete seu perfil com peso e altura para calcular o IMC.</Text>
          <LinearGradient colors={GRAD} start={{x:0,y:0}} end={{x:1,y:0}} style={{ borderRadius: 999, overflow: 'hidden', marginTop: 8 }}>
            <TouchableOpacity onPress={() => router.push('/(tabs)/profile')} style={{ paddingHorizontal: 24, paddingVertical: 14 }}>
              <Text style={{ fontSize: 15, fontWeight: '800', color: '#fff' }}>Ir para o Perfil</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      )}
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}
