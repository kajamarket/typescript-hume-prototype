// src/types.ts
export type AppState = 'idle' | 'listening' | 'playing' | 'interrupted';
export type ConnectionState = 'connecting' | 'connected' | 'disconnected';

export interface TokenResponse {
  token: string;
  expiresAt?: string | null;
}

export interface ChatMessage {
  type: 'audio_output' | 'user_interruption' | string;
  data?: any;
  text?: string; // transcript from EVI
}
