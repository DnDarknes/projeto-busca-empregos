import { useState } from 'react';
import { View, TextInput, Button, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const router = useRouter();

  
  const handleLogin = async () => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password: senha,
      });

      const { token, role } = response.data;

      console.log('LOGIN DATA:', response.data);

    
      await AsyncStorage.setItem('token', token);

      console.log('Login OK:', response.data);
      Alert.alert('Login realizado com sucesso!');

      // Redirecionar com base na role do usuário
      if (role === 'recrutador') {
        router.push('/painelRecrutador');
      } else {
        router.push('/vagas');
      }
    } catch (err: any) {
      console.log('Erro no login:', err.response?.data || err.message);
      const msg = err.response?.data?.message || 'Erro ao fazer login';
      Alert.alert('Falha no login', msg);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Email:</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        style={{ borderBottomWidth: 1, marginBottom: 10 }}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text>Senha:</Text>
      <TextInput
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        style={{ borderBottomWidth: 1, marginBottom: 20 }}
      />

      <Button title="Entrar" onPress={handleLogin} />
    </View>
  );
  
}
