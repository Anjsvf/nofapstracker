
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
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

interface EmailVerificationScreenProps {
  email: string;
  onVerificationSuccess: (code: string) => void; 
  onResendCode: () => void;
  onBackToLogin: () => void;
  isLoading?: boolean;
}

const { width, height } = Dimensions.get('window');

export const EmailVerificationScreen: React.FC<EmailVerificationScreenProps> = ({
  email,
  onVerificationSuccess,
  onResendCode,
  onBackToLogin,
  isLoading = false,
}) => {
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleVerify = () => {
    if (code.length !== 6) {
      Alert.alert('Erro', 'O código deve ter 6 dígitos');
      return;
    }
    onVerificationSuccess(code); // ATUALIZADO: passa o código
  };

  const handleResendCode = () => {
    setCountdown(60);
    onResendCode();
  };

  const formatCode = (text: string) => {
    const numbers = text.replace(/[^0-9]/g, '').slice(0, 6);
    setCode(numbers);
  };

  return (
    <LinearGradient colors={['#000000', '#000000', '#000000']} style={styles.container}>
      <View style={[styles.verificationContainer, { paddingTop: insets.top }]}>
        <Text style={styles.title}>Verificação de E-mail</Text>
        <Text style={styles.subtitle}>
          Enviamos um código de 6 dígitos para:
        </Text>
        <Text style={styles.email}>{email}</Text>

        <View style={styles.codeContainer}>
          <TextInput
            style={styles.codeInput}
            placeholder="000000"
            placeholderTextColor="#fff"
            value={code}
            onChangeText={formatCode}
            keyboardType="numeric"
            maxLength={6}
            textAlign="center"
            fontSize={24}
            letterSpacing={8}
            editable={!isLoading}
          />
        </View>

        <TouchableOpacity 
          style={[
            styles.verifyButton,
            (code.length !== 6 || isLoading) && styles.disabledButton
          ]} 
          onPress={handleVerify}
          disabled={code.length !== 6 || isLoading}
        >
          <Text style={styles.verifyButtonText}>
            {isLoading ? 'Verificando...' : 'Verificar Código'}
          </Text>
        </TouchableOpacity>

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Não recebeu o código?</Text>
          <TouchableOpacity 
            style={[
              styles.resendButton,
              (countdown > 0 || isLoading) && styles.disabledButton
            ]}
            onPress={handleResendCode}
            disabled={countdown > 0 || isLoading}
          >
            <Text style={styles.resendButtonText}>
              {countdown > 0 ? `Reenviar em ${countdown}s` : 'Reenviar código'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.backButton} 
          onPress={onBackToLogin}
          disabled={isLoading}
        >
          <Text style={styles.backButtonText}>← Voltar para o login</Text>
        </TouchableOpacity>

        <Text style={styles.note}>
          • O código expira em 10 minutos{'\n'}
          • Verifique sua caixa de spam se não encontrar o e-mail{'\n'}
          • Digite apenas os 6 dígitos recebidos
        </Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  verificationContainer: {
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
    color: '#fff',
    textAlign: 'center',
    marginBottom: height * 0.01,
  },
  email: {
    fontSize: width * 0.045,
    fontFamily: 'Inter-SemiBold',
    color: '#8b5cf6',
    textAlign: 'center',
    marginBottom: height * 0.05,
  },
  codeContainer: {
    alignItems: 'center',
    marginBottom: height * 0.04,
  },
  codeInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: width * 0.04,
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    borderWidth: 2,
    borderColor: '#1e293b',
    width: width * 0.7,
    textAlign: 'center',
    letterSpacing: 8,
  },
  verifyButton: {
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
  verifyButtonText: {
    fontSize: width * 0.045,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: height * 0.03,
  },
  resendText: {
    fontSize: width * 0.035,
    fontFamily: 'Inter-Regular',
    color: '#ffffff',
    marginBottom: 8,
  },
  resendButton: {
    padding: 8,
  },
  resendButtonText: {
    fontSize: width * 0.04,
    fontFamily: 'Inter-Medium',
    color: '#fff',
    textDecorationLine: 'underline',
  },
  backButton: {
    alignItems: 'center',
    padding: width * 0.02,
    marginBottom: height * 0.03,
  },
  backButtonText: {
    fontSize: width * 0.04,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
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

