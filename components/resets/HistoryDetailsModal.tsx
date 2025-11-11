import { ResetHistoryEntry } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import { Activity, BarChart3, Calendar, Clock, X } from 'lucide-react-native';
import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getShift } from './getShift/getShift';
import { HourlyDensityChart } from './HourlyDensityChart';
import { MonthlyMetrics } from './MonthlyMetrics';
import { ResetTimeline } from './ResetTimeline';

interface HistoryDetailsModalProps {
  visible: boolean;
  date: Date | null;
  resets: ResetHistoryEntry[];
  allResets: ResetHistoryEntry[];
  onClose: () => void;
}

export function HistoryDetailsModal({ 
  visible, 
  date, 
  resets, 
  allResets, 
  onClose 
}: HistoryDetailsModalProps) {
  const insets = useSafeAreaInsets();

  if (!visible || !date) return null;

  const shiftGroups = resets.reduce((acc, reset) => {
    const hour = new Date(reset.date).getHours();
    const shift = getShift(hour);
    const key = shift.name;
    if (!acc[key]) acc[key] = { ...shift, count: 0, resets: [] };
    acc[key].count++;
    acc[key].resets.push(reset);
    return acc;
  }, {} as Record<string, { name: string; emoji: string; color: string; count: number; resets: ResetHistoryEntry[] }>);

  const shiftEntries = Object.values(shiftGroups);

  const getTotalDaysLost = () =>
    resets.reduce((total, reset) => total + (reset.daysCompleted || 0), 0);

  const getAverageInterval = () => {
    if (resets.length <= 1) return 'N/A';
    const sorted = [...resets].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    let totalMinutes = 0;
    for (let i = 1; i < sorted.length; i++) {
      const diffMs = new Date(sorted[i].date).getTime() - new Date(sorted[i - 1].date).getTime();
      totalMinutes += diffMs / (1000 * 60);
    }
    const avgMinutes = Math.round(totalMinutes / (sorted.length - 1));
    if (avgMinutes < 60) return `${avgMinutes} min`;
    if (avgMinutes < 1440) return `${Math.round(avgMinutes / 60)}h ${avgMinutes % 60}min`;
    return `${Math.round(avgMinutes / 1440)} dias`;
  };

  // Turno mais frequente
  const mostFrequentShift = shiftEntries.length > 0
    ? shiftEntries.reduce((max, shift) => (shift.count > max.count ? shift : max), shiftEntries[0]).name
    : 'N/A';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <LinearGradient
        colors={['#000', '#000', '#000']}
        style={[styles.container, { paddingTop: insets.top + 20 }]}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Activity size={24} color="#ffffff" />
            <Text style={styles.title}>
              Análise Detalhada - {date.toLocaleDateString('pt-BR')}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Métricas Mensais */}
          <MonthlyMetrics date={date} allResets={allResets} />

          {/* Estatísticas do Dia */}
          {resets.length > 1 && (
            <View style={styles.statsRow}>
              <StatCard
                title="Intervalo Médio"
                value={getAverageInterval()}
                icon={<Clock color="#3b82f6" size={20} />}
                color="#3b82f6"
              />
            </View>
          )}

          {/* Distribuição por Turno */}
          {resets.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Distribuição por Turno</Text>
              <View style={styles.chartContainer}>
                {shiftEntries.map((shift, index) => (
                  <View key={index} style={styles.shiftBarContainer}>
                    <View style={styles.shiftHeader}>
                      <Text style={[styles.shiftLabel, { color: shift.color }]}>
                        {shift.emoji} {shift.name}
                      </Text>
                      <Text style={styles.shiftValue}>{shift.count}</Text>
                    </View>
                    <View style={styles.barBg}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            width: `${(shift.count / Math.max(...shiftEntries.map(s => s.count), 1)) * 100}%`,
                            backgroundColor: shift.color,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.shiftPercentage}>
                      {((shift.count / resets.length) * 100).toFixed(1)}% do total
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

       
          {resets.length > 0 && <HourlyDensityChart resets={resets} />}

        
          <ResetTimeline resets={resets} />

      
          {resets.length > 0 && (
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>Análise Consolidada do Dia</Text>
              <View style={styles.summaryGrid}>
                <SummaryMetric 
                  label="Total de Ocorrências" 
                  value={resets.length.toString()} 
                  color="#ef4444"
                  icon={<BarChart3 size={16} color="#ef4444" />}
                />
                <SummaryMetric 
                  label="Dias Perdidos" 
                  value={getTotalDaysLost().toString()} 
                  color="#f59e0b"
                  icon={<Calendar size={16} color="#f59e0b" />}
                />
                {resets.length > 1 && (
                  <SummaryMetric 
                    label="Intervalo Médio" 
                    value={getAverageInterval()} 
                    color="#3b82f6"
                    icon={<Clock size={16} color="#3b82f6" />}
                  />
                )}
                <SummaryMetric 
                  label="Turno Predominante" 
                  value={mostFrequentShift} 
                  color="#8b5cf6"
                  icon={<Activity size={16} color="#8b5cf6" />}
                />
              </View>
              
              {resets.filter((r) => r.badgeName).length > 0 && (
                <View style={styles.achievementsLost}>
                  <Text style={styles.achievementsTitle}>Conquistas Perdidas</Text>
                  <View style={styles.achievementsList}>
                    {resets
                      .filter((reset) => reset.badgeName)
                      .map((reset, index) => (
                        <View key={index} style={styles.achievementItem}>
                          <Text style={styles.achievementEmoji}>{reset.badgeEmoji}</Text>
                          <View style={styles.achievementInfo}>
                            <Text style={styles.achievementName}>{reset.badgeName}</Text>
                            <Text style={styles.achievementDays}>
                              {reset.daysCompleted} dia{reset.daysCompleted !== 1 ? 's' : ''} de progresso
                            </Text>
                          </View>
                        </View>
                      ))}
                  </View>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </Modal>
  );
}


const StatCard = ({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}) => (
  <View style={[styles.statCard, { borderColor: color + '40' }]}>
    <View style={[styles.statIconBg, { backgroundColor: color + '20' }]}>
      {icon}
    </View>
    <Text style={styles.statValue} numberOfLines={1}>
      {value}
    </Text>
    <Text style={styles.statLabel}>{title}</Text>
  </View>
);

const SummaryMetric = ({ 
  label, 
  value, 
  color, 
  icon
}: { 
  label: string; 
  value: string; 
  color: string;
  icon: React.ReactNode;
}) => (
  <View style={styles.summaryMetricCard}>
    <View style={styles.summaryMetricHeader}>
      <View style={styles.summaryMetricIcon}>{icon}</View>
      <Text style={[styles.summaryMetricValue, { color }]}>{value}</Text>
    </View>
    <Text style={styles.summaryMetricLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginLeft: 12,
    flexShrink: 1,
  },
  closeButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  statIconBg: {
    padding: 8,
    borderRadius: 12,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#94a3b8',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#000',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  chartContainer: {
    gap: 16,
  },
  shiftBarContainer: {
    gap: 8,
  },
  shiftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shiftLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  shiftValue: {
    fontSize: 14,
    color: '#ffffff',
    fontFamily: 'Inter-Bold',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    minWidth: 30,
    textAlign: 'center',
  },
  shiftPercentage: {
    fontSize: 11,
    color: '#64748b',
    fontFamily: 'Inter-Regular',
  },
  barBg: {
    height: 12,
    backgroundColor: '#334155',
    borderRadius: 6,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 6,
  },
  summaryContainer: {
    backgroundColor: '#000',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  summaryMetricCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: '#00000051',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#3341554f',
    alignItems: 'center',
  },
  summaryMetricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  summaryMetricIcon: {
    marginRight: 4,
  },
  summaryMetricValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
  },
  summaryMetricLabel: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: '#94a3b8',
    textAlign: 'center',
  },
  achievementsLost: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  achievementsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#facc15',
    marginBottom: 12,
    textAlign: 'center',
  },
  achievementsList: {
    gap: 12,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(250, 204, 21, 0.05)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(250, 204, 21, 0.2)',
  },
  achievementEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#facc15',
    marginBottom: 2,
  },
  achievementDays: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#94a3b8',
  },
});