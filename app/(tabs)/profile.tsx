import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const { user, updateUser, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', weight: user?.weight || '', height: user?.height || '', goal: user?.goal || '' });

  const save = () => {
    updateUser(form);
    setEditing(false);
    Alert.alert('Sucesso', 'Perfil atualizado!');
  };

  const handleLogout = () => {
    logout();
    router.replace('/auth/login');
  };

  const set = (key: string) => (val: string) => setForm(f => ({ ...f, [key]: val }));

  const menuItems = [
    { icon: '⚙️', label: 'Configurações', onPress: () => router.push('/institutional/settings') },
    { icon: 'ℹ️', label: 'Sobre Nós', onPress: () => router.push('/institutional/about') },
    { icon: '📋', label: 'Termos e Condições', onPress: () => router.push('/institutional/terms') },
    { icon: '🔒', label: 'Política de Privacidade', onPress: () => router.push('/institutional/privacy') },
    { icon: '🚪', label: 'Sair da Conta', onPress: () => setLogoutModal(true), danger: true },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() || 'U'}</Text>
        </View>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Dados Pessoais</Text>
          <TouchableOpacity onPress={() => setEditing(!editing)}>
            <Text style={styles.editBtn}>{editing ? 'Cancelar' : 'Editar'}</Text>
          </TouchableOpacity>
        </View>

        {[
          { key: 'name', label: 'Nome', keyboard: 'default' as const },
          { key: 'weight', label: 'Peso (kg)', keyboard: 'numeric' as const },
          { key: 'height', label: 'Altura (cm)', keyboard: 'numeric' as const },
          { key: 'goal', label: 'Objetivo', keyboard: 'default' as const },
        ].map(({ key, label, keyboard }) => (
          <View key={key} style={styles.field}>
            <Text style={styles.fieldLabel}>{label}</Text>
            {editing ? (
              <TextInput style={styles.fieldInput} value={form[key as keyof typeof form]} onChangeText={set(key)} keyboardType={keyboard} placeholderTextColor={Colors.textSecondary} />
            ) : (
              <Text style={styles.fieldValue}>{user?.[key as keyof typeof user] || '—'}</Text>
            )}
          </View>
        ))}

        {editing && (
          <TouchableOpacity style={styles.saveBtn} onPress={save}>
            <Text style={styles.saveBtnText}>Salvar</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.menu}>
        {menuItems.map((item, i) => (
          <TouchableOpacity key={i} style={styles.menuItem} onPress={item.onPress}>
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={[styles.menuLabel, item.danger && styles.menuLabelDanger]}>{item.label}</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Modal visible={logoutModal} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Sair da Conta</Text>
            <Text style={styles.modalText}>Tem certeza que deseja sair?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalBtnNo} onPress={() => setLogoutModal(false)}>
                <Text style={styles.modalBtnNoText}>Não</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnYes} onPress={handleLogout}>
                <Text style={styles.modalBtnYesText}>Sim</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingTop: 56, gap: 16 },
  avatarSection: { alignItems: 'center', gap: 6, marginBottom: 4 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: Colors.white },
  userName: { fontSize: 20, fontWeight: 'bold', color: Colors.text },
  userEmail: { fontSize: 14, color: Colors.textSecondary },
  card: { backgroundColor: Colors.card, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2, gap: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  editBtn: { fontSize: 14, color: Colors.primary, fontWeight: '600' },
  field: { borderBottomWidth: 1, borderBottomColor: Colors.border, paddingBottom: 10 },
  fieldLabel: { fontSize: 12, color: Colors.textSecondary, marginBottom: 4 },
  fieldValue: { fontSize: 15, color: Colors.text, fontWeight: '500' },
  fieldInput: { fontSize: 15, color: Colors.text, borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 8 },
  saveBtn: { backgroundColor: Colors.primary, borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 4 },
  saveBtnText: { color: Colors.white, fontSize: 15, fontWeight: 'bold' },
  menu: { backgroundColor: Colors.card, borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 12 },
  menuIcon: { fontSize: 20 },
  menuLabel: { flex: 1, fontSize: 15, color: Colors.text },
  menuLabelDanger: { color: Colors.danger },
  menuArrow: { fontSize: 20, color: Colors.textSecondary },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  modalBox: { backgroundColor: Colors.white, borderRadius: 20, padding: 24, width: '80%', gap: 12 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text, textAlign: 'center' },
  modalText: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center' },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 8 },
  modalBtnNo: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  modalBtnNoText: { fontSize: 15, color: Colors.text, fontWeight: '600' },
  modalBtnYes: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: Colors.danger, alignItems: 'center' },
  modalBtnYesText: { fontSize: 15, color: Colors.white, fontWeight: '600' },
});
