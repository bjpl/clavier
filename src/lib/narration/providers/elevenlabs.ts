/**
 * ElevenLabs TTS Provider
 * High-quality, natural-sounding text-to-speech (requires API key)
 */

import type {
  ITTSProvider,
  Voice,
  NarrationConfig,
  NarrationResult,
  TTSProvider,
} from '../types/narration';

export class ElevenLabsProvider implements ITTSProvider {
  name: TTSProvider = 'elevenlabs';
  private apiKey: string | null = null;
  private currentAudio: HTMLAudioElement | null = null;

  /**
   * Check if ElevenLabs is available (requires API key)
   */
  async isAvailable(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    // Check for API key in config
    const apiKey = this.apiKey || process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
    return !!apiKey;
  }

  /**
   * Set API key
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  /**
   * Get available voices from ElevenLabs
   */
  async getVoices(): Promise<Voice[]> {
    const apiKey = this.apiKey || process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
    if (!apiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    try {
      const response = await fetch('https://api.elevenlabs.io/v1/voices', {
        headers: {
          'xi-api-key': apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.statusText}`);
      }

      const data = await response.json();

      return data.voices.map((voice: any) => ({
        id: voice.voice_id,
        name: voice.name,
        language: voice.labels?.language || 'en',
        gender: voice.labels?.gender as 'male' | 'female' | undefined,
        provider: 'elevenlabs' as const,
        isPremium: true,
        providerData: voice,
      }));
    } catch (error) {
      console.error('Failed to fetch ElevenLabs voices:', error);
      throw error;
    }
  }

  /**
   * Generate speech using ElevenLabs API
   */
  async speak(text: string, config: NarrationConfig): Promise<NarrationResult> {
    const apiKey = this.apiKey || process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
    if (!apiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    if (!config.voice) {
      throw new Error('Voice must be specified for ElevenLabs');
    }

    // Stop any ongoing playback
    this.stop();

    try {
      // Map rate to ElevenLabs stability (inverse relationship)
      const stability = 0.5;
      const similarityBoost = 0.75;

      // Access API keys safely
      const elevenLabsConfig = config.apiKeys?.elevenlabs as any;

      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${config.voice.id}`,
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': apiKey,
          },
          body: JSON.stringify({
            text,
            model_id: elevenLabsConfig?.modelId || 'eleven_monolingual_v1',
            voice_settings: {
              stability: elevenLabsConfig?.stability ?? stability,
              similarity_boost: elevenLabsConfig?.similarityBoost ?? similarityBoost,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.statusText}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      const audio = new Audio(audioUrl);
      audio.volume = config.muted ? 0 : config.volume;
      audio.playbackRate = config.rate;

      this.currentAudio = audio;

      // Get duration (approximate based on blob size and bitrate)
      const duration = await this.getAudioDuration(audio);

      return {
        audio,
        blob: audioBlob,
        url: audioUrl,
        duration,
        cached: false,
      };
    } catch (error) {
      console.error('ElevenLabs TTS error:', error);
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
let instance: ElevenLabsProvider | null = null;

/**
 * Get or create ElevenLabs provider instance
 */
export function getElevenLabsProvider(): ElevenLabsProvider {
  if (!instance) {
    instance = new ElevenLabsProvider();
  }
  return instance;
}
