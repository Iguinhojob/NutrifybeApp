import { useAuth } from '@/context/auth';
import { editorialPalette } from '@/constants/theme';
import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const P = editorialPalette;

function getSuggestion(goal: string, weight: string, targetWeight: string) {
  const w = parseFloat(weight) || 70;
  const t = parseFloat(targetWeight) || 65;
  const diff = w - t;

  if (goal === 'Perder peso' && diff > 0) {
    return {
      title: 'Déficit calórico moderado',
      desc: `Para perder ${diff.toFixed(0)}kg, recomendamos um déficit de ~300-500 kcal/dia com foco em proteínas e vegetais.`,
      kcal: Math.round(w * 28),
      protein: Math.round(w * 1.8),
      icon: 'trending-down-outline' as const,
    };
  }
  if (goal === 'Ganhar massa') {
    return {
      title: 'Superávit calórico limpo',
      desc: 'Para ganhar massa muscular, recomendamos um superávit de ~300 kcal/dia com alta ingestão proteica.',
      kcal: Math.round(w * 34),
      protein: Math.round(w * 2.2),
      icon: 'trending-up-outline' as const,
    };
  }
  return {
    title: 'Manutenção equilibrada',
    desc: 'Seu plano foca em manter o peso atual com alimentação balanceada e hidratação adequada.',
    kcal: Math.round(w * 30),
    protein: Math.round(w * 1.6),
    icon: 'remove-outline' as const,
  };
}

export default function RecommendationScreen() {
  const { user } = useAuth();
  const suggestion = getSuggestion(user?.goal || '', user?.weight || '70', user?.targetWeight || '65');

  return (
    <View style={s.screen}>
      <View style={[s.bubble, { top: 50, right: -30, width: 120, height: 120, backgroundColor: P.lilac, opacity: 0.3 }]} />
      <ScrollView contentContainerStyle={s.scroll} bounces={false}>
        <Text style={s.brand}>NUTRIFYBE.</Text>
        <Text style={s.heroTitle}>{'Sua\nsugestão\ninicial.'}</Text>
        <Text style={s.heroSub}>Baseada no seu perfil.</Text>

        <View style={s.card}>
          <View style={s.cardHeader}>
            <Ionicons name={suggestion.icon} size={28} color={P.text} />
            <Text style={s.cardTitle}>{suggestion.title}</Text>
          </View>
          <Text style={s.cardDesc}>{suggestion.desc}</Text>

          <View style={s.metricsRow}>
            <View style={s.metric}>
              <Text style={s.metricValue}>{suggestion.kcal}</Text>
              <Text style={s.metricLabel}>kcal/dia</Text>
            </View>
            <View style={s.metricDivider} />
            <View style={s.metric}>
              <Text style={s.metricValue}>{suggestion.protein}g</Text>
              <Text style={s.metricLabel}>proteína/dia</Text>
            </View>
            <View style={s.metricDivider} />
            <View style={s.metric}>
              <Text style={s.metricValue}>{user?.waterGoal || '2'}L</Text>
              <Text style={s.metricLabel}>água/dia</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={s.ctaOuter} onPress={() => router.replace('/(tabs)')} activeOpacity={0.85}>
          <View style={s.ctaInner}>
            <Text style={s.ctaText}>Começar agora</Text>
            <Ionicons name="chevron-forward" size={16} color={P.text} />
            <Ionicons name="chevron-forward" size={16} color={P.text} style={{ marginLeft: -8 }} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()} style={s.adjustRow}>
          <Text style={s.adjustText}>Ajustar dados</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: P.mint },
  scroll: { flexGrow: 1, padding: 24, paddingTop: 68 },
  bubble: { position: 'absolute', borderRadius: 999 },
  brand: { fontSize: 13, fontWeight: '800', letterSpacing: 2, color: P.text, opacity: 0.5, marginBottom: 12 },
  heroTitle: { fontSize: 48, fontWeight: '900', color: P.text, letterSpacing: -2, lineHeight: 52, marginBottom: 8 },
  heroSub: { fontSize: 14, color: P.text, opacity: 0.5, fontWeight: '600', marginBottom: 32 },
  card: { backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 28, padding: 24, gap: 16, borderWidth: 1, borderColor: P.border, marginBottom: 28 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardTitle: { fontSize: 18, fontWeight: '800', color: P.text, flex: 1 },
  cardDesc: { fontSize: 14, color: P.text, opacity: 0.7, lineHeight: 22, fontWeight: '500' },
  metricsRow: { flexDirection: 'row', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: P.border },
  metric: { flex: 1, alignItems: 'center' },
  metricValue: { fontSize: 22, fontWeight: '900', color: P.text },
  metricLabel: { fontSize: 11, color: P.text, opacity: 0.5, fontWeight: '600', marginTop: 2 },
  metricDivider: { width: 1, height: 36, backgroundColor: P.border },
  ctaOuter: { backgroundColor: P.text, borderRadius: 999, padding: 4 },
  ctaInner: { backgroundColor: P.mint, borderRadius: 999, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  ctaText: { fontSize: 16, fontWeight: '800', color: P.text },
  adjustRow: { alignItems: 'center', marginTop: 16 },
  adjustText: { fontSize: 14, color: P.text, opacity: 0.5, fontWeight: '600' },
});
