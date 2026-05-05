import { Colors } from '@/constants/theme';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';

export default function AboutYouScreen() {
  const [form, setForm] = useState({ name: '', email: '', weight: '', height: '' });

  const next = () => {
    if (!form.name || !form.email || !form.weight || !form.height)
      return Alert.alert('Erro', 'Preencha todos os campos.');
    router.push({ pathname: '/auth/register', params: form });
  };

  const set = (key: string) => (val: string) => setForm(f => ({ ...f, [key]: val }));

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Sobre Você</Text>
        <Text style={styles.subtitle}>Vamos começar com algumas informações básicas</Text>

        {[
          { key: 'name', label: 'Nome completo', keyboard: 'default' as const },
          { key: 'email', label: 'Email', keyboard: 'email-address' as const },
          { key: 'weight', label: 'Peso (kg)', keyboard: 'numeric' as const },
          { key: 'height', label: 'Altura (cm)', keyboard: 'numeric' as const },
        ].map(({ key, label, keyboard }) => (
          <TextInput
            key={key}
            style={styles.input}
            placeholder={label}
            value={form[key as keyof typeof form]}
            onChangeText={set(key)}
            keyboardType={keyboard}
            autoCapitalize={key === 'email' ? 'none' : 'words'}
            placeholderTextColor={Colors.textSecondary}
          />
        ))}

        <TouchableOpacity style={styles.button} onPress={next}>
          <Text style={styles.buttonText}>Continuar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.link}>Já tenho conta</Text>
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
  button: { backgroundColor: Colors.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: Colors.white, fontSize: 16, fontWeight: 'bold' },
  link: { textAlign: 'center', color: Colors.primary, marginTop: 12, fontWeight: '600' },
});
