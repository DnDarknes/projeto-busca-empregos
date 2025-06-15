import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Alert,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Linking,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

export default function Detalhes() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [vaga, setVaga] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await api.get(`/jobs/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setVaga(res.data);
      } catch {
        Alert.alert('Erro', 'Erro ao carregar vaga');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const enviarCurriculo = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
    });

    if (!result.assets || result.assets.length === 0) {
      Alert.alert('Envio cancelado');
      return;
    }

    const file = result.assets[0];

    const formData = new FormData();
    formData.append('resume', {
      uri: file.uri,
      name: file.name,
      type: file.mimeType || 'application/pdf',
    } as any);

    try {
      const token = await AsyncStorage.getItem('token');
      const res = await api.post(`/jobs/${id}/apply`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      Alert.alert(res.data.message || 'Currículo enviado com sucesso!');
    } catch (err: any) {
      console.error('Erro ao enviar currículo:', err);
      Alert.alert('Erro', err.response?.data?.message || 'Falha ao enviar currículo.');
    }
  };

  const abrirNoMaps = () => {
    const coords = vaga?.location?.coordinates;
    if (!Array.isArray(coords) || coords.length < 2) return;
    const [lng, lat] = coords;
    Linking.openURL(`https://www.google.com/maps?q=${lat},${lng}`);
  };

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 50 }} size="large" color="#6C63FF" />;
  }

  if (!vaga) {
    return <Text style={{ padding: 20 }}>Vaga não encontrada.</Text>;
  }

  const coords = vaga.location.coordinates;
  const [lng, lat] = coords;

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Image source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/0/00/Huawei.svg' }} style={styles.logo} />
          <Text style={styles.company}>{vaga.company || 'Empresa'}</Text>
          <Text style={styles.title}>{vaga.title}</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="location-sharp" size={16} color="#333" />
              <Text style={styles.infoText}>{vaga.location.city}</Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialIcons name="trending-up" size={16} color="#333" />
              <Text style={styles.infoText}>Em Alta</Text>
            </View>
            <View style={styles.infoItem}>
              <FontAwesome5 name="money-bill-wave" size={16} color="#333" />
              <Text style={styles.infoText}>Não Info.</Text>
            </View>
          </View>

          <Text style={styles.remote}>Remoto</Text>

          <MapView
            style={styles.map}
            initialRegion={{
              latitude: lat,
              longitude: lng,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker coordinate={{ latitude: lat, longitude: lng }} title={vaga.title} />
          </MapView>

          <Text style={styles.subheading}>Requisitos da vaga:</Text>
          <View style={styles.requirements}>
            {vaga.description.split('\n').map((item: string, index: number) => (
              <Text key={index} style={styles.bullet}>• {item.trim()}</Text>
            ))}
          </View>

          <TouchableOpacity onPress={enviarCurriculo} style={styles.button}>
            <Text style={styles.buttonText}>Candidatar-se</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#2e1f4d',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
  },
  logo: {
    height: 50,
    width: 80,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 10,
  },
  company: {
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 14,
    color: '#333',
  },
  title: {
    textAlign: 'center',
    fontSize: 18,
    color: '#4B0082',
    fontWeight: 'bold',
    marginVertical: 5,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  infoText: {
    fontSize: 12,
    color: '#444',
  },
  remote: {
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#555',
    marginBottom: 10,
  },
  map: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    marginBottom: 20,
  },
  subheading: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 5,
    color: '#444',
  },
  requirements: {
    backgroundColor: '#f3f3f3',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
  },
  bullet: {
    fontSize: 13,
    color: '#333',
    marginBottom: 4,
  },
  button: {
    backgroundColor: '#6C63FF',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  }, 
});
