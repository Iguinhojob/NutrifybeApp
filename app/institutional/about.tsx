import { usePremiumTheme } from '@/context/theme';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GRAD } from '@/constants/darkTheme';

export default function AboutScreen() {
  const { colors } = usePremiumTheme();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={s.scroll}>
      <View style={s.hero}>
        <LinearGradient colors={GRAD} start={{x:0,y:0}} end={{x:1,y:1}} style={s.iconCircle}>
          <View style={s.leaf} /><View style={[s.leaf, s.leafRight]} /><View style={s.stem} />
        </LinearGradient>
        <Text style={s.title}><Text style={{ color: '#00BCD4' }}>Nutri</Text><Text style={{ color: '#7C5CBF' }}>fybe</Text></Text>
        <Text style={[s.tagline, { color: colors.textMuted }]}>Sua nutrição inteligente</Text>
      </View>
      {[
        { title: 'Nossa Missão',  text: 'Ajudar pessoas a alcançarem seus objetivos de saúde através de um acompanhamento nutricional personalizado, simples e eficaz.' },
        { title: 'O que fazemos', text: 'O Nutrifybe oferece planos alimentares personalizados, registro diário de refeições, acompanhamento de progresso e análise de tendências.' },
        { title: 'Nossa Equipe',  text: 'Somos uma equipe apaixonada por saúde e tecnologia, comprometida em tornar a nutrição acessível para todos.' },
        { title: 'Versão',        text: 'Nutrifybe v1.0.0 · 2025' },
      ].map(sec => (
        <View key={sec.title} style={[s.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[s.cardTitle, { color: colors.cyan }]}>{sec.title}</Text>
          <Text style={[s.cardText, { color: colors.textMuted }]}>{sec.text}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll:     { padding: 20, paddingTop: 20, gap: 12, alignItems: 'center' },
  hero:       { alignItems: 'center', paddingVertical: 24, gap: 8 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  leaf:       { position: 'absolute', width: 24, height: 34, borderRadius: 12, backgroundColor: '#fff', opacity: 0.9, top: 12, left: 18, transform: [{ rotate: '-25deg' }] },
  leafRight:  { left: 38, opacity: 0.6, transform: [{ rotate: '25deg' }] },
  stem:       { position: 'absolute', bottom: 12, width: 3, height: 16, borderRadius: 2, backgroundColor: '#fff', opacity: 0.8 },
  title:      { fontSize: 28, fontWeight: '900', letterSpacing: -1 },
  tagline:    { fontSize: 14, fontWeight: '500' },
  card:       { width: '100%', borderRadius: 16, padding: 16, gap: 8, borderWidth: 1 },
  cardTitle:  { fontSize: 15, fontWeight: '800' },
  cardText:   { fontSize: 14, lineHeight: 22, fontWeight: '500' },
});
