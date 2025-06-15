import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Button, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PainelRecrutador() {
  const [vagas, setVagas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const carregarVagas = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await api.get('/jobs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVagas(res.data);
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível carregar as vagas.');
    } finally {
      setLoading(false);
    }
  };

  const excluirVaga = async (id: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await api.delete(`/jobs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      carregarVagas();
    } catch (err) {
      Alert.alert('Erro', 'Erro ao excluir vaga.');
    }
  };

  useEffect(() => {
    carregarVagas();
  }, []);

  if (loading) return <Text style={{ textAlign: 'center', marginTop: 50 }}>Carregando...</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Painel do Recrutador</Text>

      <TouchableOpacity onPress={() => router.push('/criarvaga')} style={styles.botaoCriar}>
        <Text style={styles.textoBotao}>+ Criar Nova Vaga</Text>
      </TouchableOpacity>

      <FlatList
        data={vagas}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.titulo}>{item.title}</Text>
            <Text>{item.description}</Text>
            {item.createdBy && (
              <Text style={styles.criadaPor}>
                Criada por: {item.createdBy.name || item.createdBy.email}
              </Text>
            )}
            <View style={styles.botoes}>
              <Button
                title="Editar"
                onPress={() => router.push(`/editarVaga/${item._id}`)} // <- rota dinâmica
              />
              <Button title="Excluir" color="red" onPress={() => excluirVaga(item._id)} />
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>Nenhuma vaga cadastrada.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, color: '#6C63FF', fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  botaoCriar: { backgroundColor: '#6C63FF', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
  textoBotao: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  card: { backgroundColor: '#F5F5F5', padding: 15, marginBottom: 15, borderRadius: 10 },
  titulo: { fontSize: 18, fontWeight: 'bold', color: '#6C63FF', marginBottom: 5 },
  criadaPor: { fontSize: 12, color: '#777', marginTop: 4 },
  botoes: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
});
