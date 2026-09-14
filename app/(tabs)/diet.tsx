import { usePremiumTheme } from '@/context/theme';
import { useAppLayout } from '@/hooks/useAppLayout';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const DIET: Record<string, { meal: string; food: string; kcal: number; protein: number; carbs: number; fat: number }[]> = {
  Seg: [{ meal: 'Café da manhã', food: 'Aveia com frutas e mel', kcal: 320, protein: 10, carbs: 58, fat: 6 }, { meal: 'Almoço', food: 'Arroz integral, feijão, frango grelhado e salada', kcal: 680, protein: 45, carbs: 72, fat: 14 }, { meal: 'Lanche', food: 'Iogurte grego com granola', kcal: 210, protein: 14, carbs: 28, fat: 5 }, { meal: 'Jantar', food: 'Salmão assado com legumes no vapor', kcal: 520, protein: 42, carbs: 30, fat: 22 }],
  Ter: [{ meal: 'Café da manhã', food: 'Ovos mexidos com torrada integral', kcal: 350, protein: 18, carbs: 32, fat: 14 }, { meal: 'Almoço', food: 'Macarrão integral com atum e tomate', kcal: 620, protein: 38, carbs: 80, fat: 10 }, { meal: 'Lanche', food: 'Banana com pasta de amendoim', kcal: 240, protein: 8, carbs: 34, fat: 10 }, { meal: 'Jantar', food: 'Sopa de legumes com frango desfiado', kcal: 480, protein: 36, carbs: 42, fat: 12 }],
  Qua: [{ meal: 'Café da manhã', food: 'Smoothie de frutas com proteína', kcal: 290, protein: 22, carbs: 40, fat: 4 }, { meal: 'Almoço', food: 'Filé de tilápia com purê de batata doce', kcal: 590, protein: 40, carbs: 65, fat: 12 }, { meal: 'Lanche', food: 'Mix de castanhas e frutas secas', kcal: 180, protein: 5, carbs: 20, fat: 10 }, { meal: 'Jantar', food: 'Omelete de espinafre com queijo cottage', kcal: 440, protein: 32, carbs: 12, fat: 28 }],
  Qui: [{ meal: 'Café da manhã', food: 'Panqueca de banana com mel', kcal: 380, protein: 12, carbs: 62, fat: 8 }, { meal: 'Almoço', food: 'Carne moída com arroz e feijão', kcal: 720, protein: 48, carbs: 78, fat: 18 }, { meal: 'Lanche', food: 'Maçã com queijo branco', kcal: 160, protein: 8, carbs: 22, fat: 4 }, { meal: 'Jantar', food: 'Frango ao forno com batata doce', kcal: 560, protein: 44, carbs: 52, fat: 14 }],
  Sex: [{ meal: 'Café da manhã', food: 'Tapioca com frango e queijo', kcal: 340, protein: 24, carbs: 44, fat: 8 }, { meal: 'Almoço', food: 'Peixe grelhado com quinoa e salada', kcal: 580, protein: 42, carbs: 58, fat: 14 }, { meal: 'Lanche', food: 'Vitamina de abacate', kcal: 220, protein: 6, carbs: 26, fat: 12 }, { meal: 'Jantar', food: 'Wrap integral com atum e legumes', kcal: 460, protein: 34, carbs: 50, fat: 10 }],
  Sáb: [{ meal: 'Café da manhã', food: 'Açaí com granola e frutas', kcal: 420, protein: 8, carbs: 72, fat: 12 }, { meal: 'Almoço', food: 'Churrasco magro com salada verde', kcal: 650, protein: 52, carbs: 20, fat: 28 }, { meal: 'Lanche', food: 'Barra de proteína caseira', kcal: 200, protein: 16, carbs: 24, fat: 6 }, { meal: 'Jantar', food: 'Sopa de lentilha com pão integral', kcal: 480, protein: 28, carbs: 68, fat: 8 }],
  Dom: [{ meal: 'Café da manhã', food: 'Pão integral com ovos e abacate', kcal: 400, protein: 20, carbs: 38, fat: 18 }, { meal: 'Almoço', food: 'Frango assado com arroz e feijão', kcal: 700, protein: 50, carbs: 76, fat: 16 }, { meal: 'Lanche', food: 'Iogurte com chia e mel', kcal: 190, protein: 10, carbs: 28, fat: 4 }, { meal: 'Jantar', food: 'Salada completa com atum e ovos', kcal: 420, protein: 38, carbs: 18, fat: 20 }],
};

const MACRO_COLORS = [
  { label: 'Prot', color: '#3B82F6' },
  { label: 'Carb', color: '#F97316' },
  { label: 'Gord', color: '#EAB308' },
];

export default function DietScreen() {
  const { colors: C } = usePremiumTheme();
  const { topPad } = useAppLayout();
  const [selectedDay, setSelectedDay] = useState('Seg');
  const meals = DIET[selectedDay];
  const totalKcal = meals.reduce((a, m) => a + m.kcal, 0);

  const card = { backgroundColor: C.surface, borderRadius: 18, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 } as const;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 20, paddingTop: topPad }}>
      <Text style={{ fontSize: 26, fontWeight: '800', color: C.text, letterSpacing: -0.5, marginBottom: 4 }}>Dieta Semanal</Text>
      <Text style={{ fontSize: 14, color: C.textMuted, marginBottom: 20 }}>Seu plano alimentar personalizado</Text>

      {/* Seletor de dias */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        {DAYS.map(d => (
          <TouchableOpacity key={d} style={{ paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999, marginRight: 8,
            backgroundColor: selectedDay === d ? C.primary : C.surface,
            shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 }}
            onPress={() => setSelectedDay(d)}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: selectedDay === d ? '#fff' : C.textMuted }}>{d}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Total do dia */}
      <View style={[card, { backgroundColor: C.primary, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
        <View>
          <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: '600' }}>Total do dia</Text>
          <Text style={{ fontSize: 28, fontWeight: '900', color: '#fff', letterSpacing: -1 }}>{totalKcal} kcal</Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 4 }}>
          {[
            { label: 'Prot', val: meals.reduce((a, m) => a + m.protein, 0) },
            { label: 'Carb', val: meals.reduce((a, m) => a + m.carbs, 0) },
            { label: 'Gord', val: meals.reduce((a, m) => a + m.fat, 0) },
          ].map(m => (
            <Text key={m.label} style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: '600' }}>{m.label}: {m.val}g</Text>
          ))}
        </View>
      </View>

      {/* Refeições */}
      {meals.map((m, i) => (
        <View key={i} style={card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: C.primary, textTransform: 'uppercase', letterSpacing: 0.5 }}>{m.meal}</Text>
            <View style={{ backgroundColor: C.surface2, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: C.primaryDark }}>{m.kcal} kcal</Text>
            </View>
          </View>
          <Text style={{ fontSize: 14, color: C.text, lineHeight: 20, marginBottom: 12 }}>{m.food}</Text>
          <View style={{ flexDirection: 'row', gap: 16 }}>
            {[{ label: 'Prot', value: m.protein, color: '#3B82F6' }, { label: 'Carb', value: m.carbs, color: '#F97316' }, { label: 'Gord', value: m.fat, color: '#EAB308' }].map(mac => (
              <View key={mac.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: mac.color }} />
                <Text style={{ fontSize: 13, fontWeight: '700', color: C.text }}>{mac.value}g</Text>
                <Text style={{ fontSize: 11, color: C.textMuted }}>{mac.label}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}
