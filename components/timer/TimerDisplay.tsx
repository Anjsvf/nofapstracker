import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface TimerDisplayProps {
  currentDayElapsed: number;
  totalElapsed: number;
  isRunning: boolean;
  progress: number;
}

export function TimerDisplay({ 
  currentDayElapsed, 
  totalElapsed, 
  isRunning, 
  progress 
}: TimerDisplayProps) {
  const formatTime = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatTotalTime = (milliseconds: number) => {
    const totalHours = Math.floor(milliseconds / (1000 * 60 * 60));
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    }
    return `${hours}h ${minutes}m`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.progressRing}>
        <View style={[styles.progressFill, { 
          transform: [{ rotate: `${progress * 360}deg` }] 
        }]} />
        <View style={styles.timerContent}>
          <Text style={styles.timerText}>
            {formatTime(currentDayElapsed)}
          </Text>
          <Text style={styles.timerLabel}>
            {isRunning ? 'Dia Atual' : 'Parado'}
          </Text>
          {isRunning && (
            <Text style={styles.totalTimeText}>
              Total: {formatTotalTime(totalElapsed)}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  progressRing: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 8,
    borderColor: '#4c3368',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  progressFill: {
    position: 'absolute',
    top: -4,
    left: -4,
    width: 208,
    height: 208,
    borderRadius: 104,
    borderWidth: 8,
    borderColor: 'transparent',
    borderTopColor: '#8b5cf6',
    transform: [{ rotate: '-90deg' }],
  },
  timerContent: {
    alignItems: 'center',
    zIndex: 1,
  },
  timerText: {
    fontSize: 24,
    fontFamily: 'RobotoMono-Bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  timerLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#a78bfa',
  },
  totalTimeText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#a78bfa',
    marginTop: 4,
  },
});