import { usePremiumTheme } from '@/context/theme';
import { useAppLayout } from '@/hooks/useAppLayout';
import { DEMO_MODE, listAvailableNutritionists, type NutritionistProfile } from '@/services/demo';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function NutritionistProfileScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { colors: C } = usePremiumTheme();
  const { topPad } = useAppLayout();
  const [profile, setProfile] = useState<NutritionistProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    listAvailableNutritionists().then(items => { if (active) setProfile(items.find(item => String(item.id) === id) ?? null); }).catch(() => { if (active) setProfile(null); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  if (loading) return <View style={[styles.center, { backgroundColor: C.bg }]}><ActivityIndicator color={C.primary} /></View>;
  if (!profile) return <View style={[styles.center, { backgroundColor: C.bg, padding: 24 }]}><Ionicons name="person-outline" size={48} color={C.textDim} /><Text style={{ color: C.text, fontWeight: '900', fontSize: 18 }}>Perfil não encontrado</Text><TouchableOpacity onPress={() => router.back()}><Text style={{ color: C.primary, fontWeight: '800' }}>Voltar</Text></TouchableOpacity></View>;

  return <View style={{ flex: 1, backgroundColor: C.bg }}><ScrollView contentContainerStyle={[styles.scroll, { paddingTop: topPad }]} showsVerticalScrollIndicator={false}>
    <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/nutri/directory')} style={styles.back}><Ionicons name="arrow-back" size={20} color={C.primary} /><Text style={{ color: C.primary, fontWeight: '800' }}>Voltar</Text></TouchableOpacity>
    <View style={[styles.hero, { backgroundColor: C.primary }]}><View style={styles.avatar}><Text style={styles.initial}>{profile.nome.charAt(0)}</Text></View><Text style={styles.name}>{profile.nome}</Text><Text style={styles.specialty}>{profile.especialidade || 'Nutricionista'}</Text><Text style={styles.crn}>CRN {profile.crn}</Text><View style={styles.verified}><Ionicons name="checkmark-circle" size={15} color="#fff" /><Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>Perfil verificado</Text></View></View>
    {DEMO_MODE && <Text style={[styles.demo, { color: C.textDim }]}>Perfil local para testes da interface.</Text>}

    <View style={styles.metricRow}>
      <View style={[styles.metric, { backgroundColor: C.surface }]}><Ionicons name="star" size={20} color={C.warning} /><Text style={[styles.metricValue, { color: C.text }]}>{profile.rating?.toFixed(1) ?? '—'}</Text><Text style={[styles.metricLabel, { color: C.textMuted }]}>avaliação</Text></View>
      <View style={[styles.metric, { backgroundColor: C.surface }]}><Ionicons name="chatbubble-ellipses-outline" size={20} color={C.primary} /><Text style={[styles.metricValue, { color: C.text }]}>{profile.reviewCount ?? 0}</Text><Text style={[styles.metricLabel, { color: C.textMuted }]}>avaliações</Text></View>
      <View style={[styles.metric, { backgroundColor: C.surface }]}><Ionicons name="ribbon-outline" size={20} color={C.success} /><Text style={[styles.metricValue, { color: C.text }]}>{profile.experienceYears ?? '—'}</Text><Text style={[styles.metricLabel, { color: C.textMuted }]}>anos</Text></View>
    </View>

    <ProfileSection title="Sobre" C={C}><Text style={[styles.body, { color: C.textMuted }]}>{profile.bio || profile.descricao || 'Biografia ainda não informada.'}</Text></ProfileSection>
    <ProfileSection title="Áreas de atuação" C={C}><View style={styles.wrap}>{(profile.focusAreas?.length ? profile.focusAreas : [profile.especialidade || 'Nutrição']).map(area => <View key={area} style={[styles.pill, { backgroundColor: C.primarySoft }]}><Ionicons name="checkmark" size={13} color={C.primary} /><Text style={{ color: C.primary, fontWeight: '800', fontSize: 11 }}>{area}</Text></View>)}</View></ProfileSection>
    <ProfileSection title="Atendimento" C={C}><View style={styles.wrap}>{(profile.consultationModes?.length ? profile.consultationModes : ['Consultar disponibilidade']).map(mode => <View key={mode} style={[styles.pill, { backgroundColor: C.surface2 }]}><Ionicons name={mode === 'Online' ? 'videocam-outline' : 'location-outline'} size={14} color={C.textMuted} /><Text style={{ color: C.textMuted, fontWeight: '700', fontSize: 11 }}>{mode}</Text></View>)}</View></ProfileSection>
    <ProfileSection title="Avaliações" C={C}><View style={styles.ratingLine}><Ionicons name="star" size={26} color={C.warning} /><Text style={[styles.ratingNumber, { color: C.text }]}>{profile.rating?.toFixed(1) ?? 'Sem nota'}</Text></View><Text style={[styles.body, { color: C.textMuted }]}>{profile.reviewCount ? `Média baseada em ${profile.reviewCount} avaliações no catálogo de testes.` : 'Este profissional ainda não possui avaliações publicadas.'}</Text></ProfileSection>

    <TouchableOpacity onPress={() => router.push({ pathname: '/auth/nutri-code', params: { code: String(profile.id) } })} style={[styles.action, { backgroundColor: C.primary }]}><Ionicons name="person-add-outline" size={19} color="#fff" /><Text style={{ color: '#fff', fontWeight: '900', fontSize: 15 }}>Vincular este nutricionista</Text></TouchableOpacity>
    <View style={{ height: 60 }} />
  </ScrollView></View>;
}

function ProfileSection({ title, C, children }: { title: string; C: ReturnType<typeof usePremiumTheme>['colors']; children: React.ReactNode }) {
  return <View style={[styles.section, { backgroundColor: C.surface, borderColor: C.border }]}><Text style={[styles.sectionTitle, { color: C.text }]}>{title}</Text>{children}</View>;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }, scroll: { padding: 20, gap: 14 }, back: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingVertical: 8, paddingRight: 14 }, hero: { borderRadius: 24, padding: 24, alignItems: 'center' }, avatar: { width: 76, height: 76, borderRadius: 25, backgroundColor: 'rgba(255,255,255,.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 11 }, initial: { color: '#fff', fontWeight: '900', fontSize: 31 }, name: { color: '#fff', fontSize: 23, fontWeight: '900' }, specialty: { color: 'rgba(255,255,255,.82)', fontSize: 13, fontWeight: '700', marginTop: 3 }, crn: { color: 'rgba(255,255,255,.68)', fontSize: 11, marginTop: 3 }, verified: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,.17)', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 5, marginTop: 11 }, demo: { textAlign: 'center', fontSize: 10, marginTop: -8 }, metricRow: { flexDirection: 'row', gap: 8 }, metric: { flex: 1, borderRadius: 16, padding: 12, alignItems: 'center' }, metricValue: { fontSize: 19, fontWeight: '900', marginTop: 4 }, metricLabel: { fontSize: 9, marginTop: 1 }, section: { borderWidth: 1, borderRadius: 18, padding: 17, gap: 10 }, sectionTitle: { fontSize: 15, fontWeight: '900' }, body: { fontSize: 13, lineHeight: 20 }, wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 }, pill: { borderRadius: 99, paddingHorizontal: 10, paddingVertical: 7, flexDirection: 'row', alignItems: 'center', gap: 5 }, ratingLine: { flexDirection: 'row', alignItems: 'center', gap: 8 }, ratingNumber: { fontSize: 27, fontWeight: '900' }, action: { minHeight: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
});
