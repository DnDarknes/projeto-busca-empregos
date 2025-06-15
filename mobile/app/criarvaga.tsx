import { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CriarVaga() {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [acessibilidade, setAcessibilidade] = useState<string[]>([]);
  const router = useRouter();

  const toggleAcessibilidade = (tipo: string) => {
    setAcessibilidade((prev) =>
      prev.includes(tipo) ? prev.filter((t) => t !== tipo) : [...prev, tipo]
    );
  };

  const handleCriarVaga = async () => {
    try {
      const token = await AsyncStorage.getItem('token');

      await api.post('/jobs', {
        title: titulo,
        description: descricao,
        company: empresa,
        location: {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)],
          city: cidade,
          state: estado,
        },
        accessibilitySupport: acessibilidade,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Alert.alert('Sucesso', 'Vaga criada!');
      router.push('/painelRecrutador');
    } catch (err) {
      Alert.alert('Erro', 'Falha ao criar vaga.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar Nova Vaga</Text>
      <TextInput placeholder="Título" style={styles.input} onChangeText={setTitulo} value={titulo} />
      <TextInput placeholder="Descrição" style={[styles.input, { height: 80 }]} multiline onChangeText={setDescricao} value={descricao} />
      <TextInput placeholder="Empresa" style={styles.input} onChangeText={setEmpresa} value={empresa} />
      <TextInput placeholder="Cidade" style={styles.input} onChangeText={setCidade} value={cidade} />
      <TextInput placeholder="Estado" style={styles.input} onChangeText={setEstado} value={estado} />
      <TextInput placeholder="Latitude" keyboardType="numeric" style={styles.input} onChangeText={setLatitude} value={latitude} />
      <TextInput placeholder="Longitude" keyboardType="numeric" style={styles.input} onChangeText={setLongitude} value={longitude} />
      <Text style={{ marginBottom: 5 }}>Acessibilidade:</Text>
      {['visual', 'auditiva', 'fisica', 'intelectual', 'multipla', 'outra'].map((tipo) => (
        <Button
          key={tipo}
          title={`${acessibilidade.includes(tipo) ? '✓ ' : ''}${tipo}`}
          color={acessibilidade.includes(tipo) ? '#6C63FF' : '#ccc'}
          onPress={() => toggleAcessibilidade(tipo)}
        />
      ))}
      <Button title="Criar" color="#6C63FF" onPress={handleCriarVaga} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 12, borderRadius: 8 },
});
