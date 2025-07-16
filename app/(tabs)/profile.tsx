import { BadgeService } from '@/services/badgeService';
import { StorageService } from '@/services/storageService';
import { ProfileData } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import { Download, Share, Trash2, User } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [username, setUsername] = useState('');
  const [currentStreak, setCurrentStreak] = useState(0);
  const [totalResets, setTotalResets] = useState(0);
  const [joinDate, setJoinDate] = useState<Date | null>(null);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = useCallback(async () => {
    try {
      const [usernameData, timerData, profileData] = await Promise.all([
        StorageService.loadUsername(),
        StorageService.loadTimerState(),
        StorageService.loadProfileData(),
      ]);

      if (usernameData) {
        setUsername(usernameData);
      }

      if (timerData) {
        setCurrentStreak(timerData.currentStreak || 0);
      }

      if (profileData) {
        setTotalResets(profileData.totalResets || 0);
        setJoinDate(profileData.joinDate ? new Date(profileData.joinDate) : null);
      } else {
        // First time - set join date
        const now = new Date();
        const newProfileData: ProfileData = {
          totalResets: 0,
          joinDate: now.toISOString(),
        };
        setJoinDate(now);
        await StorageService.saveProfileData(newProfileData);
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
  }, []);

  const resetAllData = useCallback(() => {
    Alert.alert(
      'Resetar Todos os Dados',
      'Esta ação irá apagar TODOS os seus dados, incluindo progresso, badges e histórico. Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Resetar Tudo',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.clearAllData();
              
              // Reset local state
              setCurrentStreak(0);
              setTotalResets(0);
              setUsername('');
              setJoinDate(new Date());
              
              Alert.alert('Sucesso', 'Todos os dados foram resetados.');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível resetar os dados.');
            }
          },
        },
      ]
    );
  }, []);

  const exportData = useCallback(() => {
    // In a real app, you would export data to a file
    Alert.alert(
      'Exportar Dados',
      'Funcionalidade de exportação será implementada em versão futura.'
    );
  }, []);

  const shareProgress = useCallback(() => {
    const currentBadge = BadgeService.getBadgeInfo(currentStreak);
    const message = `Estou há ${currentStreak} dias na minha jornada NoFap! ${
      currentBadge ? `Conquista atual: ${currentBadge.name}` : ''
    } 💪 #NoFap #SelfImprovement`;
    
    Alert.alert(
      'Compartilhar Progresso',
      message,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Compartilhar', onPress: () => {
          // In a real app, you would use Share API
          Alert.alert('Compartilhado', 'Progresso compartilhado com sucesso!');
        }},
      ]
    );
  }, [currentStreak]);

  const calculateDaysSinceJoin = useCallback(() => {
    if (!joinDate) return 0;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - joinDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [joinDate]);

  const currentBadge = BadgeService.getBadgeInfo(currentStreak);

  return (
    <LinearGradient colors={['#3d2050', '#2a1c3a', '#1a0f2e']} style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Perfil</Text>
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <User size={48} color="#ffffff" />
          </View>
          <Text style={styles.username}>
            {username || 'Usuário Anônimo'}
          </Text>
          {currentBadge && (
            <View style={styles.currentBadgeContainer}>
              <Image 
                source={currentBadge.imageSource}
                style={styles.currentBadgeImage}
                resizeMode="cover"
              />
              <Text style={styles.currentBadgeText}>{currentBadge.name}</Text>
            </View>
          )}
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Estatísticas</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{currentStreak}</Text>
              <Text style={styles.statLabel}>Sequência Atual</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{totalResets}</Text>
              <Text style={styles.statLabel}>Total de Resets</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{calculateDaysSinceJoin()}</Text>
              <Text style={styles.statLabel}>Dias no App</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {joinDate ? joinDate.getFullYear() : '2024'}
              </Text>
              <Text style={styles.statLabel}>Ano de Entrada</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Ações</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={shareProgress}>
            <Share size={20} color="#8b5cf6" />
            <Text style={styles.actionButtonText}>Compartilhar Progresso</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={exportData}>
            <Download size={20} color="#8b5cf6" />
            <Text style={styles.actionButtonText}>Exportar Dados</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.dangerButton]} 
            onPress={resetAllData}
          >
            <Trash2 size={20} color="#ef4444" />
            <Text style={[styles.actionButtonText, styles.dangerButtonText]}>
              Resetar Todos os Dados
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.sectionTitle}>Informações</Text>
          <Text style={styles.infoText}>
            Versão do App: 1.0.0{'\n'}
            Desenvolvido com React Native + Expo{'\n'}
            {joinDate && `Membro desde: ${joinDate.toLocaleDateString('pt-BR')}`}
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#8b5cf6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  username: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  currentBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#ffd700',
  },
  currentBadgeImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffd700',
  },
  currentBadgeText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#ffd700',
    marginLeft: 8,
  },
  statsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold', 
    color: '#ffffff',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statValue: {
    fontSize: 28,
    fontFamily: 'RobotoMono-Bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#a78bfa',
    textAlign: 'center',
  },
  actionsContainer: {
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
    marginLeft: 12,
  },
  dangerButton: {
    borderColor: 'rgba(239, 68, 68, 0.3)',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  dangerButtonText: {
    color: '#ef4444',
  },
  infoContainer: {
    marginBottom: 40,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#a78bfa',
    lineHeight: 20,
  },
});