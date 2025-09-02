import { Users } from 'lucide-react-native';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { User } from '../../types';

interface ChatHeaderProps {
  onlineUsers: User[];
  onLogout: () => void;
}

const { width } = Dimensions.get('window');

export const ChatHeader: React.FC<ChatHeaderProps> = ({ onlineUsers, onLogout }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      <Text style={styles.title}>Chat Global</Text>
      <View style={styles.onlineContainer}>
        <Users size={16} color="#10b981" />
        <Text style={styles.onlineText}>
          {onlineUsers.filter((u) => u.online).length} online
        </Text>
      </View>
      {/* <TouchableOpacity onPress={onLogout}>
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity> */}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
    marginBottom: 20,
  },
  title: {
    fontSize: width * 0.06,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  onlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineText: {
    fontSize: width * 0.035,
    fontFamily: 'Inter-Medium',
    color: '#10b981',
    marginLeft: 4,
  },
  logoutText: {
    fontSize: width * 0.035,
    fontFamily: 'Inter-Medium',
    color: '#ef4444',
  },
});

