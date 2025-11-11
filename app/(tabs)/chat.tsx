
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChatHeader } from '../components/ChatHeader';
import { MessageInput } from '../components/MessageInput';
import { MessagesList } from '../components/MessagesList';
import { OfflineStatus } from '../components/OfflineStatus';
import { RecordingUI } from '../components/RecordingUI';

import { LoginScreen } from '../../auth/LoginScreen';

import { useAuth } from '../../hooks/useAuth';
import { useOfflineAudio } from '../../hooks/useOfflineAudio';
import { useOfflineChat } from '../../hooks/useOfflineChat';
import { useTimer } from '../../hooks/useTimer';

import { LoadingScreen } from '../../components/loading/LoadingScreen';
import { BadgeSyncService } from '../../services/badgeSyncService';

const { width } = Dimensions.get('window');

export default function ChatScreen() {
  const [keyboardHeight] = useState(new Animated.Value(0));
  const [isRefreshing, setIsRefreshing] = useState(false);

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
  } = useAuth();

  
  const { timerState } = useTimer();

  
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
  } = useOfflineChat(username, timerState.currentStreak); 

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
  const badgeSyncInitialized = useRef(false);

  const handleRefresh = async () => {
    console.log('🔄 Pull-to-refresh iniciado');
    setIsRefreshing(true);
    
    try {
      if (typeof refreshMessages === 'function') {
        await refreshMessages();
        console.log('✅ Pull-to-refresh concluído');
      } else {
        console.error('❌ refreshMessages não é uma função');
      }
    } catch (error: any) {
      console.error('❌ Erro no refresh:', error?.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  const onRegisterPress = async () => {
    await handleRegister();
  };

  const onLoginPress = async () => {
    await handleLogin();
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
      BadgeSyncService.stopPeriodicSync();
    };
  }, []);

 
  useEffect(() => {
    if (isInitialized && isLoggedIn && isOnline) {
      const currentStreak = timerState.currentStreak || 0;
      
      if (!badgeSyncInitialized.current) {

        badgeSyncInitialized.current = true;
        
        BadgeSyncService.syncBadgeOnConnect(currentStreak);
        BadgeSyncService.startPeriodicSync(() => timerState.currentStreak || 0);
        
        console.log('💎 Badge sync inicializado com streak:', currentStreak);
      } else {
       
        BadgeSyncService.updateBadge(currentStreak);
        console.log('💎 Badge atualizada para streak:', currentStreak);
      }
    }
  }, [isInitialized, isLoggedIn, isOnline, timerState.currentStreak]);

  const handleLogoutWithCleanup = async () => {
    const success = await handleLogout();
    if (success) {
      cleanup();
      BadgeSyncService.stopPeriodicSync();
      badgeSyncInitialized.current = false;
    }
  };

  if (!isLoggedIn) {
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
        isLoading={isLoading}
      />
    );
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
              onlineUsers={onlineUsers}
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