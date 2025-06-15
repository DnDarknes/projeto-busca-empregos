import { useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import api from '../services/api';

export default function Register() {
  const [name, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setSenha] = useState('');
  const [role, setRole] = useState('usuario'); 

  const cadastrar = async () => {
    try {
      await api.post('/auth/register', { name, email, password, role }); 
    } catch (err: any) {
      console.log(err.response?.data || err.message);
      Alert.alert('Erro no cadastro');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Nome:</Text>
      <TextInput value={name} onChangeText={setNome} style={{ borderBottomWidth: 1 }} />

      <Text>Email:</Text>
      <TextInput value={email} onChangeText={setEmail} style={{ borderBottomWidth: 1 }} />

      <Text>Senha:</Text>
      <TextInput value={password} onChangeText={setSenha} secureTextEntry style={{ borderBottomWidth: 1 }} />

      <Text>Tipo de Usuário:</Text>
      <Picker selectedValue={role} onValueChange={setRole}>
        <Picker.Item label="Candidato" value="usuario" />
        <Picker.Item label="Recrutador" value="recrutador" />
      </Picker>

      <Button title="Cadastrar" onPress={cadastrar} />
    </View>
  );
}
