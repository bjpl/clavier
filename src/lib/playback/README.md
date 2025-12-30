# Playback Synchronization System

Complete system for synchronizing MIDI playback with score display and keyboard visualization.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   PlaybackCoordinator                       │
│  Central event hub for playback synchronization             │
│  - Emits events (note-on, note-off, cursor-update, etc.)   │
│  - Manages cursor position (60fps smooth animation)         │
│  - Tracks active notes                                      │
│  - Handles tempo multiplier                                 │
└──────────────────┬──────────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
┌───────────────┐    ┌────────────────┐
│   ScoreSync   │    │  KeyboardSync  │
│               │    │                │
│ - Auto-scroll │    │ - Highlights   │
│ - Highlight   │    │ - Voice colors │
│ - Smooth      │    │ - Fade effects │
│   animations  │    │ - Velocity     │
└───────────────┘    └────────────────┘
        │                     │
        └──────────┬──────────┘
                   │
                   ▼
        ┌─────────────────────┐
        │  usePlaybackSync()  │
        │  React Hook         │
        │                     │
        │  Subscribes to all  │
        │  coordinator events │
        └─────────────────────┘
```

## Components

### 1. PlaybackCoordinator

Central coordination hub that emits events and manages state.

**Events:**
- `state-change`: Playback state changed (playing/paused/stopped)
- `note-on`: Note started playing
- `note-off`: Note stopped playing
- `measure-change`: Measure changed
- `beat-tick`: Beat tick (for metronome)
- `cursor-update`: Smooth cursor position update (60fps)
- `notes-clear`: All notes cleared
- `tempo-change`: Tempo multiplier changed
- `loop-change`: Loop region changed

**Usage:**
```typescript
import { getPlaybackCoordinator } from '@/lib/playback'

const coordinator = getPlaybackCoordinator()

// Initialize with time signature
coordinator.initialize(4) // 4 beats per measure

// Control playback
coordinator.startPlayback()
coordinator.pausePlayback()
coordinator.stopPlayback()

// Handle MIDI events
coordinator.handleNoteOn(noteEvent, 'soprano')
coordinator.handleNoteOff(60)

// Seek
coordinator.seekTo(5, 3) // Measure 5, Beat 3

// Listen to events
coordinator.on('cursor-update', (position) => {
  console.log(`M${position.measure}:B${position.beat}`)
})
```

### 2. ScoreSync

Manages score cursor updates and auto-scrolling.

**Features:**
- Smooth auto-scroll following playback
- Measure highlighting for loop regions
- Configurable scroll behavior
- Viewport-aware scrolling

**Usage:**
```typescript
import { ScoreSync } from '@/lib/playback'

const scoreSync = new ScoreSync({
  autoScroll: true,
  scrollDuration: 300,
  highlightMeasure: true
})

// Set scroll container
scoreSync.setScrollContainer(containerElement)

// Register measure elements for auto-scroll
scoreSync.registerMeasureElements(measureElementsMap)

// Update cursor (called by coordinator)
scoreSync.updateCursor({ measure: 5, beat: 2, beatProgress: 0.5 })

// Highlight loop region
scoreSync.highlightMeasures([1, 2, 3, 4])
```

### 3. KeyboardSync

Manages piano keyboard highlighting with voice colors and fade effects.

**Features:**
- Voice-specific colors (soprano, alto, tenor, bass)
- Velocity-based opacity
- Smooth fade-out effects
- Polyphonic highlighting

**Voice Colors:**
- Soprano: Blue (#2563EB)
- Alto: Green (#059669)
- Tenor: Amber (#D97706)
- Bass: Purple (#7C3AED)

**Usage:**
```typescript
import { KeyboardSync } from '@/lib/playback'

const keyboardSync = new KeyboardSync({
  voiceColors: true,
  velocityOpacity: true,
  fadeOutDuration: 150
})

// Add highlight
keyboardSync.addNoteHighlight({
  midiNote: 60,
  voice: 'soprano',
  velocity: 100,
  startTime: performance.now()
})

// Remove highlight (with fade)
keyboardSync.removeNoteHighlight(60)

// Get all highlights
const highlights = keyboardSync.getHighlights()

// Calculate opacity
const opacity = keyboardSync.getOpacityForHighlight(highlight)
```

### 4. usePlaybackSync Hook

React hook that subscribes to coordinator events and provides synchronized state.

**Returns:**
```typescript
{
  cursorPosition: CursorPosition      // Current cursor position
  keyboardHighlights: KeyHighlight[]  // Active keyboard highlights
  currentMeasure: number              // Current measure number
  highlightedMeasures: number[]       // Loop region measures
  playbackState: 'stopped' | 'playing' | 'paused'
  scoreSync: ScoreSync | null         // ScoreSync instance
  keyboardSync: KeyboardSync | null   // KeyboardSync instance
  coordinator: PlaybackCoordinator    // Coordinator instance
}
```

**Usage:**
```typescript
import { usePlaybackSync } from '@/lib/playback'

function MyComponent() {
  const {
    cursorPosition,
    keyboardHighlights,
    scoreSync,
    coordinator
  } = usePlaybackSync({
    enableScoreSync: true,
    enableKeyboardSync: true,
    scoreSyncConfig: {
      autoScroll: true,
      scrollDuration: 300
    },
    keyboardSyncConfig: {
      voiceColors: true,
      fadeOutDuration: 150
    }
  })

  return (
    <>
      <ScoreViewer
        currentMeasure={cursorPosition.measure}
        currentBeat={cursorPosition.beat}
      />
      <PianoKeyboard activeNotes={keyboardHighlights} />
    </>
  )
}
```

## Integration Guide

### Step 1: Wire MIDI Player to Coordinator

```typescript
import { usePlayback } from '@/hooks/use-playback'
import { getPlaybackCoordinator } from '@/lib/playback'

const coordinator = getPlaybackCoordinator()

const { play, pause, stop } = usePlayback(audioEngine, {
  onNoteOn: (note) => {
    coordinator.handleNoteOn(note, determineVoice(note))
  },
  onNoteOff: (note) => {
    coordinator.handleNoteOff(note.midiNote)
  },
  onMeasureChange: (measure) => {
    coordinator.handleMeasureChange(measure, 1)
  },
  onBeatChange: (beat) => {
    coordinator.handleBeatTick(currentMeasure, beat)
  }
})
```

### Step 2: Use Sync Hook

```typescript
const {
  cursorPosition,
  keyboardHighlights,
  playbackState
} = usePlaybackSync({
  enableScoreSync: true,
  enableKeyboardSync: true
})
```

### Step 3: Connect Components

```typescript
<ScoreViewer
  musicXML={musicXML}
  currentMeasure={cursorPosition.measure}
  currentBeat={cursorPosition.beat}
  cursorPosition={cursorPosition.beatProgress}
  enableAutoScroll={true}
/>

<PianoKeyboard
  activeNotes={keyboardHighlights.map(h => ({
    midiNote: h.midiNote,
    voice: h.voice,
    color: h.color
  }))}
  voiceColors={true}
/>

<PlaybackControls
  isPlaying={playbackState === 'playing'}
  onPlayPause={() => {
    if (playbackState === 'playing') {
      pause()
      coordinator.pausePlayback()
    } else {
      play()
      coordinator.startPlayback()
    }
  }}
  onStop={() => {
    stop()
    coordinator.stopPlayback()
  }}
/>
```

## Performance Considerations

### 60 FPS Rendering

The coordinator uses `requestAnimationFrame` for smooth cursor movement:

```typescript
// Smooth cursor animation at 60fps
private animateCursor = (): void => {
  if (this.state.state !== 'playing') return

  // Calculate beat progress
  const deltaTime = (now - lastUpdateTime) / 1000
  const beatProgress = deltaTime / secondsPerBeat

  // Update cursor
  this.state.cursor.beatProgress += beatProgress
  this.emit('cursor-update', this.state.cursor)

  // Continue animation
  requestAnimationFrame(this.animateCursor)
}
```

### Event Throttling

Cursor updates are emitted at 60fps but components can throttle if needed:

```typescript
import { throttle } from 'lodash'

const throttledUpdate = throttle((position) => {
  // Update UI
}, 16) // ~60fps

coordinator.on('cursor-update', throttledUpdate)
```

### Memory Management

Always clean up on unmount:

```typescript
useEffect(() => {
  return () => {
    scoreSync?.dispose()
    keyboardSync?.dispose()
    coordinator.dispose()
  }
}, [])
```

## Example: Complete Integration

See `src/components/walkthrough/integrated-walkthrough-view.tsx` for a complete working example.

## Testing

### Manual Testing

1. Load a MIDI file with the integrated view
2. Press play and verify:
   - Score scrolls automatically
   - Cursor moves smoothly (60fps)
   - Keyboard highlights notes with correct colors
   - Notes fade out smoothly
   - Transport controls work correctly

### Performance Testing

Monitor frame rate during playback:

```typescript
let frameCount = 0
let lastTime = performance.now()

coordinator.on('cursor-update', () => {
  frameCount++

  const now = performance.now()
  if (now - lastTime >= 1000) {
    console.log(`FPS: ${frameCount}`)
    frameCount = 0
    lastTime = now
  }
})
```

Target: 60 FPS during playback

## Troubleshooting

### Score not scrolling
- Verify `scoreSync.setScrollContainer()` called with correct element
- Check `enableAutoScroll` prop is true
- Verify measure elements registered with `scoreSync.registerMeasureElements()`

### Keyboard not highlighting
- Verify MIDI events wired to coordinator
- Check `voiceColors` prop is true
- Verify notes have velocity > 0

### Choppy cursor movement
- Check browser performance (should maintain 60fps)
- Verify no expensive operations in event handlers
- Consider throttling UI updates if needed

## API Reference

See TypeScript interfaces in source files for complete API documentation.
