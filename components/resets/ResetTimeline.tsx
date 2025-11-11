import { ResetHistoryEntry } from '@/types';
import { Calendar, Trophy } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getShift } from './getShift/getShift';

export function ResetTimeline({ resets }: { resets: ResetHistoryEntry[] }) {
  
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };




  return (
    <View style={styles.resetsProfessionalContainer}>
      <View style={styles.resetsHeader}>
        <Text style={styles.resetsTitle}>
          Registro de Ocorrências
        </Text>
        <View style={styles.resetsCounter}>
          <Text style={styles.resetsCounterText}>{resets.length}</Text>
        </View>
      </View>
      
      {resets.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Nenhum reset registrado neste dia</Text>
        </View>
      ) : (
        <View style={styles.resetsTimeline}>
          {resets
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map((reset, index) => {
              const hour = new Date(reset.date).getHours();
              const shift = getShift(hour);
              const isLast = index === resets.length - 1;
              
              return (
                <View key={reset.id} style={styles.timelineItem}>
                  <View style={styles.timelineMarker}>
                    <View style={[styles.timelineDot, { backgroundColor: shift.color }]} />
                    {!isLast && <View style={styles.timelineLine} />}
                  </View>
                  
                  <View style={styles.timelineContent}>
                    <View style={styles.resetCard}>
                      <View style={styles.resetCardHeader}>
                        <View style={styles.resetCardTitle}>
                          <Text style={styles.resetCardNumber}>#{(index + 1).toString().padStart(2, '0')}</Text>
                          <View style={[styles.shiftBadgePro, { backgroundColor: shift.color + '20', borderColor: shift.color + '40' }]}>
                            <Text style={[styles.shiftBadgeText, { color: shift.color }]}>
                              {shift.emoji} {shift.name}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.resetTime}>{formatTime(reset.date)}</Text>
                      </View>
                      
                      <View style={styles.resetCardContent}>
                        <Text style={styles.resetDate}>
                          {new Date(reset.date).toLocaleDateString('pt-BR', {
                            weekday: 'long',
                            day: '2-digit',
                            month: 'long',
                          })}
                        </Text>
                        
                        <View style={styles.resetMetrics}>
                          <View style={styles.metricItem}>
                            <Calendar size={14} color="#94a3b8" />
                            <Text style={styles.metricText}>
                              {reset.daysCompleted || 0} dia{reset.daysCompleted !== 1 ? 's' : ''} completado{reset.daysCompleted !== 1 ? 's' : ''}
                            </Text>
                          </View>
                          
                          <View style={styles.metricItem}>
                            <Trophy size={14} color={reset.badgeName ? "#facc15" : "#6b7280"} />
                            <Text style={[styles.metricText, { color: reset.badgeName ? "#facc15" : "#6b7280" }]}>
                              {reset.badgeName ? (
                                `${reset.badgeName}`
                              ) : (
                                '🏆 Iniciante'
                              )}
                            </Text>
                          </View>
                        </View>
                        
                        {reset.badgeCategory && (
                          <View style={styles.badgeCategory}>
                            <Text style={styles.badgeCategoryText}>
                              Categoria: {reset.badgeCategory}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  resetsProfessionalContainer: {
    backgroundColor: '#000',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  resetsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  resetsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  resetsCounter: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 40,
    alignItems: 'center',
  },
  resetsCounterText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
    fontStyle: 'italic',
  },
  resetsTimeline: {
    gap: 0,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineMarker: {
    alignItems: 'center',
    marginRight: 16,
    paddingTop: 8,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#1e293b',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  timelineLine: {
    width: 2,
    height: 60,
    backgroundColor: '#334155',
    marginTop: 8,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 16,
  },
  resetCard: {
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resetCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resetCardTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  resetCardNumber: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    minWidth: 40,
    textAlign: 'center',
  },
  shiftBadgePro: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  shiftBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  resetTime: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  resetCardContent: {
    gap: 12,
  },
  resetDate: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#e2e8f0',
    textTransform: 'capitalize',
  },
  resetMetrics: {
    gap: 8,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  metricText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#94a3b8',
    flex: 1,
  },
  badgeCategory: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  badgeCategoryText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
    fontStyle: 'italic',
  },
});