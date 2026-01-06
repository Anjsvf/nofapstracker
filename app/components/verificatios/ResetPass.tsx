
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

interface ResetPasswordScreenProps {
  email: string;
  onResetPassword: (code: string, newPassword: string) => void;
  onResendCode: () => void;
  onBackToLogin: () => void;
  isLoading?: boolean;
}

const { width, height } = Dimensions.get('window');

export const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({
  email,
  onResetPassword,
  onResendCode,
  onBackToLogin,
  isLoading = false,
}) => {
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleResetPassword = () => {
    if (code.length !== 6) {
      Alert.alert('Erro', 'O código deve ter 6 dígitos');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    onResetPassword(code, newPassword);
  };

  const handleResendCode = () => {
    setCountdown(60);
    onResendCode();
  };

  const formatCode = (text: string) => {
    const numbers = text.replace(/[^0-9]/g, '').slice(0, 6);
    setCode(numbers);
  };

  const canSubmit = code.length === 6 && newPassword.length >= 6 && newPassword === confirmPassword;

  return (
    <LinearGradient colors={['#000000', '#000000', '#000000']} style={styles.container}>
      <View style={[styles.resetContainer, { paddingTop: insets.top }]}>
        <Text style={styles.title}>Redefinir Senha</Text>
        <Text style={styles.subtitle}>
          Digite o código enviado para:
        </Text>
        <Text style={styles.email}>{email}</Text>

        <View style={styles.codeContainer}>
          <TextInput
            style={styles.codeInput}
            placeholder="000000"
            placeholderTextColor="#ffffff"
            value={code}
            onChangeText={formatCode}
            keyboardType="numeric"
            maxLength={6}
            textAlign="center"
            fontSize={20}
            letterSpacing={4}
          />
        </View>

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Nova senha"
            placeholderTextColor="#fff"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity 
            style={styles.passwordToggle} 
            onPress={() => setShowPassword(!showPassword)}
          >
            <Text style={styles.passwordToggleIcon}>
              {showPassword ? '👁️' : '🙈'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Confirmar nova senha"
            placeholderTextColor="#fff"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
          />
          <TouchableOpacity 
            style={styles.passwordToggle} 
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Text style={styles.passwordToggleIcon}>
              {showConfirmPassword ? '👁️' : '🙈'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[
            styles.resetButton,
            !canSubmit && styles.disabledButton
          ]} 
          onPress={handleResetPassword}
          disabled={!canSubmit || isLoading}
        >
          <Text style={styles.resetButtonText}>
            {isLoading ? 'Redefinindo...' : 'Redefinir Senha'}
          </Text>
        </TouchableOpacity>

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Não recebeu o código?</Text>
          <TouchableOpacity 
            style={[
              styles.resendButton,
              countdown > 0 && styles.disabledButton
            ]}
            onPress={handleResendCode}
            disabled={countdown > 0 || isLoading}
          >
            <Text style={styles.resendButtonText}>
              {countdown > 0 ? `Reenviar em ${countdown}s` : 'Reenviar código'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.backButton} onPress={onBackToLogin}>
          <Text style={styles.backButtonText}>← Voltar para o login</Text>
        </TouchableOpacity>

        <Text style={styles.note}>
          • O código expira em 10 minutos{'\n'}
          • A nova senha deve ter pelo menos 6 caracteres{'\n'}
          • Confirme a senha corretamente
        </Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  resetContainer: {
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
    marginBottom: height * 0.01,
  },
  email: {
    fontSize: width * 0.045,
    fontFamily: 'Inter-SemiBold',
    color: '#8b5cf6',
    textAlign: 'center',
    marginBottom: height * 0.04,
  },
  codeContainer: {
    alignItems: 'center',
    marginBottom: height * 0.03,
  },
  codeInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: width * 0.04,
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    borderWidth: 2,
    borderColor: '#1e293b',
    width: width * 0.6,
    textAlign: 'center',
    letterSpacing: 4,
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: height * 0.03,
  },
  passwordInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: width * 0.04,
    paddingRight: width * 0.12,
    fontSize: width * 0.04,
    fontFamily: 'Inter-Regular',
    color: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  passwordToggle: {
    position: 'absolute',
    right: width * 0.04,
    top: '50%',
    transform: [{ translateY: -12 }],
    padding: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
  },
  passwordToggleIcon: {
    fontSize: 16,
    textAlign: 'center',
  },
  resetButton: {
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
  resetButtonText: {
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

export default ResetPasswordScreen;