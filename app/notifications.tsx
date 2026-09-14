import { useAuth } from '@/context/auth';
import { usePremiumTheme } from '@/context/theme';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

const ICONS: Record<string, { icon: any; color: string }> = {
  plano_atualizado:         { icon: 'nutrition-outline',         color: '#06b6d4' },
  observacao:               { icon: 'chatbubble-ellipses-outline',color: '#8b5cf6' },
  vinculo_aceito:           { icon: 'checkmark-circle-outline',  color: '#10b981' },
  vinculo_recusado:         { icon: 'close-circle-outline',      color: '#ef4444' },
  acompanhamento_encerrado: { icon: 'exit-outline',              color: '#f59e0b' },
};

export default function NotificationsScreen() {
  const { notificacoes, marcarNotificacaoLida } = useAuth();
  const { colors } = usePremiumTheme();

  const naoLidas = notificacoes.filter(n => !n.lida).length;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 20, gap: 10 }}>

      {naoLidas > 0 && (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text style={{ fontSize: 13, color: colors.textMuted, fontWeight: '600' }}>
            {naoLidas} não {naoLidas === 1 ? 'lida' : 'lidas'}
          </Text>
          <TouchableOpacity onPress={() => notificacoes.forEach(n => marcarNotificacaoLida(n.id))}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: colors.primary }}>Marcar todas como lidas</Text>
          </TouchableOpacity>
        </View>
      )}

      {notificacoes.length === 0 && (
        <View style={{ alignItems: 'center', paddingVertical: 60, gap: 12 }}>
          <Ionicons name="notifications-off-outline" size={52} color={colors.border} />
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>Nenhuma notificação</Text>
          <Text style={{ fontSize: 14, color: colors.textMuted, textAlign: 'center' }}>Você será notificado sobre atualizações do plano e mensagens do nutricionista.</Text>
        </View>
      )}

      {notificacoes.map(n => {
        const meta = ICONS[n.tipo] ?? { icon: 'notifications-outline', color: colors.primary };
        return (
          <TouchableOpacity
            key={n.id}
            onPress={() => marcarNotificacaoLida(n.id)}
            style={{
              flexDirection: 'row', gap: 14, padding: 16,
              backgroundColor: n.lida ? colors.surface : colors.primarySoft,
              borderRadius: 16, borderWidth: 1,
              borderColor: n.lida ? colors.border : colors.primary + '30',
              shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
            }}
          >
            <View style={{ width: 42, height: 42, borderRadius: 13, backgroundColor: meta.color + '15', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={meta.icon} size={22} color={meta.color} />
            </View>
            <View style={{ flex: 1, gap: 3 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontSize: 14, fontWeight: '800', color: colors.text, flex: 1 }}>{n.titulo}</Text>
                {!n.lida && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary }} />}
              </View>
              <Text style={{ fontSize: 13, color: colors.textMuted, lineHeight: 19 }}>{n.descricao}</Text>
              <Text style={{ fontSize: 11, color: colors.textDim, marginTop: 2 }}>{n.data}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
