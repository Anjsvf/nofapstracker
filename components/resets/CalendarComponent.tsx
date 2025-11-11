import { ResetHistoryEntry } from '@/types'
import React, { useCallback } from 'react'
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native'

interface CalendarComponentProps {
  currentDate: Date
  resetHistory: ResetHistoryEntry[]
  startDate?: Date | null
  isRunning?: boolean 
  onDatePress: (date: Date) => void
  onMonthNavigate: (direction: 'prev' | 'next') => void
  isLoading?: boolean
}

export function CalendarComponent({
  currentDate,
  resetHistory,
  startDate,
  isRunning = true, 
  onDatePress,
  onMonthNavigate,
  isLoading = false,
}: CalendarComponentProps) {
  const monthNames = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ]

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  const getDaysInMonth = useCallback((date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }, [])

  const getFirstDayOfMonth = useCallback((date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
    return firstDay.getDay()
  }, [])

  const getResetsForDate = useCallback(
    (date: Date) => {
      return resetHistory.filter((reset) => {
        const resetDate = new Date(reset.date)
        return (
          resetDate.getDate() === date.getDate() &&
          resetDate.getMonth() === date.getMonth() &&
          resetDate.getFullYear() === date.getFullYear()
        )
      })
    },
    [resetHistory]
  )

  const isResetDay = useCallback(
    (date: Date) => {
      return getResetsForDate(date).length > 0
    },
    [getResetsForDate]
  )

  const getResetCountForDate = useCallback(
    (date: Date) => {
      return getResetsForDate(date).length
    },
    [getResetsForDate]
  )

  const isToday = useCallback((date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }, [])

  const isFutureDate = useCallback((date: Date) => {
    const today = new Date()
    today.setHours(23, 59, 59, 999)
    return date > today
  }, [])

  
  const isActiveDay = useCallback((date: Date) => {
    const dateDay = new Date(date)
    dateDay.setHours(0, 0, 0, 0)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const daysMs = 24 * 60 * 60 * 1000

   
    if (isRunning && startDate) {
      const startDay = new Date(startDate)
      startDay.setHours(0, 0, 0, 0)
      if (dateDay >= startDay && dateDay <= today) {
        return true
      }
    }

    
    for (const reset of resetHistory) {
      if (reset.daysCompleted == null || reset.daysCompleted <= 0) continue
      const resetDay = new Date(reset.date)
      resetDay.setHours(0, 0, 0, 0)
      const approxStartDay = new Date(resetDay.getTime() - reset.daysCompleted * daysMs)
      approxStartDay.setHours(0, 0, 0, 0)
      if (dateDay >= approxStartDay && dateDay < resetDay) {
        return true
      }
    }

    return false
  }, [isRunning, startDate, resetHistory])

  const renderCalendarDays = useCallback(() => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days: React.ReactNode[] = []

    for (let i = 0; i < firstDay; i++) {
      days.push(
        <View
          key={`empty-start-${i}`}
          style={[styles.dayCell, styles.emptyCell]}
        />
      )
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      )
      const isReset = isResetDay(date)
      const resetCount = getResetCountForDate(date)
      const isTodayDate = isToday(date)
      const isFuture = isFutureDate(date)
      const isActive = isActiveDay(date)

      const dayStyle: (ViewStyle | any)[] = [styles.dayCell]
      const textStyle: (TextStyle | any)[] = [styles.dayText]

      if (isFuture) {
        dayStyle.push(styles.futureDayCell)
        textStyle.push(styles.futureDayText)
      } else if (isReset) {
        dayStyle.push(styles.resetDayCell)
        textStyle.push(styles.resetDayText)
      } else if (isActive) {
        dayStyle.push(styles.cleanDayCell)
        textStyle.push(styles.cleanDayText)
      } else {
        dayStyle.push(styles.beforeStartDayCell)
        textStyle.push(styles.beforeStartDayText)
      }

      if (isTodayDate && !isFuture && isActive) {
        dayStyle.push(styles.todayBorder)
      }

      days.push(
        <TouchableOpacity
          key={day}
          style={dayStyle}
          onPress={() => onDatePress(date)}
          disabled={isFuture} 
        >
          <Text style={textStyle}>{day}</Text>
          {isReset && resetCount > 1 && (
            <View style={styles.resetCountBadge}>
              <Text style={styles.resetCountText}>{resetCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      )
    }

    const totalCells = firstDay + daysInMonth
    const remaining = 7 - (totalCells % 7)
    if (remaining < 7) {
      for (let i = 0; i < remaining; i++) {
        days.push(
          <View
            key={`empty-end-${i}`}
            style={[styles.dayCell, styles.emptyCell]}
          />
        )
      }
    }
    return days
  }, [
    currentDate,
    getDaysInMonth,
    getFirstDayOfMonth,
    isResetDay,
    getResetCountForDate,
    isToday,
    isFutureDate,
    isActiveDay, 
    onDatePress,
  ])

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando calendário...</Text>
      </View>
    )
  }

  return (
    <View style={styles.calendarContainer}>
      <View style={styles.monthHeader}>
        <TouchableOpacity
          onPress={() => onMonthNavigate('prev')}
          style={styles.monthNavButton}
        >
          <Text style={styles.monthNavText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthTitle}>
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </Text>
        <TouchableOpacity
          onPress={() => onMonthNavigate('next')}
          style={styles.monthNavButton}
        >
          <Text style={styles.monthNavText}>›</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.weekDaysContainer}>
        {weekDays.map((day) => (
          <Text key={day} style={styles.weekDayText}>
            {day}
          </Text>
        ))}
      </View>
      <View style={styles.calendarGrid}>{renderCalendarDays()}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  calendarContainer: {
    backgroundColor: 'rgba(0, 0, 0, 1)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthNavButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    minWidth: 40,
    alignItems: 'center',
  },
  monthNavText: {
    color: '#ffffff',
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  monthTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
    paddingVertical: 6,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    position: 'relative',
    marginVertical: 2,
  },
  emptyCell: {
    backgroundColor: 'transparent',
  },
  dayText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
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
    borderColor: 'rgba(48, 23, 23, 0.5)',
  },
  beforeStartDayText: {
    color: '#000',
  },
  todayBorder: {
    borderWidth: 2,
    borderColor: '#fff',
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
  loadingContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
})