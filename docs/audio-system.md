# Clavier Audio System Documentation

## Overview

The audio system provides MIDI synthesis and playback capabilities using Tone.js. It consists of three main components:

1. **AudioEngine** - Core audio synthesis using piano samples
2. **MIDIPlayer** - MIDI playback with tempo control and looping
3. **React Hooks** - Integration with React components and Zustand store

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  React Components                   │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│              React Hooks Layer                      │
│  • useAudioEngine   - Engine lifecycle              │
│  • usePlayback      - Playback control              │
│  • usePianoSounds   - Interactive piano             │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│           Core Audio Components                     │
│  ┌──────────────┐        ┌──────────────┐          │
│  │ AudioEngine  │◄───────┤ MIDIPlayer   │          │
│  └──────┬───────┘        └──────────────┘          │
│         │                                            │
│         ▼                                            │
│    Tone.js Sampler                                  │
│         │                                            │
│         ▼                                            │
│   Web Audio API                                     │
└─────────────────────────────────────────────────────┘
```

## Components

### 1. AudioEngine (`src/lib/audio/audio-engine.ts`)

**Purpose**: Manages Tone.js sampler and Web Audio API context.

**Key Features**:
- Loads Salamander Grand Piano samples from CDN
- Handles browser AudioContext suspension/resume
- Provides note playback with precise timing
- Volume control and muting
- Singleton pattern for global access

**Usage**:
```typescript
import { getGlobalAudioEngine } from '@/lib/audio'

const engine = getGlobalAudioEngine()
await engine.initialize()

// Play middle C for 1 second
engine.playNote(60, 1.0)
```

**Sample Loading**:
By default, uses free Salamander Grand Piano samples from:
```
https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_grand_piano-mp3/{note}.mp3
```

Custom samples can be configured:
```typescript
const engine = new AudioEngine({
  sampleBaseUrl: 'https://your-cdn.com/samples'
})
```

### 2. MIDIPlayer (`src/lib/audio/midi-player.ts`)

**Purpose**: Controls MIDI playback with transport synchronization.

**Key Features**:
- Loads and schedules MIDI events
- Tempo control with multipliers (0.25x - 2.0x)
- Loop regions for practice
- Position tracking (measure/beat)
- Event callbacks for UI synchronization

**Usage**:
```typescript
import { MIDIPlayer } from '@/lib/audio'

const player = new MIDIPlayer(engine)

// Load MIDI data
player.loadMIDI(midiData)

// Setup callbacks
player.onNoteOn((note) => {
  console.log('Note on:', note.midiNote)
})

player.onMeasureChange((measure) => {
  console.log('Now at measure:', measure)
})

// Playback control
player.play()
player.pause()
player.stop()
player.seekToMeasure(5)

// Practice features
player.setTempoMultiplier(0.5) // Half speed
player.setLoop({ measure: 1 }, { measure: 4 }) // Loop bars 1-4
```

### 3. React Hooks

#### useAudioEngine

**Purpose**: Manages audio engine lifecycle in React components.

**Features**:
- Lazy initialization
- Loading states
- Error handling
- Auto-initialization on user interaction

**Usage**:
```typescript
import { useAudioEngine } from '@/hooks/use-audio-engine'

function MyComponent() {
  const { engine, isReady, isLoading, error, initialize } = useAudioEngine()

  useEffect(() => {
    // Initialize on mount
    initialize().catch(console.error)
  }, [])

  if (!isReady) return <div>Loading audio...</div>

  return <div>Audio ready!</div>
}
```

#### usePlayback

**Purpose**: Integrates MIDIPlayer with playback store.

**Features**:
- Playback control functions
- Automatic store synchronization
- Active notes tracking
- Keyboard shortcuts support

**Usage**:
```typescript
import { usePlayback } from '@/hooks/use-playback'
import { useAudioEngine } from '@/hooks/use-audio-engine'

function Player() {
  const { engine } = useAudioEngine()
  const {
    play,
    pause,
    stop,
    seekToMeasure,
    loadMIDI
  } = usePlayback(engine, {
    onNoteOn: (note) => highlightNote(note.midiNote),
    onMeasureChange: (measure) => scrollToMeasure(measure)
  })

  return (
    <div>
      <button onClick={play}>Play</button>
      <button onClick={pause}>Pause</button>
      <button onClick={stop}>Stop</button>
    </div>
  )
}
```

#### usePianoSounds

**Purpose**: Interactive piano keyboard sound playback.

**Features**:
- Immediate note playback
- Active note tracking
- Touch support variant
- Keyboard mapping variant (QWERTY to piano)

**Usage**:
```typescript
import { usePianoSounds } from '@/hooks/use-piano-sounds'

function PianoKey({ midiNote }: { midiNote: number }) {
  const { engine } = useAudioEngine()
  const { playNote, isNotePlaying } = usePianoSounds(engine)

  return (
    <button
      className={isNotePlaying(midiNote) ? 'active' : ''}
      onClick={() => playNote(midiNote)}
    >
      {midiToNoteName(midiNote)}
    </button>
  )
}
```

## Data Flow

### MIDI Playback Flow

```
1. Load MIDI Data
   └─> MIDIPlayer.loadMIDI(data)
       └─> Parse events
       └─> Set tempo
       └─> Reset position

2. Start Playback
   └─> MIDIPlayer.play()
       └─> Schedule all events with Tone.Transport
       └─> Start position tracking
       └─> Update playback store

3. Event Playback
   └─> Tone.Transport triggers event
       └─> AudioEngine.playNote()
           └─> Tone.Sampler plays sample
       └─> Callback fires
           └─> Update UI (highlight note)
           └─> Update store (active notes)

4. Position Tracking
   └─> 50ms interval
       └─> Get Tone.Transport.seconds
       └─> Convert to measure/beat
       └─> Fire callbacks if changed
```

### Interactive Piano Flow

```
1. User Action (click/touch/keyboard)
   └─> Component event handler
       └─> usePianoSounds.playNote(midiNote)
           └─> AudioEngine.playNote()
               └─> Tone.Sampler plays sample
           └─> Add to active notes
           └─> Schedule auto-release
```

## Browser Compatibility

### AudioContext Autoplay Policy

Modern browsers require user interaction before audio can play:

```typescript
// ✅ Correct - Initialize after user interaction
button.addEventListener('click', async () => {
  await engine.initialize()
  player.play()
})

// ❌ Wrong - Will fail silently
window.addEventListener('load', async () => {
  await engine.initialize() // AudioContext remains suspended
  player.play() // No sound
})
```

The `useAutoInitAudioEngine` hook handles this automatically:

```typescript
// Automatically initializes on first click/tap/keypress
const { engine } = useAutoInitAudioEngine()
```

## Performance Considerations

### Sample Loading

- **First Load**: ~2-3 seconds (downloads 29 piano samples)
- **Cached**: ~100ms (uses browser cache)
- **Size**: ~8MB total for all samples

### Playback Performance

- **Latency**: <10ms on modern devices
- **CPU Usage**: ~2-5% during playback
- **Memory**: ~30MB for loaded samples
- **Max Polyphony**: ~64 simultaneous notes (Tone.js limitation)

### Optimization Tips

1. **Preload samples early**:
   ```typescript
   useEffect(() => {
     engine?.initialize() // Load on app mount
   }, [])
   ```

2. **Use velocity for dynamics**:
   ```typescript
   engine.playNote(60, 1.0, undefined, 0.3) // Soft
   engine.playNote(60, 1.0, undefined, 1.0) // Loud
   ```

3. **Batch operations**:
   ```typescript
   // Play chord
   [60, 64, 67].forEach(note => {
     engine.playNote(note, 2.0, Tone.now())
   })
   ```

## Testing

### Unit Tests

```typescript
import { AudioEngine } from '@/lib/audio'

describe('AudioEngine', () => {
  let engine: AudioEngine

  beforeEach(() => {
    engine = new AudioEngine()
  })

  afterEach(() => {
    engine.dispose()
  })

  test('initializes successfully', async () => {
    await engine.initialize()
    expect(engine.isReady).toBe(true)
  })

  test('plays notes', async () => {
    await engine.initialize()
    expect(() => engine.playNote(60, 1.0)).not.toThrow()
  })
})
```

### Integration Tests

```typescript
import { MIDIPlayer } from '@/lib/audio'

describe('MIDIPlayer', () => {
  test('loads and plays MIDI data', async () => {
    const engine = new AudioEngine()
    await engine.initialize()

    const player = new MIDIPlayer(engine)
    const midiData = createTestMIDI()

    player.loadMIDI(midiData)
    expect(player.state).toBe('stopped')

    player.play()
    expect(player.state).toBe('playing')
  })
})
```

## Troubleshooting

### No Sound Playing

1. **Check AudioContext state**:
   ```typescript
   console.log(Tone.context.state) // Should be 'running'
   ```

2. **Check if samples loaded**:
   ```typescript
   console.log(engine.isReady) // Should be true
   ```

3. **Check volume/mute**:
   ```typescript
   engine.setVolume(0.8)
   engine.setMute(false)
   ```

### Playback Position Drift

If playback position becomes out of sync:

```typescript
// Force resync
player.stop()
player.seekToMeasure(1)
player.play()
```

### Memory Leaks

Always dispose resources when done:

```typescript
useEffect(() => {
  return () => {
    player.dispose()
    engine.dispose()
  }
}, [])
```

## Future Enhancements

1. **Multiple Instruments**: Support piano, strings, brass, etc.
2. **Recording**: Record user performance as MIDI
3. **Effects**: Reverb, EQ, compression
4. **Metronome**: Visual and audio click track
5. **Tuning**: Adjustable concert pitch (A=440Hz)
6. **MIDI Input**: Support for external MIDI keyboards
7. **Waveform Visualization**: Real-time audio visualization

## References

- [Tone.js Documentation](https://tonejs.github.io/)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Salamander Piano Samples](https://github.com/gleitz/midi-js-soundfonts)
- [MIDI Specification](https://www.midi.org/specifications)
