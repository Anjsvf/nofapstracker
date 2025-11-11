import {
  BarChart3,
  CircleDashed,
  LineChart,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MOODS, TRIGGER_IMAGES } from '../../constants/moods';
import { moodRepository } from '../../data/MoodRepository';
import { MoodStats } from '../../types/moods';

interface MoodAnalyticsProps {
  refreshTrigger: number;
}

const { width } = Dimensions.get('window');

export const MoodAnalytics: React.FC<MoodAnalyticsProps> = ({ refreshTrigger }) => {
  const [stats, setStats] = useState<MoodStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'7' | '30' | '90'>('30');
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const loadStats = useCallback(async (days: number) => {
    setIsLoading(true);
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      
      const data = await moodRepository.getMoodStats(startDate, endDate);
      setStats(data);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, [fadeAnim, slideAnim]);

  useEffect(() => {
    const days = selectedPeriod === '7' ? 7 : selectedPeriod === '30' ? 30 : 90;
    loadStats(days);
  }, [loadStats, selectedPeriod, refreshTrigger]);

  const getMoodInsight = () => {
    if (!stats) return '';
    const positive = stats.moodPercentages.excellent + stats.moodPercentages.good;
    const negative = stats.moodPercentages.bad + stats.moodPercentages.terrible;
    
    if (positive >= 70) {
      return 'Incrível! Você está radiante!';
    } else if (positive >= 50) {
      return 'Você está indo bem! Continue assim!';
    } else if (negative >= 50) {
      return 'Dias difíceis, mas você é forte.';
    }
    return 'Humor equilibrado, siga em frente!';
  };

  const getTriggerData = (trigger: string) => {
    const data = {
      work: { label: 'Trabalho', image: TRIGGER_IMAGES.work, color: '#3b82f6' },
      family: { label: 'Família', image: TRIGGER_IMAGES.family, color: '#ec4899' },
      health: { label: 'Saúde', image: TRIGGER_IMAGES.health, color: '#ef4444' },
      sleep: { label: 'Sono', image: TRIGGER_IMAGES.sleep, color: '#8b5cf6' },
      social: { label: 'Social', image: TRIGGER_IMAGES.social, color: '#06b6d4' },
      exercise: { label: 'Exercício', image: TRIGGER_IMAGES.exercise, color: '#22c55e' },
      food: { label: 'Alimentação', image: TRIGGER_IMAGES.food, color: '#f59e0b' },
      weather: { label: 'Clima', image: TRIGGER_IMAGES.weather, color: '#14b8a6' },
      finance: { label: 'Finanças', image: TRIGGER_IMAGES.finance, color: '#eab308' },
      relationship: { label: 'Relacionamento', image: TRIGGER_IMAGES.relationship, color: '#f43f5e' },
    }[trigger];
    if (data) return data;
    const formattedLabel = trigger.charAt(0).toUpperCase() + trigger.slice(1);
    return { label: formattedLabel, image: null, color: '#64748b' };
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <BarChart3 color="#3b82f6" size={64} strokeWidth={1.5} />
        <Text style={styles.loadingText}>Analisando seus dados...</Text>
      </View>
    );
  }

  if (!stats || stats.totalEntries === 0) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.emptyIconContainer}>
          <LineChart color="#475569" size={80} strokeWidth={1.5} />
        </View>
        <Text style={styles.emptyTitle}>Sem dados ainda</Text>
        <Text style={styles.emptyText}>
          Comece a registrar seus humores para ver análises incríveis aqui!
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <Animated.View 
        style={[
          styles.animatedContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {(['7', '30', '90'] as const).map(period => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod(period)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.periodButtonText,
                selectedPeriod === period && styles.periodButtonTextActive,
              ]}>
                {period === '7' ? '7 dias' : period === '30' ? '30 dias' : '90 dias'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Hero Card */}
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>{getMoodInsight()}</Text>
          <View style={styles.heroStats}>
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatValue}>{stats.totalEntries}</Text>
              <Text style={styles.heroStatLabel}>Registros</Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatValue}>{stats.averageMoodScore.toFixed(1)}</Text>
              <Text style={styles.heroStatLabel}>Média</Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatValue}>
                {(stats.moodPercentages.excellent + stats.moodPercentages.good).toFixed(0)}%
              </Text>
              <Text style={styles.heroStatLabel}>Positivo</Text>
            </View>
          </View>
        </View>

        {/* Mood Distribution */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Distribuição de Humor</Text>
            <Text style={styles.cardSubtitle}>Como você tem se sentido</Text>
          </View>
          
          <View style={styles.chartContainer}>
            {MOODS.map((mood) => {
              const percentage = stats.moodPercentages[mood.type];
              const count = stats.moodDistribution[mood.type];
              
              return (
                <View key={mood.type} style={styles.barRow}>
                  <View style={styles.barLabel}>
                    <View style={[styles.moodImageContainer, { backgroundColor: mood.color + '20' }]}>
                      <Image 
                        source={mood.image} 
                        style={styles.barMoodImage}
                        resizeMode="contain"
                      />
                    </View>
                    <Text style={styles.barLabelText}>{mood.label}</Text>
                  </View>
                  
                  <View style={styles.barContainerWrapper}>
                    <View style={styles.barContainer}>
                      <View
                        style={[
                          styles.bar,
                          {
                            width: `${percentage}%`,
                            backgroundColor: mood.color,
                          },
                        ]}
                      >
                        {percentage > 10 && (
                          <Text style={styles.barInnerText}>{percentage}%</Text>
                        )}
                      </View>
                    </View>
                    <View style={styles.barInfo}>
                      {percentage <= 10 && percentage > 0 && (
                        <Text style={styles.barPercentage}>{percentage}%</Text>
                      )}
                      <Text style={styles.barCount}>{count}x</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Triggers */}
        {stats.commonTriggers.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Principais Gatilhos</Text>
              <Text style={styles.cardSubtitle}>O que mais afeta seu humor</Text>
            </View>
            
            <View style={styles.triggersList}>
              {stats.commonTriggers.slice(0, 5).map((item, index) => {
                const triggerData = getTriggerData(item.trigger);
                const maxCount = stats.commonTriggers[0].count;
                const barWidth = (item.count / maxCount) * 100;
                
                return (
                  <View key={item.trigger} style={styles.triggerItem}>
                    <View style={styles.triggerLeft}>
                      <View style={[styles.triggerRank, { backgroundColor: triggerData.color }]}>
                        <Text style={styles.triggerRankText}>{index + 1}</Text>
                      </View>
                      <View style={[styles.triggerIconCircle, { backgroundColor: triggerData.color + '20' }]}>
                        {triggerData.image ? (
                          <Image 
                            source={triggerData.image} 
                            style={styles.triggerIconImage}
                            resizeMode="contain"
                          />
                        ) : (
                          <CircleDashed color={triggerData.color} size={24} strokeWidth={1.5} />
                        )}
                      </View>
                      <View style={styles.triggerInfo}>
                        <Text style={styles.triggerLabel}>{triggerData.label}</Text>
                        <View style={styles.triggerBarMini}>
                          <View 
                            style={[
                              styles.triggerBarFill, 
                              { width: `${barWidth}%`, backgroundColor: triggerData.color }
                            ]} 
                          />
                        </View>
                      </View>
                    </View>
                    <View style={[styles.triggerBadge, { backgroundColor: triggerData.color + '20' }]}>
                      <Text style={[styles.triggerCount, { color: triggerData.color }]}>
                        {item.count}x
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Insights */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Insights Personalizados</Text>
            <Text style={styles.cardSubtitle}>Descobertas sobre você</Text>
          </View>
          
          <View style={styles.insightsList}>
            <View style={styles.insightItem}>
              <View style={styles.insightBullet} />
              <Text style={styles.insightText}>
                Sua pontuação média é <Text style={styles.insightBold}>
                  {stats.averageMoodScore.toFixed(1)}/5.0
                </Text>
              </Text>
            </View>

            {stats.moodPercentages.excellent >= 20 && (
              <View style={styles.insightItem}>
                <View style={[styles.insightBullet, { backgroundColor: '#f59e0b' }]} />
                <Text style={styles.insightText}>
                  Você teve dias excelentes em <Text style={styles.insightBold}>
                    {stats.moodPercentages.excellent}%
                  </Text> do tempo!
                </Text>
              </View>
            )}

            {stats.moodPercentages.terrible >= 15 && (
              <View style={styles.insightItem}>
                <View style={[styles.insightBullet, { backgroundColor: '#ec4899' }]} />
                <Text style={styles.insightText}>
                  Lembre-se: dias difíceis são temporários. Você é forte!
                </Text>
              </View>
            )}

            {stats.commonTriggers.length > 0 && (
              <View style={styles.insightItem}>
                <View style={[styles.insightBullet, { backgroundColor: '#eab308' }]} />
                <Text style={styles.insightText}>
                  Seu principal gatilho é <Text style={styles.insightBold}>
                    {getTriggerData(stats.commonTriggers[0].trigger).label}
                  </Text>. Que tal trabalhar nisso?
                </Text>
              </View>
            )}

            <View style={styles.insightItem}>
              <View style={[styles.insightBullet, { backgroundColor: '#22c55e' }]} />
              <Text style={styles.insightText}>
                Continue registrando para descobrir padrões e melhorar!
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },
  animatedContainer: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#000',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 20,
  },
  emptyIconContainer: {
    marginBottom: 24,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
    gap: 4,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#040906ff',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  periodButtonTextActive: {
    color: '#ffffff',
  },
  heroCard: {
    backgroundColor: '#000',
    borderRadius: 24,
    padding: 28,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1e293b',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: 24,
    textAlign: 'center',
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  heroStatItem: {
    alignItems: 'center',
  },
  heroStatValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#3b82f6',
    marginBottom: 4,
  },
  heroStatLabel: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
  },
  heroDivider: {
    width: 1,
    height: 44,
    backgroundColor: '#1e293b',
  },
  card: {
    backgroundColor: '#000',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#1e293b',
  },
  cardHeader: {
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  chartContainer: {
    gap: 18,
  },
  barRow: {
    gap: 12,
  },
  barLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  moodImageContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  barMoodImage: {
    width: 24,
    height: 24,
  },
  barLabelText: {
    fontSize: 15,
    color: '#e2e8f0',
    fontWeight: '600',
  },
  barContainerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  barContainer: {
    flex: 1,
    height: 36,
    backgroundColor: '#0f172a',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  bar: {
    height: '100%',
    borderRadius: 18,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  barInnerText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  barInfo: {
    flexDirection: 'row',
    gap: 8,
    minWidth: 60,
  },
  barPercentage: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f1f5f9',
  },
  barCount: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  triggersList: {
    gap: 12,
  },
  triggerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  triggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  triggerRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  triggerRankText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
  triggerIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  triggerIconImage: {
    width: 24,
    height: 24,
  },
  triggerInfo: {
    flex: 1,
  },
  triggerLabel: {
    fontSize: 15,
    color: '#f1f5f9',
    fontWeight: '600',
    marginBottom: 6,
  },
  triggerBarMini: {
    height: 4,
    backgroundColor: '#1e293b',
    borderRadius: 2,
    overflow: 'hidden',
  },
  triggerBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  triggerBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  triggerCount: {
    fontSize: 14,
    fontWeight: '700',
  },
  insightsList: {
    gap: 16,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  insightBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
    marginTop: 7,
  },
  insightText: {
    flex: 1,
    fontSize: 15,
    color: '#cbd5e1',
    lineHeight: 24,
  },
  insightBold: {
    fontWeight: '700',
    color: '#3b82f6',
  },
});