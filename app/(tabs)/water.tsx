import { useAuth } from '@/context/auth';
import { usePremiumTheme } from '@/context/theme';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function WaterScreen() {
  const { colors: C } = usePremiumTheme();
  const { user } = useAuth();
  const goalMl = parseFloat(user?.waterGoal || '2') * 1000;
  const [currentMl, setCurrentMl] = useState(600);
  const percent = Math.min(Math.round((currentMl / goalMl) * 100), 100);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 20, paddingTop: 56 }}>
      <Text style={{ fontSize: 26, fontWeight: '900', color: C.text, letterSpacing: -1 }}>Hidratação</Text>
      <Text style={{ fontSize: 14, color: C.textMuted, fontWeight: '500', marginBottom: 24 }}>Meta diária: {goalMl}ml</Text>

      <View style={{ alignItems: 'center', marginBottom: 20 }}>
        <View style={{ width: 180, height: 180, borderRadius: 90, backgroundColor: C.surface, borderWidth: 3, borderColor: C.cyan + '60', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${percent}%`, backgroundColor: C.cyan + '30' }} />
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Ionicons name="water" size={32} color={C.cyan} />
            <Text style={{ fontSize: 28, fontWeight: '900', color: C.text }}>{currentMl}ml</Text>
            <Text style={{ fontSize: 14, color: C.textMuted, fontWeight: '700' }}>{percent}%</Text>
          </View>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, padding: 14, borderWidth: 1, marginBottom: 24, backgroundColor: C.surface, borderColor: currentMl >= goalMl ? C.success : C.border }}>
        <Ionicons name={currentMl >= goalMl ? 'checkmark-circle' : 'water-outline'} size={20} color={currentMl >= goalMl ? C.success : C.cyan} />
        <Text style={{ fontSize: 14, fontWeight: '600', color: C.text }}>{currentMl >= goalMl ? 'Meta atingida! 🎉' : `Faltam ${goalMl - currentMl}ml para a meta`}</Text>
      </View>

      <Text style={{ fontSize: 12, fontWeight: '700', color: C.cyan, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.8 }}>Adicionar</Text>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
        {[150, 200, 300, 500].map(ml => (
          <TouchableOpacity key={ml} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, borderRadius: 14, padding: 14, borderWidth: 1, backgroundColor: C.surface, borderColor: C.border }} onPress={() => setCurrentMl(p => Math.min(p + ml, goalMl + 400))}>
            <Ionicons name="add" size={16} color={C.cyan} />
            <Text style={{ fontSize: 14, fontWeight: '700', color: C.text }}>{ml}ml</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={{ fontSize: 12, fontWeight: '700', color: C.cyan, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.8 }}>Registros de hoje</Text>
      {[{ time: '07:30', ml: 200 }, { time: '09:15', ml: 200 }, { time: '11:00', ml: 200 }].map((r, i) => (
        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 12, padding: 12, borderWidth: 1, marginBottom: 8, backgroundColor: C.surface, borderColor: C.border }}>
          <Ionicons name="water-outline" size={16} color={C.cyan} />
          <Text style={{ flex: 1, fontSize: 13, fontWeight: '600', color: C.textMuted }}>{r.time}</Text>
          <Text style={{ fontSize: 14, fontWeight: '700', color: C.text }}>{r.ml}ml</Text>
        </View>
      ))}

      <TouchableOpacity style={{ borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, marginTop: 8, borderColor: C.border }} onPress={() => setCurrentMl(0)}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: C.textMuted }}>Resetar dia</Text>
      </TouchableOpacity>
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}
