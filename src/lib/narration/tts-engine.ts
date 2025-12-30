/**
 * TTS Engine - Core text-to-speech interface
 * Manages multiple TTS providers with fallback support
 */

import type {
  ITTSProvider,
  Voice,
  NarrationConfig,
  NarrationResult,
  TTSProvider,
  NarrationError,
  NarrationCacheEntry,
} from './types/narration';
import { getWebSpeechProvider } from './providers/web-speech';
import { getElevenLabsProvider } from './providers/elevenlabs';
import { getOpenAIProvider } from './providers/openai';

/**
 * Default narration configuration
 */
const DEFAULT_CONFIG: NarrationConfig = {
  provider: 'web-speech',
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
  muted: false,
  autoAdvance: false,
  autoPlay: false,
  cacheAudio: true,
};

/**
 * TTS Engine class
 * Manages text-to-speech synthesis with multiple provider support
 */
export class TTSEngine {
  private providers: Map<TTSProvider, ITTSProvider> = new Map();
  private currentProvider: ITTSProvider | null = null;
  private config: NarrationConfig = DEFAULT_CONFIG;
  private cache: Map<string, NarrationCacheEntry> = new Map();
  private currentAudio: HTMLAudioElement | null = null;

  constructor(config?: Partial<NarrationConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeProviders();
  }

  /**
   * Initialize all available TTS providers
   */
  private initializeProviders(): void {
    this.providers.set('web-speech', getWebSpeechProvider());
    this.providers.set('elevenlabs', getElevenLabsProvider());
    this.providers.set('openai', getOpenAIProvider());
  }

  /**
   * Initialize the engine with a specific provider
   */
  async initialize(provider?: TTSProvider): Promise<void> {
    const targetProvider = provider || this.config.provider;
    const providerInstance = this.providers.get(targetProvider);

    if (!providerInstance) {
      throw new Error(`Provider ${targetProvider} not found`);
    }

    const isAvailable = await providerInstance.isAvailable();

    if (!isAvailable) {
      // Try fallback to web-speech
      if (targetProvider !== 'web-speech') {
        console.warn(`Provider ${targetProvider} not available, falling back to web-speech`);
        return this.initialize('web-speech');
      }
      throw this.createError(
        'unsupported',
        'No TTS provider available in this environment'
      );
    }

    this.currentProvider = providerInstance;
    this.config.provider = targetProvider;
  }

  /**
   * Get available voices for current provider
   */
  async getVoices(): Promise<Voice[]> {
    if (!this.currentProvider) {
      await this.initialize();
    }

    if (!this.currentProvider) {
      return [];
    }

    try {
      return await this.currentProvider.getVoices();
    } catch (error) {
      console.error('Failed to get voices:', error);
      return [];
    }
  }

  /**
   * Generate and play speech
   */
  async speak(text: string): Promise<NarrationResult> {
    if (!this.currentProvider) {
      await this.initialize();
    }

    if (!this.currentProvider) {
      throw this.createError('provider', 'No TTS provider available');
    }

    // Check cache first
    if (this.config.cacheAudio) {
      const cacheKey = this.generateCacheKey(text);
      const cached = this.cache.get(cacheKey);

      if (cached) {
        const audio = new Audio(cached.url);
        audio.volume = this.config.muted ? 0 : this.config.volume;
        audio.playbackRate = this.config.rate;

        this.currentAudio = audio;

        return {
          audio,
          blob: cached.blob,
          url: cached.url,
          duration: cached.duration,
          cached: true,
        };
      }
    }

    try {
      const result = await this.currentProvider.speak(text, this.config);

      // Cache the result
      if (this.config.cacheAudio && result.blob && result.url) {
        const cacheKey = this.generateCacheKey(text);
        this.cache.set(cacheKey, {
          key: cacheKey,
          blob: result.blob,
          url: result.url,
          voice: this.config.voice!,
          provider: this.config.provider,
          cachedAt: Date.now(),
          duration: result.duration,
        });
      }

      this.currentAudio = result.audio || null;
      return result;
    } catch (error) {
      console.error('TTS error:', error);

      // Try fallback to web-speech if premium provider fails
      if (this.config.provider !== 'web-speech') {
        console.warn('Falling back to web-speech provider');
        await this.setProvider('web-speech');
        return this.speak(text);
      }

      throw this.createError('provider', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Stop current speech
   */
  stop(): void {
    if (this.currentProvider) {
      this.currentProvider.stop();
    }
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }

  /**
   * Pause current speech
   */
  pause(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
    }
  }

  /**
   * Resume paused speech
   */
  resume(): void {
    if (this.currentAudio) {
      this.currentAudio.play().catch((error) => {
        console.error('Failed to resume audio:', error);
      });
    }
  }

  /**
   * Set playback rate
   */
  setRate(rate: number): void {
    this.config.rate = Math.max(0.5, Math.min(2.0, rate));
    if (this.currentAudio) {
      this.currentAudio.playbackRate = this.config.rate;
    }
  }

  /**
   * Set pitch (Web Speech API only)
   */
  setPitch(pitch: number): void {
    this.config.pitch = Math.max(0.5, Math.min(2.0, pitch));
  }

  /**
   * Set volume
   */
  setVolume(volume: number): void {
    this.config.volume = Math.max(0, Math.min(1.0, volume));
    if (this.currentAudio) {
      this.currentAudio.volume = this.config.muted ? 0 : this.config.volume;
    }
  }

  /**
   * Toggle mute
   */
  toggleMute(): void {
    this.config.muted = !this.config.muted;
    if (this.currentAudio) {
      this.currentAudio.volume = this.config.muted ? 0 : this.config.volume;
    }
  }

  /**
   * Set voice
   */
  async setVoice(voice: Voice): Promise<void> {
    this.config.voice = voice;

    // Switch provider if needed
    if (voice.provider !== this.config.provider) {
      await this.setProvider(voice.provider);
    }
  }

  /**
   * Set provider
   */
  async setProvider(provider: TTSProvider): Promise<void> {
    await this.initialize(provider);
  }

  /**
   * Get current configuration
   */
  getConfig(): NarrationConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<NarrationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Clear audio cache
   */
  clearCache(): void {
    // Revoke all object URLs
    this.cache.forEach((entry) => {
      URL.revokeObjectURL(entry.url);
    });
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; entries: number } {
    let totalSize = 0;
    this.cache.forEach((entry) => {
      totalSize += entry.blob.size;
    });
    return {
      size: totalSize,
      entries: this.cache.size,
    };
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.stop();
    this.clearCache();
    this.providers.forEach((provider) => provider.dispose());
    this.providers.clear();
    this.currentProvider = null;
  }

  /**
   * Generate cache key for text + voice + settings
   */
  private generateCacheKey(text: string): string {
    const voiceId = this.config.voice?.id || 'default';
    const settings = `${this.config.rate}-${this.config.pitch}`;
    return `${this.config.provider}-${voiceId}-${settings}-${this.hashString(text)}`;
  }

  /**
   * Simple string hash function
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  /**
   * Create a narration error
   */
  private createError(
    type: NarrationError['type'],
    message: string
  ): NarrationError {
    return {
      type,
      message,
      recoverable: type !== 'unsupported',
      fallbackProvider: type !== 'unsupported' ? 'web-speech' : undefined,
    };
  }
}

/**
 * Singleton instance for global access
 */
let globalTTSEngine: TTSEngine | null = null;

/**
 * Get or create global TTS engine instance
 */
export function getGlobalTTSEngine(config?: Partial<NarrationConfig>): TTSEngine {
  if (!globalTTSEngine) {
    globalTTSEngine = new TTSEngine(config);
  }
  return globalTTSEngine;
}

/**
 * Reset global TTS engine (useful for testing)
 */
export function resetGlobalTTSEngine(): void {
  if (globalTTSEngine) {
    globalTTSEngine.dispose();
    globalTTSEngine = null;
  }
}
