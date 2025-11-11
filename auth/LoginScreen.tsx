
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  Linking,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UsernameInput } from '../app/components/verificatios/UsernameInput'; // Importar o novo componente

interface LoginScreenProps {
  username: string;
  email: string;
  password: string;
  setUsername: (value: string) => void;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  onRegister: () => void;
  onLogin: () => void;
  onForgotPassword: () => void;
  isLoading?: boolean;
}

const { width, height } = Dimensions.get('window');

export const LoginScreen: React.FC<LoginScreenProps> = ({
  username,
  email,
  password,
  setUsername,
  setEmail,
  setPassword,
  onRegister,
  onLogin,
  onForgotPassword,
  isLoading = false,
}) => {
  const insets = useSafeAreaInsets();
  const [isRegistering, setIsRegistering] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isUsernameValid, setIsUsernameValid] = useState(false); 

  const handleTermsPress = () => {
    const termsUrl = 'https://fapzero-termos-e-privacidade.netlify.app/';
    Linking.openURL(termsUrl).catch(err => 
      Alert.alert('Erro', 'Não foi possível abrir o link dos termos de uso.')
    );
  };

  const handleRegister = () => {
    if (!acceptedTerms) {
      Alert.alert('Termos de Uso', 'Você deve aceitar os Termos de Uso para criar uma conta.');
      return;
    }
    
    if (!isUsernameValid) {
      Alert.alert('Username inválido', 'Por favor, escolha um nome de usuário válido e disponível.');
      return;
    }
    
    console.log('Chamando onRegister');
    onRegister();
  };

  const handleLogin = () => {
    console.log('Chamando onLogin');
    onLogin();
  };

  const handleForgotPasswordPress = () => {
    console.log('Botão esqueceu senha clicado no LoginScreen');
    onForgotPassword();
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setAcceptedTerms(false);
    setIsUsernameValid(false); 
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const isRegisterButtonEnabled = () => {
    return acceptedTerms && isUsernameValid && !isLoading;
  };

  return (
    <LinearGradient colors={['#000000', '#000000', '#000000']} style={styles.container}>
      <View style={[styles.loginContainer, { paddingTop: insets.top }]}>
        <Text style={styles.loginTitle}>
          {isRegistering ? 'Criar Conta' : 'Entrar no Chat Global'}
        </Text>
        <Text style={styles.loginSubtitle}>
          {isRegistering ? 'Crie sua conta para começar' : 'Acesse sua conta'}
        </Text>

        {isRegistering && (
          <UsernameInput
            value={username}
            onChangeText={setUsername}
            isLoading={isLoading}
            onValidationChange={setIsUsernameValid}
          />
        )}

        <TextInput
          style={styles.input}
          placeholder="E-mail"
          placeholderTextColor="#ffffff"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!isLoading}
        />
        
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Senha"
            placeholderTextColor="#ffffff"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            editable={!isLoading}
          />
          <TouchableOpacity 
            style={styles.passwordToggle} 
            onPress={togglePasswordVisibility}
            activeOpacity={0.7}
            disabled={isLoading}
          >
            <Text style={styles.passwordToggleIcon}>
              {showPassword ? '👁️' : '🙈'}
            </Text>
          </TouchableOpacity>
        </View>

       
        {!isRegistering && (
          <TouchableOpacity 
            style={styles.forgotPasswordContainer} 
            onPress={handleForgotPasswordPress}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            {/* <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text> */}
          </TouchableOpacity>
        )}

        {isRegistering && (
          <TouchableOpacity 
            style={styles.termsContainer} 
            onPress={() => setAcceptedTerms(!acceptedTerms)}
            activeOpacity={0.7}
            disabled={isLoading}
          >
            <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
              {acceptedTerms && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.termsText}>
              Eu aceito os{' '}
              <Text style={styles.termsLink} onPress={handleTermsPress}>
                Termos de Uso e Privacidade
              </Text>
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={[
            styles.primaryButton,
            (isRegistering && !isRegisterButtonEnabled()) && styles.disabledButton,
            (!isRegistering && isLoading) && styles.disabledButton
          ]} 
          onPress={isRegistering ? handleRegister : handleLogin}
          disabled={isRegistering ? !isRegisterButtonEnabled() : isLoading}
          activeOpacity={0.7}
        >
          <Text style={styles.primaryButtonText}>
            {isLoading 
              ? (isRegistering ? 'Criando...' : 'Entrando...') 
              : (isRegistering ? 'Criar Conta' : 'Entrar')
            }
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.toggleButton} 
          onPress={toggleMode}
          disabled={isLoading}
          activeOpacity={0.7}
        >
          <Text style={styles.toggleButtonText}>
            {isRegistering 
              ? 'Já tem uma conta? Entrar' 
              : 'Não tem conta? Criar agora'
            }
          </Text>
        </TouchableOpacity>

        <Text style={styles.loginNote}>
          {isRegistering ? (
            <>
              • Nome de usuário: 3-20 caracteres únicos{'\n'}
              • E-mail necessário{'\n'}
              • Senha com mínimo de 6 caracteres{'\n'}
              • Aceite os Termos de Uso para continuar
            </>
          ) : (
            <>
              • Use seu e-mail e senha para entrar{'\n'}
              • Não é Possível Recuperar Senha Por Enquanto{'\n'}
            </>
          )}
        </Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: width * 0.05,
  },
  loginTitle: {
    fontSize: width * 0.08,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: height * 0.02,
  },
  loginSubtitle: {
    fontSize: width * 0.04,
    fontFamily: 'Inter-Regular',
    color: '#fff',
    textAlign: 'center',
    marginBottom: height * 0.05,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: width * 0.04,
    fontSize: width * 0.04,
    fontFamily: 'Inter-Regular',
    color: '#ffffff',
    marginBottom: height * 0.03,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: height * 0.02,
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
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: height * 0.03,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  forgotPasswordText: {
    fontSize: width * 0.035,
    fontFamily: 'Inter-Medium',
    color: '#fff',
    textDecorationLine: 'underline',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.03,
    paddingHorizontal: width * 0.02,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#ffffff',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: '#52f805ff',
    borderColor: '#fff',
  },
  checkmark: {
    color: '#000000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  termsText: {
    fontSize: width * 0.035,
    fontFamily: 'Inter-Regular',
    color: '#ffffff',
    flex: 1,
  },
  termsLink: {
    color: '#fff',
    textDecorationLine: 'underline',
    fontFamily: 'Inter-SemiBold',
  },
  primaryButton: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: width * 0.04,
    alignItems: 'center',
    marginBottom: height * 0.02,
  },
  disabledButton: {
    backgroundColor: '#1e293bc0',
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: width * 0.045,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  toggleButton: {
    padding: width * 0.02,
    alignItems: 'center',
    marginBottom: height * 0.03,
  },
  toggleButtonText: {
    fontSize: width * 0.04,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
    textDecorationLine: 'underline',
  },
  loginNote: {
    fontSize: width * 0.035,
    fontFamily: 'Inter-Regular',
    color: '#fff',
    textAlign: 'center',
    lineHeight: width * 0.05,
  },
});