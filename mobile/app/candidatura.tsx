import * as DocumentPicker from 'expo-document-picker';
import { Button, View, Text, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import api from '../services/api';

export default function Candidatura() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const enviarCurriculo = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });

    if (result.assets && result.assets.length > 0) {
      const file = result.assets[0];

      const formData = new FormData();
      formData.append('curriculo', {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || 'application/pdf',
      } as any);

      try {
        await api.post(`/jobs/${id}/apply`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        Alert.alert('Sucesso', 'Candidatura enviada com sucesso!');
      } catch (error) {
        console.error('Erro ao enviar candidatura:', error);
        Alert.alert('Erro', 'Falha ao enviar candidatura.');
      }
    } else {
      Alert.alert('Aviso', 'Nenhum arquivo selecionado.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Anexe seu currículo para se candidatar:</Text>
      <Button title="Selecionar e Enviar Currículo" color="#6C63FF" onPress={enviarCurriculo} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  label: { fontSize: 16, marginBottom: 15 },
});
