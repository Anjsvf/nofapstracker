import { TimerDisplay } from '@/components/timer/TimerDisplay';
import { useTimer } from '@/hooks/useTimer';
import { BadgeService } from '@/services/badgeService';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, RotateCcw } from 'lucide-react-native';
import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const {
    timerState,
    startTimer,
    resetTimer,
    getCurrentDayElapsed,
    getTotalElapsed,
    getCurrentDayProgress,
  } = useTimer();

  const currentBadge = BadgeService.getBadgeInfo(timerState.currentStreak);

  return (
    <LinearGradient colors={['#3d2050', '#2a1c3a', '#1a0f2e']} style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>NoFap Tracker</Text>
          <Text style={styles.subtitle}>Sua jornada de autodisciplina</Text>
        </View>

        <View style={styles.streakContainer}>
          <Text style={styles.streakLabel}>Sequência Atual</Text>
          <Text style={styles.streakNumber}>{timerState.currentStreak}</Text>
          <Text style={styles.streakUnit}>dias</Text>
        </View>

        <View style={styles.timerContainer}>
          <TimerDisplay
            currentDayElapsed={getCurrentDayElapsed()}
            totalElapsed={getTotalElapsed()}
            isRunning={timerState.isRunning}
            progress={getCurrentDayProgress()}
          />
        </View>

        {currentBadge && (
          <View style={styles.badgeContainer}>
            <Image 
              source={currentBadge.imageSource}
              style={styles.badgeImage}
              resizeMode="cover"
            />
            <View style={styles.badgeInfo}>
              <Text style={styles.badgeText}>{currentBadge.name}</Text>
              <Text style={styles.badgeCategory}>{currentBadge.category}</Text>
            </View>
          </View>
        )}

        <View style={styles.controlsContainer}>
          {!timerState.isRunning ? (
            <TouchableOpacity style={styles.startButton} onPress={startTimer}>
              <Play size={24} color="#ffffff" />
              <Text style={styles.buttonText}>Iniciar Jornada</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.resetButton} onPress={resetTimer}>
              <RotateCcw size={24} color="#ffffff" />
              <Text style={styles.buttonText}>Resetar</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{timerState.currentStreak}</Text>
            <Text style={styles.statLabel}>Dias Completos</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {Math.floor(getCurrentDayElapsed() / (1000 * 60 * 60)) || 0}
            </Text>
            <Text style={styles.statLabel}>Horas Hoje</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {Math.round(getCurrentDayProgress() * 100) || 0}%
            </Text>
            <Text style={styles.statLabel}>Progresso Diário</Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#a78bfa',
    textAlign: 'center',
  },
  streakContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  streakLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#a78bfa',
    marginBottom: 8,
  },
  streakNumber: {
    fontSize: 72,
    fontFamily: 'RobotoMono-Bold',
    color: '#ffffff',
    lineHeight: 72,
  },
  streakUnit: {
    fontSize: 20,
    fontFamily: 'Inter-Medium',
    color: '#a78bfa',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#8b5cf6',
  },
  badgeImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#ffd700',
  },
  badgeInfo: {
    marginLeft: 16,
    flex: 1,
  },
  badgeText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
    marginBottom: 2,
  },
  badgeCategory: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#a78bfa',
  },
  controlsContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    elevation: 4,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    elevation: 4,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
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
});