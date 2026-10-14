import { useAuth } from '@/context/auth';
import { usePremiumTheme } from '@/context/theme';
import { useAppLayout } from '@/hooks/useAppLayout';
import { NutricionistasAPI, type NutritionistReviewsResponse } from '@/services/api';
import { DEMO_MODE, listAvailableNutritionists, type NutritionistProfile } from '@/services/demo';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppButton, BackLink, ErrorState, InlineNotice, StatusPill } from '@/components/ui-kit';
import { useFollowUp } from '@/components/follow-up-status';

export default function NutritionistProfileScreen() {
  const { user } = useAuth();
  const followUp = useFollowUp();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { colors: C } = usePremiumTheme();
  const { topPad } = useAppLayout();
  const [profile, setProfile] = useState<NutritionistProfile | null>(null);
  const [reviews, setReviews] = useState<NutritionistReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const profileRequest = DEMO_MODE
      ? listAvailableNutritionists().then(items => items.find(item => String(item.id) === String(id)) ?? null)
      : NutricionistasAPI.getById(Number(id));
    Promise.all([profileRequest, NutricionistasAPI.getReviews(Number(id)).catch(() => null)])
      .then(([item, reviewData]) => { if (active) { setProfile(item); setReviews(reviewData); } })
      .catch(() => { if (active) setProfile(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  if (user?.nutricionistaId && String(user.nutricionistaId) !== String(id)) return <Redirect href="/(tabs)/plan" />;
  if (loading) return <View style={[styles.center, { backgroundColor: C.bg }]} accessible accessibilityLabel="Carregando perfil"><ActivityIndicator color={C.primaryText} /><Text style={{ color: C.textMuted }}>Carregando perfil…</Text></View>;
  if (!profile) return <View style={[styles.center, { backgroundColor: C.bg, padding: 24 }]}><ErrorState title="Perfil não encontrado" message="Este profissional pode não estar mais disponível. Volte e escolha outro perfil." /><AppButton variant="secondary" label="Voltar" icon="arrow-back" onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/plan')} /></View>;

  const total = reviews?.total ?? profile.reviewCount ?? 0;
  const media = reviews?.media ?? profile.rating ?? null;
  const average = total > 0 && media != null ? media.toFixed(1) : '—';
  const isMine = !!followUp.nutricionista && String(followUp.nutricionista.id) === String(profile.id);
  return <View style={{ flex: 1, backgroundColor: C.bg }}><ScrollView contentContainerStyle={[styles.scroll, { paddingTop: topPad }]} showsVerticalScrollIndicator={false}>
    <BackLink onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/plan')} />
    <View style={[styles.hero, { backgroundColor: C.primary }]}><View style={styles.avatar}>{profile.foto ? <Image source={{ uri: profile.foto }} style={styles.avatarImage} /> : <Text style={styles.initial}>{profile.nome.charAt(0)}</Text>}</View><Text style={styles.name}>{profile.nome}</Text><Text style={styles.specialty}>{profile.especialidade || 'Nutricionista'}</Text><Text style={styles.crn}>CRN {profile.crn}</Text>{(DEMO_MODE || profile.status === 'approved') && <View style={styles.verified}><Ionicons name={DEMO_MODE ? 'flask-outline' : 'shield-checkmark-outline'} size={15} color="#fff" /><Text style={{ color: '#fff', fontSize: 12, fontWeight: '800' }}>{DEMO_MODE ? 'Perfil de demonstração' : 'Cadastro aprovado pela Nutrifybe'}</Text></View>}</View>

    <View style={styles.metricRow}>
      <View style={[styles.metric, { backgroundColor: C.surface }]}><Ionicons name="star" size={20} color={C.warning} /><Text style={[styles.metricValue, { color: C.text }]}>{average}</Text><Text style={[styles.metricLabel, { color: C.textMuted }]}>{total > 0 ? 'nota média' : 'sem avaliações'}</Text></View>
      <View style={[styles.metric, { backgroundColor: C.surface }]}><Ionicons name="chatbubble-ellipses-outline" size={20} color={C.primary} /><Text style={[styles.metricValue, { color: C.text }]}>{total}</Text><Text style={[styles.metricLabel, { color: C.textMuted }]}>avaliações</Text></View>
      {profile.experienceYears != null && <View style={[styles.metric, { backgroundColor: C.surface }]}><Ionicons name="ribbon-outline" size={20} color={C.success} /><Text style={[styles.metricValue, { color: C.text }]}>{profile.experienceYears}</Text><Text style={[styles.metricLabel, { color: C.textMuted }]}>anos de experiência</Text></View>}
    </View>

    <ProfileSection title="Sobre" C={C}><Text style={[styles.body, { color: C.textMuted }]}>{profile.bio || profile.descricao || 'Biografia ainda não informada.'}</Text></ProfileSection>
    <ProfileSection title="Áreas de atuação" C={C}><View style={styles.wrap}>{(profile.focusAreas?.length ? profile.focusAreas : [profile.especialidade || 'Nutrição']).map(area => <View key={area} style={[styles.pill, { backgroundColor: C.primarySoft }]}><Ionicons name="checkmark" size={13} color={C.primaryText} /><Text style={{ color: C.primaryText, fontWeight: '800', fontSize: 12 }}>{area}</Text></View>)}</View></ProfileSection>
    {!!profile.consultationModes?.length && <ProfileSection title="Atendimento" C={C}><View style={styles.wrap}>{profile.consultationModes.map(mode => <View key={mode} style={[styles.pill, { backgroundColor: C.surface2 }]}><Ionicons name={mode === 'Online' ? 'videocam-outline' : 'location-outline'} size={14} color={C.textMuted} /><Text style={{ color: C.textMuted, fontWeight: '700', fontSize: 12 }}>{mode}</Text></View>)}</View></ProfileSection>}
    <ProfileSection title="Avaliações de pacientes" C={C}>
      <View style={styles.ratingLine}><Ionicons name="star" size={26} color={C.warning} /><Text style={[styles.ratingNumber, { color: C.text }]}>{average}</Text><Text style={{ color: C.textMuted }}>({total})</Text></View>
      {reviews?.avaliacoes?.length ? reviews.avaliacoes.map((review, index) => <View key={`${review.criadoEm}-${index}`} style={[styles.review, { backgroundColor: C.surface2 }]}><View style={styles.reviewTop}><Text style={{ color: C.text, fontWeight: '800' }}>Paciente</Text><View style={styles.reviewStars}>{[1, 2, 3, 4, 5].map(star => <Ionicons key={star} name={star <= review.nota ? 'star' : 'star-outline'} size={13} color={C.warning} />)}</View></View><Text style={{ color: C.textDim, fontSize: 11 }}>{new Date(review.criadoEm).toLocaleDateString('pt-BR')}</Text>{review.comentario?.trim() ? <Text style={[styles.body, { color: C.textMuted }]}>{review.comentario}</Text> : <Text style={[styles.body, { color: C.textDim, fontStyle: 'italic' }]}>Avaliação sem comentário.</Text>}</View>) : <Text style={[styles.body, { color: C.textMuted }]}>{total ? 'Ainda não há comentários publicados.' : 'Este profissional ainda não recebeu avaliações.'}</Text>}
    </ProfileSection>

    {followUp.state === 'solo' && <View style={{ gap: 10 }}>
      <InlineNotice tone="info" title="Como funciona a solicitação">{`${profile.nome} recebe seu pedido com nome, e-mail, idade, peso, altura, objetivo e condição de saúde do seu cadastro. Depois do aceite, o profissional passa a ver seu diário, a água e as medidas registradas, e o chat é liberado.`}</InlineNotice>
      <AppButton size="lg" icon="person-add-outline" label="Solicitar acompanhamento" onPress={() => router.push({ pathname: '/auth/nutri-code', params: { code: String(profile.id) } })} />
    </View>}
    {isMine && <StatusPill tone={followUp.state === 'ativo' ? 'success' : 'warning'} icon={followUp.state === 'ativo' ? 'checkmark-circle' : 'time'} label={followUp.state === 'ativo' ? 'Este é o seu nutricionista' : 'Sua solicitação aguarda resposta deste profissional'} />}
    <View style={{ height: 60 }} />
  </ScrollView></View>;
}

function ProfileSection({ title, C, children }: { title: string; C: ReturnType<typeof usePremiumTheme>['colors']; children: React.ReactNode }) {
  return <View style={[styles.section, { backgroundColor: C.surface, borderColor: C.border }]}><Text style={[styles.sectionTitle, { color: C.text }]}>{title}</Text>{children}</View>;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }, scroll: { padding: 20, gap: 14 }, back: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingVertical: 8, paddingRight: 14 }, hero: { borderRadius: 24, padding: 24, alignItems: 'center' }, avatar: { width: 76, height: 76, borderRadius: 25, backgroundColor: 'rgba(255,255,255,.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 11, overflow: 'hidden' }, avatarImage: { width: 76, height: 76 }, initial: { color: '#fff', fontWeight: '900', fontSize: 31 }, name: { color: '#fff', fontSize: 23, fontWeight: '900' }, specialty: { color: 'rgba(255,255,255,.95)', fontSize: 14, fontWeight: '700', marginTop: 3 }, crn: { color: 'rgba(255,255,255,.92)', fontSize: 13, marginTop: 3 }, verified: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,.17)', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 5, marginTop: 11 }, demo: { textAlign: 'center', fontSize: 10, marginTop: -8 }, metricRow: { flexDirection: 'row', gap: 8 }, metric: { flex: 1, borderRadius: 16, padding: 12, alignItems: 'center' }, metricValue: { fontSize: 19, fontWeight: '900', marginTop: 4 }, metricLabel: { fontSize: 11, textAlign: 'center', marginTop: 1 }, section: { borderWidth: 1, borderRadius: 18, padding: 17, gap: 10 }, sectionTitle: { fontSize: 15, fontWeight: '900' }, body: { fontSize: 13, lineHeight: 20 }, wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 }, pill: { borderRadius: 99, paddingHorizontal: 10, paddingVertical: 7, flexDirection: 'row', alignItems: 'center', gap: 5 }, ratingLine: { flexDirection: 'row', alignItems: 'center', gap: 8 }, ratingNumber: { fontSize: 27, fontWeight: '900' }, review: { borderRadius: 14, padding: 13, gap: 6 }, reviewTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, reviewStars: { flexDirection: 'row', gap: 2 }, action: { minHeight: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
});
