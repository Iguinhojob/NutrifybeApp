import { useAuth } from '@/context/auth';
import { usePremiumTheme } from '@/context/theme';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function PlanHistoryScreen() {
  const { planos } = useAuth();
  const { colors } = usePremiumTheme();
  const [expanded, setExpanded] = useState<string | null>(planos[0]?.id ?? null);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 20, gap: 0 }}>

      <Text style={{ fontSize: 14, color: colors.textMuted, marginBottom: 20 }}>
        Cada edição gera uma nova versão. O histórico completo é preservado.
      </Text>

      {planos.length === 0 && (
        <View style={{ alignItems: 'center', paddingVertical: 60, gap: 12 }}>
          <Ionicons name="document-text-outline" size={52} color={colors.border} />
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>Nenhum plano ainda</Text>
          <Text style={{ fontSize: 14, color: colors.textMuted, textAlign: 'center' }}>Seu histórico de planos aparecerá aqui.</Text>
        </View>
      )}

      {planos.map((p, i) => {
        const isFirst   = i === 0;
        const isExpanded = expanded === p.id;
        const origemColor = p.origem === 'nutricionista' ? colors.primary : colors.secondary;
        const origemLabel = p.origem === 'nutricionista' ? 'Nutricionista' : 'Você';
        const origemIcon  = p.origem === 'nutricionista' ? 'person-outline' : 'person-circle-outline';

        return (
          <View key={p.id} style={{ flexDirection: 'row', gap: 14 }}>
            {/* Linha do tempo */}
            <View style={{ alignItems: 'center', width: 24 }}>
              <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: isFirst ? colors.primary : colors.border, alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                {isFirst
                  ? <Ionicons name="star" size={12} color="#fff" />
                  : <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.textDim }} />
                }
              </View>
              {i < planos.length - 1 && (
                <View style={{ width: 2, flex: 1, backgroundColor: colors.border, marginTop: 4 }} />
              )}
            </View>

            {/* Card */}
            <View style={{ flex: 1, marginBottom: 16 }}>
              <TouchableOpacity
                onPress={() => setExpanded(isExpanded ? null : p.id)}
                style={{
                  backgroundColor: colors.surface, borderRadius: 16, padding: 14,
                  borderWidth: 1, borderColor: isFirst ? colors.primary + '40' : colors.border,
                  shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: origemColor + '15' }}>
                    <Ionicons name={origemIcon as any} size={11} color={origemColor} />
                    <Text style={{ fontSize: 11, fontWeight: '700', color: origemColor }}>{origemLabel}</Text>
                  </View>
                  {isFirst && (
                    <View style={{ borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: colors.primary }}>
                      <Text style={{ fontSize: 10, fontWeight: '700', color: '#fff' }}>Atual</Text>
                    </View>
                  )}
                  <Text style={{ fontSize: 11, color: colors.textDim, marginLeft: 'auto' }}>{p.data}</Text>
                  <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={14} color={colors.textMuted} />
                </View>

                {isExpanded && (
                  <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10, marginTop: 4 }}>
                    {p.conteudo.split('\n').map((linha, li) => (
                      <View key={li} style={{ flexDirection: 'row', gap: 8, paddingVertical: 3 }}>
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary, marginTop: 6 }} />
                        <Text style={{ fontSize: 13, color: colors.textMuted, flex: 1, lineHeight: 20 }}>{linha}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        );
      })}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}
