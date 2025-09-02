
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useState } from 'react';
import { Alert } from 'react-native';
import { API_URL } from '../utils/api';

export const useAuth = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const savedUsername = await AsyncStorage.getItem('username');
      if (token && savedUsername) {
        setUsername(savedUsername);
        setIsLoggedIn(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error checking auth status:', error);
      return false;
    }
  };

  const handleRegister = async () => {
    if (username.trim().length < 3 || username.trim().length > 20) {
      Alert.alert('Erro', 'O nome de usuário deve ter entre 3 e 20 caracteres');
      return { success: false };
    }
    if (!/^[a-zA-Z0-9\u00C0-\u017F_]+$/.test(username)) {
      Alert.alert('Erro', 'O nome de usuário deve conter apenas letras, números e underscores');
      return { success: false };
    }
    if (!email || !password) {
      Alert.alert('Erro', 'E-mail e senha são obrigatórios');
      return { success: false };
    }
    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return { success: false };
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        username,
        email,
        password,
      });

      setIsLoading(false);

      if (response.data.needsVerification) {
        return {
          success: true,
          needsVerification: true,
          email: response.data.email,
        };
      }

     
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('username', response.data.username);
      setUsername(response.data.username);
      setIsLoggedIn(true);

      return { success: true };
    } catch (error: any) {
      setIsLoading(false);
      Alert.alert('Erro', error.response?.data?.message || 'Falha ao registrar');
      return { success: false };
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'E-mail e senha são obrigatórios');
      return { success: false };
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      });

      setIsLoading(false);

      if (response.data.needsVerification) {
        return {
          success: false,
          needsVerification: true,
          email: response.data.email,
        };
      }

      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('username', response.data.username);
      setUsername(response.data.username);
      setIsLoggedIn(true);

      return { success: true };
    } catch (error: any) {
      setIsLoading(false);
      const message = error.response?.data?.message || 'Falha ao fazer login';
      if (error.response?.data?.needsVerification) {
        return {
          success: false,
          needsVerification: true,
          email: error.response.data.email,
          message,
        };
      }
      Alert.alert('Erro', message);
      return { success: false };
    }
  };

  const verifyEmail = async (verificationCode: string, userEmail: string) => {
    if (!verificationCode || verificationCode.length !== 6) {
      Alert.alert('Erro', 'Código de verificação inválido');
      return false;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/auth/verify-email`, {
        email: userEmail,
        code: verificationCode,
      });

      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('username', response.data.username);
      setUsername(response.data.username);
      setIsLoggedIn(true);
      setIsLoading(false);

      Alert.alert('Sucesso', 'E-mail verificado com sucesso!');
      return true;
    } catch (error: any) {
      setIsLoading(false);
      Alert.alert('Erro', error.response?.data?.message || 'Falha na verificação');
      return false;
    }
  };

  const resendVerificationCode = async (
    userEmail: string,
    type: 'email_verification' | 'password_reset' = 'email_verification'
  ) => {
    setIsLoading(true);
    try {
      await axios.post(`${API_URL}/api/auth/resend-code`, {
        email: userEmail,
        type,
      });
      setIsLoading(false);
      Alert.alert('Sucesso', 'Código reenviado com sucesso!');
      return true;
    } catch (error: any) {
      setIsLoading(false);
      Alert.alert('Erro', error.response?.data?.message || 'Falha ao reenviar código');
      return false;
    }
  };

  const forgotPassword = async (userEmail: string) => {
    if (!userEmail) {
      Alert.alert('Erro', 'E-mail é obrigatório');
      return false;
    }

    setIsLoading(true);
    try {
      await axios.post(`${API_URL}/api/auth/forgot-password`, {
        email: userEmail,
      });
      setIsLoading(false);
      Alert.alert('Sucesso', 'Se este e-mail existir, um código foi enviado.');
      return true;
    } catch (error: any) {
      setIsLoading(false);
      Alert.alert('Erro', error.response?.data?.message || 'Falha ao solicitar recuperação');
      return false;
    }
  };

  const resetPassword = async (userEmail: string, resetCode: string, newPassword: string) => {
    if (!resetCode || resetCode.length !== 6) {
      Alert.alert('Erro', 'Código de recuperação inválido');
      return false;
    }
    if (newPassword.length < 6) {
      Alert.alert('Erro', 'A nova senha deve ter pelo menos 6 caracteres');
      return false;
    }

    setIsLoading(true);
    try {
      await axios.post(`${API_URL}/api/auth/reset-password`, {
        email: userEmail,
        code: resetCode,
        newPassword,
      });
      setIsLoading(false);
      Alert.alert('Sucesso', 'Senha redefinida com sucesso!');
      return true;
    } catch (error: any) {
      setIsLoading(false);
      Alert.alert('Erro', error.response?.data?.message || 'Falha ao redefinir senha');
      return false;
    }
  };

  const handleLogout = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');
      if (token && userId) {
        await axios.post(
          `${API_URL}/api/auth/logout`,
          { userId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('username');
      await AsyncStorage.removeItem('userId');
      setIsLoggedIn(false);
      setUsername('');
      setEmail('');
      setPassword('');
      return true;
    } catch (error) {
      console.error('Error logging out:', error);
      return false;
    }
  };

  return {
    username,
    email,
    password,
    isLoggedIn,
    isLoading,
    setUsername,
    setEmail,
    setPassword,
    checkAuthStatus,
    handleRegister,
    handleLogin,
    handleLogout,
    verifyEmail,
    resendVerificationCode,
    forgotPassword,
    resetPassword,
  };
};