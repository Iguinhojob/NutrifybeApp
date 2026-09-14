import { useAuth } from '@/context/auth';
import { usePremiumTheme } from '@/context/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ReviewScreen() {
  const { vinculo, avaliarNutricionista } = useAuth();
  const { colors } = usePremiumTheme();
  const [nota, setNota]           = useState(0);
  const [comentario, setComentario] = useState('');

  const nutri = vinculo?.nutricionista;

  const enviar = () => {
    if (nota === 0) return Alert.alert('Ops!', 'Selecione uma nota de 1 a 5.');
    avaliarNutricionista(nutri!.id, nota, comentario);
    Alert.alert('Avaliação enviada!', 'Obrigado pelo seu feedback.', [
      { text: 'OK', onPress: () => router.replace('/(tabs)') },
    ]);
  };

  if (!nutri) return null;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 24, gap: 20 }}>

      {/* Card do nutricionista */}
      <View style={{ backgroundColor: colors.surface, borderRadius: 20, padding: 20, alignItems: 'center', gap: 10, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ fontSize: 48 }}>{nutri.avatar}</Text>
        <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text }}>{nutri.name}</Text>
        <Text style={{ fontSize: 14, color: colors.primary, fontWeight: '600' }}>{nutri.specialty}</Text>
        <Text style={{ fontSize: 12, color: colors.textMuted }}>{nutri.crn}</Text>
      </View>

      {/* Estrelas */}
      <View style={{ backgroundColor: colors.surface, borderRadius: 20, padding: 20, gap: 14, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text }}>Como foi seu acompanhamento?</Text>
        <Text style={{ fontSize: 13, color: colors.textMuted }}>Toque nas estrelas para avaliar</Text>

        <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'center' }}>
          {[1, 2, 3, 4, 5].map(n => (
            <TouchableOpacity key={n} onPress={() => setNota(n)}>
              <Ionicons
                name={n <= nota ? 'star' : 'star-outline'}
                size={40}
                color={n <= nota ? colors.warning : colors.border}
              />
            </TouchableOpacity>
          ))}
        </View>

        {nota > 0 && (
          <Text style={{ textAlign: 'center', fontSize: 14, fontWeight: '700', color: colors.warning }}>
            {['', 'Muito ruim', 'Ruim', 'Regular', 'Bom', 'Excelente!'][nota]}
          </Text>
        )}
      </View>

      {/* Comentário */}
      <View style={{ backgroundColor: colors.surface, borderRadius: 20, padding: 20, gap: 10, borderWidth: 1, borderColor: colors.border }}>
        <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text }}>Comentário <Text style={{ color: colors.textMuted, fontWeight: '500' }}>(opcional)</Text></Text>
        <TextInput
          style={{
            backgroundColor: colors.surface2, borderRadius: 14, padding: 14,
            fontSize: 14, color: colors.text, borderWidth: 1, borderColor: colors.border,
            minHeight: 100, textAlignVertical: 'top',
          }}
          placeholder="Conte como foi sua experiência..."
          placeholderTextColor={colors.textDim}
          value={comentario}
          onChangeText={setComentario}
          multiline
        />
      </View>

      {/* Botões */}
      <TouchableOpacity
        style={{ backgroundColor: colors.primary, borderRadius: 14, padding: 16, alignItems: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 }}
        onPress={enviar}
      >
        <Text style={{ fontSize: 16, fontWeight: '800', color: '#fff' }}>Enviar avaliação</Text>
      </TouchableOpacity>

      <TouchableOpacity style={{ alignItems: 'center', padding: 12 }} onPress={() => router.replace('/(tabs)')}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textMuted }}>Pular por agora</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}
