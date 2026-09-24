import { useAuth } from '@/context/auth';
import { usePremiumTheme } from '@/context/theme';
import { useAppLayout } from '@/hooks/useAppLayout';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { suggestedWaterGoal } from '@/utils/onboarding';
import { DiaryAPI, type WaterEntry } from '@/services/api';

export default function WaterScreen() {
  const { colors: C } = usePremiumTheme();
  const { topPad } = useAppLayout();
  const { user } = useAuth();
  const goalMl = parseFloat((user?.waterGoal || suggestedWaterGoal(user?.weight || '', user?.activityLevel || '')).replace(',', '.')) * 1000;
  const [entries, setEntries] = useState<WaterEntry[]>([]);
  const currentMl = entries.reduce((total, entry) => total + entry.amountMl, 0);
  const pct = Math.min(Math.round((currentMl / goalMl) * 100), 100);
  const done = currentMl >= goalMl;
  const loadEntries = async () => setEntries(await DiaryAPI.water());
  useEffect(() => { loadEntries().catch(() => Alert.alert('Erro', 'Não foi possível carregar seus registros de água.')); }, []);
  const addWater = async (ml: number) => {
    try { await DiaryAPI.addWater(ml); await loadEntries(); }
    catch (error) { Alert.alert('Erro', error instanceof Error ? error.message : 'Não foi possível registrar a água.'); }
  };
  const resetDay = async () => {
    try { await DiaryAPI.resetWater(); setEntries([]); }
    catch (error) { Alert.alert('Erro', error instanceof Error ? error.message : 'Não foi possível resetar o dia.'); }
  };

  const card = { backgroundColor: C.surface, borderRadius: 20, padding: 18, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 } as const;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 20, paddingTop: topPad }}>
      <Text style={{ fontSize: 26, fontWeight: '800', color: C.text, letterSpacing: -0.5, marginBottom: 4 }}>Hidratação</Text>
      <Text style={{ fontSize: 14, color: C.textMuted, marginBottom: 20 }}>Meta diária: {goalMl}ml</Text>

      {/* Círculo de progresso */}
      <View style={[card, { alignItems: 'center', paddingVertical: 28 }]}>
        <View style={{ width: 180, height: 180, borderRadius: 90, borderWidth: 12, borderColor: C.border, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${pct}%`, backgroundColor: C.primary + '25' }} />
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Ionicons name="water" size={32} color={C.primary} />
            <Text style={{ fontSize: 30, fontWeight: '900', color: C.text }}>{currentMl}ml</Text>
            <Text style={{ fontSize: 14, color: C.textMuted, fontWeight: '600' }}>{pct}%</Text>
          </View>
        </View>

        {/* Barra de progresso linear */}
        <View style={{ width: '100%', marginTop: 20 }}>
          <View style={{ height: 8, borderRadius: 4, backgroundColor: C.border, overflow: 'hidden' }}>
            <View style={{ height: 8, borderRadius: 4, backgroundColor: C.primary, width: `${pct}%` as any }} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
            <Text style={{ fontSize: 12, color: C.textMuted }}>{currentMl}ml</Text>
            <Text style={{ fontSize: 12, color: C.textMuted }}>{goalMl}ml</Text>
          </View>
        </View>
      </View>

      {/* Status */}
      <View style={[card, { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: done ? C.surface2 : C.surface, borderWidth: done ? 1.5 : 0, borderColor: done ? C.primary : 'transparent' }]}>
        <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: done ? C.primary : C.border, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={done ? 'checkmark-circle' : 'water-outline'} size={22} color={done ? '#fff' : C.textMuted} />
        </View>
        <Text style={{ fontSize: 14, fontWeight: '600', color: C.text }}>
          {done ? 'Meta atingida! Parabéns 🎉' : `Faltam ${goalMl - currentMl}ml para a meta`}
        </Text>
      </View>

      {/* Botões de adição */}
      <Text style={{ fontSize: 11, fontWeight: '700', color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>Adicionar</Text>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
        {[150, 200, 300, 500].map(ml => (
          <TouchableOpacity key={ml} style={[card, { flex: 1, alignItems: 'center', paddingVertical: 14, marginBottom: 0 }]}
            onPress={() => addWater(ml)}>
            <Ionicons name="add-circle-outline" size={20} color={C.primary} />
            <Text style={{ fontSize: 13, fontWeight: '700', color: C.text, marginTop: 4 }}>{ml}ml</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Registros */}
      <Text style={{ fontSize: 11, fontWeight: '700', color: C.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>Registros de hoje</Text>
      <View style={card}>
        {entries.map((r, i, arr) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12,
            ...(i < arr.length - 1 ? { borderBottomWidth: 1, borderBottomColor: C.border } : {}) }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="water-outline" size={16} color={C.primary} />
            </View>
            <Text style={{ flex: 1, fontSize: 14, color: C.textMuted }}>{new Date(r.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</Text>
            <Text style={{ fontSize: 14, fontWeight: '700', color: C.text }}>{r.amountMl}ml</Text>
          </View>
        ))}
        {!entries.length && <Text style={{ color: C.textMuted, fontSize: 13 }}>Nenhum consumo registrado hoje.</Text>}
      </View>

      <TouchableOpacity style={{ borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: C.border, marginTop: 4 }}
        onPress={resetDay}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: C.textMuted }}>Resetar dia</Text>
      </TouchableOpacity>
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}
