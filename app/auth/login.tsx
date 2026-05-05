import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!email || !password) return Alert.alert('Erro', 'Preencha todos os campos.');
    const ok = login(email, password);
    if (ok) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Erro', 'Email ou senha inválidos.');
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      bounces={false}
    >
      <Text style={styles.logo}>🥗</Text>
      <Text style={styles.title}>Nutrifybe</Text>
      <Text style={styles.subtitle}>Bem-vindo de volta!</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={Colors.textSecondary}
        />
        <TextInput
          style={styles.input}
          placeholder="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor={Colors.textSecondary}
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/auth/about-you')}>
          <Text style={styles.link}>Não tem conta? <Text style={styles.linkBold}>Cadastre-se</Text></Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', padding: 24 },
  logo: { fontSize: 56 },
  title: { fontSize: 32, fontWeight: 'bold', color: Colors.primary, marginTop: 8 },
  subtitle: { fontSize: 16, color: Colors.textSecondary, marginBottom: 32 },
  form: { width: '100%', gap: 12 },
  input: { backgroundColor: Colors.white, borderRadius: 12, padding: 14, fontSize: 16, borderWidth: 1, borderColor: Colors.border, color: Colors.text },
  button: { backgroundColor: Colors.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: Colors.white, fontSize: 16, fontWeight: 'bold' },
  link: { textAlign: 'center', color: Colors.textSecondary, marginTop: 8 },
  linkBold: { color: Colors.primary, fontWeight: 'bold' },
});
