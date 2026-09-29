import { useAuth } from '@/context/auth';
import { useDiary, type WaterRecord } from '@/context/diary';
import { usePremiumTheme } from '@/context/theme';
import { suggestedWaterGoal } from '@/utils/onboarding';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function WaterScreen() {
  const { user } = useAuth();
  const { waterToday, waterTodayMl, addWater, removeWater, ready } = useDiary();
  const { colors: C } = usePremiumTheme();
  const [customOpen, setCustomOpen] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [customError, setCustomError] = useState('');
  const [pendingDelete, setPendingDelete] = useState<WaterRecord | null>(null);
  const [busy, setBusy] = useState(false);

  const configuredGoal = Number(String(user?.waterGoal ?? '').replace(',', '.'));
  const suggestedGoal = suggestedWaterGoal(user?.weight || '', user?.activityLevel);
  const safeGoalLiters = Number.isFinite(configuredGoal) && configuredGoal > 0
    ? configuredGoal
    : Number.isFinite(suggestedGoal) && suggestedGoal > 0 ? suggestedGoal : 2;
  const goalMl = Math.round(safeGoalLiters * 1000);
  const consumedMl = Number.isFinite(waterTodayMl) && waterTodayMl >= 0 ? waterTodayMl : 0;
  const pct = goalMl > 0 ? Math.min(Math.round(consumedMl / goalMl * 100), 100) : 0;
  const remainingMl = Math.max(goalMl - consumedMl, 0);
  const card = { backgroundColor: C.surface, borderRadius: 20, padding: 18, marginBottom: 14, shadowColor: '#000', shadowOpacity: .05, shadowRadius: 8, elevation: 2 } as const;

  const addPreset = async (amount: number) => {
    if (busy) return;
    setBusy(true);
    try { await addWater(amount); } finally { setBusy(false); }
  };

  const saveCustom = async () => {
    const amount = Number(customAmount.replace(',', '.'));
    if (!Number.isFinite(amount) || amount <= 0 || amount > 5000) {
      setCustomError('Informe uma quantidade entre 1 e 5.000 ml.');
      return;
    }
    setBusy(true);
    try {
      await addWater(Math.round(amount));
      setCustomAmount('');
      setCustomError('');
      setCustomOpen(false);
    } finally { setBusy(false); }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setBusy(true);
    try {
      await removeWater(pendingDelete.id);
      setPendingDelete(null);
    } finally { setBusy(false); }
  };

  return <View style={{ flex: 1, backgroundColor: C.bg }}>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, gap: 2, paddingBottom: 100 }}>
      <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')} style={{ flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', paddingVertical: 8, paddingRight: 12, marginBottom: 4 }}>
        <Ionicons name="arrow-back" size={20} color={C.primary} /><Text style={{ color: C.primary, fontWeight: '800' }}>Voltar</Text>
      </TouchableOpacity>
      <Text style={{ fontSize: 26, fontWeight: '900', color: C.text }}>Hidratação</Text>
      <Text style={{ fontSize: 14, color: C.textMuted, marginBottom: 18 }}>Meta diária: {goalMl} ml</Text>

      <View style={[card, { alignItems: 'center', paddingVertical: 28 }]}>
        <View style={{ width: 172, height: 172, borderRadius: 86, borderWidth: 11, borderColor: C.border, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="water" size={30} color={C.primary} />
          <Text style={{ fontSize: 31, fontWeight: '900', color: C.text }}>{consumedMl} ml</Text>
          <Text style={{ color: C.textMuted, fontWeight: '700' }}>{pct}%</Text>
        </View>
        <View style={{ height: 8, borderRadius: 4, overflow: 'hidden', backgroundColor: C.border, width: '100%', marginTop: 20 }}><View style={{ width: `${pct}%` as any, height: 8, borderRadius: 4, backgroundColor: C.primary }} /></View>
        <Text style={{ fontSize: 13, color: C.textMuted, marginTop: 9 }}>{remainingMl} ml restantes</Text>
      </View>

      <Text style={{ fontSize: 12, fontWeight: '800', color: C.textMuted, marginBottom: 10 }}>ADICIONAR ÁGUA</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
        {[150, 200, 300, 500].map(amount => <TouchableOpacity disabled={busy} key={amount} onPress={() => void addPreset(amount)} style={{ flex: 1, backgroundColor: C.surface, borderRadius: 14, paddingVertical: 14, alignItems: 'center', opacity: busy ? .6 : 1 }}><Ionicons name="add-circle-outline" size={20} color={C.primary} /><Text style={{ color: C.text, fontWeight: '800', marginTop: 4 }}>{amount}</Text><Text style={{ color: C.textMuted, fontSize: 11 }}>ml</Text></TouchableOpacity>)}
      </View>
      <TouchableOpacity onPress={() => { setCustomError(''); setCustomOpen(true); }} style={{ borderWidth: 1, borderColor: C.primary, borderRadius: 14, padding: 13, alignItems: 'center', marginBottom: 18, flexDirection: 'row', justifyContent: 'center', gap: 8 }}><Ionicons name="create-outline" size={18} color={C.primary} /><Text style={{ color: C.primary, fontWeight: '800' }}>Informar outra quantidade</Text></TouchableOpacity>

      <Text style={{ fontSize: 12, fontWeight: '800', color: C.textMuted, marginBottom: 10 }}>REGISTROS DE HOJE</Text>
      <View style={card}>
        {!ready ? <Text style={{ color: C.textMuted }}>Carregando registros…</Text> : waterToday.length === 0 ? <View style={{ alignItems: 'center', paddingVertical: 12, gap: 6 }}><Ionicons name="water-outline" size={27} color={C.textDim} /><Text style={{ color: C.textMuted }}>Nenhum copo registrado hoje.</Text></View> : waterToday.map((record, index) => <View key={record.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11, ...(index < waterToday.length - 1 ? { borderBottomWidth: 1, borderBottomColor: C.border } : {}) }}><Ionicons name="water-outline" size={19} color={C.primary} /><Text style={{ flex: 1, color: C.textMuted }}>{new Date(record.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</Text><Text style={{ color: C.text, fontWeight: '800' }}>{record.amountMl} ml</Text><TouchableOpacity accessibilityLabel={`Excluir registro de ${record.amountMl} ml`} onPress={() => setPendingDelete(record)} style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: C.dangerLight, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="trash-outline" size={17} color={C.danger} /></TouchableOpacity></View>)}
      </View>
    </ScrollView>

    <Modal visible={customOpen} transparent animationType="fade" onRequestClose={() => setCustomOpen(false)}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,.5)', alignItems: 'center', justifyContent: 'center', padding: 24 }}><View style={{ width: '100%', maxWidth: 420, backgroundColor: C.surface, borderRadius: 20, padding: 20 }}><Text style={{ color: C.text, fontSize: 19, fontWeight: '900' }}>Quanto você bebeu?</Text><Text style={{ color: C.textMuted, fontSize: 13, marginTop: 4, marginBottom: 14 }}>Informe a quantidade exata em mililitros.</Text><View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: customError ? C.danger : C.border, borderRadius: 12, backgroundColor: C.surface2 }}><TextInput autoFocus value={customAmount} onChangeText={value => { setCustomAmount(value); setCustomError(''); }} keyboardType="decimal-pad" placeholder="Ex.: 275" placeholderTextColor={C.textDim} style={{ flex: 1, padding: 14, color: C.text, fontSize: 17, fontWeight: '700' }} /><Text style={{ color: C.textMuted, marginRight: 14 }}>ml</Text></View>{!!customError && <Text style={{ color: C.danger, fontSize: 12, marginTop: 7 }}>{customError}</Text>}<TouchableOpacity disabled={busy} onPress={() => void saveCustom()} style={{ backgroundColor: C.primary, borderRadius: 13, padding: 14, alignItems: 'center', marginTop: 14 }}>{busy ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '800' }}>Adicionar água</Text>}</TouchableOpacity><TouchableOpacity disabled={busy} onPress={() => { setCustomOpen(false); setCustomAmount(''); setCustomError(''); }} style={{ padding: 13, alignItems: 'center' }}><Text style={{ color: C.textMuted, fontWeight: '700' }}>Cancelar</Text></TouchableOpacity></View></View>
    </Modal>

    <Modal visible={!!pendingDelete} transparent animationType="fade" onRequestClose={() => setPendingDelete(null)}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,.5)', alignItems: 'center', justifyContent: 'center', padding: 24 }}><View style={{ width: '100%', maxWidth: 400, backgroundColor: C.surface, borderRadius: 22, padding: 22, alignItems: 'center', gap: 12 }}><View style={{ width: 54, height: 54, borderRadius: 17, backgroundColor: C.dangerLight, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="trash-outline" size={25} color={C.danger} /></View><Text style={{ color: C.text, fontSize: 19, fontWeight: '900' }}>Excluir registro?</Text><Text style={{ color: C.textMuted, textAlign: 'center', lineHeight: 20 }}>Remover {pendingDelete?.amountMl ?? 0} ml dos registros de hoje?</Text><View style={{ flexDirection: 'row', gap: 9, alignSelf: 'stretch' }}><TouchableOpacity disabled={busy} onPress={() => setPendingDelete(null)} style={{ flex: 1, minHeight: 48, borderRadius: 13, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: C.text, fontWeight: '800' }}>Cancelar</Text></TouchableOpacity><TouchableOpacity disabled={busy} onPress={() => void confirmDelete()} style={{ flex: 1, minHeight: 48, borderRadius: 13, backgroundColor: C.danger, alignItems: 'center', justifyContent: 'center' }}>{busy ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '800' }}>Excluir</Text>}</TouchableOpacity></View></View></View>
    </Modal>
  </View>;
}
