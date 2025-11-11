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

     
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('username', response.data.username);
      setUsername(response.data.username);
      setIsLoggedIn(true);

      Alert.alert('Sucesso', 'Usuário registrado com sucesso!');
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

      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('username', response.data.username);
      setUsername(response.data.username);
      setIsLoggedIn(true);

      return { success: true };
    } catch (error: any) {
      setIsLoading(false);
      const message = error.response?.data?.message || 'Falha ao fazer login';
      Alert.alert('Erro', message);
      return { success: false };
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
  };
};