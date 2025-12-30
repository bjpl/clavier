/**
 * Narration module - Text-to-Speech for Clavier
 * Exports all narration-related functionality
 */

// Core engine
export { TTSEngine, getGlobalTTSEngine, resetGlobalTTSEngine } from './tts-engine';
export { useNarrationStore } from './narration-controller';

// Providers
export { WebSpeechProvider, getWebSpeechProvider } from './providers/web-speech';
export { ElevenLabsProvider, getElevenLabsProvider } from './providers/elevenlabs';
export { OpenAIProvider, getOpenAIProvider } from './providers/openai';

// Hooks
export { useNarration, useNarrationEvents, useAutoNarration, useNarrationVoice } from './hooks/use-narration';
export { useNarrationSync, useNarrationNavigation } from './hooks/use-narration-sync';

// Types
export type {
  TTSProvider,
  Voice,
  NarrationConfig,
  NarrationState,
  NarrationError,
  ITTSProvider,
  NarrationResult,
  NarrationEvent,
  NarrationEventType,
  NarrationCacheEntry,
  NarrationControls,
  ProviderConfig,
} from './types/narration';
