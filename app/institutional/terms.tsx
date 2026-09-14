import { usePremiumTheme } from '@/context/theme';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const SECTIONS = [
  { title: '1. Aceitação dos Termos', text: 'Ao utilizar o Nutrifybe, você concorda com estes Termos e Condições. Se não concordar, não utilize o aplicativo.' },
  { title: '2. Uso do Serviço', text: 'O Nutrifybe é destinado a fins informativos e de acompanhamento nutricional. Não substitui consultas com profissionais de saúde.' },
  { title: '3. Conta do Usuário', text: 'Você é responsável por manter a confidencialidade de suas credenciais de acesso e por todas as atividades realizadas em sua conta.' },
  { title: '4. Conteúdo', text: 'As informações nutricionais fornecidas são baseadas em dados gerais e podem não ser adequadas para condições médicas específicas.' },
  { title: '5. Limitação de Responsabilidade', text: 'O Nutrifybe não se responsabiliza por decisões tomadas com base nas informações do aplicativo sem orientação profissional.' },
  { title: '6. Modificações', text: 'Reservamos o direito de modificar estes termos a qualquer momento. Notificaremos os usuários sobre mudanças significativas.' },
  { title: '7. Contato', text: 'Para dúvidas sobre os termos: contatonutrifybe@gmail.com' },
];

export default function TermsScreen() {
  const { colors } = usePremiumTheme();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 13, color: colors.textMuted, marginBottom: 4, fontWeight: '500' }}>Última atualização: Janeiro 2025</Text>
      {SECTIONS.map(section => (
        <View key={section.title} style={[s.card, { backgroundColor: colors.surface, shadowColor: '#000' }]}>
          <Text style={[s.cardTitle, { color: colors.primary }]}>{section.title}</Text>
          <Text style={[s.cardText, { color: colors.textMuted }]}>{section.text}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  card:      { borderRadius: 16, padding: 16, gap: 8, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardTitle: { fontSize: 15, fontWeight: '800' },
  cardText:  { fontSize: 14, lineHeight: 22, fontWeight: '500' },
});
