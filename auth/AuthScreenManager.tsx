
import React, { useState } from 'react';
import { EmailVerificationScreen } from '../app/components/verificatios/EmailVerificationScreen';
import { ForgotPasswordScreen } from '../app/components/verificatios/ForgotPasswordScreen';
import { ResetPasswordScreen } from '../app/components/verificatios/ResetPass';
import { LoginScreen } from '../auth/LoginScreen';
import { useAuth } from '../hooks/useAuth';

type AuthScreenType = 'login' | 'emailVerification' | 'forgotPassword' | 'resetPassword';

interface AuthScreenManagerProps {
  onAuthSuccess: () => void;
}

export const AuthScreenManager: React.FC<AuthScreenManagerProps> = ({ onAuthSuccess }) => {
  const {
    username,
    email,
    password,
    isLoading,
    setUsername,
    setEmail,
    setPassword,
    handleRegister,
    handleLogin,
    verifyEmail,
    resendVerificationCode,
    forgotPassword,
    resetPassword,
  } = useAuth();

  const [currentScreen, setCurrentScreen] = useState<AuthScreenType>('login');
  const [verificationEmail, setVerificationEmail] = useState('');

  const handleRegisterPress = async () => {
    try {
      const result = await handleRegister();
      console.log('Resultado do registro:', result);

      if (result.success && result.needsVerification) {
        setVerificationEmail(result.email || email);
        setCurrentScreen('emailVerification');
      } else if (result.success) {
        onAuthSuccess(); 
      }
    } catch (error) {
      console.error('Erro no registro:', error);
    }
  };

  const handleLoginPress = async () => {
    try {
      const result = await handleLogin();
      console.log('Resultado do login:', result);

      if (result.success) {
        onAuthSuccess();
      } else if (result.needsVerification) {
        setVerificationEmail(result.email || email);
        setCurrentScreen('emailVerification');
      }
    } catch (error) {
      console.error('Erro no login:', error);
    }
  };

  const handleEmailVerificationWithCode = async (code: string) => {
    try {
      const success = await verifyEmail(code, verificationEmail);
      if (success) {
        onAuthSuccess();
      }
    } catch (error) {
      console.error('Erro na verificação:', error);
    }
  };

  const handleResendVerificationCode = async () => {
    try {
      await resendVerificationCode(verificationEmail);
    } catch (error) {
      console.error('Erro ao reenviar código:', error);
    }
  };

  const handleForgotPasswordPress = () => {
    console.log('Botão esqueceu senha pressionado');
    setCurrentScreen('forgotPassword');
  };

  const handleForgotPasswordSubmit = async (forgotEmail: string) => {
    try {
      const success = await forgotPassword(forgotEmail);
      if (success) {
        setVerificationEmail(forgotEmail);
        setCurrentScreen('resetPassword');
      }
    } catch (error) {
      console.error('Erro ao solicitar reset de senha:', error);
    }
  };

  const handleResetPasswordSubmit = async (code: string, newPassword: string) => {
    try {
      const success = await resetPassword(verificationEmail, code, newPassword);
      if (success) {
        setCurrentScreen('login');
        setEmail('');
        setPassword('');
        setVerificationEmail('');
      }
    } catch (error) {
      console.error('Erro ao resetar senha:', error);
    }
  };

  const handleResendPasswordResetCode = async () => {
    try {
      await resendVerificationCode(verificationEmail, 'password_reset');
    } catch (error) {
      console.error('Erro ao reenviar código de reset:', error);
    }
  };

  const handleBackToLogin = () => {
    console.log('Voltando para login');
    setCurrentScreen('login');
    setVerificationEmail('');
  };

  console.log('Tela atual:', currentScreen);

  switch (currentScreen) {
    case 'emailVerification':
      return (
        <EmailVerificationScreen
          email={verificationEmail}
          onVerificationSuccess={handleEmailVerificationWithCode}
          onResendCode={handleResendVerificationCode}
          onBackToLogin={handleBackToLogin}
          isLoading={isLoading}
        />
      );
    case 'forgotPassword':
      return (
        <ForgotPasswordScreen
          onSubmit={handleForgotPasswordSubmit}
          onBackToLogin={handleBackToLogin}
          isLoading={isLoading}
        />
      );
    case 'resetPassword':
      return (
        <ResetPasswordScreen
          email={verificationEmail}
          onResetPassword={handleResetPasswordSubmit}
          onResendCode={handleResendPasswordResetCode}
          onBackToLogin={handleBackToLogin}
          isLoading={isLoading}
        />
      );
    default:
      return (
        <LoginScreen
          username={username}
          email={email}
          password={password}
          setUsername={setUsername}
          setEmail={setEmail}
          setPassword={setPassword}
          onRegister={handleRegisterPress}
          onLogin={handleLoginPress}
          onForgotPassword={handleForgotPasswordPress}
          isLoading={isLoading}
        />
      );
  }
};


