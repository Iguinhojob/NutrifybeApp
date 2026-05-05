import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const GOALS = ['Perder peso', 'Ganhar massa', 'Manter peso', 'Melhorar saúde'];

export default function RegisterScreen() {
  const params = useLocalSearchParams<{ name: string; email: string; weight: string; height: string }>();
  const { register } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [goal, setGoal] = useState(GOALS[0]);

  const handleRegister = () => {
    if (!password || password.length < 6) return Alert.alert('Erro', 'Senha deve ter ao menos 6 caracteres.');
    if (password !== confirm) return Alert.alert('Erro', 'Senhas não coincidem.');
    register({ name: params.name, email: params.email, weight: params.weight, height: params.height, goal, password });
    router.replace('/auth/success');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Finalize seu Cadastro</Text>
        <Text style={styles.subtitle}>Olá, {params.name}! Defina sua senha e objetivo.</Text>

        <TextInput style={styles.input} placeholder="Senha" value={password} onChangeText={setPassword} secureTextEntry placeholderTextColor={Colors.textSecondary} />
        <TextInput style={styles.input} placeholder="Confirmar senha" value={confirm} onChangeText={setConfirm} secureTextEntry placeholderTextColor={Colors.textSecondary} />

        <Text style={styles.label}>Objetivo</Text>
        <View style={styles.goals}>
          {GOALS.map(g => (
            <TouchableOpacity key={g} style={[styles.goalChip, goal === g && styles.goalChipActive]} onPress={() => setGoal(g)}>
              <Text style={[styles.goalText, goal === g && styles.goalTextActive]}>{g}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Registrar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 24, gap: 12, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: 'bold', color: Colors.primary, marginBottom: 4 },
  subtitle: { fontSize: 14, color: Colors.textSecondary, marginBottom: 20 },
  input: { backgroundColor: Colors.white, borderRadius: 12, padding: 14, fontSize: 16, borderWidth: 1, borderColor: Colors.border, color: Colors.text },
  label: { fontSize: 14, fontWeight: '600', color: Colors.text, marginTop: 8 },
  goals: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  goalChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.white },
  goalChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  goalText: { color: Colors.textSecondary, fontSize: 13 },
  goalTextActive: { color: Colors.white, fontWeight: '600' },
  button: { backgroundColor: Colors.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 16 },
  buttonText: { color: Colors.white, fontSize: 16, fontWeight: 'bold' },
});
