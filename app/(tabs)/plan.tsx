import { useAuth } from '@/context/auth';
import { usePremiumTheme } from '@/context/theme';
import { useAppLayout } from '@/hooks/useAppLayout';
import { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const PLAN: Record<string, { name: string; time: string; foods: string[]; kcal: number; origin: 'IA' | 'Nutricionista' | 'Pendente'; done: boolean }[]> = {
  Seg: [{ name: 'Café da manhã', time: '07:00', foods: ['Aveia com frutas', 'Mel', 'Café preto'], kcal: 320, origin: 'IA', done: true }, { name: 'Almoço', time: '12:30', foods: ['Arroz integral', 'Feijão', 'Frango grelhado', 'Salada verde'], kcal: 680, origin: 'Nutricionista', done: true }, { name: 'Lanche', time: '16:00', foods: ['Iogurte grego', 'Granola'], kcal: 210, origin: 'IA', done: false }, { name: 'Jantar', time: '19:30', foods: ['Salmão assado', 'Legumes no vapor'], kcal: 520, origin: 'Nutricionista', done: false }],
  Ter: [{ name: 'Café da manhã', time: '07:00', foods: ['Ovos mexidos', 'Torrada integral'], kcal: 350, origin: 'IA', done: false }, { name: 'Almoço', time: '12:30', foods: ['Macarrão integral', 'Atum', 'Tomate'], kcal: 620, origin: 'IA', done: false }, { name: 'Lanche', time: '16:00', foods: ['Banana', 'Pasta de amendoim'], kcal: 240, origin: 'Pendente', done: false }, { name: 'Jantar', time: '19:30', foods: ['Sopa de legumes', 'Frango desfiado'], kcal: 480, origin: 'Pendente', done: false }],
  Qua: [{ name: 'Café da manhã', time: '07:00', foods: ['Smoothie de frutas', 'Proteína em pó'], kcal: 290, origin: 'IA', done: false }, { name: 'Almoço', time: '12:30', foods: ['Tilápia grelhada', 'Purê de batata doce'], kcal: 590, origin: 'Nutricionista', done: false }, { name: 'Lanche', time: '16:00', foods: ['Mix de castanhas', 'Frutas secas'], kcal: 180, origin: 'IA', done: false }, { name: 'Jantar', time: '19:30', foods: ['Omelete de espinafre', 'Queijo cottage'], kcal: 440, origin: 'IA', done: false }],
  Qui: [{ name: 'Café da manhã', time: '07:00', foods: ['Panqueca de banana', 'Mel'], kcal: 380, origin: 'Pendente', done: false }, { name: 'Almoço', time: '12:30', foods: ['Carne moída', 'Arroz', 'Feijão'], kcal: 720, origin: 'Nutricionista', done: false }, { name: 'Lanche', time: '16:00', foods: ['Maçã', 'Queijo branco'], kcal: 160, origin: 'IA', done: false }, { name: 'Jantar', time: '19:30', foods: ['Frango ao forno', 'Batata doce'], kcal: 560, origin: 'IA', done: false }],
  Sex: [{ name: 'Café da manhã', time: '07:00', foods: ['Tapioca', 'Frango', 'Queijo'], kcal: 340, origin: 'IA', done: false }, { name: 'Almoço', time: '12:30', foods: ['Peixe grelhado', 'Quinoa', 'Salada'], kcal: 580, origin: 'Nutricionista', done: false }, { name: 'Lanche', time: '16:00', foods: ['Vitamina de abacate'], kcal: 220, origin: 'IA', done: false }, { name: 'Jantar', time: '19:30', foods: ['Wrap integral', 'Atum', 'Legumes'], kcal: 460, origin: 'IA', done: false }],
  Sáb: [{ name: 'Café da manhã', time: '08:00', foods: ['Açaí', 'Granola', 'Frutas'], kcal: 420, origin: 'Pendente', done: false }, { name: 'Almoço', time: '13:00', foods: ['Churrasco magro', 'Salada verde'], kcal: 650, origin: 'Pendente', done: false }, { name: 'Lanche', time: '16:30', foods: ['Barra de proteína'], kcal: 200, origin: 'IA', done: false }, { name: 'Jantar', time: '20:00', foods: ['Sopa de lentilha', 'Pão integral'], kcal: 480, origin: 'Pendente', done: false }],
  Dom: [{ name: 'Café da manhã', time: '08:30', foods: ['Pão integral', 'Ovos', 'Abacate'], kcal: 400, origin: 'IA', done: false }, { name: 'Almoço', time: '13:00', foods: ['Frango assado', 'Arroz', 'Feijão'], kcal: 700, origin: 'Nutricionista', done: false }, { name: 'Lanche', time: '16:00', foods: ['Iogurte', 'Chia', 'Mel'], kcal: 190, origin: 'IA', done: false }, { name: 'Jantar', time: '19:30', foods: ['Salada completa', 'Atum', 'Ovos'], kcal: 420, origin: 'IA', done: false }],
};
const ORIGIN: Record<string, { color: string; bg: string }> = {
  IA:            { color: '#3B82F6', bg: '#EFF6FF' },
  Nutricionista: { color: '#22C55E', bg: '#F0FDF4' },
  Pendente:      { color: '#F97316', bg: '#FFF7ED' },
};

// ── Tela Dieta Nutri (vínculo ativo) ─────────────────────────────────────────
function DietaNutriScreen() {
  const { colors: C } = usePremiumTheme();
  const { topPad } = useAppLayout();
  const { vinculo } = useAuth();
  const nutri = vinculo?.nutricionista;
  const { user } = useAuth();
  const planoAtual = user?.prescricaoSemanal ? { conteudo: user.prescricaoSemanal, origem: 'nutricionista', data: '' } : null;
  const [encerrarModal, setEncerrarModal] = useState(false);

  const handleEncerrar = () => {
    setEncerrarModal(false);
    router.push('/nutri/review');
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: topPad, gap: 14 }} showsVerticalScrollIndicator={false}>

        {/* Card do nutricionista */}
        <View style={{ backgroundColor: C.primary, borderRadius: 20, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={{ width: 56, height: 56, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 28 }}>👩⚕️</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: '#fff' }}>{nutri?.nome}</Text>
            <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>{nutri?.especialidade || 'Nutricionista'}</Text>
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 1 }}>CRN {nutri?.crn}</Text>
          </View>
          <View style={{ alignItems: 'center', gap: 3 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <Ionicons name="star" size={13} color="#fbbf24" />
              <Text style={{ fontSize: 14, fontWeight: '800', color: '#fff' }}>5.0</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ade80' }} />
              <Text style={{ fontSize: 10, fontWeight: '700', color: '#fff' }}>Ativo</Text>
            </View>
          </View>
        </View>

        {/* Plano atual */}
        <View style={{ backgroundColor: C.surface, borderRadius: 20, padding: 18, gap: 12, borderWidth: 1, borderColor: C.border }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 15, fontWeight: '800', color: C.text }}>Plano atual</Text>
            <TouchableOpacity onPress={() => router.push('/nutri/plan-history')} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: C.primary }}>Histórico</Text>
              <Ionicons name="chevron-forward" size={13} color={C.primary} />
            </TouchableOpacity>
          </View>
          {planoAtual ? (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: C.primarySoft }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: C.primary }}>
                    {planoAtual.origem === 'nutricionista' ? '👩⚕️ Nutricionista' : '👤 Você'}
                  </Text>
                </View>
                <Text style={{ fontSize: 11, color: C.textDim }}>{planoAtual.data}</Text>
              </View>
              {planoAtual.conteudo.split('\n').map((linha, i) => (
                <View key={i} style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.primary, marginTop: 7 }} />
                  <Text style={{ fontSize: 14, color: C.textMuted, flex: 1, lineHeight: 21 }}>{linha}</Text>
                </View>
              ))}
            </>
          ) : (
            <Text style={{ fontSize: 14, color: C.textMuted }}>Nenhum plano prescrito ainda.</Text>
          )}
        </View>

        {/* Observações */}
        {vinculo?.nutricionista && (
          <View style={{ backgroundColor: C.surface, borderRadius: 20, padding: 18, gap: 12, borderWidth: 1, borderColor: C.border }}>
            <Text style={{ fontSize: 15, fontWeight: '800', color: C.text }}>Prescrição semanal</Text>
            <Text style={{ fontSize: 14, color: C.textMuted, lineHeight: 21 }}>
              {vinculo.nutricionista.descricao || 'Nenhuma observação ainda.'}
            </Text>
          </View>
        )}

        {/* Atalhos */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity
            style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, padding: 14, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border }}
            onPress={() => router.push('/nutri/tracking')}
          >
            <Ionicons name="fitness-outline" size={16} color={C.primary} />
            <Text style={{ fontSize: 13, fontWeight: '700', color: C.text }}>Registrar medidas</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, padding: 14, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border }}
            onPress={() => router.push('/nutri/plan-history')}
          >
            <Ionicons name="time-outline" size={16} color={C.secondary} />
            <Text style={{ fontSize: 13, fontWeight: '700', color: C.text }}>Histórico</Text>
          </TouchableOpacity>
        </View>

        {/* Encerrar */}
        <TouchableOpacity
          style={{ borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1.5, borderColor: C.danger + '60', backgroundColor: C.dangerSoft }}
          onPress={() => setEncerrarModal(true)}
        >
          <Text style={{ fontSize: 14, fontWeight: '700', color: C.danger }}>Encerrar acompanhamento</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Modal encerrar */}
      <Modal visible={encerrarModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <View style={{ backgroundColor: C.surface, borderRadius: 24, padding: 24, width: '100%', gap: 14 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: C.text, textAlign: 'center' }}>Encerrar acompanhamento?</Text>
            <Text style={{ fontSize: 14, color: C.textMuted, textAlign: 'center', lineHeight: 20 }}>
              Você poderá avaliar o nutricionista após o encerramento. O histórico será preservado.
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity style={{ flex: 1, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: C.border, alignItems: 'center' }} onPress={() => setEncerrarModal(false)}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: C.text }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ flex: 1, padding: 14, borderRadius: 14, backgroundColor: C.danger, alignItems: 'center' }} onPress={handleEncerrar}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>Encerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ── Tela Plano padrão (sem vínculo) ──────────────────────────────────────────
export default function PlanScreen() {
  const { vinculo } = useAuth();
  if (vinculo?.status === 'ativo') return <DietaNutriScreen />;

  const { colors: C } = usePremiumTheme();
  const { topPad } = useAppLayout();
  const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  const [selectedDay, setSelectedDay] = useState(todayIdx);
  const [expanded, setExpanded]       = useState<number | null>(0);
  const [planState, setPlanState]     = useState(PLAN);
  const dayKey    = DAYS[selectedDay];
  const meals     = planState[dayKey];
  const totalKcal = meals.reduce((a, m) => a + m.kcal, 0);
  const doneMeals = meals.filter(m => m.done).length;

  const toggleDone = (idx: number) => setPlanState(prev => ({ ...prev, [dayKey]: prev[dayKey].map((m, i) => i === idx ? { ...m, done: !m.done } : m) }));

  const card = { backgroundColor: C.surface, borderRadius: 18, marginBottom: 10, overflow: 'hidden' as const,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={[s.scroll, { paddingTop: topPad }]} showsVerticalScrollIndicator={false}>
        <Text style={[s.title, { color: C.text }]}>Plano Alimentar</Text>

        {/* Seletor de dias */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          {DAYS.map((d, i) => (
            <TouchableOpacity key={d} style={{ paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999, marginRight: 8,
              backgroundColor: selectedDay === i ? C.primary : C.surface,
              shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 }}
              onPress={() => { setSelectedDay(i); setExpanded(null); }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: selectedDay === i ? '#fff' : C.textMuted }}>{d}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Resumo do dia */}
        <View style={{ backgroundColor: C.surface, borderRadius: 20, padding: 18, marginBottom: 16, flexDirection: 'row', alignItems: 'center',
          shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, color: C.textMuted, marginBottom: 4 }}>Total do dia</Text>
            <Text style={{ fontSize: 26, fontWeight: '900', color: C.text, letterSpacing: -1 }}>{totalKcal} <Text style={{ fontSize: 14, fontWeight: '500', color: C.textMuted }}>kcal</Text></Text>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.primary }} />
              <Text style={{ fontSize: 13, color: C.textMuted }}>{doneMeals}/{meals.length} refeições</Text>
            </View>
            <View style={{ width: 100, height: 6, borderRadius: 3, backgroundColor: C.border, overflow: 'hidden' }}>
              <View style={{ height: 6, borderRadius: 3, backgroundColor: C.primary, width: `${(doneMeals / meals.length) * 100}%` as any }} />
            </View>
          </View>
        </View>

        {/* Macros */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          {[
            { label: 'Proteína', value: `${Math.round(totalKcal * 0.3 / 4)}g`,  color: '#3B82F6', bg: '#EFF6FF' },
            { label: 'Carbo',    value: `${Math.round(totalKcal * 0.45 / 4)}g`, color: '#F97316', bg: '#FFF7ED' },
            { label: 'Gordura',  value: `${Math.round(totalKcal * 0.25 / 9)}g`, color: '#EAB308', bg: '#FEFCE8' },
          ].map(m => (
            <View key={m.label} style={{ flex: 1, borderRadius: 14, padding: 12, alignItems: 'center', backgroundColor: C.surface,
              shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: m.color, marginBottom: 4 }} />
              <Text style={{ fontSize: 16, fontWeight: '800', color: C.text }}>{m.value}</Text>
              <Text style={{ fontSize: 10, color: C.textMuted, fontWeight: '600', marginTop: 2 }}>{m.label}</Text>
            </View>
          ))}
        </View>

        {/* Refeições */}
        {meals.map((meal, i) => (
          <View key={i} style={card}>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }}
              onPress={() => setExpanded(expanded === i ? null : i)}>
              <TouchableOpacity style={{ width: 26, height: 26, borderRadius: 8, borderWidth: 2, alignItems: 'center', justifyContent: 'center',
                borderColor: meal.done ? C.primary : C.border, backgroundColor: meal.done ? C.primary : 'transparent' }}
                onPress={() => toggleDone(i)}>
                {meal.done && <Ionicons name="checkmark" size={14} color="#fff" />}
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: meal.done ? C.textMuted : C.text,
                  ...(meal.done ? { textDecorationLine: 'line-through' as const } : {}) }}>{meal.name}</Text>
                <Text style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{meal.time} · {meal.kcal} kcal</Text>
              </View>
              <View style={{ borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: ORIGIN[meal.origin].bg }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: ORIGIN[meal.origin].color }}>{meal.origin}</Text>
              </View>
              <Ionicons name={expanded === i ? 'chevron-up' : 'chevron-down'} size={16} color={C.textMuted} />
            </TouchableOpacity>
            {expanded === i && (
              <View style={{ paddingHorizontal: 16, paddingBottom: 16, borderTopWidth: 1, borderTopColor: C.border, gap: 6 }}>
                {meal.foods.map((f, fi) => (
                  <View key={fi} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 2 }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.primary }} />
                    <Text style={{ fontSize: 14, color: C.textMuted }}>{f}</Text>
                  </View>
                ))}
                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8,
                  backgroundColor: C.surface2, alignSelf: 'flex-start', marginTop: 6 }}
                  onPress={() => router.push('/(tabs)/messages')}>
                  <Ionicons name="sparkles-outline" size={14} color={C.primary} />
                  <Text style={{ fontSize: 12, fontWeight: '700', color: C.primary }}>Sugerir com NutrIA</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}

        {/* Ações */}
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
          <TouchableOpacity style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, padding: 14,
            borderWidth: 1.5, borderColor: C.border, backgroundColor: C.surface }}
            onPress={() => router.push('/(tabs)/messages')}>
            <Ionicons name="person-outline" size={16} color={C.text} />
            <Text style={{ fontSize: 14, fontWeight: '700', color: C.text }}>Nutricionista</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, padding: 14,
            backgroundColor: C.primary }}
            onPress={() => router.push('/(tabs)/messages')}>
            <Ionicons name="sparkles-outline" size={16} color="#fff" />
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>NutrIA</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  scroll: { padding: 20 },
  title:  { fontSize: 26, fontWeight: '800', letterSpacing: -0.5, marginBottom: 16 },
});
