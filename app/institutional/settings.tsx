import { Colors } from '@/constants/theme';
import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [reminders, setReminders] = useState(true);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notificações</Text>
        <View style={styles.item}>
          <Text style={styles.itemLabel}>Ativar notificações</Text>
          <Switch value={notifications} onValueChange={setNotifications} trackColor={{ true: Colors.primary }} />
        </View>
        <View style={styles.item}>
          <Text style={styles.itemLabel}>Lembretes de refeições</Text>
          <Switch value={reminders} onValueChange={setReminders} trackColor={{ true: Colors.primary }} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Aparência</Text>
        <View style={styles.item}>
          <Text style={styles.itemLabel}>Modo escuro</Text>
          <Switch value={darkMode} onValueChange={setDarkMode} trackColor={{ true: Colors.primary }} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dados</Text>
        <TouchableOpacity style={styles.item}>
          <Text style={styles.itemLabel}>Exportar dados</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item}>
          <Text style={[styles.itemLabel, { color: Colors.danger }]}>Excluir conta</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, gap: 16 },
  section: { backgroundColor: Colors.white, borderRadius: 14, overflow: 'hidden' },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, padding: 16, paddingBottom: 8, textTransform: 'uppercase' },
  item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderTopWidth: 1, borderTopColor: Colors.border },
  itemLabel: { fontSize: 15, color: Colors.text },
  arrow: { fontSize: 20, color: Colors.textSecondary },
});
