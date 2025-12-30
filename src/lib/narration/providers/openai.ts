/**
 * OpenAI TTS Provider
 * Natural-sounding text-to-speech using OpenAI's API (requires API key)
 */

import type {
  ITTSProvider,
  Voice,
  NarrationConfig,
  NarrationResult,
  TTSProvider,
} from '../types/narration';

const OPENAI_VOICES = [
  { id: 'alloy', name: 'Alloy', language: 'en-US', gender: 'neutral' as const },
  { id: 'echo', name: 'Echo', language: 'en-US', gender: 'male' as const },
  { id: 'fable', name: 'Fable', language: 'en-US', gender: 'neutral' as const },
  { id: 'onyx', name: 'Onyx', language: 'en-US', gender: 'male' as const },
  { id: 'nova', name: 'Nova', language: 'en-US', gender: 'female' as const },
  { id: 'shimmer', name: 'Shimmer', language: 'en-US', gender: 'female' as const },
];

export class OpenAIProvider implements ITTSProvider {
  name: TTSProvider = 'openai';
  private apiKey: string | null = null;
  private currentAudio: HTMLAudioElement | null = null;

  /**
   * Check if OpenAI TTS is available (requires API key)
   */
  async isAvailable(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    // Check for API key in config
    const apiKey = this.apiKey || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    return !!apiKey;
  }

  /**
   * Set API key
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  /**
   * Get available OpenAI voices
   */
  async getVoices(): Promise<Voice[]> {
    return OPENAI_VOICES.map((voice) => ({
      ...voice,
      provider: 'openai' as const,
      isPremium: true,
    }));
  }

  /**
   * Generate speech using OpenAI TTS API
   */
  async speak(text: string, config: NarrationConfig): Promise<NarrationResult> {
    const apiKey = this.apiKey || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    if (!config.voice) {
      throw new Error('Voice must be specified for OpenAI TTS');
    }

    // Stop any ongoing playback
    this.stop();

    try {
      // Access API keys safely
      const openaiConfig = config.apiKeys?.openai as any;

      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: openaiConfig?.model || 'tts-1',
          input: text,
          voice: config.voice.id,
          speed: config.rate,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      const audio = new Audio(audioUrl);
      audio.volume = config.muted ? 0 : config.volume;
      // OpenAI handles speed in API, don't apply playbackRate

      this.currentAudio = audio;

      // Get duration
      const duration = await this.getAudioDuration(audio);

      return {
        audio,
        blob: audioBlob,
        url: audioUrl,
        duration,
        cached: false,
      };
    } catch (error) {
      console.error('OpenAI TTS error:', error);
      throw error;
    }
  }

  /**
   * Stop current audio
   */
  stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.stop();
  }

  /**
   * Get audio duration once metadata is loaded
   */
  private getAudioDuration(audio: HTMLAudioElement): Promise<number> {
    return new Promise((resolve) => {
      if (audio.duration && !isNaN(audio.duration)) {
        resolve(audio.duration);
      } else {
        audio.addEventListener('loadedmetadata', () => {
          resolve(audio.duration || 0);
        }, { once: true });
      }
    });
  }
}

/**
 * Singleton instance
 */
let instance: OpenAIProvider | null = null;

/**
 * Get or create OpenAI provider instance
 */
export function getOpenAIProvider(): OpenAIProvider {
  if (!instance) {
    instance = new OpenAIProvider();
  }
  return instance;
}
