import { Pause, Play } from 'lucide-react-native';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Message } from '../../types';
import { formatDuration } from '../../utils/helpers';

interface AudioMessageProps {
  message: Message;
  onPlay?: (uri: string, messageId: string) => void;
  onPause?: () => void;
  onStop?: () => void;
  playingId?: string | null;
  audioPosition?: number;
  audioDuration?: number;
}

const { width } = Dimensions.get('window');

export const AudioMessage: React.FC<AudioMessageProps> = ({
  message,
  onPlay,
  onPause,
  onStop,
  playingId,
  audioPosition = 0,
  audioDuration = 0,
}) => {
  const isPlaying = playingId === message._id;
  const progressPercentage = isPlaying && audioDuration > 0 
    ? Math.min((audioPosition / audioDuration) * 100, 100)
    : 0;

  return (
    <View style={styles.audioContainer}>
      <View style={styles.audioMessage}>
        {/* Ícone de áudio decorativo */}
        {/* <View style={styles.audioIcon}>
          <Volume2 size={20} color="#8b5cf6" />
        </View> */}

        <View style={styles.audioContent}>
          {/* Controles principais */}
          <View style={styles.audioControls}>
            <TouchableOpacity
              style={[styles.playButton, isPlaying && styles.playButtonActive]}
              onPress={() => {
                if (isPlaying) {
                  onPause?.();
                } else {
                  onPlay?.(message.audioUri!, message._id);
                }
              }}
              activeOpacity={0.8}
            >
              {isPlaying ? (
                <Pause size={20} color="#ffffff" />
              ) : (
                <Play size={20} color="#ffffff" style={{ marginLeft: 2 }} />
              )}
            </TouchableOpacity>

            <View style={styles.audioInfo}>
            
              <View style={styles.progressContainer}>
                <View style={styles.audioProgressBar}>
                  <View
                    style={[
                      styles.audioProgress,
                      { width: `${progressPercentage}%` }
                    ]}
                  />
                  {isPlaying && (
                    <View 
                      style={[
                        styles.progressThumb,
                        { left: `${Math.max(progressPercentage - 1, 0)}%` }
                      ]} 
                    />
                  )}
                </View>
              </View>

             
              <View style={styles.timeContainer}>
                <Text style={styles.audioDuration}>
                  {isPlaying
                    ? `${formatDuration(audioPosition)} / ${formatDuration(audioDuration)}`
                    : formatDuration(message.audioDuration || 0)}
                </Text>
              </View>
            </View>

            {/* <TouchableOpacity
              style={styles.stopButton}
              onPress={onStop}
              activeOpacity={0.7}
            >
              <Square size={14} color="#a78bfa" />
            </TouchableOpacity> */}
          </View>
        </View>
      </View>

      {/* Indicador de status */}
      {isPlaying && (
        <View style={styles.statusIndicator}>
          <View style={styles.waveAnimation}>
            <View style={[styles.waveBars, styles.waveBar1]} />
            <View style={[styles.waveBars, styles.waveBar2]} />
            <View style={[styles.waveBars, styles.waveBar3]} />
            <View style={[styles.waveBars, styles.waveBar4]} />
          </View>
          <Text style={styles.statusText}>Reproduzindo...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  audioContainer: {
    minWidth: width * 0.65,
    marginBottom: 6,
  },
  audioMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  audioIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  audioContent: {
    flex: 1,
  },
  audioControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  playButtonActive: {
    backgroundColor: '#3b82f6',
    transform: [{ scale: 0.95 }],
  },
  audioInfo: {
    flex: 1,
  },
  progressContainer: {
    marginBottom: 6,
  },
  audioProgressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  audioProgress: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 3,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
  progressThumb: {
    position: 'absolute',
    top: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  timeContainer: {
    alignItems: 'center',
  },
  audioDuration: {
    fontSize: width * 0.032,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  stopButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(167, 139, 250, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    paddingHorizontal: 12,
  },
  waveAnimation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  waveBars: {
    width: 2,
    backgroundColor: '#0f172a',
    borderRadius: 1,
    marginHorizontal: 1,
  },
  waveBar1: {
    height: 8,
    opacity: 0.8,
  },
  waveBar2: {
    height: 12,
    opacity: 1,
  },
  waveBar3: {
    height: 6,
    opacity: 0.6,
  },
  waveBar4: {
    height: 10,
    opacity: 0.9,
  },
  statusText: {
    fontSize: width * 0.028,
    fontFamily: 'Inter-Regular',
    color: '#ffffff',
    fontStyle: 'italic',
  },
});

