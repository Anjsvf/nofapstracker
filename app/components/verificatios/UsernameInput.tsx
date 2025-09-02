
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useUsernameValidation } from '../../../hooks/useUsernameValidation';

interface UsernameInputProps {
  value: string;
  onChangeText: (text: string) => void;
  isLoading?: boolean;
  onValidationChange?: (isValid: boolean) => void;
}

const { width } = Dimensions.get('window');

export const UsernameInput: React.FC<UsernameInputProps> = ({
  value,
  onChangeText,
  isLoading = false,
  onValidationChange,
}) => {
  const {
    isChecking,
    isAvailable,
    message,
    isValid,
    checkUsername,
    resetValidation,
  } = useUsernameValidation();

  useEffect(() => {
    if (value.trim()) {
      checkUsername(value.trim());
    } else {
      resetValidation();
    }
  }, [value, checkUsername, resetValidation]);

  useEffect(() => {
    onValidationChange?.(isValid);
  }, [isValid, onValidationChange]);

  const getInputStyle = () => {
    if (!value.trim()) return styles.input;
    if (isChecking) return [styles.input, styles.inputChecking];
    if (isAvailable === true) return [styles.input, styles.inputSuccess];
    if (isAvailable === false) return [styles.input, styles.inputError];
    return styles.input;
  };

  const getMessageStyle = () => {
    if (isChecking) return styles.messageChecking;
    if (isAvailable === true) return styles.messageSuccess;
    if (isAvailable === false) return styles.messageError;
    return styles.message;
  };

  const renderIcon = () => {
    if (isChecking) {
      return (
        <View style={styles.iconContainer}>
          <ActivityIndicator size="small" color="#fff" />
        </View>
      );
    }

    if (isAvailable === true) {
      return (
        <View style={styles.iconContainer}>
          <Text style={styles.successIcon}>✓</Text>
        </View>
      );
    }

    if (isAvailable === false) {
      return (
        <View style={styles.iconContainer}>
          <Text style={styles.errorIcon}>✗</Text>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={getInputStyle()}
          placeholder="Nome de usuário"
          placeholderTextColor="#a7979787"
          value={value}
          onChangeText={onChangeText}
          maxLength={20}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isLoading}
        />
        {renderIcon()}
      </View>
      
      {(message || isChecking) && (
        <Text style={getMessageStyle()}>
          {message}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  inputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: width * 0.04,
    paddingRight: width * 0.12,
    fontSize: width * 0.04,
    fontFamily: 'Inter-Regular',
    color: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  inputChecking: {
    borderColor: '#1e293b',
  },
  inputSuccess: {
    borderColor: '#10b981',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  iconContainer: {
    position: 'absolute',
    right: width * 0.04,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIcon: {
    color: '#10b981',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorIcon: {
    color: '#ef4444',
    fontSize: 18,
    fontWeight: 'bold',
  },
  message: {
    fontSize: width * 0.035,
    fontFamily: 'Inter-Regular',
    marginTop: 8,
    marginLeft: 4,
  },
  messageChecking: {
    fontSize: width * 0.035,
    fontFamily: 'Inter-Regular',
    color: '#fff',
    marginTop: 8,
    marginLeft: 4,
  },
  messageSuccess: {
    fontSize: width * 0.035,
    fontFamily: 'Inter-Medium',
    color: '#10b981',
    marginTop: 8,
    marginLeft: 4,
  },
  messageError: {
    fontSize: width * 0.035,
    fontFamily: 'Inter-Medium',
    color: '#ef4444',
    marginTop: 8,
    marginLeft: 4,
  },
});