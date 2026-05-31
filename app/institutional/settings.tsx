import { useTheme } from '@/context/theme';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const { colors, isDark, toggleTheme } = useTheme();

  const s = styles(colors);

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.section}>
        <Text style={s.sectionTitle}>Aparência</Text>
        <View style={s.item}>
          <Text style={s.itemLabel}>Modo escuro</Text>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>Dados</Text>
        <TouchableOpacity style={s.item}>
          <Text style={s.itemLabel}>Exportar dados</Text>
          <Text style={s.arrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.item}>
          <Text style={[s.itemLabel, { color: colors.danger }]}>Excluir conta</Text>
          <Text style={s.arrow}>›</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = (colors: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, gap: 16 },
  section: { backgroundColor: colors.card, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, padding: 16, paddingBottom: 8, textTransform: 'uppercase' },
  item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderTopWidth: 1, borderTopColor: colors.border },
  itemLabel: { fontSize: 15, color: colors.text },
  arrow: { fontSize: 20, color: colors.textSecondary },
});
