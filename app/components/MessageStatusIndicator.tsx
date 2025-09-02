import { Check, Clock, Upload } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Message } from '../../types';

interface MessageStatusIndicatorProps {
  message: Message;
  size?: number;
}

export const MessageStatusIndicator: React.FC<MessageStatusIndicatorProps> = ({
  message,
  size = 14,
}) => {
  if (!message.isOwn) return null;

  const getStatusIcon = () => {
    if (message.isPending) {
      return <Clock size={size} color="#f59e0b" />;
    }
    
    if (!message.isSynced) {
      return <Upload size={size} color="#6b7280" />;
    }
    
    return <Check size={size} color="#10b981" />;
  };

  return (
    <View style={styles.container}>
      {getStatusIcon()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginLeft: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});


