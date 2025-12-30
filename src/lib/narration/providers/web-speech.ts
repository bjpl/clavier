/**
 * Web Speech API TTS Provider
 * Free, browser-native text-to-speech implementation
 */

import type {
  ITTSProvider,
  Voice,
  NarrationConfig,
  NarrationResult,
  TTSProvider,
} from '../types/narration';

export class WebSpeechProvider implements ITTSProvider {
  name: TTSProvider = 'web-speech';
  private utterance: SpeechSynthesisUtterance | null = null;

  /**
   * Check if currently speaking
   */
  get isSpeaking(): boolean {
    return this.utterance !== null && window.speechSynthesis.speaking;
  }

  /**
   * Check if Web Speech API is available
   */
  async isAvailable(): Promise<boolean> {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  /**
   * Get available voices from the browser
   */
  async getVoices(): Promise<Voice[]> {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return [];
    }

    // Wait for voices to load (they may not be immediately available)
    const voices = await this.waitForVoices();

    return voices.map((voice) => ({
      id: voice.voiceURI,
      name: voice.name,
      language: voice.lang,
      provider: 'web-speech' as const,
      isPremium: false,
      providerData: voice,
    }));
  }

  /**
   * Wait for voices to be loaded (Chrome requires this)
   */
  private waitForVoices(): Promise<SpeechSynthesisVoice[]> {
    return new Promise((resolve) => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        resolve(voices);
        return;
      }

      // Wait for voiceschanged event
      const handleVoicesChanged = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
          resolve(voices);
        }
      };

      window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);

      // Fallback timeout
      setTimeout(() => {
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
        resolve(window.speechSynthesis.getVoices());
      }, 1000);
    });
  }

  /**
   * Generate speech using Web Speech API
   */
  async speak(text: string, config: NarrationConfig): Promise<NarrationResult> {
    if (!(await this.isAvailable())) {
      throw new Error('Web Speech API is not available');
    }

    // Cancel any ongoing speech
    this.stop();

    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      this.utterance = utterance;

      // Apply configuration
      utterance.rate = config.rate;
      utterance.pitch = config.pitch;
      utterance.volume = config.muted ? 0 : config.volume;

      // Set voice if specified
      if (config.voice?.providerData) {
        utterance.voice = config.voice.providerData as SpeechSynthesisVoice;
      }

      // Track completion
      let resolved = false;

      utterance.onend = () => {
        if (!resolved) {
          resolved = true;
          // Web Speech API doesn't provide duration, estimate it
          const duration = this.estimateDuration(text, config.rate);
          resolve({
            duration,
            cached: false,
          });
        }
      };

      utterance.onerror = (event) => {
        if (!resolved) {
          resolved = true;
          reject(
            new Error(
              `Web Speech API error: ${event.error || 'Unknown error'}`
            )
          );
        }
      };

      // Start speaking
      window.speechSynthesis.speak(utterance);
    });
  }

  /**
   * Stop current speech
   */
  stop(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.utterance = null;
    }
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.stop();
  }

  /**
   * Estimate duration based on text length and rate
   * Average speaking rate is ~150 words per minute at 1x speed
   */
  private estimateDuration(text: string, rate: number): number {
    const words = text.split(/\s+/).length;
    const baseWordsPerMinute = 150;
    const adjustedWordsPerMinute = baseWordsPerMinute * rate;
    const durationMinutes = words / adjustedWordsPerMinute;
    return durationMinutes * 60; // Convert to seconds
  }
}

/**
 * Singleton instance
 */
let instance: WebSpeechProvider | null = null;

/**
 * Get or create Web Speech provider instance
 */
export function getWebSpeechProvider(): WebSpeechProvider {
  if (!instance) {
    instance = new WebSpeechProvider();
  }
  return instance;
}
