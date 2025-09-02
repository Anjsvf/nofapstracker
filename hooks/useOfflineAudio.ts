import { Audio } from 'expo-av';
import { useRef, useState } from 'react';
import { Alert } from 'react-native';
import { Message } from '../types';

interface UseOfflineAudioProps {
  replyingTo: Message | null;
  onSendVoiceMessage: (audioUri: string, audioDuration: number, messageText?: string) => Promise<void>;
}

export const useOfflineAudio = ({ replyingTo, onSendVoiceMessage }: UseOfflineAudioProps) => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioPosition, setAudioPosition] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [showRecordingUI, setShowRecordingUI] = useState(false);

  const recordingTimer = useRef<NodeJS.Timeout | null>(null);

  const requestAudioPermission = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Erro', 'Permissão de microfone negada.');
      return false;
    }
    return true;
  };

  const startRecording = async () => {
    try {
      const hasPermission = await requestAudioPermission();
      if (!hasPermission) return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await newRecording.startAsync();

      setRecording(newRecording);
      setIsRecording(true);
      setShowRecordingUI(true);
      setRecordingDuration(0);

      recordingTimer.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Erro', 'Falha ao iniciar a gravação.');
    }
  };

  const stopRecording = async () => {
    try {
      if (recording && recordingTimer.current) {
        clearInterval(recordingTimer.current);
        recordingTimer.current = null;

        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();

        if (uri && recordingDuration >= 1) {
        
          await onSendVoiceMessage(uri, recordingDuration, '[Mensagem de voz]');
        } else if (recordingDuration < 1) {
          Alert.alert('Aviso', 'Gravação muito curta. Mínimo de 1 segundo.');
        }

        setRecording(null);
        setIsRecording(false);
        setShowRecordingUI(false);
        setRecordingDuration(0);
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert('Erro', 'Falha ao finalizar a gravação.');
    }
  };

  const cancelRecording = async () => {
    try {
      if (recording && recordingTimer.current) {
        clearInterval(recordingTimer.current);
        recordingTimer.current = null;

        await recording.stopAndUnloadAsync();
        setRecording(null);
        setIsRecording(false);
        setShowRecordingUI(false);
        setRecordingDuration(0);
      }
    } catch (error) {
      console.error('Error canceling recording:', error);
    }
  };

  const playAudio = async (uri: string, messageId: string) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true }
      );
      setSound(newSound);
      setPlayingId(messageId);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setAudioPosition(Math.floor((status.positionMillis || 0) / 1000));
          setAudioDuration(Math.floor((status.durationMillis || 0) / 1000));

          if (status.didJustFinish) {
            setPlayingId(null);
            setAudioPosition(0);
            setAudioDuration(0);
            setSound(null);
            newSound.unloadAsync();
          }
        }
      });
    } catch (error) {
      console.error('Error playing audio:', error);
      Alert.alert('Erro', 'Falha ao reproduzir o áudio.');
    }
  };

  const pauseAudio = async () => {
    try {
      if (sound) {
        await sound.pauseAsync();
      }
      setPlayingId(null);
    } catch (error) {
      console.error('Error pausing audio:', error);
    }
  };

  const stopAudio = async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      }
      setPlayingId(null);
      setAudioPosition(0);
      setAudioDuration(0);
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  };

  const cleanup = () => {
    sound?.unloadAsync();
    if (recordingTimer.current) {
      clearInterval(recordingTimer.current);
    }
  };

  return {
    isRecording,
    showRecordingUI,
    recordingDuration,
    playingId,
    audioPosition,
    audioDuration,
    startRecording,
    stopRecording,
    cancelRecording,
    playAudio,
    pauseAudio,
    stopAudio,
    cleanup,
  };
};