import React from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { StartButton } from '../timer/StartButton';

interface TimerDisplayProps {
  currentDayElapsed: number;
  totalElapsed: number;
  isRunning: boolean;
  progress: number;
  onStartPress: () => void;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function TimerDisplay({ 
  currentDayElapsed, 
  totalElapsed, 
  isRunning, 
  progress,
  onStartPress 
}: TimerDisplayProps) {
  const animatedValue = React.useRef(new Animated.Value(0)).current;
  
  // Responsividade baseada no tamanho da tela
  const screenWidth = Dimensions.get('window').width;
  const isSmallDevice = screenWidth < 360;
  const isMediumDevice = screenWidth >= 360 && screenWidth < 400;
  
  // Ajusta tamanhos baseado no dispositivo
  const size = isSmallDevice ? 200 : 220;
  const strokeWidth = isSmallDevice ? 10 : 12;
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

  // Estilos dinâmicos baseados no tamanho do dispositivo
  const dynamicStyles = {
    glowEffect: {
      width: size + 20,
      height: size + 20,
      borderRadius: (size + 20) / 2,
    },
    timerContent: {
      width: size - 40,
      height: size - 40,
    },
    timerText: {
      fontSize: isSmallDevice ? 24 : isMediumDevice ? 26 : 28,
    },
    statusDot: {
      width: isSmallDevice ? 6 : 8,
      height: isSmallDevice ? 6 : 8,
      borderRadius: isSmallDevice ? 3 : 4,
    },
    statusLabel: {
      fontSize: isSmallDevice ? 10 : 12,
    },
    totalTimeLabel: {
      fontSize: isSmallDevice ? 9 : 10,
    },
    totalTimeText: {
      fontSize: isSmallDevice ? 12 : 14,
    },
    progressText: {
      fontSize: isSmallDevice ? 14 : 16,
    },
    progressLabel: {
      fontSize: isSmallDevice ? 9 : 10,
    },
  };

  return (
    <View style={styles.container}>
      <View style={styles.timerContainer}>
        <View style={[styles.glowEffect, dynamicStyles.glowEffect, { opacity: isRunning ? 0.3 : 0.1 }]} />
        
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

        {/* Botão de Iniciar - Componente separado */}
        {!isRunning && <StartButton onPress={onStartPress} />}

        {/* Conteúdo do Timer - Só aparece quando está rodando */}
        {isRunning && (
          <View style={[styles.timerContent, dynamicStyles.timerContent]}>
            <View style={styles.timeContainer}>
              <Text 
                style={[styles.timerText, { fontSize: dynamicStyles.timerText.fontSize }]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
              >
                {formatTime(currentDayElapsed)}
              </Text>
              <View style={styles.statusContainer}>
                <View style={[
                  styles.statusDot, 
                  dynamicStyles.statusDot,
                  { backgroundColor: '#72f605ff' }
                ]} />
                <Text style={[
                  styles.timerLabel, 
                  { 
                    fontSize: dynamicStyles.statusLabel.fontSize,
                    color: '#27f610ff'
                  }
                ]}>
                  Em Andamento
                </Text>
              </View>
            </View>
            
            <View style={styles.totalTimeContainer}>
              <Text style={[styles.totalTimeLabel, { fontSize: dynamicStyles.totalTimeLabel.fontSize }]}>
                Tempo Total
              </Text>
              <Text 
                style={[styles.totalTimeText, { fontSize: dynamicStyles.totalTimeText.fontSize }]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {formatTotalTime(totalElapsed)}
              </Text>
            </View>
            
            <View style={styles.progressContainer}>
              <Text style={[styles.progressText, { fontSize: dynamicStyles.progressText.fontSize }]}>
                {Math.round(progress * 100)}%
              </Text>
              <Text 
                style={[styles.progressLabel, { fontSize: dynamicStyles.progressLabel.fontSize }]}
                numberOfLines={1}
              >
                do dia completo
              </Text>
            </View>
          </View>
        )}
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
  },
  timeContainer: {
    alignItems: 'center',
    marginBottom: 6,
    width: '100%',
    paddingHorizontal: 4,
  },
  timerText: {
    fontFamily: 'RobotoMono-Bold',
    color: '#ffffff',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    marginRight: 4,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  timerLabel: {
    fontFamily: 'Inter-Medium',
  },
  totalTimeContainer: {
    alignItems: 'center',
    marginBottom: 6,
    paddingVertical: 3,
    paddingHorizontal: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    maxWidth: '90%',
  },
  totalTimeLabel: {
    fontFamily: 'Inter-Regular',
    color: '#999999',
    marginBottom: 1,
  },
  totalTimeText: {
    fontFamily: 'RobotoMono-SemiBold',
    color: '#ffffff',
  },
  progressContainer: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 4,
  },
  progressText: {
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  progressLabel: {
    fontFamily: 'Inter-Regular',
    color: '#cccccc',
    textAlign: 'center',
  },
});