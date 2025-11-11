import { BlurView } from 'expo-blur';
import React from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AlertButton {
  text: string;
  onPress: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  buttons?: AlertButton[];
  onClose: () => void;
}

export function CustomAlert({
  visible,
  title,
  message,
  buttons = [{ text: 'OK', onPress: () => {}, style: 'default' }],
  onClose,
}: CustomAlertProps) {
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { paddingTop: insets.top }]}>
        <BlurView intensity={Platform.OS === 'ios' ? 25 : 30} tint="dark" style={styles.blur}>
          <View style={styles.alertContainer}>
            <View style={styles.content}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>
            </View>

            <View style={styles.buttonContainer}>
              {buttons.map((button, index) => (
                <Pressable
                  key={index}
                  android_ripple={{ color: 'rgba(255,255,255,0.1)' }}
                  onPress={() => {
                    button.onPress();
                    onClose();
                  }}
                  style={({ pressed }) => [
                    styles.button,
                    button.style === 'cancel' && styles.cancelButton,
                    button.style === 'destructive' && styles.destructiveButton,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      button.style === 'cancel' && styles.cancelButtonText,
                      button.style === 'destructive' && styles.destructiveButtonText,
                    ]}
                  >
                    {button.text}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </BlurView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  blur: {
    width: '85%',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  alertContainer: {
    backgroundColor: '#000',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    padding: 28,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  message: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#cbd5e1',
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  button: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  destructiveButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.08)',
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#00ff84',
    letterSpacing: 0.3,
  },
  cancelButtonText: {
    color: '#ef1616ff',
  },
  destructiveButtonText: {
    color: '#ef4444',
  },
});
