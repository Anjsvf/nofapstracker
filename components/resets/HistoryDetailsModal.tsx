import { ResetHistoryEntry } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Clock, Trophy, X } from 'lucide-react-native';
import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HistoryDetailsModalProps {
  visible: boolean;
  date: Date | null;
  resets: ResetHistoryEntry[];
  onClose: () => void;
}

export function HistoryDetailsModal({ visible, date, resets, onClose }: HistoryDetailsModalProps) {
  const insets = useSafeAreaInsets();

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getTotalDaysLost = () => {
    return resets.reduce((total, reset) => total + (reset.daysCompleted || 0), 0);
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <LinearGradient
        colors={["#000000", "#000000", "#000000"]}
        style={[styles.container, { paddingTop: insets.top + 20 }]}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Clock size={24} color="#ffffff" />
            <Text style={styles.title}>
              Resets do Dia {date?.toLocaleDateString('pt-BR')}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.detailsContainer}>
            <Text style={styles.detailsTitle}>
              📅 {resets.length} reset{resets.length !== 1 ? 's' : ''} registrado{resets.length !== 1 ? 's' : ''}
            </Text>
            
            {resets.map((reset, index) => (
              <View key={reset.id} style={styles.resetDetailItem}>
                <View style={styles.resetDetailHeader}>
                  <Text style={styles.resetDetailNumber}>Reset #{index + 1}</Text>
                 
                </View>
                
                <View style={styles.resetDetailInfo}>
                  <Text style={styles.resetDetailDate}>
                    {new Date(reset.date).toLocaleDateString('pt-BR', {
                      weekday: 'long',
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </Text>
                  <Text style={styles.resetDetailFullTime}>
                    Às {formatTime(reset.date)}
                  </Text>
                  
                 
                  <View style={styles.progressInfo}>
                    <View style={styles.progressItem}>
                      <Calendar size={16} color="#ffffff" />
                      <Text style={styles.progressText}>
                        {reset.daysCompleted || 0} dia{(reset.daysCompleted || 0) !== 1 ? 's' : ''} completados
                      </Text>
                    </View>
                    
                   
                    {reset.badgeName ? (
                      <View style={styles.progressItem}>
                        <Trophy size={16} color="#fbbf24" />
                        <Text style={styles.badgeText}>
                          {reset.badgeEmoji} {reset.badgeName}
                        </Text>
                        {reset.badgeCategory && (
                          <Text style={styles.badgeCategoryText}>
                            • {reset.badgeCategory}
                          </Text>
                        )}
                      </View>
                    ) : (
                      <View style={styles.progressItem}>
                        <Trophy size={16} color="#6b7280" />
                        <Text style={styles.noBadgeText}>
                          Nenhuma conquista alcançada
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                
                {index < resets.length - 1 && (
                  <View style={styles.resetDetailSeparator} />
                )}
              </View>
            ))}
            
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>Resumo do Dia</Text>
              <Text style={styles.summaryText}>Total de resets: {resets.length}</Text>
              <Text style={styles.summaryText}>
                Total de dias perdidos: {getTotalDaysLost()}
              </Text>
              {resets.length > 1 && (
                <Text style={styles.summaryText}>
                  Intervalo: {formatTime(resets[0].date)} - {formatTime(resets[resets.length - 1].date)}
                </Text>
              )}
              
              
              <View style={styles.badgesSummary}>
                <Text style={styles.badgesSummaryTitle}>🏆 Conquistas Perdidas:</Text>
                {resets
                  .filter(reset => reset.badgeName)
                  .map((reset, index) => (
                    <Text key={index} style={styles.badgesSummaryItem}>
                      {reset.badgeEmoji} {reset.badgeName} ({reset.daysCompleted} dias)
                    </Text>
                  ))
                }
                {resets.filter(reset => reset.badgeName).length === 0 && (
                  <Text style={styles.noBadgesLost}>Nenhuma conquista foi perdida</Text>
                )}
              </View>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
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
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  detailsContainer: {
    backgroundColor: '#171a18ff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.32)',
  },
  detailsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'center',
  },
  resetDetailItem: {
    marginBottom: 16,
  },
  resetDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resetDetailNumber: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ef4444',
  },
  resetDetailTime: {
    fontSize: 18,
    fontFamily: 'RobotoMono-Bold',
    color: '#ef4444',
  },
  resetDetailInfo: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.54)',
  },
  resetDetailDate: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
    marginBottom: 4,
  },
  resetDetailFullTime: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#fff',
    marginBottom: 12,
  },
  progressInfo: {
    marginTop: 8,
    gap: 8,
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#fff',
  },
  badgeText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#fbbf24',
  },
  badgeCategoryText: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#d1d5db',
    marginLeft: 4,
  },
  noBadgeText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#6b7280',
    fontStyle: 'italic',
  },
  resetDetailSeparator: {
    height: 1,
    backgroundColor: 'rgba(62, 35, 35, 0.27)',
    marginTop: 16,
  },
  summaryContainer: {
    marginTop: 20,
    backgroundColor: '#0c131f4b',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#35445bff',
  },
  summaryTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
    marginBottom: 4,
  },
  badgesSummary: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#3b83f628',
  },
  badgesSummaryTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#fbbf24',
    marginBottom: 8,
  },
  badgesSummaryItem: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
    marginBottom: 4,
    marginLeft: 8,
  },
  noBadgesLost: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#6b7280',
    fontStyle: 'italic',
    marginLeft: 8,
  },
});