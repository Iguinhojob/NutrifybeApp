import { useAuth } from '@/context/auth';
import { usePremiumTheme } from '@/context/theme';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

const CAMPOS = [
  { key: 'peso',    label: 'Peso',         icon: 'scale-outline'   as const, unit: 'kg',  kb: 'numeric' as const },
  { key: 'cintura', label: 'Cintura',       icon: 'resize-outline'  as const, unit: 'cm',  kb: 'numeric' as const },
  { key: 'quadril', label: 'Quadril',       icon: 'body-outline'    as const, unit: 'cm',  kb: 'numeric' as const },
  { key: 'braco',   label: 'Braço',         icon: 'barbell-outline' as const, unit: 'cm',  kb: 'numeric' as const },
  { key: 'gordura', label: '% Gordura',     icon: 'analytics-outline'as const, unit: '%',  kb: 'numeric' as const },
];

const REFEICOES = ['Café da manhã', 'Almoço', 'Lanche', 'Jantar'];

export default function TrackingScreen() {
  const { colors } = usePremiumTheme();
  const { updateUser } = useAuth();

  const [medidas, setMedidas]   = useState<Record<string, string>>({});
  const [refeicoes, setRefeicoes] = useState<Record<string, string>>({});
  const [tab, setTab]           = useState<'medidas' | 'diario'>('medidas');

  const salvar = () => {
    Alert.alert('Registrado!', 'Suas medidas foram salvas com sucesso.');
    if (medidas.peso) updateUser({ weight: medidas.peso });
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 20, gap: 16 }}>

      {/* Tabs */}
      <View style={{ flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 14, padding: 4, borderWidth: 1, borderColor: colors.border }}>
        {(['medidas', 'diario'] as const).map(t => (
          <TouchableOpacity
            key={t}
            style={{ flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', backgroundColor: tab === t ? colors.primary : 'transparent' }}
            onPress={() => setTab(t)}
          >
            <Text style={{ fontSize: 14, fontWeight: '700', color: tab === t ? '#fff' : colors.textMuted }}>
              {t === 'medidas' ? '📏 Medidas' : '🍽️ Diário'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'medidas' && (
        <>
          <View style={{ backgroundColor: colors.surface, borderRadius: 20, padding: 18, gap: 14, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text }}>Medidas corporais</Text>
            <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: -8 }}>
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </Text>

            {CAMPOS.map(c => (
              <View key={c.key} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surface2, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: colors.border }}>
                <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name={c.icon} size={17} color={colors.primary} />
                </View>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, width: 80 }}>{c.label}</Text>
                <TextInput
                  style={{ flex: 1, fontSize: 15, fontWeight: '700', color: colors.text, textAlign: 'right' }}
                  placeholder="—"
                  placeholderTextColor={colors.textDim}
                  keyboardType={c.kb}
                  value={medidas[c.key] || ''}
                  onChangeText={v => setMedidas(prev => ({ ...prev, [c.key]: v }))}
                />
                <Text style={{ fontSize: 13, color: colors.textMuted, width: 28 }}>{c.unit}</Text>
              </View>
            ))}
          </View>

          {/* Histórico mock */}
          <View style={{ backgroundColor: colors.surface, borderRadius: 20, padding: 18, gap: 12, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text }}>Últimos registros</Text>
            {[
              { data: '10/07', peso: '70.2', cintura: '82' },
              { data: '03/07', peso: '70.8', cintura: '83' },
              { data: '26/06', peso: '71.5', cintura: '84' },
            ].map((r, i, arr) => (
              <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, ...(i < arr.length - 1 ? { borderBottomWidth: 1, borderBottomColor: colors.border } : {}) }}>
                <Text style={{ fontSize: 13, color: colors.textMuted, fontWeight: '600' }}>{r.data}</Text>
                <Text style={{ fontSize: 13, color: colors.text, fontWeight: '700' }}>⚖️ {r.peso}kg</Text>
                <Text style={{ fontSize: 13, color: colors.text, fontWeight: '700' }}>📏 {r.cintura}cm</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {tab === 'diario' && (
        <View style={{ backgroundColor: colors.surface, borderRadius: 20, padding: 18, gap: 14, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text }}>Diário alimentar</Text>
          <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: -8 }}>
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </Text>

          {REFEICOES.map(r => (
            <View key={r} style={{ gap: 6 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 }}>{r}</Text>
              <View style={{ backgroundColor: colors.surface2, borderRadius: 14, borderWidth: 1, borderColor: colors.border }}>
                <TextInput
                  style={{ padding: 14, fontSize: 14, color: colors.text, minHeight: 52 }}
                  placeholder="O que você comeu?"
                  placeholderTextColor={colors.textDim}
                  value={refeicoes[r] || ''}
                  onChangeText={v => setRefeicoes(prev => ({ ...prev, [r]: v }))}
                  multiline
                />
              </View>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={{ backgroundColor: colors.primary, borderRadius: 14, padding: 16, alignItems: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 }}
        onPress={salvar}
      >
        <Text style={{ fontSize: 16, fontWeight: '800', color: '#fff' }}>Salvar registro</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}
