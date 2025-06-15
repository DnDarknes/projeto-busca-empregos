import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function Home() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, color: '#6C63FF' }}>Conexão de Talentos</Text>
      <Button title="Login" onPress={() => router.push('/login')} />
      <Button title="Cadastro" onPress={() => router.push('/register')} />
    </View>
  );
}
