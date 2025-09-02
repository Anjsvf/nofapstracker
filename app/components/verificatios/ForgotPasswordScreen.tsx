
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ForgotPasswordScreenProps {
  onSubmit: (email: string) => void;
  onBackToLogin: () => void;
  isLoading?: boolean;
}

const { width, height } = Dimensions.get('window');

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  onSubmit,
  onBackToLogin,
  isLoading = false,
}) => {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');

  const handleSubmit = () => {
    if (!email.trim()) {
      Alert.alert('Erro', 'Por favor, digite seu e-mail');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Erro', 'Por favor, digite um e-mail válido');
      return;
    }

    onSubmit(email.toLowerCase().trim());
  };

  return (
    <LinearGradient colors={['#000000', '#000000', '#000000']} style={styles.container}>
      <View style={[styles.forgotContainer, { paddingTop: insets.top }]}>
        <Text style={styles.title}>Esqueceu a Senha?</Text>
        <Text style={styles.subtitle}>
          Digite seu e-mail e enviaremos um código para redefinir sua senha
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Digite seu e-mail"
          placeholderTextColor="#fff"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />

        <TouchableOpacity 
          style={[
            styles.submitButton,
            !email.trim() && styles.disabledButton
          ]} 
          onPress={handleSubmit}
          disabled={!email.trim() || isLoading}
        >
          <Text style={styles.submitButtonText}>
            {isLoading ? 'Enviando...' : 'Enviar Código'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={onBackToLogin}>
          <Text style={styles.backButtonText}>← Voltar para o login</Text>
        </TouchableOpacity>

        <Text style={styles.note}>
          • Verifique sua caixa de entrada e spam{'\n'}
          • O código expira em 10 minutos{'\n'}
          • Se não receber, tente reenviar o código
        </Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  forgotContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: width * 0.05,
  },
  title: {
    fontSize: width * 0.08,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: height * 0.02,
  },
  subtitle: {
    fontSize: width * 0.04,
    fontFamily: 'Inter-Regular',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: height * 0.05,
    lineHeight: width * 0.055,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: width * 0.04,
    fontSize: width * 0.04,
    fontFamily: 'Inter-Regular',
    color: '#ffffff',
    marginBottom: height * 0.04,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  submitButton: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: width * 0.04,
    alignItems: 'center',
    marginBottom: height * 0.03,
  },
  disabledButton: {
    backgroundColor: '#1e293b',
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: width * 0.045,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  backButton: {
    alignItems: 'center',
    padding: width * 0.02,
    marginBottom: height * 0.03,
  },
  backButtonText: {
    fontSize: width * 0.04,
    fontFamily: 'Inter-Medium',
    color: '#fff',
    textDecorationLine: 'underline',
  },
  note: {
    fontSize: width * 0.032,
    fontFamily: 'Inter-Regular',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: width * 0.045,
    opacity: 0.8,
  },
});

