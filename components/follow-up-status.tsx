import { AppButton, StatusPill, type IconName, type Tone } from '@/components/ui-kit';
import { useAuth } from '@/context/auth';
import { usePremiumTheme } from '@/context/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

export type FollowUpState = 'ativo' | 'pendente' | 'solo';

/**
 * Estado do acompanhamento a partir do que o app realmente conhece:
 * - ativo: vínculo aceito pelo nutricionista (status "accepted" na API);
 * - pendente: solicitação enviada e ainda sem resposta;
 * - solo: sem nutricionista vinculado. A API não diferencia "nunca pediu",
 *   "pedido recusado" e "vínculo encerrado": nos três casos o paciente volta ao modo solo.
 */
export function useFollowUp() {
  const { user, vinculo } = useAuth();
  const state: FollowUpState = vinculo?.status === 'ativo' ? 'ativo' : (vinculo?.status === 'pendente' || user?.nutricionistaId) ? 'pendente' : 'solo';
  return { state, nutricionista: vinculo?.nutricionista ?? null };
}

const COPY: Record<FollowUpState, { pill: string; tone: Tone; icon: IconName }> = {
  ativo: { pill: 'Acompanhamento ativo', tone: 'success', icon: 'checkmark-circle' },
  pendente: { pill: 'Aguardando resposta', tone: 'warning', icon: 'time' },
  solo: { pill: 'Modo solo', tone: 'neutral', icon: 'person-circle-outline' },
};

export function FollowUpStatusCard({ compact = false }: { compact?: boolean }) {
  const { colors: C } = usePremiumTheme();
  const { state, nutricionista } = useFollowUp();
  const copy = COPY[state];
  const nome = nutricionista?.nome;

  const title = state === 'ativo'
    ? `Você é acompanhado(a) por ${nome ?? 'seu nutricionista'}`
    : state === 'pendente'
      ? `Solicitação enviada${nome ? ` para ${nome}` : ''}`
      : 'Você está usando o Nutrifybe por conta própria';
  const description = state === 'ativo'
    ? 'Seu diário, suas medidas e a conversa ficam disponíveis para o profissional.'
    : state === 'pendente'
      ? 'O nutricionista precisa aceitar o pedido. Enquanto isso, continue registrando suas refeições normalmente. Plano e chat são liberados após o aceite.'
      : 'Quando quiser, encontre um nutricionista para receber um plano alimentar e conversar pelo app.';

  const openProfile = () => nutricionista && router.push({ pathname: '/nutri/professional', params: { id: String(nutricionista.id) } });
  const primary = state === 'ativo'
    ? { label: 'Abrir conversa', icon: 'chatbubbles-outline' as IconName, onPress: () => router.push('/(tabs)/messages') }
    : state === 'pendente'
      ? (nutricionista ? { label: 'Ver perfil do nutricionista', icon: 'person-outline' as IconName, onPress: openProfile } : null)
      : { label: 'Encontrar nutricionista', icon: 'search-outline' as IconName, onPress: () => router.push('/nutri/directory') };

  if (compact) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${copy.pill}. ${title}. ${primary ? primary.label : ''}`}
        onPress={primary?.onPress ?? (() => router.push('/(tabs)/plan'))}
        style={({ pressed }) => [styles.compact, { backgroundColor: C.surface, borderColor: C.border, opacity: pressed ? 0.85 : 1 }]}
      >
        <Avatar foto={nutricionista?.foto} state={state} />
        <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
          <StatusPill tone={copy.tone} icon={copy.icon} label={copy.pill} />
          <Text numberOfLines={2} style={{ color: C.text, fontWeight: '800', fontSize: 14 }}>{title}</Text>
          {primary && <Text style={{ color: C.primaryText, fontWeight: '800', fontSize: 13 }}>{primary.label} ›</Text>}
        </View>
      </Pressable>
    );
  }

  return (
    <View style={[styles.full, { backgroundColor: C.surface, borderColor: C.border }]}>
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
        <Avatar foto={nutricionista?.foto} state={state} />
        <View style={{ flex: 1, minWidth: 0, gap: 6 }}>
          <StatusPill tone={copy.tone} icon={copy.icon} label={copy.pill} />
          <Text accessibilityRole="header" style={{ color: C.text, fontWeight: '900', fontSize: 16 }}>{title}</Text>
          {state !== 'solo' && nutricionista?.especialidade ? <Text style={{ color: C.textMuted, fontSize: 13 }}>{nutricionista.especialidade} · CRN {nutricionista.crn}</Text> : null}
        </View>
      </View>
      <Text style={{ color: C.textMuted, fontSize: 13, lineHeight: 19 }}>{description}</Text>
      <View style={{ gap: 8 }}>
        {primary && <AppButton label={primary.label} icon={primary.icon} onPress={primary.onPress} />}
        {state === 'solo' && <AppButton variant="secondary" label="Tenho o ID do nutricionista" icon="key-outline" onPress={() => router.push('/auth/nutri-code')} />}
        {state === 'ativo' && nutricionista && <AppButton variant="secondary" label="Ver perfil do nutricionista" icon="person-outline" onPress={openProfile} />}
      </View>
    </View>
  );
}

function Avatar({ foto, state }: { foto?: string | null; state: FollowUpState }) {
  const { colors: C } = usePremiumTheme();
  if (foto) return <Image source={{ uri: foto }} style={styles.avatar} accessibilityIgnoresInvertColors />;
  return (
    <View style={[styles.avatar, { backgroundColor: C.primarySoft, alignItems: 'center', justifyContent: 'center' }]}>
      <Ionicons name={state === 'solo' ? 'person-outline' : 'medkit-outline'} size={22} color={C.primaryText} />
    </View>
  );
}

const styles = StyleSheet.create({
  compact: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 18, padding: 14 },
  full: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 16 },
});
