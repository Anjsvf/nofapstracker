import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import { Power } from 'lucide-react-native';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface StartButtonProps {
  onPress: () => void;
}

export function StartButton({ onPress }: StartButtonProps) {
  const screenWidth = Dimensions.get('window').width;
  const isSmallDevice = screenWidth < 360;
  
  const buttonSize = isSmallDevice ? 100 : 120;
  const iconSize = isSmallDevice ? 32 : 40;
  const fontSize = isSmallDevice ? 12 : 14;

  return (
    <View style={styles.overlay}>
      <TouchableOpacity 
        style={[
          styles.circularButton,
          { width: buttonSize, height: buttonSize, borderRadius: buttonSize / 2 }
        ]}
        onPress={onPress}
        activeOpacity={0.85}
      >
        <ExpoLinearGradient
          colors={['#000000ff', '#000000ff', '#000000ff']}
          style={[
            styles.buttonGradient,
            { width: buttonSize, height: buttonSize, borderRadius: buttonSize / 2 }
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
         <Power size={iconSize} color="#ffffff" strokeWidth={2.5} />
          <Text style={[styles.buttonText, { fontSize }]}>INICIAR</Text>
        </ExpoLinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularButton: {
    shadowColor: '#000000ff',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonGradient: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#010403ff',
  },
  buttonText: {
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginTop: 4,
    letterSpacing: 1.2,
  },
});