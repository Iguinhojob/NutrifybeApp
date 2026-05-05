import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MEALS = ['Café da manhã', 'Almoço', 'Lanche', 'Jantar'];

function getWeekDays() {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - today.getDay() + i);
    return d;
  });
}

export default function HomeScreen() {
  const { user } = useAuth();
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today.getDate());
  const [modalVisible, setModalVisible] = useState(false);
  const [meals, setMeals] = useState<Record<string, string>>({});
  const weekDays = getWeekDays();

  const handleRegister = () => {
    Alert.alert('Sucesso', 'Refeições registradas!');
    setModalVisible(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, {user?.name?.split(' ')[0]} 👋</Text>
          <Text style={styles.date}>{today.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
        </View>
        <Text style={styles.logo}>🥗</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Resumo do Dia</Text>
        <View style={styles.macros}>
          {[{ label: 'Calorias', value: '1.840 kcal', color: Colors.primary },
            { label: 'Proteínas', value: '120g', color: Colors.secondary },
            { label: 'Carbos', value: '210g', color: Colors.yellow },
            { label: 'Gorduras', value: '60g', color: Colors.red }].map(m => (
            <View key={m.label} style={styles.macroItem}>
              <Text style={[styles.macroValue, { color: m.color }]}>{m.value}</Text>
              <Text style={styles.macroLabel}>{m.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Esta Semana</Text>
        <View style={styles.weekRow}>
          {weekDays.map((d, i) => (
            <TouchableOpacity key={i} style={[styles.dayBtn, selectedDate === d.getDate() && styles.dayBtnActive]} onPress={() => setSelectedDate(d.getDate())}>
              <Text style={[styles.dayLabel, selectedDate === d.getDate() && styles.dayLabelActive]}>{DAYS[i]}</Text>
              <Text style={[styles.dayNum, selectedDate === d.getDate() && styles.dayNumActive]}>{d.getDate()}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.registerBtn} onPress={() => setModalVisible(true)}>
        <Text style={styles.registerBtnText}>+ Registrar Refeições</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.dietBtn} onPress={() => router.push('/(tabs)/diet')}>
        <Text style={styles.dietBtnText}>📋 Ver Dieta Semanal</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Registrar Refeições</Text>
          <Text style={styles.modalDate}>Dia {selectedDate}</Text>
          <ScrollView style={{ flex: 1 }}>
            {MEALS.map(meal => (
              <View key={meal} style={styles.mealInput}>
                <Text style={styles.mealLabel}>{meal}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Arroz, feijão, frango..."
                  value={meals[meal] || ''}
                  onChangeText={v => setMeals(m => ({ ...m, [meal]: v }))}
                  placeholderTextColor={Colors.textSecondary}
                />
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Registrar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingTop: 56, gap: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  greeting: { fontSize: 22, fontWeight: 'bold', color: Colors.text },
  date: { fontSize: 13, color: Colors.textSecondary, marginTop: 2, textTransform: 'capitalize' },
  logo: { fontSize: 36 },
  card: { backgroundColor: Colors.card, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  macros: { flexDirection: 'row', justifyContent: 'space-between' },
  macroItem: { alignItems: 'center' },
  macroValue: { fontSize: 15, fontWeight: 'bold' },
  macroLabel: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayBtn: { alignItems: 'center', padding: 8, borderRadius: 12, flex: 1 },
  dayBtnActive: { backgroundColor: Colors.primary },
  dayLabel: { fontSize: 11, color: Colors.textSecondary },
  dayLabelActive: { color: Colors.white },
  dayNum: { fontSize: 15, fontWeight: '700', color: Colors.text, marginTop: 2 },
  dayNumActive: { color: Colors.white },
  registerBtn: { backgroundColor: Colors.primary, borderRadius: 12, padding: 16, alignItems: 'center' },
  registerBtnText: { color: Colors.white, fontSize: 16, fontWeight: 'bold' },
  dietBtn: { backgroundColor: Colors.white, borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: Colors.primary },
  dietBtnText: { color: Colors.primary, fontSize: 15, fontWeight: '600' },
  modal: { flex: 1, padding: 24, paddingTop: 40, backgroundColor: Colors.background, gap: 12 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: Colors.primary },
  modalDate: { fontSize: 14, color: Colors.textSecondary },
  mealInput: { marginBottom: 12 },
  mealLabel: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 6 },
  input: { backgroundColor: Colors.white, borderRadius: 12, padding: 12, fontSize: 15, borderWidth: 1, borderColor: Colors.border, color: Colors.text },
  button: { backgroundColor: Colors.primary, borderRadius: 12, padding: 16, alignItems: 'center' },
  buttonText: { color: Colors.white, fontSize: 16, fontWeight: 'bold' },
  cancelBtn: { alignItems: 'center', padding: 12 },
  cancelText: { color: Colors.textSecondary, fontSize: 15 },
});
