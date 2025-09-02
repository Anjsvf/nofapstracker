import { Dimensions } from 'react-native';

export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const RECORDING_OPTIONS = {
  android: {
    extension: '.m4a',
    outputFormat: 'mpeg_4',
    audioEncoder: 'aac',
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
  },
  ios: {
    extension: '.m4a',
    outputFormat: 'mpeg4aac',
    audioQuality: 'MAX',
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
};

export const MESSAGE_LIMITS = {
  MAX_TEXT_LENGTH: 500,
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 20,
  MIN_RECORDING_DURATION: 1,
  MAX_RECORDING_DURATION: 300,
};

export const TIMEOUTS = {
  API_TIMEOUT: 10000,
  SOCKET_TIMEOUT: 20000,
  RECORDING_TIMER_INTERVAL: 1000,
};