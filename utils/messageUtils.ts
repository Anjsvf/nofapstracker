import { Message } from '../types';

export const generateTempId = (): string => {
  return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const createOfflineMessage = (
  text: string,
  username: string,
  type: 'text' | 'voice' = 'text',
  audioUri?: string,
  audioDuration?: number,
  replyTo?: string
): Message => {
  const tempId = generateTempId();
  
  return {
    _id: tempId,
    tempId,
    username,
    text,
    type,
    audioUri,
    audioDuration,
    timestamp: new Date(),
    replyTo,
    reactions: {},
    isOwn: true,
    isPending: true,
    isSynced: false,
  };
};