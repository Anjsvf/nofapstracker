import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import { Play } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface StartButtonProps {
  onPress: () => void;
}

export function StartButton({ onPress }: StartButtonProps) {
  const screenWidth = Dimensions.get('window').width;
  const isSmallDevice = screenWidth < 360;
  
  const buttonSize = isSmallDevice ? 100 : 120;
  const iconSize = isSmallDevice ? 32 : 40;
  const fontSize = isSmallDevice ? 12 : 14;

  // Animações de batimento cardíaco
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animação de batimento suave (como coração)
    const heartbeat = Animated.loop(
      Animated.sequence([
        // Primeira batida
        Animated.timing(scaleAnim, {
          toValue: 1.08,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        // Segunda batida (mais suave)
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 120,
          useNativeDriver: true,
        }),
        // Pausa entre ciclos
        Animated.delay(800),
      ])
    );

    // Animação de brilho pulsante
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );

    heartbeat.start();
    glow.start();

    return () => {
      heartbeat.stop();
      glow.stop();
    };
  }, []);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.overlay}>
      {/* Efeito de brilho pulsante */}
      <Animated.View
        style={[
          styles.glowRing,
          {
            width: buttonSize + 20,
            height: buttonSize + 20,
            borderRadius: (buttonSize + 20) / 2,
            opacity: glowOpacity,
          },
        ]}
      />
      
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
        }}
      >
        <TouchableOpacity 
          style={[
            styles.circularButton,
            {
              width: buttonSize,
              height: buttonSize,
              borderRadius: buttonSize / 2,
            }
          ]}
          onPress={onPress}
          activeOpacity={0.85}
        >
          <ExpoLinearGradient
            colors={['#10b981', '#059669', '#047857']}
            style={[
              styles.buttonGradient,
              {
                width: buttonSize,
                height: buttonSize,
                borderRadius: buttonSize / 2,
              }
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Play size={iconSize} color="#ffffff" fill="#ffffff" />
            <Text style={[styles.buttonText, { fontSize }]}>INICIAR</Text>
          </ExpoLinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    backgroundColor: '#10b981',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 8,
  },
  circularButton: {
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  buttonGradient: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#6ee7b7',
  },
  buttonText: {
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginTop: 4,
    letterSpacing: 1.5,
  },
});