# Clavier Narration System

## Overview

The Clavier narration system provides high-quality text-to-speech (TTS) functionality for measure-by-measure musical analysis commentary. It supports multiple TTS providers with automatic fallback and offers seamless integration with the playback system.

## Architecture

### Core Components

```
src/lib/narration/
├── types/
│   └── narration.ts          # TypeScript type definitions
├── providers/
│   ├── web-speech.ts          # Browser-native TTS (free)
│   ├── elevenlabs.ts          # ElevenLabs API (premium)
│   └── openai.ts              # OpenAI TTS API (premium)
├── hooks/
│   ├── use-narration.ts       # Main React hook
│   └── use-narration-sync.ts  # Playback synchronization
├── tts-engine.ts              # Core TTS engine
├── narration-controller.ts    # State management (Zustand)
└── index.ts                   # Public API exports
```

## Features

### Multi-Provider Support

1. **Web Speech API** (Default, Free)
   - Browser-native TTS
   - No API key required
   - Works offline
   - Multiple voices per browser
   - Limited quality compared to premium options

2. **ElevenLabs** (Premium)
   - High-quality, natural-sounding voices
   - Requires API key
   - Best voice quality
   - Configurable stability and similarity

3. **OpenAI TTS** (Premium)
   - Natural-sounding voices
   - Requires API key
   - Good quality at lower cost
   - 6 voice options: alloy, echo, fable, onyx, nova, shimmer

### Key Features

- **Automatic Fallback**: Falls back to Web Speech API if premium providers fail
- **Audio Caching**: Generated audio is cached to reduce API calls and latency
- **Playback Sync**: Synchronizes with music playback
- **Speed Control**: Adjustable playback rate (0.5x - 2.0x)
- **Volume Control**: Independent volume control from music
- **Auto-Advance**: Optionally advance to next measure after narration
- **Voice Selection**: Choose from available voices per provider
- **Progress Tracking**: Real-time playback progress
- **Error Handling**: Graceful error handling with user-friendly messages

## Usage

### Basic Usage

```typescript
import { useNarration } from '@/lib/narration';

function CommentaryPanel() {
  const { speak, stop, isPlaying, voices, setVoice } = useNarration();

  return (
    <div>
      <button onClick={() => speak("This is a cadence in C major")}>
        Play Narration
      </button>
      <button onClick={stop} disabled={!isPlaying}>
        Stop
      </button>
      <select onChange={(e) => {
        const voice = voices.find(v => v.id === e.target.value);
        if (voice) setVoice(voice);
      }}>
        {voices.map(voice => (
          <option key={voice.id} value={voice.id}>
            {voice.name} ({voice.language})
          </option>
        ))}
      </select>
    </div>
  );
}
```

### Synchronized with Playback

```typescript
import { useNarrationSync } from '@/lib/narration';

function WalkthroughView({ commentary }: { commentary: string }) {
  const { isNarrating, playNarration, stopNarration } = useNarrationSync(
    commentary,
    {
      autoPlay: true,                      // Auto-play on measure change
      pauseMusicDuringNarration: true,     // Pause music while narrating
      autoAdvanceOnNarrationEnd: false,    // Stay on measure after narration
    }
  );

  return (
    <div>
      {isNarrating ? (
        <button onClick={stopNarration}>Stop Narration</button>
      ) : (
        <button onClick={playNarration}>Play Narration</button>
      )}
    </div>
  );
}
```

### Advanced Configuration

```typescript
import { useNarration } from '@/lib/narration';

function NarrationSettings() {
  const {
    setRate,
    setPitch,
    setVolume,
    setProvider,
    config,
    clearCache,
  } = useNarration();

  return (
    <div>
      <label>
        Speed: {config.rate}x
        <input
          type="range"
          min={0.5}
          max={2.0}
          step={0.1}
          value={config.rate}
          onChange={(e) => setRate(parseFloat(e.target.value))}
        />
      </label>

      <label>
        Volume: {Math.round(config.volume * 100)}%
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={config.volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
        />
      </label>

      <select
        value={config.provider}
        onChange={(e) => setProvider(e.target.value as any)}
      >
        <option value="web-speech">Web Speech (Free)</option>
        <option value="elevenlabs">ElevenLabs (Premium)</option>
        <option value="openai">OpenAI (Premium)</option>
      </select>

      <button onClick={clearCache}>Clear Cache</button>
    </div>
  );
}
```

### Event Handling

```typescript
import { useNarrationEvents } from '@/lib/narration';

function NarrationMonitor() {
  useNarrationEvents((event) => {
    console.log('Narration event:', event.type, event.data);

    switch (event.type) {
      case 'start':
        console.log('Narration started');
        break;
      case 'end':
        console.log('Narration ended');
        break;
      case 'error':
        console.error('Narration error:', event.data);
        break;
      case 'progress':
        console.log('Progress:', event.data.progress);
        break;
    }
  });

  return null; // Or render UI based on events
}
```

## Configuration

### Environment Variables

Add to `.env.local`:

```bash
# Optional: ElevenLabs API Key
NEXT_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_api_key

# Optional: OpenAI API Key
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key
```

### Default Configuration

```typescript
{
  provider: 'web-speech',    // Default to free Web Speech API
  rate: 1.0,                 // Normal speed
  pitch: 1.0,                // Normal pitch (Web Speech only)
  volume: 0.8,               // 80% volume
  muted: false,              // Not muted
  autoAdvance: false,        // Don't auto-advance
  autoPlay: false,           // Don't auto-play
  cacheAudio: true,          // Cache generated audio
}
```

## API Reference

### Main Hook: `useNarration()`

Returns an object with:

**State:**
- `isPlaying: boolean` - Whether narration is currently playing
- `isLoading: boolean` - Whether narration is loading
- `progress: number` - Playback progress (0-1)
- `voices: Voice[]` - Available voices for current provider
- `error: NarrationError | undefined` - Current error state
- `config: NarrationConfig` - Current configuration

**Controls:**
- `speak(text: string, measure?: number): Promise<void>` - Play narration
- `pause(): void` - Pause narration
- `resume(): void` - Resume narration
- `stop(): void` - Stop narration
- `setRate(rate: number): void` - Set playback rate (0.5-2.0)
- `setPitch(pitch: number): void` - Set pitch (0.5-2.0, Web Speech only)
- `setVolume(volume: number): void` - Set volume (0-1)
- `toggleMute(): void` - Toggle mute
- `setVoice(voice: Voice): Promise<void>` - Change voice
- `setProvider(provider: TTSProvider): Promise<void>` - Change provider
- `clearCache(): void` - Clear audio cache
- `updateConfig(config: Partial<NarrationConfig>): void` - Update config

### Sync Hook: `useNarrationSync()`

```typescript
useNarrationSync(
  commentary: string | undefined,
  options?: {
    autoPlay?: boolean;
    pauseMusicDuringNarration?: boolean;
    autoAdvanceOnNarrationEnd?: boolean;
  }
)
```

Returns:
- `currentMeasure: number` - Current measure number
- `isNarrating: boolean` - Whether narration is playing
- `isMusicPlaying: boolean` - Whether music is playing
- `playNarration(): void` - Play current commentary
- `stopNarration(): void` - Stop narration

### Types

```typescript
type TTSProvider = 'web-speech' | 'elevenlabs' | 'openai';

interface Voice {
  id: string;
  name: string;
  language: string;
  gender?: 'male' | 'female' | 'neutral';
  provider: TTSProvider;
  isPremium?: boolean;
}

interface NarrationConfig {
  provider: TTSProvider;
  voice?: Voice;
  rate: number;           // 0.5 - 2.0
  pitch: number;          // 0.5 - 2.0
  volume: number;         // 0.0 - 1.0
  muted: boolean;
  autoAdvance: boolean;
  autoPlay: boolean;
  cacheAudio: boolean;
}
```

## Provider Setup

### ElevenLabs Setup

1. Sign up at [elevenlabs.io](https://elevenlabs.io)
2. Get your API key from the dashboard
3. Add to `.env.local`:
   ```bash
   NEXT_PUBLIC_ELEVENLABS_API_KEY=your_api_key_here
   ```
4. Select ElevenLabs provider in the app

### OpenAI Setup

1. Sign up at [platform.openai.com](https://platform.openai.com)
2. Create an API key
3. Add to `.env.local`:
   ```bash
   NEXT_PUBLIC_OPENAI_API_KEY=your_api_key_here
   ```
4. Select OpenAI provider in the app

## Audio Caching

Generated audio is automatically cached to:
- Reduce API calls to premium providers
- Improve response time for repeated narration
- Work offline after initial generation

**Cache Location:** `public/audio/narration/` (runtime, not committed to git)

**Cache Management:**
```typescript
const { clearCache } = useNarration();
clearCache(); // Clear all cached audio
```

## Best Practices

1. **Start with Web Speech API**: Test with the free provider before setting up premium APIs
2. **Cache Audio**: Keep cacheAudio enabled to reduce API costs
3. **Handle Errors**: Always check for errors and provide fallback UI
4. **Voice Selection**: Let users choose their preferred voice
5. **Volume Control**: Provide independent volume control for narration
6. **Mobile Support**: Web Speech API works well on mobile devices
7. **Network Handling**: Premium providers require network; handle offline gracefully

## Troubleshooting

### Web Speech API Not Working

- **Browser Support**: Check if browser supports Web Speech API
- **HTTPS Required**: Some browsers require HTTPS for Web Speech
- **Voice Loading**: Voices may take time to load on first use

### Premium Providers Not Working

- **API Key**: Verify API key is correctly set in `.env.local`
- **NEXT_PUBLIC Prefix**: Environment variables must start with `NEXT_PUBLIC_`
- **Network**: Check network connectivity
- **Quota**: Verify API quota hasn't been exceeded

### Audio Not Playing

- **User Interaction**: Some browsers require user interaction before playing audio
- **Autoplay Policy**: Check browser autoplay policies
- **Volume**: Verify volume is not muted or set to 0

## Performance Considerations

- **Caching**: First-time generation has latency; subsequent plays are instant
- **API Costs**: Premium providers charge per character
- **Bandwidth**: Cached audio uses local storage
- **Memory**: Large cache may use significant memory; clear periodically

## Future Enhancements

- [ ] SSML support for advanced speech control
- [ ] Multi-language support beyond English
- [ ] Emotion/tone control for expressive narration
- [ ] Background pre-generation for upcoming measures
- [ ] Voice cloning for consistent instructor voice
- [ ] Offline mode with pre-downloaded audio

## Related Documentation

- [Walkthrough System](./walkthrough-system.md)
- [Playback System](./playback-system.md)
- [Audio Engine](./audio-engine.md)
