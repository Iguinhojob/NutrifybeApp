import { useAuth } from '@/context/auth';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { D, GRAD } from '@/constants/darkTheme';

function getSuggestion(goal: string, weight: string, targetWeight: string) {
  const w = parseFloat(weight) || 70, t = parseFloat(targetWeight) || 65, diff = w - t;
  if (goal === 'Perder peso' && diff > 0) return { title: 'Déficit calórico moderado', desc: `Para perder ${diff.toFixed(0)}kg, recomendamos um déficit de ~300-500 kcal/dia com foco em proteínas e vegetais.`, kcal: Math.round(w * 28), protein: Math.round(w * 1.8), icon: 'trending-down-outline' as const };
  if (goal === 'Ganhar massa') return { title: 'Superávit calórico limpo', desc: 'Para ganhar massa muscular, recomendamos um superávit de ~300 kcal/dia com alta ingestão proteica.', kcal: Math.round(w * 34), protein: Math.round(w * 2.2), icon: 'trending-up-outline' as const };
  return { title: 'Manutenção equilibrada', desc: 'Seu plano foca em manter o peso atual com alimentação balanceada e hidratação adequada.', kcal: Math.round(w * 30), protein: Math.round(w * 1.6), icon: 'remove-outline' as const };
}

export default function RecommendationScreen() {
  const { user } = useAuth();
  const s = getSuggestion(user?.goal || '', user?.weight || '70', user?.targetWeight || '65');

  return (
    <View style={st.screen}>
      <View style={[st.glow, st.glowCyan]} />
      <View style={[st.glow, st.glowPurple]} />
      <ScrollView contentContainerStyle={st.scroll} bounces={false}>
        <Text style={st.brand}>NUTRIFYBE</Text>
        <Text style={st.heroTitle}>{'Sua\nsugestão\ninicial.'}</Text>
        <Text style={st.heroSub}>Baseada no seu perfil.</Text>

        <LinearGradient colors={GRAD} start={{x:0,y:0}} end={{x:1,y:1}} style={st.cardBorder}>
          <View style={st.card}>
            <View style={st.cardHeader}>
              <View style={st.iconWrap}>
                <Ionicons name={s.icon} size={24} color={D.cyan} />
              </View>
              <Text style={st.cardTitle}>{s.title}</Text>
            </View>
            <Text style={st.cardDesc}>{s.desc}</Text>
            <View style={st.metricsRow}>
              {[{ value: String(s.kcal), label: 'kcal/dia' }, { value: `${s.protein}g`, label: 'proteína/dia' }, { value: `${user?.waterGoal || '2'}L`, label: 'água/dia' }].map((m, i, arr) => (
                <View key={i} style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}>
                  <View style={st.metric}>
                    <Text style={st.metricValue}>{m.value}</Text>
                    <Text style={st.metricLabel}>{m.label}</Text>
                  </View>
                  {i < arr.length - 1 && <View style={st.metricDivider} />}
                </View>
              ))}
            </View>
          </View>
        </LinearGradient>

        <LinearGradient colors={GRAD} start={{x:0,y:0}} end={{x:1,y:0}} style={st.btn}>
          <TouchableOpacity onPress={() => router.replace('/(tabs)')} activeOpacity={0.85} style={st.btnInner}>
            <Text style={st.btnText}>Começar agora</Text>
            <Ionicons name="arrow-forward" size={18} color={D.white} />
          </TouchableOpacity>
        </LinearGradient>

        <TouchableOpacity onPress={() => router.back()} style={st.adjustRow}>
          <Text style={st.adjustText}>Ajustar dados</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  screen:       { flex: 1, backgroundColor: D.bg },
  glow:         { position: 'absolute', borderRadius: 999, opacity: 0.18 },
  glowCyan:     { width: 280, height: 280, backgroundColor: D.cyan,   top: -80,  left: -80 },
  glowPurple:   { width: 240, height: 240, backgroundColor: D.purple, bottom: 40, right: -60 },
  scroll:       { flexGrow: 1, padding: 24, paddingTop: 68 },
  brand:        { fontSize: 12, fontWeight: '800', letterSpacing: 3, color: D.cyan, marginBottom: 12 },
  heroTitle:    { fontSize: 48, fontWeight: '900', color: D.text, letterSpacing: -2, lineHeight: 52, marginBottom: 8 },
  heroSub:      { fontSize: 14, color: D.textMuted, fontWeight: '600', marginBottom: 32 },
  cardBorder:   { borderRadius: 26, padding: 1.5, marginBottom: 28 },
  card:         { backgroundColor: D.surface, borderRadius: 25, padding: 24, gap: 16 },
  cardHeader:   { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap:     { width: 44, height: 44, borderRadius: 14, backgroundColor: D.surface2, alignItems: 'center', justifyContent: 'center' },
  cardTitle:    { fontSize: 18, fontWeight: '800', color: D.text, flex: 1 },
  cardDesc:     { fontSize: 14, color: D.textMuted, lineHeight: 22, fontWeight: '500' },
  metricsRow:   { flexDirection: 'row', paddingTop: 16, borderTopWidth: 1, borderTopColor: D.border },
  metric:       { flex: 1, alignItems: 'center' },
  metricValue:  { fontSize: 20, fontWeight: '900', color: D.text },
  metricLabel:  { fontSize: 11, color: D.textMuted, fontWeight: '600', marginTop: 2 },
  metricDivider:{ width: 1, height: 36, backgroundColor: D.border },
  btn:          { borderRadius: 14, overflow: 'hidden', marginBottom: 16 },
  btnInner:     { paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  btnText:      { fontSize: 16, fontWeight: '800', color: D.white },
  adjustRow:    { alignItems: 'center' },
  adjustText:   { fontSize: 14, color: D.textDim, fontWeight: '600' },
});
