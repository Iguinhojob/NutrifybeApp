import { useAuth } from '@/context/auth';
import { usePremiumTheme } from '@/context/theme';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { user, updateUser, logout } = useAuth();
  const { colors, isDark, toggleTheme } = usePremiumTheme();
  const s = useMemo(() => createStyles(colors, isDark), [colors, isDark]);
  const [editing, setEditing] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', weight: user?.weight || '', height: user?.height || '', goal: user?.goal || '' });

  const save = () => { updateUser(form); setEditing(false); Alert.alert('Sucesso', 'Perfil atualizado!'); };
  const set = (key: string) => (val: string) => setForm(f => ({ ...f, [key]: val }));
  const handleLogout = () => { logout(); router.replace('/auth/login'); };

  const bmi = user?.weight && user?.height
    ? (parseFloat(user.weight) / Math.pow(parseFloat(user.height) / 100, 2)).toFixed(1)
    : '—';

  const menuItems = [
    { icon: 'moon-outline' as const, label: isDark ? 'Modo claro' : 'Modo escuro', onPress: toggleTheme },
    { icon: 'settings-outline' as const, label: 'Configurações', onPress: () => router.push('/institutional/settings') },
    { icon: 'information-circle-outline' as const, label: 'Sobre Nós', onPress: () => router.push('/institutional/about') },
    { icon: 'document-text-outline' as const, label: 'Termos e Condições', onPress: () => router.push('/institutional/terms') },
    { icon: 'shield-checkmark-outline' as const, label: 'Política de Privacidade', onPress: () => router.push('/institutional/privacy') },
    { icon: 'log-out-outline' as const, label: 'Sair da Conta', onPress: () => setLogoutModal(true), danger: true },
  ];

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
      {/* Avatar */}
      <View style={s.avatarSection}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{user?.name?.[0]?.toUpperCase() || 'U'}</Text>
        </View>
        <Text style={s.userName}>{user?.name}</Text>
        <Text style={s.userEmail}>{user?.email}</Text>
        <View style={[s.goalBadge, { backgroundColor: colors.purpleSoft }]}>
          <Text style={[s.goalBadgeText, { color: colors.text }]}>{user?.goal || 'Sem objetivo'}</Text>
        </View>
      </View>

      {/* Métricas rápidas */}
      <View style={s.metricsRow}>
        {[
          { label: 'Peso', value: `${user?.weight || '—'}kg` },
          { label: 'Altura', value: `${user?.height || '—'}cm` },
          { label: 'IMC', value: bmi },
          { label: 'Meta', value: `${user?.targetWeight || '—'}kg` },
        ].map(m => (
          <View key={m.label} style={[s.metricCard, { backgroundColor: colors.surface }]}>
            <Text style={s.metricValue}>{m.value}</Text>
            <Text style={s.metricLabel}>{m.label}</Text>
          </View>
        ))}
      </View>

      {/* Dados pessoais */}
      <View style={[s.card, { backgroundColor: colors.surface }]}>
        <View style={s.cardHeader}>
          <Text style={s.cardTitle}>Dados Pessoais</Text>
          <TouchableOpacity onPress={() => setEditing(!editing)}>
            <Text style={[s.editBtn, { color: colors.purpleAccent }]}>{editing ? 'Cancelar' : 'Editar'}</Text>
          </TouchableOpacity>
        </View>

        {[
          { key: 'name', label: 'Nome', keyboard: 'default' as const },
          { key: 'weight', label: 'Peso (kg)', keyboard: 'numeric' as const },
          { key: 'height', label: 'Altura (cm)', keyboard: 'numeric' as const },
          { key: 'goal', label: 'Objetivo', keyboard: 'default' as const },
        ].map(({ key, label, keyboard }) => (
          <View key={key} style={s.field}>
            <Text style={s.fieldLabel}>{label}</Text>
            {editing ? (
              <TextInput style={[s.fieldInput, { backgroundColor: colors.surface2, borderColor: colors.border, color: colors.text }]} value={form[key as keyof typeof form]} onChangeText={set(key)} keyboardType={keyboard} placeholderTextColor={colors.textDim} />
            ) : (
              <Text style={s.fieldValue}>{user?.[key as keyof typeof user] || '—'}</Text>
            )}
          </View>
        ))}

        {editing && (
          <TouchableOpacity style={[s.saveBtn, { backgroundColor: colors.ctaContrastBg }]} onPress={save}>
            <Text style={[s.saveBtnText, { color: colors.ctaContrastText }]}>Salvar</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Menu */}
      <View style={[s.menu, { backgroundColor: colors.surface }]}>
        {menuItems.map((item, i) => (
          <TouchableOpacity key={i} style={[s.menuItem, { borderBottomColor: colors.border }]} onPress={item.onPress}>
            <View style={[s.menuIconWrap, { backgroundColor: item.danger ? '#EF444420' : colors.surface3 }]}>
              <Ionicons name={item.icon} size={18} color={item.danger ? '#EF4444' : colors.text} />
            </View>
            <Text style={[s.menuLabel, item.danger && s.menuLabelDanger]}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textDim} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Modal logout */}
      <Modal visible={logoutModal} transparent animationType="fade">
        <View style={s.overlay}>
          <View style={[s.modalBox, { backgroundColor: colors.surface }]}>
            <Text style={[s.modalTitle, { color: colors.text }]}>Sair da Conta</Text>
            <Text style={[s.modalText, { color: colors.textMuted }]}>Tem certeza que deseja sair?</Text>
            <View style={s.modalButtons}>
              <TouchableOpacity style={[s.modalBtnNo, { borderColor: colors.border }]} onPress={() => setLogoutModal(false)}>
                <Text style={[s.modalBtnNoText, { color: colors.text }]}>Não</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.modalBtnYes} onPress={handleLogout}>
                <Text style={s.modalBtnYesText}>Sair</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

function createStyles(colors: any, isDark: boolean) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.bg },
    scroll: { padding: 20, paddingTop: 56, gap: 14 },
    avatarSection: { alignItems: 'center', gap: 6, marginBottom: 4 },
    avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.purpleSoft, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: colors.purpleAccent + '40' },
    avatarText: { fontSize: 32, fontWeight: '900', color: colors.text },
    userName: { fontSize: 20, fontWeight: '900', color: colors.text, letterSpacing: -0.5 },
    userEmail: { fontSize: 13, color: colors.textMuted, fontWeight: '500' },
    goalBadge: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5, marginTop: 4 },
    goalBadgeText: { fontSize: 12, fontWeight: '700' },
    metricsRow: { flexDirection: 'row', gap: 8 },
    metricCard: { flex: 1, borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
    metricValue: { fontSize: 16, fontWeight: '900', color: colors.text },
    metricLabel: { fontSize: 10, color: colors.textMuted, fontWeight: '700', marginTop: 2 },
    card: { borderRadius: 20, padding: 18, gap: 12, borderWidth: 1, borderColor: colors.border },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardTitle: { fontSize: 15, fontWeight: '800', color: colors.text },
    editBtn: { fontSize: 14, fontWeight: '700' },
    field: { borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 10 },
    fieldLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '700', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
    fieldValue: { fontSize: 15, color: colors.text, fontWeight: '600' },
    fieldInput: { fontSize: 15, borderWidth: 1, borderRadius: 10, padding: 10 },
    saveBtn: { borderRadius: 999, padding: 14, alignItems: 'center', marginTop: 4 },
    saveBtnText: { fontSize: 15, fontWeight: '800' },
    menu: { borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
    menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, gap: 12 },
    menuIconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    menuLabel: { flex: 1, fontSize: 15, color: colors.text, fontWeight: '600' },
    menuLabelDanger: { color: '#EF4444' },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
    modalBox: { borderRadius: 24, padding: 24, width: '80%', gap: 12, borderWidth: 1, borderColor: colors.border },
    modalTitle: { fontSize: 18, fontWeight: '900', textAlign: 'center' },
    modalText: { fontSize: 14, textAlign: 'center' },
    modalButtons: { flexDirection: 'row', gap: 12, marginTop: 8 },
    modalBtnNo: { flex: 1, padding: 14, borderRadius: 999, borderWidth: 1, alignItems: 'center' },
    modalBtnNoText: { fontSize: 15, fontWeight: '700' },
    modalBtnYes: { flex: 1, padding: 14, borderRadius: 999, backgroundColor: '#EF4444', alignItems: 'center' },
    modalBtnYesText: { fontSize: 15, color: '#FFFFFF', fontWeight: '700' },
  });
}
