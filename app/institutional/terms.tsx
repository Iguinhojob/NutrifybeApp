import { usePremiumTheme } from '@/context/theme';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const SECTIONS = [
  { title: '1. Aceitação dos Termos', text: 'Ao utilizar o Nutrifybe, você concorda com estes Termos e Condições. Se não concordar, não utilize o aplicativo.' },
  { title: '2. Uso do Serviço', text: 'O Nutrifybe é destinado a fins informativos e de acompanhamento nutricional. Não substitui consultas com profissionais de saúde.' },
  { title: '3. Conta do Usuário', text: 'Você é responsável por manter a confidencialidade de suas credenciais de acesso e por todas as atividades realizadas em sua conta.' },
  { title: '4. Conteúdo', text: 'As informações nutricionais fornecidas são baseadas em dados gerais e podem não ser adequadas para condições médicas específicas.' },
  { title: '5. Limitação de Responsabilidade', text: 'O Nutrifybe não se responsabiliza por decisões tomadas com base nas informações do aplicativo sem orientação profissional.' },
  { title: '6. Modificações', text: 'Reservamos o direito de modificar estes termos a qualquer momento. Notificaremos os usuários sobre mudanças significativas.' },
  { title: '7. Contato', text: 'Para dúvidas sobre os termos: termos@nutrifybe.com' },
];

export default function TermsScreen() {
  const { colors, isDark } = usePremiumTheme();
  const s = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.scroll}>
      <Text style={s.updated}>Última atualização: Janeiro 2025</Text>
      {SECTIONS.map(section => (
        <View key={section.title} style={s.card}>
          <Text style={s.cardTitle}>{section.title}</Text>
          <Text style={s.cardText}>{section.text}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

function createStyles(colors: any, isDark: boolean) {
  return StyleSheet.create({
    screen:    { flex: 1, backgroundColor: colors.bg },
    scroll:    { padding: 20, gap: 12 },
    updated:   { fontSize: 13, color: colors.textMuted, marginBottom: 4, fontWeight: '500' },
    card:      { backgroundColor: colors.surface, borderRadius: 16, padding: 16, gap: 8, borderWidth: 1, borderColor: colors.border },
    cardTitle: { fontSize: 15, fontWeight: '800', color: colors.primary },
    cardText:  { fontSize: 14, color: colors.textMuted, lineHeight: 22, fontWeight: '500' },
  });
}
