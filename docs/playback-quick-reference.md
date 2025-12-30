# Playback Synchronization - Quick Reference

## Quick Start

```typescript
import { usePlaybackSync } from '@/lib/playback'
import { getPlaybackCoordinator } from '@/lib/playback'

// 1. Get coordinator
const coordinator = getPlaybackCoordinator()
coordinator.initialize(4) // 4/4 time

// 2. Use sync hook
const { cursorPosition, keyboardHighlights, playbackState } = usePlaybackSync()

// 3. Wire MIDI events
usePlayback(audioEngine, {
  onNoteOn: (note) => coordinator.handleNoteOn(note, voice),
  onNoteOff: (note) => coordinator.handleNoteOff(note.midiNote),
  onMeasureChange: (m) => coordinator.handleMeasureChange(m),
  onBeatChange: (b) => coordinator.handleBeatTick(measure, b)
})

// 4. Use in components
<ScoreViewer currentMeasure={cursorPosition.measure} />
<PianoKeyboard activeNotes={keyboardHighlights} />
```

## Event Types

| Event | Data | Purpose |
|-------|------|---------|
| `state-change` | `'stopped' \| 'playing' \| 'paused'` | Playback state |
| `note-on` | `ActiveNoteInfo` | Note started |
| `note-off` | `number` | Note stopped |
| `measure-change` | `(measure, beat)` | Measure changed |
| `beat-tick` | `(measure, beat)` | Beat tick |
| `cursor-update` | `CursorPosition` | Cursor moved (60fps) |
| `notes-clear` | `void` | All notes cleared |
| `tempo-change` | `number` | Tempo multiplier changed |
| `loop-change` | `number[]` | Loop region changed |

## Component Props

### ScoreViewer
```typescript
<ScoreViewer
  musicXML={xml}
  currentMeasure={cursorPosition.measure}
  currentBeat={cursorPosition.beat}
  cursorPosition={cursorPosition.beatProgress}
  highlightedMeasures={[1, 2, 3, 4]}
  voiceColors={true}
  enableAutoScroll={true}
/>
```

### PianoKeyboard
```typescript
<PianoKeyboard
  activeNotes={keyboardHighlights.map(h => ({
    midiNote: h.midiNote,
    voice: h.voice,
    color: h.color,
    velocity: h.velocity
  }))}
  voiceColors={true}
  showLabels={true}
/>
```

### PlaybackControls
```typescript
<PlaybackControls
  isPlaying={playbackState === 'playing'}
  onPlayPause={handlePlayPause}
  onStop={handleStop}
  onSkipBack={() => seekToMeasure(currentMeasure - 1)}
  onSkipForward={() => seekToMeasure(currentMeasure + 1)}
  onTempoChange={setTempoMultiplier}
  currentMeasure={currentMeasure}
  currentBeat={cursorPosition.beat}
  totalMeasures={totalMeasures}
  tempoMultiplier={1.0}
/>
```

## Coordinator Methods

```typescript
// Playback control
coordinator.startPlayback()
coordinator.pausePlayback()
coordinator.stopPlayback()
coordinator.seekTo(measure, beat)

// MIDI events
coordinator.handleNoteOn(note, voice)
coordinator.handleNoteOff(midiNote)
coordinator.handleMeasureChange(measure, beat)
coordinator.handleBeatTick(measure, beat)

// Configuration
coordinator.setTempoMultiplier(1.5) // 150% speed
coordinator.setHighlightedMeasures([1, 2, 3, 4])
coordinator.setAutoScroll(true)

// State
const state = coordinator.getState()
const notes = coordinator.getActiveNotes()
```

## Configuration Objects

### ScoreSyncConfig
```typescript
{
  autoScroll: true,
  scrollDuration: 300,      // ms
  scrollLeadMeasures: 1,    // measures
  highlightMeasure: true,
  autoAdjustZoom: false
}
```

### KeyboardSyncConfig
```typescript
{
  voiceColors: true,
  velocityOpacity: true,
  fadeOutDuration: 150,     // ms
  minOpacity: 0.4,
  maxOpacity: 0.9
}
```

## Voice Colors

```typescript
import { VOICE_COLORS } from '@/lib/playback'

VOICE_COLORS = {
  soprano: '#2563EB',  // Blue
  alto: '#059669',     // Green
  tenor: '#D97706',    // Amber
  bass: '#7C3AED'      // Purple
}
```

## Common Patterns

### Transport Controls
```typescript
const handlePlayPause = () => {
  if (playbackState === 'playing') {
    pause()
    coordinator.pausePlayback()
  } else {
    play()
    coordinator.startPlayback()
  }
}

const handleStop = () => {
  stop()
  coordinator.stopPlayback()
}
```

### Seeking
```typescript
const skipToMeasure = (measure: number) => {
  seekToMeasure(measure)
  coordinator.seekTo(measure)
}
```

### Loop Region
```typescript
const setLoop = (start: number, end: number) => {
  const measures = Array.from(
    { length: end - start + 1 },
    (_, i) => start + i
  )
  coordinator.setHighlightedMeasures(measures)
}
```

### Cleanup
```typescript
useEffect(() => {
  return () => {
    scoreSync?.dispose()
    keyboardSync?.dispose()
    coordinator.dispose()
  }
}, [])
```

## Performance Tips

1. **Throttle cursor updates if needed:**
```typescript
const throttledUpdate = throttle((position) => {
  // Update UI
}, 16) // ~60fps

coordinator.on('cursor-update', throttledUpdate)
```

2. **Use memo for expensive calculations:**
```typescript
const keyboardNotes = useMemo(
  () => keyboardHighlights.map(h => ({ /* ... */ })),
  [keyboardHighlights]
)
```

3. **Debounce measure element registration:**
```typescript
const registerElements = debounce((elements) => {
  scoreSync.registerMeasureElements(elements)
}, 100)
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Score not scrolling | Check `scoreSync.setScrollContainer()` called |
| Keyboard not highlighting | Verify MIDI events wired to coordinator |
| Choppy cursor | Check browser performance (target 60fps) |
| Notes not clearing | Verify `handleNoteOff` called |
| Wrong voice colors | Check voice parameter in `handleNoteOn` |

## File Locations

```
src/lib/playback/
├── playback-coordinator.ts     # Central hub
├── score-sync.ts               # Score auto-scroll
├── keyboard-sync.ts            # Keyboard highlights
├── index.ts                    # Exports
├── hooks/
│   └── use-playback-sync.ts   # React hook
└── examples/
    └── basic-usage.ts         # Usage examples

src/components/walkthrough/
└── integrated-walkthrough-view.tsx  # Complete demo
```

## See Also

- Full documentation: `src/lib/playback/README.md`
- Implementation summary: `docs/playback-synchronization-implementation.md`
- Examples: `src/lib/playback/examples/basic-usage.ts`
- Demo component: `src/components/walkthrough/integrated-walkthrough-view.tsx`
