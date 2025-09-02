import { Clock, Send } from 'lucide-react-native';
import React from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Message } from '../../types';
import { formatTime } from '../../utils/helpers';

interface PendingMessagesListProps {
  pendingMessages: Message[];
  onRetrySync?: () => void;
  isVisible: boolean;
}

const { width } = Dimensions.get('window');

export const PendingMessagesList: React.FC<PendingMessagesListProps> = ({
  pendingMessages,
  onRetrySync,
  isVisible,
}) => {
  if (!isVisible) return null;

  const renderPendingMessage = ({ item }: { item: Message }) => (
    <View style={styles.messageItem}>
      <View style={styles.messageIcon}>
        <Clock size={16} color="#f59e0b" />
      </View>
      <View style={styles.messageContent}>
        <Text style={styles.messageText} numberOfLines={1}>
          {item.type === 'voice' ? '[Mensagem de voz]' : item.text}
        </Text>
        <Text style={styles.messageTime}>{formatTime(item.timestamp)}</Text>
      </View>
      {item.type === 'voice' && (
        <View style={styles.voiceIndicator}>
          <Text style={styles.voiceText}>🎤</Text>
        </View>
      )}
    </View>
  );

  if (pendingMessages.length === 0) {
    return (
      <View style={[styles.container, { paddingVertical: 20 }]}>
        <Text style={[styles.messageText, { textAlign: 'center', color: '#9ca3af' }]}>
          Nenhuma mensagem pendente
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mensagens Pendentes ({pendingMessages.length})</Text>
        {onRetrySync && (
          <TouchableOpacity style={styles.retryButton} onPress={onRetrySync}>
            <Send size={14} color="#ffffff" />
            <Text style={styles.retryText}>Tentar Enviar</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={pendingMessages}
        keyExtractor={(item) => item._id}
        renderItem={renderPendingMessage}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        maxToRenderPerBatch={5}
        initialNumToRender={5}
        bounces={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    marginHorizontal: width * 0.04,
    marginBottom: 16,
    borderRadius: 12,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  list: {
    maxHeight: 150,
  },
  messageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  messageIcon: {
    marginRight: 12,
  },
  messageContent: {
    flex: 1,
  },
  messageText: {
    color: '#ffffff',
    fontSize: 13,
    fontFamily: 'Inter-Regular',
  },
  messageTime: {
    color: '#9ca3af',
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  voiceIndicator: {
    marginLeft: 8,
  },
  voiceText: {
    fontSize: 16,
  },
});
