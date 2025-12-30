/**
 * Text-to-Speech narration type definitions for Clavier
 *
 * Defines all types related to TTS narration functionality,
 * voice selection, and audio synthesis.
 */

/**
 * Supported TTS provider types
 */
export type TTSProvider = 'web-speech' | 'elevenlabs' | 'openai';

/**
 * Voice configuration
 */
export interface Voice {
  /** Unique voice identifier */
  id: string;
  /** Human-readable voice name */
  name: string;
  /** Voice language code (e.g., 'en-US', 'en-GB') */
  language: string;
  /** Voice gender */
  gender?: 'male' | 'female' | 'neutral';
  /** Provider-specific voice data */
  providerData?: unknown;
  /** Whether this is a premium voice */
  isPremium?: boolean;
  /** Provider this voice belongs to */
  provider: TTSProvider;
}

/**
 * Narration configuration
 */
export interface NarrationConfig {
  /** Selected TTS provider */
  provider: TTSProvider;
  /** Selected voice */
  voice?: Voice;
  /** Speech rate (0.5 - 2.0) */
  rate: number;
  /** Speech pitch (0.5 - 2.0) */
  pitch: number;
  /** Volume (0.0 - 1.0) */
  volume: number;
  /** Whether narration is muted */
  muted: boolean;
  /** Auto-advance to next measure on narration end */
  autoAdvance: boolean;
  /** Auto-play narration when measure changes */
  autoPlay: boolean;
  /** Cache generated audio files */
  cacheAudio: boolean;
  /** API keys for premium providers */
  apiKeys?: {
    elevenlabs?: string;
    openai?: string;
  };
}

/**
 * Narration state
 */
export interface NarrationState {
  /** Whether narration is currently playing */
  isPlaying: boolean;
  /** Whether narration is loading */
  isLoading: boolean;
  /** Current narration text */
  currentText?: string;
  /** Current measure being narrated */
  currentMeasure?: number;
  /** Playback progress (0-1) */
  progress: number;
  /** Error state */
  error?: NarrationError;
  /** Available voices for current provider */
  availableVoices: Voice[];
  /** Current audio element (if any) */
  audioElement?: HTMLAudioElement;
}

/**
 * Narration error types
 */
export interface NarrationError {
  /** Error type */
  type: 'provider' | 'network' | 'unsupported' | 'api-key' | 'quota';
  /** Error message */
  message: string;
  /** Whether this is a recoverable error */
  recoverable: boolean;
  /** Suggested fallback provider */
  fallbackProvider?: TTSProvider;
}

/**
 * TTS provider interface
 */
export interface ITTSProvider {
  /** Provider name */
  name: TTSProvider;
  /** Whether this provider is available in current environment */
  isAvailable(): Promise<boolean>;
  /** Get available voices */
  getVoices(): Promise<Voice[]>;
  /** Generate speech audio */
  speak(text: string, config: NarrationConfig): Promise<NarrationResult>;
  /** Stop current speech */
  stop(): void;
  /** Clean up resources */
  dispose(): void;
}

/**
 * Result of TTS generation
 */
export interface NarrationResult {
  /** Audio element ready to play */
  audio?: HTMLAudioElement;
  /** Audio blob (for caching) */
  blob?: Blob;
  /** Audio URL (for caching) */
  url?: string;
  /** Duration in seconds */
  duration: number;
  /** Whether audio was retrieved from cache */
  cached: boolean;
}

/**
 * Narration sync event types
 */
export type NarrationEventType =
  | 'start'
  | 'end'
  | 'pause'
  | 'resume'
  | 'error'
  | 'progress'
  | 'voice-change'
  | 'provider-change';

/**
 * Narration event
 */
export interface NarrationEvent {
  /** Event type */
  type: NarrationEventType;
  /** Timestamp when event occurred */
  timestamp: number;
  /** Event-specific data */
  data?: unknown;
}

/**
 * Narration cache entry
 */
export interface NarrationCacheEntry {
  /** Cache key (hash of text + voice + settings) */
  key: string;
  /** Cached audio blob */
  blob: Blob;
  /** Audio URL */
  url: string;
  /** Voice used */
  voice: Voice;
  /** Provider used */
  provider: TTSProvider;
  /** Timestamp when cached */
  cachedAt: number;
  /** Audio duration in seconds */
  duration: number;
}

/**
 * Narration controls interface
 */
export interface NarrationControls {
  /** Play narration */
  play: (text: string, measure?: number) => Promise<void>;
  /** Pause narration */
  pause: () => void;
  /** Resume narration */
  resume: () => void;
  /** Stop narration */
  stop: () => void;
  /** Set playback rate */
  setRate: (rate: number) => void;
  /** Set pitch */
  setPitch: (pitch: number) => void;
  /** Set volume */
  setVolume: (volume: number) => void;
  /** Toggle mute */
  toggleMute: () => void;
  /** Change voice */
  setVoice: (voice: Voice) => void;
  /** Change provider */
  setProvider: (provider: TTSProvider) => void;
  /** Clear cache */
  clearCache: () => void;
}

/**
 * Provider-specific configuration
 */
export interface ProviderConfig {
  /** ElevenLabs configuration */
  elevenlabs?: {
    apiKey: string;
    modelId?: string;
    stability?: number;
    similarityBoost?: number;
  };
  /** OpenAI configuration */
  openai?: {
    apiKey: string;
    model?: 'tts-1' | 'tts-1-hd';
    voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  };
}
