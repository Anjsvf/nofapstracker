import { Mic, Send, Square, X } from 'lucide-react-native';
import React, { useCallback, useRef, useState } from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
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
const MIN_INPUT_HEIGHT = 44;
const MAX_INPUT_HEIGHT = height * 0.18;

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
  const inputRef = useRef<TextInput>(null);
  const [inputHeight, setInputHeight] = useState(MIN_INPUT_HEIGHT);

  const canSend = inputText.trim().length > 0 && !isRecording;

  const handleSend = useCallback(() => {
    if (canSend) {
      onSendMessage();
      // O parent deve limpar o texto, mas por segurança:
      // setInputText('');
    }
  }, [canSend, onSendMessage]);

  const handleContentSizeChange = useCallback((event: any) => {
    const { contentSize } = event.nativeEvent;
    const newHeight = Math.max(
      MIN_INPUT_HEIGHT,
      Math.min(MAX_INPUT_HEIGHT, contentSize.height + 20) // + padding
    );
    setInputHeight(newHeight);
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.container}>
        {replyingTo && (
          <View style={styles.replyPreview}>
            <View style={styles.replyContent}>
              <Text style={styles.replyLabel}>Respondendo a {replyingTo.username}</Text>
              <Text style={styles.replyMessageText} numberOfLines={1}>
                {replyingTo.text || '(mensagem de áudio)'}
              </Text>
            </View>
            <TouchableOpacity onPress={onCancelReply} style={styles.cancelButton}>
              <X size={18} color="#f59e0b" />
            </TouchableOpacity>
          </View>
        )}

        <View
          style={[
            styles.inputSection,
            { paddingBottom: Math.max(insets.bottom, 12) },
          ]}
        >
          <View
            style={[
              styles.inputContainer,
              { height: Math.max(MIN_INPUT_HEIGHT, inputHeight) },
            ]}
          >
            <TextInput
              ref={inputRef}
              style={styles.messageInput}
              placeholder="Digite sua mensagem..."
              placeholderTextColor="#c0c5ce8c"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={2000}
              editable={!isRecording}
              blurOnSubmit={false}
              onContentSizeChange={handleContentSizeChange}
              scrollEnabled={true}
              textAlignVertical="center"
            />

            <TouchableOpacity
              style={[
                styles.sendButton,
                !canSend && styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={!canSend}
              activeOpacity={0.7}
            >
              <Send
                size={20}
                color={canSend ? '#ffffff' : '#64748b'}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.micButton, isRecording && styles.micButtonActive]}
            onPressIn={isRecording ? onStopRecording : onStartRecording}
            activeOpacity={0.8}
          >
            {isRecording ? (
              <Square size={26} color="#ffffff" />
            ) : (
              <Mic size={26} color="#ffffff" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000000ff', // ou a cor do seu background
  },
  replyPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#1e293b',
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  replyContent: {
    flex: 1,
  },
  replyLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  replyMessageText: {
    color: '#e2e8f0',
    fontSize: 14,
    marginTop: 2,
  },
  cancelButton: {
    padding: 4,
  },
  inputSection: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    gap: 12,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: MIN_INPUT_HEIGHT,
    marginBottom:6
  },
  messageInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#ffffff',
    paddingTop: Platform.OS === 'ios' ? 12 : 8,
    paddingBottom: Platform.OS === 'ios' ? 12 : 8,
    maxHeight: MAX_INPUT_HEIGHT,
  },
  sendButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 22,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: 'transparent',
  },
  micButton: {
    backgroundColor: '#f59e0b',
    borderRadius: 30,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    marginBottom:6
  },
  micButtonActive: {
    backgroundColor: '#ef4444',
  },
});