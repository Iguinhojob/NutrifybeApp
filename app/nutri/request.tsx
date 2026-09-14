import { useAuth, Nutricionista } from '@/context/auth';
import { usePremiumTheme } from '@/context/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const NUTRICIONISTAS: Nutricionista[] = [
  { id: '1', name: 'Dra. Ana Beatriz',   specialty: 'Nutrição Esportiva',  crn: 'CRN-3 12345', rating: 4.9, patients: 128, online: true,  avatar: '👩⚕️', bio: 'Especialista em nutrição esportiva e emagrecimento. 8 anos de experiência.' },
  { id: '2', name: 'Dr. Carlos Mendes',  specialty: 'Nutrição Clínica',    crn: 'CRN-3 67890', rating: 4.7, patients: 95,  online: false, avatar: '👨⚕️', bio: 'Foco em doenças crônicas, diabetes e hipertensão. Atendimento humanizado.' },
  { id: '3', name: 'Dra. Fernanda Lima', specialty: 'Nutrição Funcional',  crn: 'CRN-3 54321', rating: 4.8, patients: 210, online: true,  avatar: '👩💼', bio: 'Nutrição funcional e integrativa. Especialista em saúde intestinal e imunidade.' },
  { id: '4', name: 'Dr. Rafael Costa',   specialty: 'Nutrição Pediátrica', crn: 'CRN-3 11223', rating: 4.6, patients: 74,  online: true,  avatar: '👨‍⚕️', bio: 'Especialista em nutrição infantil e adolescente. Abordagem lúdica e familiar.' },
];

export default function RequestScreen() {
  const { solicitarVinculo } = useAuth();
  const { colors } = usePremiumTheme();
  const [selected, setSelected] = useState<Nutricionista | null>(null);
  const [confirmModal, setConfirmModal] = useState(false);

  const confirmar = () => {
    if (!selected) return;
    solicitarVinculo(selected);
    setConfirmModal(false);
    Alert.alert('Solicitação enviada!', `Aguarde a confirmação de ${selected.name}.`, [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 20, gap: 14 }}>

      <Text style={{ fontSize: 14, color: colors.textMuted, marginBottom: 4 }}>
        Escolha um nutricionista para iniciar seu acompanhamento personalizado.
      </Text>

      {NUTRICIONISTAS.map(n => (
        <TouchableOpacity
          key={n.id}
          onPress={() => { setSelected(n); setConfirmModal(true); }}
          style={{
            backgroundColor: colors.surface, borderRadius: 20, padding: 16, gap: 12,
            borderWidth: 1, borderColor: colors.border,
            shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
          }}
        >
          {/* Topo */}
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
            <View style={{ width: 56, height: 56, borderRadius: 18, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <Text style={{ fontSize: 28 }}>{n.avatar}</Text>
              {n.online && (
                <View style={{ position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, borderRadius: 6, backgroundColor: '#10b981', borderWidth: 2, borderColor: colors.surface }} />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '800', color: colors.text }}>{n.name}</Text>
              <Text style={{ fontSize: 13, fontWeight: '600', color: colors.primary, marginTop: 1 }}>{n.specialty}</Text>
              <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 1 }}>{n.crn}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                <Ionicons name="star" size={13} color={colors.warning} />
                <Text style={{ fontSize: 13, fontWeight: '800', color: colors.text }}>{n.rating}</Text>
              </View>
              <Text style={{ fontSize: 11, color: colors.textMuted }}>{n.patients} pacientes</Text>
            </View>
          </View>

          <Text style={{ fontSize: 13, color: colors.textMuted, lineHeight: 19 }}>{n.bio}</Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: n.online ? colors.successSoft : colors.border }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: n.online ? colors.success : colors.textMuted }} />
              <Text style={{ fontSize: 11, fontWeight: '700', color: n.online ? colors.success : colors.textMuted }}>{n.online ? 'Online' : 'Offline'}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primary, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8 }}>
              <Ionicons name="person-add-outline" size={14} color="#fff" />
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>Solicitar</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}

      {/* Modal de confirmação */}
      <Modal visible={confirmModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <View style={{ backgroundColor: colors.surface, borderRadius: 24, padding: 24, width: '100%', gap: 14 }}>
            <View style={{ alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 36 }}>{selected?.avatar}</Text>
              <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text, textAlign: 'center' }}>Solicitar vínculo?</Text>
              <Text style={{ fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20 }}>
                Você está prestes a enviar uma solicitação de acompanhamento para{' '}
                <Text style={{ fontWeight: '700', color: colors.text }}>{selected?.name}</Text>.
              </Text>
            </View>
            <Text style={{ fontSize: 13, color: colors.textMuted, textAlign: 'center', lineHeight: 19 }}>
              O nutricionista precisará aceitar sua solicitação antes do acompanhamento começar.
            </Text>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
              <TouchableOpacity
                style={{ flex: 1, padding: 14, borderRadius: 14, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center' }}
                onPress={() => setConfirmModal(false)}
              >
                <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, padding: 14, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center' }}
                onPress={confirmar}
              >
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}
