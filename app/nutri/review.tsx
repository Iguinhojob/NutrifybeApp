import { useAuth } from '@/context/auth';
import { usePremiumTheme } from '@/context/theme';
import { Ionicons } from '@expo/vector-icons';
import { router, Redirect } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ReviewScreen() {
  const { vinculo, encerrarVinculo, loading } = useAuth();
  const { colors } = usePremiumTheme();
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState('');
  const [denuncia, setDenuncia] = useState('');
  const [error, setError] = useState('');
  const nutri = vinculo?.nutricionista;

  if (!nutri || vinculo?.status !== 'ativo') return <Redirect href="/(tabs)/plan" />;

  const enviar = async () => {
    setError('');
    if (!nota) { setError('Selecione uma nota de 1 a 5 para encerrar o acompanhamento.'); return; }
    if (comentario.length > 1200 || denuncia.length > 2000) { setError('O comentário pode ter até 1.200 caracteres e a denúncia até 2.000.'); return; }
    const result = await encerrarVinculo(nota, comentario.trim() || undefined, denuncia.trim() || undefined);
    if (!result.success) { setError(result.error || 'Não foi possível encerrar o vínculo.'); return; }
    router.replace('/(tabs)');
  };

  const field = { backgroundColor: colors.surface2, borderRadius: 14, padding: 14, fontSize: 14, color: colors.text, borderWidth: 1, borderColor: colors.border, minHeight: 100, textAlignVertical: 'top' as const };
  return <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 24, gap: 16 }}>
    <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 4 }}><Ionicons name="arrow-back" size={20} color={colors.primary} /><Text style={{ color: colors.primary, fontWeight: '800' }}>Voltar</Text></TouchableOpacity>
    <Text style={{ fontSize: 24, fontWeight: '900', color: colors.text }}>Encerrar acompanhamento</Text>
    <Text style={{ fontSize: 14, lineHeight: 21, color: colors.textMuted }}>Sua avaliação será registrada e o vínculo com este profissional será encerrado.</Text>

    <View style={{ backgroundColor: colors.surface, borderRadius: 20, padding: 20, alignItems: 'center', gap: 7, borderWidth: 1, borderColor: colors.border }}>
      <Ionicons name="person-circle-outline" size={48} color={colors.primary} />
      <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text }}>{nutri.nome}</Text>
      <Text style={{ fontSize: 14, color: colors.primary, fontWeight: '600' }}>{nutri.especialidade || 'Nutricionista'}</Text>
      <Text style={{ fontSize: 12, color: colors.textMuted }}>CRN {nutri.crn}</Text>
    </View>

    <View style={{ backgroundColor: colors.surface, borderRadius: 20, padding: 20, gap: 13, borderWidth: 1, borderColor: colors.border }}>
      <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text }}>Como foi seu acompanhamento?</Text>
      <Text style={{ fontSize: 13, color: colors.textMuted }}>Escolha uma nota de 1 a 5 estrelas</Text>
      <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'center' }}>{[1, 2, 3, 4, 5].map(n => <TouchableOpacity key={n} accessibilityLabel={`${n} estrelas`} onPress={() => setNota(n)}><Ionicons name={n <= nota ? 'star' : 'star-outline'} size={38} color={n <= nota ? colors.warning : colors.border} /></TouchableOpacity>)}</View>
      {nota > 0 && <Text style={{ textAlign: 'center', fontSize: 14, fontWeight: '700', color: colors.warning }}>{['', 'Muito ruim', 'Ruim', 'Regular', 'Bom', 'Excelente!'][nota]}</Text>}
      <Text style={{ fontSize: 14, fontWeight: '800', color: colors.text }}>Comentário <Text style={{ color: colors.textMuted, fontWeight: '500' }}>(opcional)</Text></Text>
      <TextInput style={field} placeholder="Conte como foi sua experiência" placeholderTextColor={colors.textDim} value={comentario} onChangeText={setComentario} multiline maxLength={1200} />
    </View>

    <View style={{ backgroundColor: colors.surface, borderRadius: 20, padding: 20, gap: 10, borderWidth: 1, borderColor: colors.border }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Ionicons name="flag-outline" size={19} color={colors.danger} /><Text style={{ fontSize: 15, fontWeight: '800', color: colors.text }}>Denunciar profissional <Text style={{ color: colors.textMuted, fontWeight: '500' }}>(opcional)</Text></Text></View>
      <Text style={{ fontSize: 12, lineHeight: 18, color: colors.textMuted }}>Descreva o que aconteceu. A denúncia será enviada à equipe responsável junto com o encerramento do vínculo.</Text>
      <TextInput style={field} placeholder="Relate o motivo da denúncia" placeholderTextColor={colors.textDim} value={denuncia} onChangeText={setDenuncia} multiline maxLength={2000} />
    </View>

    {!!error && <Text accessibilityRole="alert" style={{ color: colors.danger, fontSize: 13 }}>{error}</Text>}
    <TouchableOpacity disabled={loading} style={{ backgroundColor: colors.danger, borderRadius: 14, padding: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, opacity: loading ? .7 : 1 }} onPress={() => void enviar()}>
      {loading ? <ActivityIndicator color="#fff" /> : <Ionicons name="link-outline" size={18} color="#fff" />}
      <Text style={{ fontSize: 15, fontWeight: '800', color: '#fff' }}>{loading ? 'Enviando...' : 'Enviar e encerrar vínculo'}</Text>
    </TouchableOpacity>
  </ScrollView>;
}
