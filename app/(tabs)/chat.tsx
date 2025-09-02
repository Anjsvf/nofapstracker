import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Componentes da UI do Chat
import { ChatHeader } from '../components/ChatHeader';
import { MessageInput } from '../components/MessageInput';
import { MessagesList } from '../components/MessagesList';
import { OfflineStatus } from '../components/OfflineStatus';
import { RecordingUI } from '../components/RecordingUI';

// Componentes do fluxo de Autenticação
import { LoginScreen } from '../../auth/LoginScreen';
import { EmailVerificationScreen } from '../components/verificatios/EmailVerificationScreen';
import { ForgotPasswordScreen } from '../components/verificatios/ForgotPasswordScreen';
import { ResetPasswordScreen } from '../components/verificatios/ResetPass';

// Hooks customizados
import { useAuth } from '../../hooks/useAuth';
import { useOfflineAudio } from '../../hooks/useOfflineAudio';
import { useOfflineChat } from '../../hooks/useOfflineChat';


import { LoadingScreen } from '../../components/loading/LoadingScreen';

const { width } = Dimensions.get('window');


type AuthMode = 'login' | 'verifyEmail' | 'forgotPassword' | 'resetPassword';

export default function ChatScreen() {
  const [keyboardHeight] = useState(new Animated.Value(0));
  const [isRefreshing, setIsRefreshing] = useState(false);

  
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [authEmail, setAuthEmail] = useState(''); 

 
  const {
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
  } = useAuth();

  
  const {
    messages,
    inputText,
    setInputText,
    replyingTo,
    setReplyingTo,
    onlineUsers,
    isSyncing,
    isInitialized,
    sendMessage,
    sendVoiceMessage,
    addReaction,
    forceSync,
    refreshMessages,
    isOnline,
  } = useOfflineChat(username);

  
  const {
    isRecording,
    showRecordingUI,
    recordingDuration,
    playingId,
    audioPosition,
    audioDuration,
    startRecording,
    stopRecording,
    cancelRecording,
    playAudio,
    pauseAudio,
    stopAudio,
    cleanup,
  } = useOfflineAudio({
    replyingTo,
    onSendVoiceMessage: sendVoiceMessage,
  });

  const scrollViewRef = useRef<ScrollView>(null);
  const pendingMessagesCount = messages.filter(m => m.isPending).length;

  
  const onRegisterPress = async () => {
    const result = await handleRegister();
    if (result.success && result.needsVerification) {
      setAuthEmail(result.email!);
      setAuthMode('verifyEmail');
    }
  };

  const onLoginPress = async () => {
    const result = await handleLogin();
    if (!result.success && result.needsVerification) {
      setAuthEmail(result.email!);
      setAuthMode('verifyEmail');
      if (result.message) {
        Alert.alert('Verificação Necessária', result.message);
      }
    }
  };

  const onVerifyEmailPress = async (code: string) => {
    await verifyEmail(code, authEmail);
    
  };

  const onForgotPasswordPress = async (email: string) => {
    const success = await forgotPassword(email);
    if (success) {
      setAuthEmail(email);
      setAuthMode('resetPassword');
    }
  };

  const onResetPasswordPress = async (code: string, newPass: string) => {
    const success = await resetPassword(authEmail, code, newPass);
    if (success) {
      setAuthMode('login'); 
    }
  };

  const onResendCodePress = async (type: 'email_verification' | 'password_reset') => {
    await resendVerificationCode(authEmail, type);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshMessages();
    } catch (error) {
      console.error('Erro no refresh:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();

    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      event => {
        Animated.timing(keyboardHeight, {
          duration: Platform.OS === 'ios' ? event.duration : 250,
          toValue: event.endCoordinates.height,
          useNativeDriver: false,
        }).start();
      },
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        Animated.timing(keyboardHeight, {
          duration: Platform.OS === 'ios' ? 250 : 250,
          toValue: 0,
          useNativeDriver: false,
        }).start();
      },
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
      cleanup();
    };
  }, []);

  const handleLogoutWithCleanup = async () => {
    const success = await handleLogout();
    if (success) {
      cleanup();
      setAuthMode('login'); 
    }
  };

  
  if (!isLoggedIn) {
    switch (authMode) {
      case 'verifyEmail':
        return (
          <EmailVerificationScreen
            email={authEmail}
            onVerificationSuccess={onVerifyEmailPress}
            onResendCode={() => onResendCodePress('email_verification')}
            onBackToLogin={() => setAuthMode('login')}
            isLoading={isLoading}
          />
        );
      case 'forgotPassword':
        return (
          <ForgotPasswordScreen
            onSubmit={onForgotPasswordPress}
            onBackToLogin={() => setAuthMode('login')}
            isLoading={isLoading}
          />
        );
      case 'resetPassword':
        return (
          <ResetPasswordScreen
            email={authEmail}
            onResetPassword={onResetPasswordPress}
            onResendCode={() => onResendCodePress('password_reset')}
            onBackToLogin={() => setAuthMode('login')}
            isLoading={isLoading}
          />
        );
      case 'login':
      default:
        return (
          <LoginScreen
            username={username}
            email={email}
            password={password}
            setUsername={setUsername}
            setEmail={setEmail}
            setPassword={setPassword}
            onRegister={onRegisterPress}
            onLogin={onLoginPress}
            onForgotPassword={() => setAuthMode('forgotPassword')}
            isLoading={isLoading}
          />
        );
    }
  }

  
  if (!isInitialized) {
    return (
      <LinearGradient colors={['#000000', '#000000', '#000000']} style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <LoadingScreen />
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  
  return (
    <LinearGradient colors={['#000000', '#000000', '#000000']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <OfflineStatus
          isOnline={isOnline}
          isSyncing={isSyncing}
          onSyncPress={forceSync}
          pendingMessagesCount={pendingMessagesCount}
        />

        <ChatHeader onlineUsers={onlineUsers} onLogout={handleLogoutWithCleanup} />

        <Animated.View style={[styles.chatContainer, { paddingBottom: keyboardHeight }]}>
          <View style={styles.messagesContainer}>
            <MessagesList
              messages={messages}
              onPlayAudio={playAudio}
              onPauseAudio={pauseAudio}
              onStopAudio={stopAudio}
              playingId={playingId}
              audioPosition={audioPosition}
              audioDuration={audioDuration}
              onAddReaction={addReaction}
              onReply={setReplyingTo}
              scrollViewRef={scrollViewRef}
              onRefresh={handleRefresh}
              isRefreshing={isRefreshing}
            />
          </View>

          <RecordingUI
            isVisible={showRecordingUI}
            duration={recordingDuration}
            onCancel={cancelRecording}
            onStop={stopRecording}
          />

          <View style={styles.inputContainer}>
            <MessageInput
              inputText={inputText}
              setInputText={setInputText}
              onSendMessage={sendMessage}
              onStartRecording={startRecording}
              onStopRecording={stopRecording}
              isRecording={isRecording}
              replyingTo={replyingTo}
              onCancelReply={() => setReplyingTo(null)}
            />
          </View>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: width * 0.05,
  },
  messagesContainer: {
    flex: 1,
  },
  inputContainer: {
    backgroundColor: 'transparent',
  },
});
