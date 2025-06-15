import { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, StyleSheet, TextInput, Button
} from 'react-native';
import { useRouter } from 'expo-router';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const accessibilityTypes = ['visual', 'auditiva', 'fisica', 'intelectual', 'multipla', 'outra'];

export default function Vagas() {
  const [vagas, setVagas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterAcc, setFilterAcc] = useState<string[]>([]);
  const [filterState, setFilterState] = useState('');
  const router = useRouter();

  const fetchVagas = async (accessFilter: string[] = [], stateFilter = '') => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const params: any = {};
      if (accessFilter.length) params.accessibilitySupport = accessFilter.join(',');
      if (stateFilter) params.state = stateFilter;

      const endpoint =
        accessFilter.length || stateFilter
          ? '/jobs/filter/accessibility'
          : '/jobs';

      const res = await api.get(endpoint, { headers, params });
      setVagas(res.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setVagas([]);
      } else {
        console.error('Erro ao buscar vagas:', err.response?.data || err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVagas();
  }, []);

  const toggleAccess = (tipo: string) => {
    const updated = filterAcc.includes(tipo)
      ? filterAcc.filter(t => t !== tipo)
      : [...filterAcc, tipo];
    setFilterAcc(updated);
    fetchVagas(updated, filterState);
  };

  const applyStateFilter = () => {
    fetchVagas(filterAcc, filterState.trim());
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.filterContainer}>
        <Text style={styles.filterTitle}>Filtrar por acessibilidade:</Text>
        <View style={styles.filterRow}>
          {accessibilityTypes.map(tipo => (
            <TouchableOpacity
              key={tipo}
              style={[
                styles.filterBtn,
                filterAcc.includes(tipo) && styles.filterBtnSelected
              ]}
              onPress={() => toggleAccess(tipo)}
            >
              <Text style={[
                styles.filterBtnText,
                filterAcc.includes(tipo) && styles.filterBtnTextSelected
              ]}>{tipo}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.filterTitle, { marginTop: 10 }]}>Filtrar por estado (UF):</Text>
        <View style={styles.stateFilterRow}>
          <TextInput
            placeholder="Ex: SP"
            value={filterState}
            onChangeText={setFilterState}
            style={styles.stateInput}
            autoCapitalize="characters"
            maxLength={2}
          />
          <Button title="Aplicar" onPress={applyStateFilter} color="#6C63FF" />
        </View>
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text style={{ marginTop: 10 }}>Carregando vagas...</Text>
        </View>
      ) : (
        <FlatList
          data={vagas}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                router.push({ pathname: '/detalhes', params: { id: item._id } })
              }
            >
              <Text style={styles.titulo}>{item.title}</Text>
              <Text style={styles.descricao}>{item.description}</Text>
              <Text style={styles.local}>
                {item.location.city}, {item.location.state}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center' }}>Nenhuma vaga disponível</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  filterContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: '#f9f9f9'
  },
  filterTitle: { fontWeight: 'bold', marginBottom: 5, color: '#333' },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  filterBtn: {
    backgroundColor: '#ccc',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    margin: 4,
  },
  filterBtnSelected: { backgroundColor: '#6C63FF' },
  filterBtnText: { color: '#333', fontSize: 14 },
  filterBtnTextSelected: { color: '#fff' },
  stateFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  stateInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
    backgroundColor: '#fff'
  },
  card: {
    backgroundColor: '#F2F2F2',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  titulo: { fontSize: 18, fontWeight: 'bold', color: '#6C63FF' },
  descricao: { color: '#333', marginVertical: 5 },
  local: { fontStyle: 'italic', color: '#666' },
});
