import { usePremiumTheme } from '@/context/theme';
import { useAuth } from '@/context/auth';
import { useAppLayout } from '@/hooks/useAppLayout';
import { DEMO_MODE, listAvailableNutritionists, type NutritionistProfile } from '@/services/demo';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function NutritionistDirectoryScreen() {
  const { user } = useAuth();
  const { colors: C } = usePremiumTheme();
  const { topPad } = useAppLayout();
  const [items, setItems] = useState<NutritionistProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  if (user?.nutricionistaId) return <Redirect href="/(tabs)/plan" />;

  useEffect(() => {
    let active = true;
    listAvailableNutritionists().then(value => { if (active) setItems(value); }).catch(() => { if (active) setItems([]); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('pt-BR');
    if (!term) return items;
    return items.filter(item => `${item.nome} ${item.especialidade ?? ''} ${(item.focusAreas ?? []).join(' ')}`.toLocaleLowerCase('pt-BR').includes(term));
  }, [items, query]);

  return <View style={{ flex: 1, backgroundColor: C.bg }}>
    <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: topPad }]} showsVerticalScrollIndicator={false}>
      <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/plan')} style={styles.back}><Ionicons name="arrow-back" size={20} color={C.primary} /><Text style={{ color: C.primary, fontWeight: '800' }}>Voltar</Text></TouchableOpacity>
      <Text style={[styles.title, { color: C.text }]}>Encontre seu nutricionista</Text>
      <Text style={[styles.subtitle, { color: C.textMuted }]}>Conheça os perfis, especialidades e avaliações antes de escolher.</Text>
      {DEMO_MODE && <View style={[styles.notice, { backgroundColor: C.primarySoft }]}><Ionicons name="information-circle-outline" size={18} color={C.primary} /><Text style={{ color: C.textMuted, flex: 1, fontSize: 11, lineHeight: 16 }}>Perfis locais para testar a experiência. Nenhuma solicitação externa é enviada até você confirmar o vínculo.</Text></View>}

      <View style={[styles.search, { backgroundColor: C.surface, borderColor: C.border }]}><Ionicons name="search-outline" size={19} color={C.textMuted} /><TextInput value={query} onChangeText={setQuery} placeholder="Nome ou especialidade" placeholderTextColor={C.textDim} style={{ flex: 1, color: C.text, fontSize: 14, paddingVertical: 11 }} /></View>

      {loading ? <View style={styles.loading}><ActivityIndicator color={C.primary} /><Text style={{ color: C.textMuted }}>Buscando profissionais…</Text></View> : filtered.length === 0 ? <View style={styles.loading}><Ionicons name="people-outline" size={42} color={C.textDim} /><Text style={{ color: C.textMuted }}>Nenhum profissional encontrado.</Text></View> : filtered.map(item => (
        <TouchableOpacity key={item.id} activeOpacity={.85} onPress={() => router.push({ pathname: '/nutri/professional', params: { id: String(item.id) } })} style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={styles.cardTop}>
            <View style={[styles.avatar, { backgroundColor: C.primary }]}>{item.foto ? <Image source={{ uri: item.foto }} style={styles.avatarImage} /> : <Text style={styles.initial}>{item.nome.charAt(0)}</Text>}</View>
            <View style={{ flex: 1 }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}><Text style={[styles.name, { color: C.text }]}>{item.nome}</Text><Ionicons name="checkmark-circle" size={15} color={C.primary} /></View><Text style={[styles.specialty, { color: C.primary }]}>{item.especialidade || 'Nutricionista'}</Text><Text style={[styles.crn, { color: C.textMuted }]}>CRN {item.crn}</Text></View>
            {item.rating ? <View style={[styles.rating, { backgroundColor: C.warningSoft }]}><Ionicons name="star" size={13} color={C.warning} /><Text style={{ color: C.text, fontWeight: '900', fontSize: 12 }}>{item.rating.toFixed(1)}</Text></View> : null}
          </View>
          <Text style={[styles.description, { color: C.textMuted }]}>{item.descricao || 'Consulte o perfil completo deste profissional.'}</Text>
          <View style={styles.tags}>{(item.focusAreas ?? []).slice(0, 3).map(area => <View key={area} style={[styles.tag, { backgroundColor: C.surface2 }]}><Text style={{ color: C.textMuted, fontSize: 10, fontWeight: '700' }}>{area}</Text></View>)}</View>
          <View style={[styles.footer, { borderTopColor: C.border }]}><Text style={{ color: C.textMuted, fontSize: 11 }}>{item.reviewCount ? `${item.reviewCount} avaliações` : 'Sem avaliações publicadas'}</Text><View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><Text style={{ color: C.primary, fontWeight: '900', fontSize: 12 }}>Ver perfil</Text><Ionicons name="chevron-forward" size={15} color={C.primary} /></View></View>
        </TouchableOpacity>
      ))}
      <View style={{ height: 60 }} />
    </ScrollView>
  </View>;
}

const styles = StyleSheet.create({
  scroll: { padding: 20, gap: 14 }, back: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingVertical: 8, paddingRight: 14 }, title: { fontSize: 27, fontWeight: '900', letterSpacing: -.7 }, subtitle: { fontSize: 14, lineHeight: 20, marginTop: -7 }, notice: { borderRadius: 14, padding: 12, flexDirection: 'row', gap: 8, alignItems: 'flex-start' }, search: { borderWidth: 1, borderRadius: 15, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 9 }, loading: { minHeight: 220, alignItems: 'center', justifyContent: 'center', gap: 10 }, card: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 12 }, cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 }, avatar: { width: 52, height: 52, borderRadius: 17, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }, avatarImage: { width: 52, height: 52 }, initial: { color: '#fff', fontSize: 21, fontWeight: '900' }, name: { fontSize: 16, fontWeight: '900' }, specialty: { fontSize: 12, fontWeight: '800', marginTop: 2 }, crn: { fontSize: 10, marginTop: 2 }, rating: { borderRadius: 99, paddingHorizontal: 9, paddingVertical: 5, flexDirection: 'row', alignItems: 'center', gap: 4 }, description: { fontSize: 12, lineHeight: 18 }, tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 }, tag: { borderRadius: 99, paddingHorizontal: 9, paddingVertical: 5 }, footer: { borderTopWidth: 1, paddingTop: 11, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
