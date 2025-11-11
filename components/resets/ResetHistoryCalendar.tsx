import { CalendarComponent } from '@/components/resets/CalendarComponent';
import { CustomAlert } from '@/components/resets/CustomAlert/CustomAlert';
import { HistoryDetailsModal } from '@/components/resets/HistoryDetailsModal';
import { useTimer } from '@/hooks/useTimer';
import { StorageService } from '@/services/storageService';
import { ResetHistoryEntry } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar as CalendarIcon, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ResetHistoryCalendarProps {
  visible: boolean;
  onClose: () => void;
}

export function ResetHistoryCalendar({ visible, onClose }: ResetHistoryCalendarProps) {
  const insets = useSafeAreaInsets();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [resetHistory, setResetHistory] = useState<ResetHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailModal, setDetailModal] = useState({
    visible: false,
    date: null as Date | null,
    resets: [] as ResetHistoryEntry[]
  });
  const [alert, setAlert] = useState({
    visible: false,
    title: '',
    message: '',
  });

  // Integrate useTimer
  const { timerState } = useTimer();
  const startDate = timerState.startTime ? new Date(timerState.startTime) : null;

  const loadResetHistory = useCallback(async () => {
    if (!visible) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Loading reset history in calendar...');
      
      if (typeof StorageService.loadResetHistory !== 'function') {
        throw new Error('StorageService.loadResetHistory is not a function. Please check your StorageService implementation.');
      }
      
      const history = await StorageService.loadResetHistory();
      console.log('Loaded history:', history);
      
      setResetHistory(history || []);
    } catch (error: any) {
      console.error('Error loading reset history:', error);
      setError(error.message || 'Erro ao carregar histórico');
      setResetHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, [visible]);

  useEffect(() => {
    loadResetHistory();
  }, [loadResetHistory]);

  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  }, []);

  const showAlert = useCallback((title: string, message: string) => {
    setAlert({
      visible: true,
      title,
      message,
    });
  }, []);

  const handleDatePress = useCallback((date: Date) => {
    const isFutureDate = (dateToCheck: Date) => {
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      return dateToCheck > today;
    };

    if (isFutureDate(date)) return; // Apenas bloqueia dias futuros
    
    const resets = resetHistory.filter(reset => {
      const resetDate = new Date(reset.date);
      return (
        resetDate.getDate() === date.getDate() &&
        resetDate.getMonth() === date.getMonth() &&
        resetDate.getFullYear() === date.getFullYear()
      );
    });

    if (resets.length > 0) {
      setDetailModal({
        visible: true,
        date,
        resets: resets.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      });
    } else {
      showAlert(
        'Dia Limpo',
        `Nenhum reset registrado em ${date.toLocaleDateString('pt-BR')}`
      );
    }
  }, [resetHistory, showAlert]);

  const closeDetailModal = useCallback(() => {
    setDetailModal({
      visible: false,
      date: null,
      resets: []
    });
  }, []);

  const totalResets = resetHistory.length;
  const currentMonthResets = resetHistory.filter(reset => {
    const resetDate = new Date(reset.date);
    return (
      resetDate.getMonth() === currentDate.getMonth() &&
      resetDate.getFullYear() === currentDate.getFullYear()
    );
  }).length;

  if (!visible) return null;

  return (
    <>
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <LinearGradient
          colors={["#000000","#000000"]}
          style={[styles.container, { paddingTop: insets.top + 20 }]}
        >
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <CalendarIcon size={24} color="#ffffff" />
              <Text style={styles.title}>Histórico de Resets</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={loadResetHistory} style={styles.retryButton}>
                <Text style={styles.retryButtonText}>Tentar Novamente</Text>
              </TouchableOpacity>
            </View>
          )}

          <ScrollView
            style={styles.content}
            contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
            showsVerticalScrollIndicator={false}
          >
            <CalendarComponent
              currentDate={currentDate}
              resetHistory={resetHistory}
              startDate={startDate}
              isRunning={timerState.isRunning} // Nova prop passada
              onDatePress={handleDatePress}
              onMonthNavigate={navigateMonth}
              isLoading={isLoading}
            />

            <View style={styles.legendContainer}>
              <Text style={styles.legendTitle}>Legenda:</Text>
              <View style={styles.legendRow}>
                <View style={[styles.legendItem, styles.cleanDayCell]}>
                  <Text style={[styles.legendText, styles.cleanDayText]}>15</Text>
                </View>
                <Text style={styles.legendLabel}>Dias sem reset (streak ativo)</Text>
              </View>
              <View style={styles.legendRow}>
                <View style={[styles.legendItem, styles.resetDayCell]}>
                  <Text style={[styles.legendText, styles.resetDayText]}>15</Text>
                </View>
                <Text style={styles.legendLabel}>Dias com reset</Text>
              </View>
              <View style={styles.legendRow}>
                <View style={[styles.legendItem, styles.resetDayCell]}>
                  <Text style={[styles.legendText, styles.resetDayText]}>15</Text>
                  <View style={styles.resetCountBadge}>
                    <Text style={styles.resetCountText}>3</Text>
                  </View>
                </View>
                <Text style={styles.legendLabel}>Múltiplos resets no dia</Text>
              </View>
              <View style={styles.legendRow}>
                <View style={[styles.legendItem, styles.futureDayCell]}>
                  <Text style={[styles.legendText, styles.futureDayText]}>15</Text>
                </View>
                <Text style={styles.legendLabel}>Dias futuros</Text>
              </View>
              <View style={styles.legendRow}>
                <View style={[styles.legendItem, styles.beforeStartDayCell]}>
                  <Text style={[styles.legendText, styles.beforeStartDayText]}>15</Text>
                </View>
                <Text style={styles.legendLabel}>Fora do período de tracking</Text>
              </View>
            </View>
          </ScrollView>
        </LinearGradient>
      </Modal>

      <HistoryDetailsModal
        visible={detailModal.visible}
        date={detailModal.date}
        resets={detailModal.resets}
        allResets={resetHistory}
        onClose={closeDetailModal}
      />

      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        buttons={[
          {
            text: 'OK',
            onPress: () => {},
            style: 'default'
          }
        ]}
        onClose={() => setAlert({ visible: false, title: '', message: '' })}
      />
    </>
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
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    color: '#ef4444',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    minWidth: 120,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
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
    color: '#fff',
    textAlign: 'center',
  },
  debugButton: {
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    borderColor: 'rgba(255, 193, 7, 0.5)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  debugButtonText: {
    color: '#ffc107',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  legendContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.98)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  legendTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
    marginBottom: 12,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendItem: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginRight: 12,
    position: 'relative',
  },
  legendText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  legendLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#ffffff',
    flex: 1,
  },
  cleanDayCell: {
    backgroundColor: 'rgba(34, 197, 94, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.5)',
  },
  cleanDayText: {
    color: '#22c55e',
  },
  resetDayCell: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.5)',
  },
  resetDayText: {
    color: '#ef4444',
  },
  futureDayCell: {
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
  },
  futureDayText: {
    color: '#6b7280',
  },
  beforeStartDayCell: {
    backgroundColor: '#ffffff71',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  beforeStartDayText: {
    color: '#000',
  },
  resetCountBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ef4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  resetCountText: {
    color: '#ffffff',
    fontSize: 10,
    fontFamily: 'Inter-Bold',
  },
});