import { RefreshCw, Wifi, WifiOff } from 'lucide-react-native';
import React, { useEffect } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface OfflineStatusProps {
  isOnline: boolean;
  isSyncing: boolean;
  onSyncPress?: () => void;
  pendingMessagesCount: number;
}

const { width } = Dimensions.get('window');

export const OfflineStatus: React.FC<OfflineStatusProps> = ({
  isOnline,
  isSyncing,
  onSyncPress,
  pendingMessagesCount,
}) => {
  const insets = useSafeAreaInsets();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    const shouldShow = !isOnline || isSyncing || pendingMessagesCount > 0;

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: shouldShow ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: shouldShow ? 0 : -50,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isOnline, isSyncing, pendingMessagesCount]);

  const getStatusInfo = () => {
    if (isSyncing) {
      return {
        text: 'Sincronizando...',
        backgroundColor: '#f59e0b',
        icon: <RefreshCw size={16} color="#ffffff" />,
      };
    }
    if (!isOnline) {
      return {
        text:
          pendingMessagesCount > 0
            ? `Offline • ${pendingMessagesCount} mensagem${pendingMessagesCount !== 1 ? 's' : ''} pendente${pendingMessagesCount !== 1 ? 's' : ''}`
            : 'Você está offline',
        backgroundColor: '#ef4444',
        icon: <WifiOff size={16} color="#ffffff" />,
      };
    }
    if (pendingMessagesCount > 0) {
      return {
        text: `${pendingMessagesCount} mensagem${pendingMessagesCount !== 1 ? 's' : ''} para sincronizar`,
        backgroundColor: '#f59e0b',
        icon: <RefreshCw size={16} color="#ffffff" />,
      };
    }
    return {
      text: 'Online',
      backgroundColor: '#10b981',
      icon: <Wifi size={16} color="#ffffff" />,
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          backgroundColor: statusInfo.backgroundColor,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.statusInfo}>
          {statusInfo.icon}
          <Text style={styles.statusText}>{statusInfo.text}</Text>
        </View>

        {pendingMessagesCount > 0 && isOnline && !isSyncing && onSyncPress && (
          <TouchableOpacity style={styles.syncButton} onPress={onSyncPress}>
            <RefreshCw size={14} color="#ffffff" />
            <Text style={styles.syncButtonText}>Sincronizar</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: width * 0.04,
    paddingVertical: 8,
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  syncButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
});

export default OfflineStatus; 