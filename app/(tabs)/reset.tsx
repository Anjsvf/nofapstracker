import { ResetHistoryCalendar } from '@/components/resets/ResetHistoryCalendar';
import { StorageService } from '@/services/storageService';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  History,
  Sparkles,
  TrendingUp
} from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ResetsScreen() {
  const insets = useSafeAreaInsets();
  const [showCalendar, setShowCalendar] = useState(false);
  const [totalResets, setTotalResets] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [resetHistory, setResetHistory] = useState<any[]>([]);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));

  const loadData = useCallback(async () => {
    try {
      const [profileData, timerData, history] = await Promise.all([
        StorageService.loadProfileData(),
        StorageService.loadTimerState(),
        StorageService.loadResetHistory(),
      ]);

      setTotalResets(profileData?.totalResets || 0);
      setCurrentStreak(timerData?.currentStreak || 0);
      setResetHistory(history || []);

     
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    } catch (error) {
      console.error('Error loading reset data:', error);
    }
  }, [fadeAnim, slideAnim]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const latestReset = resetHistory.length > 0 ? resetHistory[0] : null;

  const getMotivationalMessage = () => {
    if (currentStreak === 0) return "Hoje é um novo começo!";
    if (currentStreak < 7) return "Primeiros passos conquistados! ";
    if (currentStreak < 30) return "Força imparável! Continue assim! ";
    if (currentStreak < 90) return "Transformação visível! Você é incrível! ";
    return "Lendário! Você é uma inspiração não Desista! ";
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
     
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerIconWrapper}>
            <History size={28} color="#60a5fa" />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Histórico</Text>
            <Text style={styles.headerSubtitle}>{getMotivationalMessage()}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
      
        <Animated.View 
          style={[
            styles.statsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <LinearGradient
            colors={['#000', '#000']}
            style={[styles.statCard, styles.statCardDanger]}
          >
            <View style={[styles.statIconContainer, styles.statIconDanger]}>
              <Clock size={24} color="#ef4444" />
            </View>
            <Text style={styles.statValue}>{totalResets}</Text>
            <Text style={styles.statLabel}>Total de Resets</Text>
            <View style={styles.statDivider} />
            <Text style={styles.statSubtext}>registros históricos</Text>
          </LinearGradient>

          <LinearGradient
            colors={['rgba(0, 0, 0, 0.95)', '#000']}
            style={[styles.statCard, styles.statCardSuccess]}
          >
            <View style={[styles.statIconContainer, styles.statIconSuccess]}>
              <TrendingUp size={24} color="#22c55e" />
            </View>
            <Text style={styles.statValue}>{currentStreak}</Text>
            <Text style={styles.statLabel}>Dias de Sequência</Text>
            <View style={styles.statDivider} />
            <Text style={styles.statSubtext}>consecutivos ativos</Text>
          </LinearGradient>
        </Animated.View>

     
        <TouchableOpacity
          style={styles.calendarButton}
          onPress={() => setShowCalendar(true)}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={['rgba(59, 130, 246, 0.2)', 'rgba(37, 99, 235, 0.1)']}
            style={styles.calendarButtonGradient}
          >
            <View style={styles.calendarButtonContent}>
              <View style={styles.calendarIconWrapper}>
                <Calendar size={22} color="#60a5fa" />
              </View>
              <View style={styles.calendarTextContainer}>
                <Text style={styles.calendarButtonText}>Ver Calendário Completo</Text>
                <Text style={styles.calendarButtonSubtext}>Visualize todos os registros</Text>
              </View>
            </View>
            <ArrowRight size={20} color="#60a5fa" />
          </LinearGradient>
        </TouchableOpacity>

       
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Último Reset</Text>
            {latestReset && (
              <View style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>Mais recente</Text>
              </View>
            )}
          </View>
          
          {!latestReset ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <View style={styles.emptyIconCircle}>
                  <CheckCircle2 size={48} color="#22c55e" strokeWidth={1.5} />
                </View>
                <View style={styles.emptySparklesContainer}>
                  <Sparkles size={20} color="#22c55e" style={styles.sparkle1} />
                  <Sparkles size={16} color="#22c55e" style={styles.sparkle2} />
                  <Sparkles size={14} color="#22c55e" style={styles.sparkle3} />
                </View>
              </View>
              <Text style={styles.emptyTitle}>Nenhum Reset Registrado</Text>
              <Text style={styles.emptyText}>
                Você está mantendo o foco!
              </Text>
              <Text style={styles.emptySubtext}>
                Continue forte na sua jornada de autodisciplina 
              </Text>
              <View style={styles.emptyProgressBar}>
                <View style={styles.emptyProgressFill} />
              </View>
            </View>
          ) : (
            <View style={styles.resetCard}>
              <View style={styles.resetHeader}>
                <View style={styles.resetDateContainer}>
                  <Text style={styles.resetDay}>
                    {new Date(latestReset.date).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                    })}
                  </Text>
                  <View>
                    <Text style={styles.resetMonth}>
                      {new Date(latestReset.date).toLocaleDateString('pt-BR', {
                        month: 'short',
                      }).toUpperCase()}
                    </Text>
                    <Text style={styles.resetYear}>
                      {new Date(latestReset.date).getFullYear()}
                    </Text>
                  </View>
                </View>

                <View style={styles.resetTimeBox}>
                  <Clock size={14} color="#64748b" />
                  <Text style={styles.resetTime}>
                    {new Date(latestReset.date).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              </View>

              <View style={styles.resetDivider} />

              <View style={styles.resetDetails}>
                {latestReset.note ? (
                  <>
                    <Text style={styles.resetNoteLabel}>Nota registrada:</Text>
                    <View style={styles.resetNoteContainer}>
                      <Text style={styles.resetNote} numberOfLines={4}>
                        "{latestReset.note}"
                      </Text>
                    </View>
                  </>
                ) : null}
              </View>
            </View>
          )}
        </View>

        {/* Motivational Messages */}
        <View style={styles.motivationSection}>
          <LinearGradient
            colors={['rgba(34, 197, 94, 0.1)', 'rgba(34, 197, 94, 0.05)']}
            style={styles.motivationCard}
          >
            <Text style={styles.motivationText}>
              "Cada recomeço é uma nova oportunidade de se tornar uma versão melhor de si mesmo."
            </Text>
          </LinearGradient>

          {currentStreak > 7 && (
            <View style={styles.achievementCard}>
              <View style={styles.achievementIconWrapper}>
                <TrendingUp size={18} color="#22c55e" />
              </View>
              <View style={styles.achievementContent}>
                <Text style={styles.achievementTitle}>Progresso Consistente!</Text>
                <Text style={styles.achievementText}>
                  Você está {currentStreak} dias sem reset. Continue assim! 
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <ResetHistoryCalendar
        visible={showCalendar}
        onClose={() => setShowCalendar(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51, 65, 85, 0.3)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  headerIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(96, 165, 250, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.3)',
  },
  statCardDanger: {
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  statCardSuccess: {
    borderColor: 'rgba(34, 197, 94, 0.25)',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statIconDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  statIconSuccess: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  statValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 8,
  },
  statDivider: {
    width: 30,
    height: 1,
    backgroundColor: 'rgba(100, 116, 139, 0.3)',
    marginVertical: 8,
  },
  statSubtext: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'center',
  },
  calendarButton: {
    marginBottom: 20,
    borderRadius: 18,
    overflow: 'hidden',
  },
  calendarButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.2)',
  },
  calendarButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  calendarIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(96, 165, 250, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarTextContainer: {
    flex: 1,
  },
  calendarButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#60a5fa',
    marginBottom: 2,
  },
  calendarButtonSubtext: {
    fontSize: 12,
    color: 'rgba(96, 165, 250, 0.7)',
  },
  recentSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  sectionBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  sectionBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ef4444',
  },
  emptyState: {
    backgroundColor: 'rgba(30, 41, 59, 0.3)',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
  },
  emptyIconContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(34, 197, 94, 0.2)',
  },
  emptySparklesContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  sparkle1: {
    position: 'absolute',
    top: -5,
    right: 10,
  },
  sparkle2: {
    position: 'absolute',
    bottom: 5,
    left: -5,
  },
  sparkle3: {
    position: 'absolute',
    top: 15,
    left: -10,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#22c55e',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  emptyProgressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  emptyProgressFill: {
    width: '100%',
    height: '100%',
    backgroundColor: '#22c55e',
    borderRadius: 2,
  },
  resetCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.3)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  resetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  resetDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  resetDay: {
    fontSize: 48,
    fontWeight: '800',
    color: '#ef4444',
    lineHeight: 48,
  },
  resetMonth: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94a3b8',
    textAlign: 'left',
    marginBottom: 2,
  },
  resetYear: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'left',
  },
  resetTimeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  resetTime: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94a3b8',
  },
  resetDivider: {
    height: 1,
    backgroundColor: 'rgba(51, 65, 85, 0.5)',
    marginBottom: 16,
  },
  resetDetails: {
    marginBottom: 14,
  },
  resetNoteLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resetNoteContainer: {
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
  },
  resetNote: {
    fontSize: 14,
    color: '#94a3b8',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  motivationSection: {
    marginBottom: 20,
    gap: 12,
  },
  motivationCard: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
    alignItems: 'center',
    gap: 14,
  },
  motivationText: {
    flex: 1,
    fontSize: 14,
    color: '#86efac',
    lineHeight: 22,
    fontStyle: 'italic',
    fontWeight: '500',
    textAlign: 'center',
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
    gap: 12,
  },
  achievementIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#22c55e',
    marginBottom: 3,
  },
  achievementText: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
  },
});