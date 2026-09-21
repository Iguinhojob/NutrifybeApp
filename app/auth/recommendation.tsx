import { useAuth } from '@/context/auth';
import { usePremiumTheme } from '@/context/theme';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

function getSuggestion(goal: string, weight: string, targetWeight: string) {
  const w = parseFloat(weight) || 70, t = parseFloat(targetWeight) || 65, diff = w - t;
  if (goal === 'Perder peso' && diff > 0)
    return { title: 'Déficit calórico moderado', desc: `Para perder ${diff.toFixed(0)}kg, sugerimos um déficit de ~300–500 kcal/dia com foco em proteínas e vegetais.`, kcal: Math.round(w * 28), protein: Math.round(w * 1.8), icon: 'trending-down-outline' as const };
  if (goal === 'Ganhar massa')
    return { title: 'Superávit calórico limpo', desc: 'Para ganhar massa muscular, sugerimos um superávit de ~300 kcal/dia com alta ingestão proteica.', kcal: Math.round(w * 34), protein: Math.round(w * 2.2), icon: 'trending-up-outline' as const };
  return { title: 'Manutenção equilibrada', desc: 'Seu plano foca em manter o peso atual com alimentação balanceada e hidratação adequada.', kcal: Math.round(w * 30), protein: Math.round(w * 1.6), icon: 'remove-outline' as const };
}

export default function RecommendationScreen() {
  const { user } = useAuth();
  const { colors: C } = usePremiumTheme();
  const sg = getSuggestion(user?.goal || '', user?.weight || '70', user?.targetWeight || '65');

  const metrics = [
    { value: String(sg.kcal), label: 'kcal/dia' },
    { value: `${sg.protein}g`, label: 'proteína/dia' },
    { value: `${user?.waterGoal || '2'}L`, label: 'água/dia' },
  ];

  return (
    <View style={[s.screen, { backgroundColor: C.bg }]}>
      <View style={[s.blob, { backgroundColor: C.primarySoft }]} />
      <ScrollView contentContainerStyle={s.scroll} bounces={false}>

        <Text style={[s.label, { color: C.primary }]}>NUTRIFYBE</Text>
        <Text style={[s.heroTitle, { color: C.text }]}>{'Sua\nsugestão\ninicial.'}</Text>
        <Text style={[s.heroSub, { color: C.textMuted }]}>Baseada no seu perfil. Você pode ajustar depois.</Text>

        {/* Card principal */}
        <View style={[s.card, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={s.cardHeader}>
            <View style={[s.iconWrap, { backgroundColor: C.primarySoft }]}>
              <Ionicons name={sg.icon} size={22} color={C.primary} />
            </View>
            <Text style={[s.cardTitle, { color: C.text }]}>{sg.title}</Text>
          </View>
          <Text style={[s.cardDesc, { color: C.textMuted }]}>{sg.desc}</Text>

          <View style={[s.metricsRow, { borderTopColor: C.border }]}>
            {metrics.map((m, i, arr) => (
              <View key={i} style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}>
                <View style={s.metric}>
                  <Text style={[s.metricValue, { color: C.text }]}>{m.value}</Text>
                  <Text style={[s.metricLabel, { color: C.textMuted }]}>{m.label}</Text>
                </View>
                {i < arr.length - 1 && <View style={[s.metricDivider, { backgroundColor: C.border }]} />}
              </View>
            ))}
          </View>
        </View>

        {/* Opção nutricionista — apresentada como opção, não venda */}
        <View style={[s.nutriOption, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={[s.nutriIconWrap, { backgroundColor: C.primarySoft }]}>
            <Ionicons name="person-outline" size={20} color={C.primary} />
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={[s.nutriTitle, { color: C.text }]}>Tem um nutricionista?</Text>
            <Text style={[s.nutriDesc, { color: C.textMuted }]}>
              Se você já acompanha com um profissional, pode vincular a conta dele para sincronizar seu plano.
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/auth/nutri-code')} style={[s.nutriBtn, { borderColor: C.border }]}>
            <Text style={[s.nutriBtnText, { color: C.primary }]}>Vincular</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[s.btnPrimary, { backgroundColor: C.primary, shadowColor: C.primary }]}
          onPress={() => router.replace('/(tabs)')}
          activeOpacity={0.85}
        >
          <Text style={s.btnPrimaryText}>Começar</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()} style={s.adjustRow}>
          <Text style={[s.adjustText, { color: C.textDim }]}>Ajustar dados</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen:        { flex: 1 },
  blob:          { position: 'absolute', top: -120, left: -100, width: 340, height: 340, borderRadius: 170 },
  scroll:        { flexGrow: 1, padding: 24, paddingTop: 68, gap: 16 },
  label:         { fontSize: 12, fontWeight: '800', letterSpacing: 3, marginBottom: 4 },
  heroTitle:     { fontSize: 44, fontWeight: '900', letterSpacing: -2, lineHeight: 48 },
  heroSub:       { fontSize: 14, fontWeight: '500', marginBottom: 8 },
  card:          { borderRadius: 20, padding: 20, borderWidth: 1, gap: 14 },
  cardHeader:    { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap:      { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  cardTitle:     { fontSize: 17, fontWeight: '800', flex: 1 },
  cardDesc:      { fontSize: 14, lineHeight: 21 },
  metricsRow:    { flexDirection: 'row', paddingTop: 14, borderTopWidth: 1 },
  metric:        { flex: 1, alignItems: 'center' },
  metricValue:   { fontSize: 20, fontWeight: '900' },
  metricLabel:   { fontSize: 11, fontWeight: '600', marginTop: 2 },
  metricDivider: { width: 1, height: 32 },
  nutriOption:   { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, padding: 16, borderWidth: 1 },
  nutriIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  nutriTitle:    { fontSize: 14, fontWeight: '700' },
  nutriDesc:     { fontSize: 12, lineHeight: 18 },
  nutriBtn:      { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1.5 },
  nutriBtnText:  { fontSize: 13, fontWeight: '700' },
  btnPrimary:    { borderRadius: 16, height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
                   shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 14, elevation: 6 },
  btnPrimaryText:{ fontSize: 17, fontWeight: '800', color: '#fff' },
  adjustRow:     { alignItems: 'center', paddingBottom: 16 },
  adjustText:    { fontSize: 14, fontWeight: '600' },
});
