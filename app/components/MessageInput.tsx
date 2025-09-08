import { Mic, Send, Square } from 'lucide-react-native';
import React from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Message } from '../../types';

interface MessageInputProps {
  inputText: string;
  setInputText: (text: string) => void;
  onSendMessage: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  isRecording: boolean;
  replyingTo: Message | null;
  onCancelReply: () => void;
}

const { width, height } = Dimensions.get('window');

export const MessageInput: React.FC<MessageInputProps> = ({
  inputText,
  setInputText,
  onSendMessage,
  onStartRecording,
  onStopRecording,
  isRecording,
  replyingTo,
  onCancelReply,
}) => {
  const insets = useSafeAreaInsets();

  const handleSendMessage = () => {
    if (inputText.trim() !== '' && !isRecording) {
      onSendMessage();
    }
  };

  const handleSubmitEditing = () => {
   
    if (inputText.trim() !== '' && !isRecording) {
      handleSendMessage();
    }
  };

  return (
    <View style={styles.container}>
      {replyingTo && (
        <View style={styles.replyPreview}>
          <Text style={styles.replyText}>Respondendo a {replyingTo.username}</Text>
          <TouchableOpacity onPress={onCancelReply}>
            <Text style={styles.cancelReply}>✕</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <View style={[
        styles.inputSection, 
        { 
          paddingBottom: Math.max(insets.bottom, 20),
        }
      ]}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.messageInput}
            placeholder="Digite sua mensagem..."
            placeholderTextColor="#c0c5ce4c"
            value={inputText}
            onChangeText={setInputText}
            multiline={true}
            maxLength={500}
            returnKeyType="default"
            onSubmitEditing={handleSubmitEditing}
            editable={!isRecording}
            blurOnSubmit={false}
            textAlignVertical="top"
            scrollEnabled={true} 
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (inputText.trim() === '' || isRecording) && styles.sendButtonDisabled
            ]}
            onPress={handleSendMessage}
            disabled={inputText.trim() === '' || isRecording}
            activeOpacity={0.7}
          >
            <Send
              size={20}
              color={inputText.trim() === '' || isRecording ? '#000' : '#ffffff'}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.micButton, isRecording && styles.micButtonActive]}
          onPress={isRecording ? onStopRecording : onStartRecording}
          activeOpacity={0.7}
        >
          {isRecording ? (
            <Square size={24} color="#ffffff" />
          ) : (
            <Mic size={24} color="#ffffff" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-end',
  },
  replyPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#444',
    borderRadius: 8,
    marginBottom: 8,
    marginHorizontal: width * 0.02,
  },
  replyText: {
    color: '#ccc',
    fontSize: 12,
    flex: 1,
  },
  cancelReply: {
    color: '#f59e0b',
    fontSize: 16,
    paddingLeft: 10,
  },
  inputSection: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: width * 0.03,
    paddingHorizontal: width * 0.02,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.012, // Aumentado um pouco
    minHeight: width * 0.12,
    maxHeight: height * 0.2, // Altura máxima definida
    marginBottom: 6,
  },
  messageInput: {
    flex: 1,
    fontSize: width * 0.04,
    fontFamily: 'Inter-Regular',
    color: '#ffffff',
    paddingVertical: height * 0.01, // Reduzido
    paddingRight: width * 0.02, // Espaço para o botão send
    minHeight: width * 0.08, // Altura mínima
    maxHeight: height * 0.15,
    textAlignVertical: 'top', // Melhor para multiline
    includeFontPadding: false, // Remove padding extra do Android
  },
  sendButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 20,
    width: width * 0.1,
    height: width * 0.1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: width * 0.01, // Reduzido
  },
  sendButtonDisabled: {
    backgroundColor: '#64748b',
  },
  micButton: {
    backgroundColor: '#f59e0b',
    borderRadius: 30,
    width: width * 0.15,
    height: width * 0.15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginBottom: 6,
  },
  micButtonActive: {
    backgroundColor: '#ef4444',
  },
});

