import React from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

interface TimerDisplayProps {
  currentDayElapsed: number;
  totalElapsed: number;
  isRunning: boolean;
  progress: number;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function TimerDisplay({ 
  currentDayElapsed, 
  totalElapsed, 
  isRunning, 
  progress 
}: TimerDisplayProps) {
  const animatedValue = React.useRef(new Animated.Value(0)).current;
  const size = 220;
  const strokeWidth = 12;
  const center = size / 2;
  const radius = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: progress,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

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
      <View style={styles.timerContainer}>
       
        <View style={[styles.glowEffect, { opacity: isRunning ? 0.3 : 0.1 }]} />
        
       
        <Svg width={size} height={size} style={styles.progressRing}>
          <Defs>
            <LinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <Stop offset="50%" stopColor="#e5e5e5" stopOpacity="1" />
              <Stop offset="100%" stopColor="#d1d1d1" stopOpacity="1" />
            </LinearGradient>
            <LinearGradient id="backgroundGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#1a1a1a" stopOpacity="0.8" />
              <Stop offset="100%" stopColor="#333333" stopOpacity="0.6" />
            </LinearGradient>
          </Defs>
          
         
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke="url(#backgroundGradient)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          
         
          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius}
            stroke="url(#progressGradient)"
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            transform={`rotate(-90 ${center} ${center})`}
            opacity={isRunning ? 1 : 0.6}
          />
        </Svg>

        {/* Timer content */}
        <View style={styles.timerContent}>
          <View style={styles.timeContainer}>
            <Text style={styles.timerText}>
              {formatTime(currentDayElapsed)}
            </Text>
            <View style={styles.statusContainer}>
              <View style={[styles.statusDot, { 
                backgroundColor: isRunning ? '#72f605ff' : '#666666' 
              }]} />
              <Text style={[styles.timerLabel, {
                color: isRunning ? '#27f610ff' : '#666666'
              }]}>
                {isRunning ? 'Em Andamento' : 'Pausado'}
              </Text>
            </View>
          </View>
          
          {isRunning && (
            <View style={styles.totalTimeContainer}>
              <Text style={styles.totalTimeLabel}>Tempo Total</Text>
              <Text style={styles.totalTimeText}>
                {formatTotalTime(totalElapsed)}
              </Text>
            </View>
          )}
          
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {Math.round(progress * 100)}%
            </Text>
            <Text style={styles.progressLabel}>do dia completo</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  timerContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowEffect: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#1a1a1a',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 25,
    elevation: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  progressRing: {
    transform: [{ rotate: '0deg' }],
  },
  timerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 180,
    height: 180,
  },
  timeContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  timerText: {
    fontSize: 28,
    fontFamily: 'RobotoMono-Bold',
    color: '#ffffff',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  timerLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  totalTimeContainer: {
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  totalTimeLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#999999',
    marginBottom: 2,
  },
  totalTimeText: {
    fontSize: 14,
    fontFamily: 'RobotoMono-SemiBold',
    color: '#ffffff',
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  progressLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#cccccc',
    textAlign: 'center',
  },
});