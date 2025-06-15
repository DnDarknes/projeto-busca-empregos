import { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';

export default function EditarVaga() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [empresa, setEmpresa] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await api.get(`/jobs/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const vaga = res.data;
        setTitulo(vaga.title);
        setDescricao(vaga.description);
        setCidade(vaga.location.city);
        setEstado(vaga.location.state);
        setLatitude(String(vaga.location.coordinates[1]));
        setLongitude(String(vaga.location.coordinates[0]));
        setEmpresa(vaga.company);
      } catch (err) {
        Alert.alert('Erro', 'Não foi possível carregar os dados da vaga.');
      }
    })();
  }, [id]);

  const salvarAlteracoes = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      await api.patch(`/jobs/${id}`, {
        title: titulo,
        description: descricao,
        company: empresa,
        location: {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)],
          city: cidade,
          state: estado,
        },
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert('Sucesso', 'Vaga atualizada!');
      router.push('/painelRecrutador');
    } catch (err: any) {
      console.log(err.response?.data || err.message);
      Alert.alert('Erro', 'Erro ao atualizar a vaga.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Vaga</Text>
      <TextInput style={styles.input} value={titulo} onChangeText={setTitulo} placeholder="Título" />
      <TextInput style={styles.input} value={descricao} onChangeText={setDescricao} placeholder="Descrição" />
      <TextInput style={styles.input} value={empresa} onChangeText={setEmpresa} placeholder="Empresa" />
      <TextInput style={styles.input} value={cidade} onChangeText={setCidade} placeholder="Cidade" />
      <TextInput style={styles.input} value={estado} onChangeText={setEstado} placeholder="Estado" />
      <TextInput style={styles.input} value={latitude} onChangeText={setLatitude} placeholder="Latitude" keyboardType="numeric" />
      <TextInput style={styles.input} value={longitude} onChangeText={setLongitude} placeholder="Longitude" keyboardType="numeric" />
      <Button title="Salvar Alterações" onPress={salvarAlteracoes} color="#6C63FF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: '#6C63FF' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
});
