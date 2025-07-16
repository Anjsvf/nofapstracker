import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Mic, MicOff, Send, Users } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Message {
  id: string;
  username: string;
  text: string;
  timestamp: Date;
  type: 'text' | 'voice';
  isOwn: boolean;
}

interface User {
  username: string;
  online: boolean;
}

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadUsername();
    // In a real app, you would connect to a socket.io server here
    generateMockMessages();
  }, []);

  const loadUsername = async () => {
    try {
      const saved = await AsyncStorage.getItem('username');
      if (saved) {
        setUsername(saved);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('Error loading username:', error);
    }
  };

  const saveUsername = async (name: string) => {
    try {
      await AsyncStorage.setItem('username', name);
    } catch (error) {
      console.error('Error saving username:', error);
    }
  };

  const generateMockMessages = () => {
    const mockMessages: Message[] = [
      {
        id: '1',
        username: 'AlphaWarrior',
        text: 'Acabei de completar 30 dias! 💪',
        timestamp: new Date(Date.now() - 3600000),
        type: 'text',
        isOwn: false,
      },
      {
        id: '2',
        username: 'SigmaGrinder',
        text: 'Parabéns mano! Continua assim 🔥',
        timestamp: new Date(Date.now() - 3000000),
        type: 'text',
        isOwn: false,
      },
      {
        id: '3', 
        username: 'FenixRising',
        text: 'Alguém tem dicas para quando bate a vontade?',
        timestamp: new Date(Date.now() - 1800000),
        type: 'text',
        isOwn: false,
      },
    ];

    const mockUsers: User[] = [
      { username: 'AlphaWarrior', online: true },
      { username: 'SigmaGrinder', online: true },
      { username: 'FenixRising', online: true },
      { username: 'ChadMaster', online: false },
      { username: 'TitanForce', online: true },
    ];

    setMessages(mockMessages);
    setOnlineUsers(mockUsers);
  };

  const handleLogin = () => {
    if (username.trim().length < 3) {
      Alert.alert('Erro', 'O nome de usuário deve ter pelo menos 3 caracteres');
      return;
    }

    if (username.trim().length > 20) {
      Alert.alert('Erro', 'O nome de usuário deve ter no máximo 20 caracteres');
      return;
    }

    // Check if username is already taken (mock check)
    const isUsernameTaken = onlineUsers.some(user => 
      user.username.toLowerCase() === username.toLowerCase()
    );

    if (isUsernameTaken) {
      Alert.alert('Erro', 'Este nome de usuário já está em uso');
      return;
    }

    saveUsername(username);
    setIsLoggedIn(true);
  };

  const sendMessage = () => {
    if (inputText.trim() === '') return;

    const newMessage: Message = {
      id: Date.now().toString(),
      username,
      text: inputText.trim(),
      timestamp: new Date(),
      type: 'text',
      isOwn: true,
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    
    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const copyMessage = (text: string) => {
    // In a real app, you would use Clipboard API
    Alert.alert('Copiado', 'Mensagem copiada para a área de transferência');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // In a real app, you would handle voice recording here
    if (!isRecording) {
      Alert.alert('Gravação', 'Gravação de voz iniciada (funcionalidade mock)');
    } else {
      Alert.alert('Gravação', 'Gravação de voz finalizada (funcionalidade mock)');
    }
  };

  if (!isLoggedIn) {
    return (
      <LinearGradient colors={['#3d2050', '#2a1c3a', '#1a0f2e']} style={[styles.container, { paddingTop: insets.top + 20 }]}>
        <View style={styles.loginContainer}>
          <Text style={styles.loginTitle}>Entrar no Chat Global</Text>
          <Text style={styles.loginSubtitle}>
            Escolha um nome de usuário único para participar
          </Text>
          
          <TextInput
            style={styles.usernameInput}
            placeholder="Nome de usuário"
            placeholderTextColor="#a78bfa"
            value={username}
            onChangeText={setUsername}
            maxLength={20}
            autoCapitalize="none"
          />
          
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Entrar</Text>
          </TouchableOpacity>
          
          <Text style={styles.loginNote}>
            • Mínimo 3 caracteres{'\n'}
            • Máximo 20 caracteres{'\n'}
            • Sem espaços ou caracteres especiais
          </Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#3d2050', '#2a1c3a', '#1a0f2e']} style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Chat Global</Text>
        <View style={styles.onlineContainer}>
          <Users size={16} color="#10b981" />
          <Text style={styles.onlineText}>
            {onlineUsers.filter(u => u.online).length} online
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <TouchableOpacity
              key={message.id}
              style={[
                styles.messageContainer,
                message.isOwn && styles.ownMessageContainer
              ]}
              onLongPress={() => copyMessage(message.text)}
            >
              <View style={[
                styles.messageBubble,
                message.isOwn && styles.ownMessageBubble
              ]}>
                {!message.isOwn && (
                  <Text style={styles.messageUsername}>
                    {message.username}
                  </Text>
                )}
                <Text style={[
                  styles.messageText,
                  message.isOwn && styles.ownMessageText
                ]}>
                  {message.text}
                </Text>
                <Text style={[
                  styles.messageTime,
                  message.isOwn && styles.ownMessageTime
                ]}>
                  {formatTime(message.timestamp)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.messageInput}
            placeholder="Digite sua mensagem..."
            placeholderTextColor="#a78bfa"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          
          <TouchableOpacity 
            style={[styles.voiceButton, isRecording && styles.voiceButtonActive]}
            onPress={toggleRecording}
          >
            {isRecording ? (
              <MicOff size={20} color="#ffffff" />
            ) : (
              <Mic size={20} color="#ffffff" />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Send size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
        <View style={{ height: insets.bottom + 80 }} />
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  onlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#10b981',
    marginLeft: 4,
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  loginTitle: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
  },
  loginSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#a78bfa',
    textAlign: 'center',
    marginBottom: 40,
  },
  usernameInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#ffffff',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  loginButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  loginButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  loginNote: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#a78bfa',
    textAlign: 'center',
    lineHeight: 20,
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  messagesContainer: {
    flex: 1,
    marginBottom: 20,
  },
  messageContainer: {
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  ownMessageContainer: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 12,
    maxWidth: '80%',
  },
  ownMessageBubble: {
    backgroundColor: '#8b5cf6',
  },
  messageUsername: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#a78bfa',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#ffffff',
    marginBottom: 4,
  },
  ownMessageText: {
    color: '#ffffff',
  },
  messageTime: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#a78bfa',
  },
  ownMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 8,
    marginBottom: 20,
  },
  messageInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxHeight: 100,
  },
  voiceButton: {
    backgroundColor: '#f59e0b',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  voiceButtonActive: {
    backgroundColor: '#ef4444',
  },
  sendButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});