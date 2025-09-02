import { Mic, Square, Trash2, Volume2 } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { formatDuration } from '../../utils/helpers';

interface RecordingUIProps {
  isVisible: boolean;
  duration: number;
  onCancel: () => void;
  onStop: () => void;
}

const { width, height } = Dimensions.get('window');

export const RecordingUI: React.FC<RecordingUIProps> = ({
  isVisible,
  duration,
  onCancel,
  onStop,
}) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim1 = useRef(new Animated.Value(1)).current;
  const waveAnim2 = useRef(new Animated.Value(1)).current;
  const waveAnim3 = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      // Animação de entrada
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();

   
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

    
      const waveAnimation = (anim: Animated.Value, delay: number) => {
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(anim, {
              toValue: 1.5,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0.5,
              duration: 600,
              useNativeDriver: true,
            }),
          ])
        ).start();
      };

      waveAnimation(waveAnim1, 0);
      waveAnimation(waveAnim2, 200);
      waveAnimation(waveAnim3, 400);

     
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      
      pulseAnim.setValue(1);
      waveAnim1.setValue(1);
      waveAnim2.setValue(1);
      waveAnim3.setValue(1);
      glowAnim.setValue(0);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <Animated.View
      style={[
        styles.recordingContainer,
        {
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [100, 0],
              }),
            },
          ],
          opacity: slideAnim,
        },
      ]}
    >
     
      <View style={styles.backgroundBlur} />
      
    
      <Animated.View 
        style={[
          styles.glowEffect,
          { opacity: glowOpacity }
        ]} 
      />

      <View style={styles.recordingContent}>
        {/* Seção de informações de gravação */}
        <View style={styles.recordingInfo}>
          {/* Ícone de microfone com pulso */}
          <View style={styles.microphoneContainer}>
            <Animated.View
              style={[
                styles.recordingIndicator,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              <Mic size={16} color="#ffffff" />
            </Animated.View>
            
            {/* Ondas sonoras animadas */}
            <View style={styles.soundWaves}>
              <Animated.View
                style={[
                  styles.waveRing,
                  styles.waveRing1,
                  { transform: [{ scale: waveAnim1 }] }
                ]}
              />
              <Animated.View
                style={[
                  styles.waveRing,
                  styles.waveRing2,
                  { transform: [{ scale: waveAnim2 }] }
                ]}
              />
              <Animated.View
                style={[
                  styles.waveRing,
                  styles.waveRing3,
                  { transform: [{ scale: waveAnim3 }] }
                ]}
              />
            </View>
          </View>

          {/* Informações textuais */}
          <View style={styles.textInfo}>
            <View style={styles.statusContainer}>
              <Volume2 size={14} color="#ef4444" />
              <Text style={styles.recordingText}>Gravando</Text>
            </View>
            <Text style={styles.recordingDuration}>
              {formatDuration(duration)}
            </Text>
          </View>
        </View>

        {/* Botões de ação */}
        <View style={styles.recordingButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.cancelButton]} 
            onPress={onCancel}
            activeOpacity={0.8}
          >
            <View style={styles.buttonIconContainer}>
              <Trash2 size={20} color="#ffffff" />
            </View>
            <Text style={styles.buttonLabel}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.stopButton]} 
            onPress={onStop}
            activeOpacity={0.8}
          >
            <View style={styles.buttonIconContainer}>
              <Square size={18} color="#ffffff" />
            </View>
            <Text style={styles.buttonLabel}>Enviar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Indicador de nível de som */}
      <View style={styles.levelIndicator}>
        <View style={styles.levelBars}>
          {[...Array(12)].map((_, index) => (
            <Animated.View
              key={index}
              style={[
                styles.levelBar,
                {
                  height: Math.random() * 20 + 8,
                  opacity: Math.random() * 0.8 + 0.2,
                  transform: [{ 
                    scaleY: waveAnim1.interpolate({
                      inputRange: [0.5, 1.5],
                      outputRange: [0.3, 1],
                    })
                  }]
                }
              ]}
            />
          ))}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  recordingContainer: {
    borderRadius: 24,
    marginBottom: 16,
    padding: width * 0.05,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 120,
  },
  backgroundBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 15, 15, 0.95)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  glowEffect: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 26,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#ef4444',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  recordingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  recordingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  microphoneContainer: {
    position: 'relative',
    marginRight: width * 0.04,
  },
  recordingIndicator: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 6,
    zIndex: 2,
  },
  soundWaves: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveRing: {
    position: 'absolute',
    borderWidth: 1,
    borderRadius: 50,
    borderColor: '#ef4444',
  },
  waveRing1: {
    width: 60,
    height: 60,
    opacity: 0.6,
  },
  waveRing2: {
    width: 76,
    height: 76,
    opacity: 0.4,
  },
  waveRing3: {
    width: 92,
    height: 92,
    opacity: 0.2,
  },
  textInfo: {
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  recordingText: {
    fontSize: width * 0.04,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
    marginLeft: 6,
  },
  recordingDuration: {
    fontSize: width * 0.05,
    fontFamily: 'Inter-Bold',
    color: '#f59e0b',
    letterSpacing: 0.5,
  },
  recordingButtons: {
    flexDirection: 'column',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
  },
  cancelButton: {
    backgroundColor: '#dc2626',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  stopButton: {
    backgroundColor: '#059669',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonIconContainer: {
    marginRight: 6,
  },
  buttonLabel: {
    fontSize: width * 0.032,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
  },
  levelIndicator: {
    marginTop: 16,
    alignItems: 'center',
  },
  levelBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: 24,
  },
  levelBar: {
    width: 3,
    backgroundColor: '#ef4444',
    borderRadius: 1.5,
    minHeight: 4,
  },
});

