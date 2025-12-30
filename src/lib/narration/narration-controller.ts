/**
 * Narration Controller - State management for TTS narration
 * Manages narration state, playback controls, and synchronization
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  NarrationState,
  NarrationConfig,
  NarrationControls,
  Voice,
  TTSProvider,
  NarrationEvent,
} from './types/narration';
import { getGlobalTTSEngine, TTSEngine } from './tts-engine';

interface NarrationStore extends NarrationState, NarrationControls {
  // Engine instance
  engine: TTSEngine | null;

  // Event listeners
  listeners: Set<(event: NarrationEvent) => void>;
  addEventListener: (listener: (event: NarrationEvent) => void) => void;
  removeEventListener: (listener: (event: NarrationEvent) => void) => void;
  emitEvent: (event: NarrationEvent) => void;

  // Configuration
  config: NarrationConfig;
  updateConfig: (config: Partial<NarrationConfig>) => void;

  // Internal state management
  setIsPlaying: (isPlaying: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: NarrationStore['error']) => void;
  setProgress: (progress: number) => void;
  setAvailableVoices: (voices: Voice[]) => void;

  // Initialization
  initialize: () => Promise<void>;
}

const initialConfig: NarrationConfig = {
  provider: 'web-speech',
  rate: 1.0,
  pitch: 1.0,
  volume: 0.8,
  muted: false,
  autoAdvance: false,
  autoPlay: false,
  cacheAudio: true,
};

const initialState: Omit<NarrationState, 'availableVoices'> = {
  isPlaying: false,
  isLoading: false,
  progress: 0,
};

export const useNarrationStore = create<NarrationStore>()(
  devtools(
    (set, get) => ({
      ...initialState,
      availableVoices: [],
      engine: null,
      listeners: new Set(),
      config: initialConfig,

      /**
       * Initialize the narration system
       */
      initialize: async () => {
        set({ isLoading: true, error: undefined }, false, 'narration/initialize');

        try {
          const engine = getGlobalTTSEngine(get().config);
          await engine.initialize();

          const voices = await engine.getVoices();

          set(
            {
              engine,
              availableVoices: voices,
              isLoading: false,
            },
            false,
            'narration/initialized'
          );

          // Set default voice if available
          if (voices.length > 0 && !get().config.voice) {
            const defaultVoice = voices.find((v) => v.language.startsWith('en')) || voices[0];
            get().setVoice(defaultVoice);
          }
        } catch (error) {
          set(
            {
              isLoading: false,
              error: {
                type: 'provider',
                message: error instanceof Error ? error.message : 'Failed to initialize narration',
                recoverable: true,
                fallbackProvider: 'web-speech',
              },
            },
            false,
            'narration/initError'
          );
        }
      },

      /**
       * Play narration
       */
      play: async (text: string, measure?: number) => {
        const { engine, emitEvent } = get();

        if (!engine) {
          await get().initialize();
        }

        const currentEngine = get().engine;
        if (!currentEngine) {
          throw new Error('TTS engine not initialized');
        }

        set(
          {
            isPlaying: true,
            isLoading: true,
            currentText: text,
            currentMeasure: measure,
            error: undefined,
          },
          false,
          'narration/play'
        );

        emitEvent({ type: 'start', timestamp: Date.now() });

        try {
          const result = await currentEngine.speak(text);

          if (result.audio) {
            const audio = result.audio;

            // Track progress
            audio.ontimeupdate = () => {
              if (audio.duration > 0) {
                set({ progress: audio.currentTime / audio.duration }, false, 'narration/progress');
                emitEvent({
                  type: 'progress',
                  timestamp: Date.now(),
                  data: { progress: audio.currentTime / audio.duration },
                });
              }
            };

            // Handle completion
            audio.onended = () => {
              set({ isPlaying: false, progress: 0 }, false, 'narration/end');
              emitEvent({ type: 'end', timestamp: Date.now() });
            };

            // Handle errors
            audio.onerror = (error) => {
              set(
                {
                  isPlaying: false,
                  error: {
                    type: 'provider',
                    message: 'Audio playback failed',
                    recoverable: true,
                  },
                },
                false,
                'narration/error'
              );
              emitEvent({
                type: 'error',
                timestamp: Date.now(),
                data: { error },
              });
            };

            // Start playback
            await audio.play();

            set(
              {
                isLoading: false,
                audioElement: audio,
              },
              false,
              'narration/playing'
            );
          } else {
            // Web Speech API doesn't return audio element
            set({ isLoading: false }, false, 'narration/playing');
          }
        } catch (error) {
          set(
            {
              isPlaying: false,
              isLoading: false,
              error: {
                type: 'provider',
                message: error instanceof Error ? error.message : 'Narration failed',
                recoverable: true,
                fallbackProvider: 'web-speech',
              },
            },
            false,
            'narration/error'
          );

          emitEvent({
            type: 'error',
            timestamp: Date.now(),
            data: { error },
          });
        }
      },

      /**
       * Pause narration
       */
      pause: () => {
        const { engine } = get();
        if (engine) {
          engine.pause();
          set({ isPlaying: false }, false, 'narration/pause');
          get().emitEvent({ type: 'pause', timestamp: Date.now() });
        }
      },

      /**
       * Resume narration
       */
      resume: () => {
        const { engine } = get();
        if (engine) {
          engine.resume();
          set({ isPlaying: true }, false, 'narration/resume');
          get().emitEvent({ type: 'resume', timestamp: Date.now() });
        }
      },

      /**
       * Stop narration
       */
      stop: () => {
        const { engine } = get();
        if (engine) {
          engine.stop();
          set(
            {
              isPlaying: false,
              progress: 0,
              currentText: undefined,
              currentMeasure: undefined,
              audioElement: undefined,
            },
            false,
            'narration/stop'
          );
          get().emitEvent({ type: 'end', timestamp: Date.now() });
        }
      },

      /**
       * Set playback rate
       */
      setRate: (rate: number) => {
        const { engine, config } = get();
        if (engine) {
          engine.setRate(rate);
          set(
            { config: { ...config, rate } },
            false,
            'narration/setRate'
          );
        }
      },

      /**
       * Set pitch
       */
      setPitch: (pitch: number) => {
        const { engine, config } = get();
        if (engine) {
          engine.setPitch(pitch);
          set(
            { config: { ...config, pitch } },
            false,
            'narration/setPitch'
          );
        }
      },

      /**
       * Set volume
       */
      setVolume: (volume: number) => {
        const { engine, config } = get();
        if (engine) {
          engine.setVolume(volume);
          set(
            { config: { ...config, volume } },
            false,
            'narration/setVolume'
          );
        }
      },

      /**
       * Toggle mute
       */
      toggleMute: () => {
        const { engine, config } = get();
        if (engine) {
          engine.toggleMute();
          set(
            { config: { ...config, muted: !config.muted } },
            false,
            'narration/toggleMute'
          );
        }
      },

      /**
       * Set voice
       */
      setVoice: async (voice: Voice) => {
        const { engine, config } = get();
        if (engine) {
          await engine.setVoice(voice);
          set(
            { config: { ...config, voice } },
            false,
            'narration/setVoice'
          );
          get().emitEvent({
            type: 'voice-change',
            timestamp: Date.now(),
            data: { voice },
          });
        }
      },

      /**
       * Set provider
       */
      setProvider: async (provider: TTSProvider) => {
        const { engine, config } = get();
        if (engine) {
          set({ isLoading: true }, false, 'narration/setProvider');

          try {
            await engine.setProvider(provider);
            const voices = await engine.getVoices();

            set(
              {
                config: { ...config, provider, voice: undefined },
                availableVoices: voices,
                isLoading: false,
              },
              false,
              'narration/providerChanged'
            );

            // Set default voice for new provider
            if (voices.length > 0) {
              const defaultVoice = voices.find((v) => v.language.startsWith('en')) || voices[0];
              await get().setVoice(defaultVoice);
            }

            get().emitEvent({
              type: 'provider-change',
              timestamp: Date.now(),
              data: { provider },
            });
          } catch (error) {
            set(
              {
                isLoading: false,
                error: {
                  type: 'provider',
                  message: error instanceof Error ? error.message : 'Failed to change provider',
                  recoverable: true,
                },
              },
              false,
              'narration/providerError'
            );
          }
        }
      },

      /**
       * Clear cache
       */
      clearCache: () => {
        const { engine } = get();
        if (engine) {
          engine.clearCache();
        }
      },

      /**
       * Update configuration
       */
      updateConfig: (config: Partial<NarrationConfig>) => {
        const currentConfig = get().config;
        set(
          { config: { ...currentConfig, ...config } },
          false,
          'narration/updateConfig'
        );
        get().engine?.updateConfig(config);
      },

      /**
       * Event management
       */
      addEventListener: (listener) => {
        get().listeners.add(listener);
      },

      removeEventListener: (listener) => {
        get().listeners.delete(listener);
      },

      emitEvent: (event: NarrationEvent) => {
        get().listeners.forEach((listener) => listener(event));
      },

      /**
       * Internal state setters
       */
      setIsPlaying: (isPlaying) =>
        set({ isPlaying }, false, 'narration/setIsPlaying'),

      setIsLoading: (isLoading) =>
        set({ isLoading }, false, 'narration/setIsLoading'),

      setError: (error) =>
        set({ error }, false, 'narration/setError'),

      setProgress: (progress) =>
        set({ progress }, false, 'narration/setProgress'),

      setAvailableVoices: (availableVoices) =>
        set({ availableVoices }, false, 'narration/setAvailableVoices'),
    }),
    { name: 'NarrationStore' }
  )
);

// Selectors for optimized component subscriptions
export const selectNarrationState = (state: NarrationStore) => ({
  isPlaying: state.isPlaying,
  isLoading: state.isLoading,
  progress: state.progress,
});

export const selectNarrationConfig = (state: NarrationStore) => state.config;
export const selectNarrationVoices = (state: NarrationStore) => state.availableVoices;
export const selectNarrationError = (state: NarrationStore) => state.error;
