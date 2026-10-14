import { AppButton, BackLink, EmptyState, ErrorState, InlineNotice, LoadingState, StatusPill, friendlyError } from '@/components/ui-kit';
import { useFollowUp } from '@/components/follow-up-status';
import { usePremiumTheme } from '@/context/theme';
import { useAppLayout } from '@/hooks/useAppLayout';
import { NutricionistasAPI, type NutritionistReviewsResponse } from '@/services/api';
import { DEMO_MODE, listAvailableNutritionists, type NutritionistProfile } from '@/services/demo';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

type ReviewSummary = Pick<NutritionistReviewsResponse, 'media' | 'total'>;
const ALL = 'Todas';

export default function NutritionistDirectoryScreen() {
  const { state } = useFollowUp();
  const { colors: C } = usePremiumTheme();
  const { topPad } = useAppLayout();
  const [items, setItems] = useState<NutritionistProfile[]>([]);
  const [reviews, setReviews] = useState<Record<number, ReviewSummary | null>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [specialty, setSpecialty] = useState(ALL);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    listAvailableNutritionists()
      .then(async value => {
        if (!active) return;
        setItems(value);
        // Avaliações reais vêm da API (média e total por profissional). No modo demonstração, usamos os dados locais.
        if (DEMO_MODE) {
          setReviews(Object.fromEntries(value.map(item => [item.id, { media: item.rating ?? null, total: item.reviewCount ?? 0 }])));
          return;
        }
        const entries = await Promise.all(value.map(item => NutricionistasAPI.getReviews(item.id)
          .then(r => [item.id, { media: r.media, total: r.total }] as const)
          .catch(() => [item.id, null] as const)));
        if (active) setReviews(Object.fromEntries(entries));
      })
      .catch(e => { if (active) { setItems([]); setError(friendlyError(e, 'Não foi possível carregar a lista de nutricionistas.')); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [attempt]);
  const retry = useCallback(() => setAttempt(n => n + 1), []);

  const specialties = useMemo(() => {
    const set = new Set(items.map(item => item.especialidade?.trim()).filter(Boolean) as string[]);
    return [ALL, ...[...set].sort((a, b) => a.localeCompare(b, 'pt-BR'))];
  }, [items]);

  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('pt-BR');
    return items.filter(item => {
      if (specialty !== ALL && item.especialidade?.trim() !== specialty) return false;
      if (!term) return true;
      return `${item.nome} ${item.especialidade ?? ''} ${item.crn} ${(item.focusAreas ?? []).join(' ')}`.toLocaleLowerCase('pt-BR').includes(term);
    });
  }, [items, query, specialty]);

  // Quem já tem (ou aguarda) um nutricionista volta ao plano: a API só permite um vínculo por vez.
  if (state !== 'solo') return <Redirect href="/(tabs)/plan" />;

  const clearFilters = () => { setQuery(''); setSpecialty(ALL); };
  const hasFilters = !!query.trim() || specialty !== ALL;

  return <View style={{ flex: 1, backgroundColor: C.bg }}>
    <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: topPad }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <BackLink onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/plan')} />
      <Text accessibilityRole="header" style={[styles.title, { color: C.text }]}>Encontre seu nutricionista</Text>
      <Text style={[styles.subtitle, { color: C.textMuted }]}>Compare nome, especialidade e CRN. Ao escolher, você envia uma solicitação e o profissional decide se aceita.</Text>
      {DEMO_MODE && <InlineNotice tone="info">Perfis de demonstração para testar a experiência. Nenhuma solicitação é enviada ao servidor.</InlineNotice>}

      <View style={[styles.search, { backgroundColor: C.surface, borderColor: C.border }]}>
        <Ionicons name="search-outline" size={19} color={C.textMuted} />
        <TextInput accessibilityLabel="Buscar por nome, especialidade ou CRN" value={query} onChangeText={setQuery} placeholder="Nome, especialidade ou CRN" placeholderTextColor={C.textDim} style={{ flex: 1, color: C.text, fontSize: 15, paddingVertical: 12 }} />
        {!!query && <Pressable accessibilityRole="button" accessibilityLabel="Limpar busca" hitSlop={10} onPress={() => setQuery('')}><Ionicons name="close-circle" size={20} color={C.textMuted} /></Pressable>}
      </View>

      {specialties.length > 2 && (
        <View>
          <Text style={[styles.filterLabel, { color: C.textMuted }]}>ESPECIALIDADE</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 8 }}>
            {specialties.map(option => {
              const active = option === specialty;
              return <Pressable key={option} accessibilityRole="radio" accessibilityState={{ checked: active }} onPress={() => setSpecialty(option)} style={[styles.chip, { backgroundColor: active ? C.primarySoft : C.surface, borderColor: active ? C.primaryText : C.border }]}>
                {active && <Ionicons name="checkmark" size={15} color={C.primaryText} />}
                <Text style={{ color: active ? C.primaryText : C.text, fontWeight: '800', fontSize: 13 }}>{option}</Text>
              </Pressable>;
            })}
          </ScrollView>
        </View>
      )}

      {loading ? <LoadingState label="Buscando profissionais disponíveis…" />
        : error ? <ErrorState message={error} onRetry={retry} />
        : filtered.length === 0 ? <EmptyState icon="people-outline" title={hasFilters ? 'Nenhum profissional com esses filtros' : 'Nenhum nutricionista disponível agora'}
            action={<View style={{ gap: 8, alignSelf: 'stretch' }}>
              {hasFilters && <AppButton variant="secondary" icon="close-circle-outline" label="Limpar filtros" onPress={clearFilters} />}
              <AppButton variant={hasFilters ? 'ghost' : 'primary'} icon="key-outline" label="Tenho o ID de um nutricionista" onPress={() => router.push('/auth/nutri-code')} />
            </View>}>
            {hasFilters ? 'Tente outro nome ou outra especialidade. Se você já conhece um profissional, pode usar o ID da conta dele.' : 'Ainda não há profissionais aprovados na plataforma. Se você conhece um nutricionista que usa o Nutrifybe, peça o ID da conta dele.'}
          </EmptyState>
        : <>
          <Text accessibilityLiveRegion="polite" style={{ color: C.textMuted, fontSize: 13 }}>{filtered.length} {filtered.length === 1 ? 'profissional encontrado' : 'profissionais encontrados'}</Text>
          {filtered.map(item => {
            const review = reviews[item.id];
            const hasReviews = !!review && review.total > 0 && review.media != null;
            return <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={`${item.nome}, ${item.especialidade || 'Nutricionista'}, CRN ${item.crn}${hasReviews ? `, nota ${review!.media!.toFixed(1)} em ${review!.total} avaliações` : ''}. Ver perfil`} onPress={() => router.push({ pathname: '/nutri/professional', params: { id: String(item.id) } })} style={({ pressed }) => [styles.card, { backgroundColor: C.surface, borderColor: C.border, opacity: pressed ? 0.9 : 1 }]}>
              <View style={styles.cardTop}>
                <View style={[styles.avatar, { backgroundColor: C.primary }]}>{item.foto ? <Image source={{ uri: item.foto }} style={styles.avatarImage} /> : <Text style={styles.initial}>{item.nome.charAt(0)}</Text>}</View>
                <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                  <Text style={[styles.name, { color: C.text }]}>{item.nome}</Text>
                  <Text style={[styles.specialty, { color: C.primaryText }]}>{item.especialidade || 'Nutricionista'}</Text>
                  <Text style={[styles.crn, { color: C.textMuted }]}>CRN {item.crn}</Text>
                </View>
              </View>
              {!!item.descricao && <Text numberOfLines={3} style={[styles.description, { color: C.textMuted }]}>{item.descricao}</Text>}
              {(item.focusAreas?.length ?? 0) > 0 && <View style={styles.tags}>{item.focusAreas!.slice(0, 3).map(area => <View key={area} style={[styles.tag, { backgroundColor: C.surface2 }]}><Text style={{ color: C.textMuted, fontSize: 12, fontWeight: '700' }}>{area}</Text></View>)}</View>}
              <View style={[styles.footer, { borderTopColor: C.border }]}>
                {hasReviews
                  ? <StatusPill tone="warning" icon="star" label={`${review!.media!.toFixed(1)} · ${review!.total} ${review!.total === 1 ? 'avaliação' : 'avaliações'}`} />
                  : <Text style={{ color: C.textMuted, fontSize: 12 }}>{review === undefined ? 'Carregando avaliações…' : review === null ? 'Avaliações indisponíveis' : 'Ainda sem avaliações'}</Text>}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><Text style={{ color: C.primaryText, fontWeight: '900', fontSize: 14 }}>Ver perfil</Text><Ionicons name="chevron-forward" size={16} color={C.primaryText} /></View>
              </View>
            </Pressable>;
          })}
        </>}
      <View style={{ height: 60 }} />
    </ScrollView>
  </View>;
}

const styles = StyleSheet.create({
  scroll: { padding: 20, gap: 14, width: '100%', maxWidth: 720, alignSelf: 'center' }, title: { fontSize: 27, fontWeight: '900', letterSpacing: -.7 }, subtitle: { fontSize: 14, lineHeight: 20, marginTop: -6 },
  search: { borderWidth: 1, borderRadius: 15, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 9 }, filterLabel: { fontSize: 12, fontWeight: '900', letterSpacing: .6, marginBottom: 8 },
  chip: { minHeight: 44, borderWidth: 1.5, borderRadius: 999, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 5 },
  card: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 12 }, cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 }, avatar: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }, avatarImage: { width: 56, height: 56 }, initial: { color: '#fff', fontSize: 22, fontWeight: '900' },
  name: { fontSize: 17, fontWeight: '900' }, specialty: { fontSize: 14, fontWeight: '800' }, crn: { fontSize: 13, fontWeight: '600' }, description: { fontSize: 13, lineHeight: 19 }, tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 }, tag: { borderRadius: 99, paddingHorizontal: 10, paddingVertical: 5 },
  footer: { borderTopWidth: 1, paddingTop: 11, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
});
