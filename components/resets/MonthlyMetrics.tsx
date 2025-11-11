import { ResetHistoryEntry } from '@/types';
import { BarChart3, Calendar, TrendingDown, TrendingUp } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getShift } from './getShift/getShift';

interface MonthlyMetricsProps {
  date: Date;
  allResets: ResetHistoryEntry[];
}

export function MonthlyMetrics({ date, allResets }: MonthlyMetricsProps) {
  const currentYear = date.getFullYear();
  const currentMonth = date.getMonth();
  

  const monthlyResets = allResets.filter(reset => {
    const resetDate = new Date(reset.date);
    return resetDate.getFullYear() === currentYear && resetDate.getMonth() === currentMonth;
  });

 
  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const previousMonthResets = allResets.filter(reset => {
    const resetDate = new Date(reset.date);
    return resetDate.getFullYear() === previousYear && resetDate.getMonth() === previousMonth;
  });

 
  const totalResets = monthlyResets.length;
  const totalDaysLost = monthlyResets.reduce((total, reset) => total + (reset.daysCompleted || 0), 0);
  const averageDaysLost = totalResets > 0 ? Math.round(totalDaysLost / totalResets) : 0;


  const previousMonthTotal = previousMonthResets.length;
  const percentageChange = previousMonthTotal > 0 
    ? ((totalResets - previousMonthTotal) / previousMonthTotal * 100)
    : totalResets > 0 ? 100 : 0;

 
  const getWeekOfMonth = (date: Date) => Math.ceil(date.getDate() / 7);
  const weeklyDistribution = Array.from({ length: 4 }, (_, i) => ({
    week: i + 1,
    count: monthlyResets.filter(reset => getWeekOfMonth(new Date(reset.date)) === i + 1).length
  }));

 
  const maxWeeklyCount = Math.max(...weeklyDistribution.map(w => w.count), 1);

 
  const shiftAnalysis = monthlyResets.reduce((acc, reset) => {
    const hour = new Date(reset.date).getHours();
    const shift = getShift(hour);
    if (!acc[shift.name]) {
      acc[shift.name] = { ...shift, count: 0 };
    }
    acc[shift.name].count++;
    return acc;
  }, {} as Record<string, { name: string; emoji: string; color: string; count: number }>);

  const shiftEntries = Object.values(shiftAnalysis).sort((a, b) => b.count - a.count);
  const dominantShift = shiftEntries[0]?.name || 'N/A';


  const dayOfWeekAnalysis = Array.from({ length: 7 }, (_, i) => ({
    day: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][i],
    count: monthlyResets.filter(reset => new Date(reset.date).getDay() === i).length
  }));

  const worstDay = dayOfWeekAnalysis.reduce((max, day) => 
    day.count > max.count ? day : max, dayOfWeekAnalysis[0]
  );

 
  const getAverageFrequency = () => {
    if (monthlyResets.length <= 1) return 'N/A';
    const sorted = [...monthlyResets].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let totalDays = 0;
    for (let i = 1; i < sorted.length; i++) {
      const diffMs = new Date(sorted[i].date).getTime() - new Date(sorted[i - 1].date).getTime();
      totalDays += diffMs / (1000 * 60 * 60 * 24);
    }
    const avgDays = Math.round(totalDays / (sorted.length - 1));
    return avgDays === 1 ? '1 dia' : `${avgDays} dias`;
  };

  const monthName = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Métricas de {monthName}</Text>
      
      
      <View style={styles.statsGrid}>
        <StatCard
          title="Total de Resets"
          value={totalResets.toString()}
          icon={<BarChart3 color="#ef4444" size={16} />}
          color="#ef4444"
          subtitle={previousMonthTotal > 0 ? 
            `${percentageChange > 0 ? '+' : ''}${percentageChange.toFixed(0)}% vs mês anterior` : 
            'Primeiro mês registrado'
          }
          trend={percentageChange > 0 ? 'up' : percentageChange < 0 ? 'down' : 'neutral'}
        />
        
        <StatCard
          title="Dias Perdidos"
          value={totalDaysLost.toString()}
          icon={<Calendar color="#f59e0b" size={16} />}
          color="#f59e0b"
          subtitle={`Média: ${averageDaysLost} dias/reset`}
        />
        
        {/* <StatCard
          title="Frequência Média"
          value={getAverageFrequency()}
          icon={<Clock color="#3b82f6" size={16} />}
          color="#3b82f6"
          subtitle="Intervalo entre resets"
        /> */}
      </View>

      {/* Análises detalhadas */}
      {totalResets > 0 && (
        <>
          {/* Distribuição semanal - VERSÃO COMPACTA */}
          <View style={styles.analysisSection}>
            <Text style={styles.sectionTitle}>Distribuição Semanal</Text>
            <View style={styles.weeklyCompactGrid}>
              {weeklyDistribution.map((week) => {
                const barHeight = Math.max((week.count / maxWeeklyCount) * 40, 4);
                return (
                  <View key={week.week} style={styles.weekCompactItem}>
                    <Text style={styles.weekCompactLabel}>S{week.week}</Text>
                    <View style={styles.weekCompactBarContainer}>
                      <View 
                        style={[
                          styles.weekCompactBar, 
                          { 
                            height: barHeight,
                            backgroundColor: week.count > 0 ? '#3b82f6' : '#64748b'
                          }
                        ]} 
                      />
                    </View>
                    <Text style={styles.weekCompactCount}>{week.count}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Análise por dias da semana */}
          <View style={styles.analysisSection}>
            <Text style={styles.sectionTitle}>Padrão por Dia da Semana</Text>
            <Text style={styles.insightText}>
              Pior dia: <Text style={styles.highlightText}>{worstDay.day}</Text> ({worstDay.count} resets)
            </Text>
            <View style={styles.dayOfWeekGrid}>
              {dayOfWeekAnalysis.map((day) => (
                <View key={day.day} style={styles.dayOfWeekItem}>
                  <Text style={[styles.dayOfWeekLabel, 
                    day.count === worstDay.count && worstDay.count > 0 ? styles.worstDayLabel : {}
                  ]}>
                    {day.day}
                  </Text>
                  <View style={[styles.dayOfWeekDot, {
                    backgroundColor: day.count === 0 ? '#22c55e' : 
                                   day.count <= 2 ? '#f59e0b' : '#ef4444',
                    opacity: day.count === 0 ? 0.3 : 1
                  }]} />
                  <Text style={styles.dayOfWeekCount}>{day.count}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Análise por turnos se houver dados */}
          {shiftEntries.length > 0 && (
            <View style={styles.analysisSection}>
              <Text style={styles.sectionTitle}>Análise por Turno</Text>
              <Text style={styles.insightText}>
                Turno predominante: <Text style={styles.highlightText}>{dominantShift}</Text>
              </Text>
              <View style={styles.shiftGrid}>
                {shiftEntries.map((shift) => (
                  <View key={shift.name} style={styles.shiftItem}>
                    <Text style={styles.shiftEmoji}>{shift.emoji}</Text>
                    <Text style={[styles.shiftName, { color: shift.color }]}>{shift.name}</Text>
                    <Text style={styles.shiftCount}>{shift.count}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Resumo de insights */}
          <View style={styles.insightsSection}>
            <Text style={styles.sectionTitle}>Insights do Mês</Text>
            <View style={styles.insightsList}>
              <Text style={styles.insightItem}>
                • {totalResets === 1 ? 'Houve apenas 1 reset' : `Total de ${totalResets} resets`} neste mês
              </Text>
              {averageDaysLost > 0 && (
                <Text style={styles.insightItem}>
                  • Média de {averageDaysLost} dias de progresso perdidos por reset
                </Text>
              )}
              {worstDay.count > 0 && (
                <Text style={styles.insightItem}>
                  • {worstDay.day} foi o dia da semana mais problemático ({worstDay.count} resets)
                </Text>
              )}
              {dominantShift !== 'N/A' && (
                <Text style={styles.insightItem}>
                  • A maioria dos resets ocorreu no turno da {dominantShift.toLowerCase()}
                </Text>
              )}
              {percentageChange !== 0 && previousMonthTotal > 0 && (
                <Text style={[styles.insightItem, {
                  color: percentageChange > 0 ? '#ef4444' : '#22c55e'
                }]}>
                  • {percentageChange > 0 ? 'Aumento' : 'Redução'} de {Math.abs(percentageChange).toFixed(0)}% 
                  comparado ao mês anterior
                </Text>
              )}
            </View>
          </View>
        </>
      )}

      {totalResets === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>🎉 Parabéns! Nenhum reset registrado neste mês</Text>
          <Text style={styles.emptyStateSubtext}>Continue mantendo o foco e a disciplina!</Text>
        </View>
      )}
    </View>
  );
}

// Componente auxiliar para cards de estatística
const StatCard = ({
  title,
  value,
  icon,
  color,
  subtitle,
  trend
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
}) => (
  <View style={[styles.statCard, { borderColor: color + '40' }]}>
    <View style={styles.statHeader}>
      <View style={[styles.statIconBg, { backgroundColor: color + '20' }]}>
        {icon}
      </View>
      {trend && trend !== 'neutral' && (
        <View style={styles.trendIcon}>
          {trend === 'up' ? 
            <TrendingUp size={12} color={trend === 'up' ? '#ef4444' : '#22c55e'} /> :
            <TrendingDown size={12} color="#22c55e" />
          }
        </View>
      )}
    </View>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{title}</Text>
    {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: {
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
  title: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#00000070',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  statIconBg: {
    padding: 6,
    borderRadius: 8,
  },
  trendIcon: {
    marginLeft: 4,
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: '#94a3b8',
    textAlign: 'center',
  },
  statSubtitle: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    textAlign: 'center',
    marginTop: 2,
  },
  analysisSection: {
    marginBottom: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  insightText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#94a3b8',
    marginBottom: 12,
  },
  highlightText: {
    color: '#ffffff',
    fontFamily: 'Inter-Bold',
  },
  
  // Estilos compactos para distribuição semanal
  weeklyCompactGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 60, // Reduzido de 80 para 60
    paddingHorizontal: 8,
  },
  weekCompactItem: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 2,
  },
  weekCompactLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#94a3b8',
    marginBottom: 4,
  },
  weekCompactBarContainer: {
    width: 20,
    height: 40,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 4,
  },
  weekCompactBar: {
    width: 16,
    borderRadius: 2,
    minHeight: 4,
  },
  weekCompactCount: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  
  dayOfWeekGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  dayOfWeekItem: {
    alignItems: 'center',
    flex: 1,
  },
  dayOfWeekLabel: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: '#94a3b8',
    marginBottom: 6,
  },
  worstDayLabel: {
    color: '#ef4444',
    fontFamily: 'Inter-Bold',
  },
  dayOfWeekDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  dayOfWeekCount: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  shiftGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  shiftItem: {
    flex: 1,
    minWidth: 80,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: 10,
  },
  shiftEmoji: {
    fontSize: 16,
    marginBottom: 4,
  },
  shiftName: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 2,
  },
  shiftCount: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  insightsSection: {
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  insightsList: {
    gap: 8,
  },
  insightItem: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#cbd5e1',
    lineHeight: 18,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#22c55e',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#94a3b8',
    textAlign: 'center',
  },
});