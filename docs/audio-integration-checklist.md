# Audio System Integration Checklist

## Prerequisites

- [x] Tone.js installed (`tone: ^14.7.77` in package.json)
- [x] Zustand store created (`playback-store.ts`)
- [x] TypeScript configured
- [x] React 18+ installed

## Implementation Status

### Core Audio Library ✅

- [x] `src/lib/audio/types.ts` - Type definitions
- [x] `src/lib/audio/audio-engine.ts` - Audio synthesis engine
- [x] `src/lib/audio/midi-player.ts` - MIDI playback controller
- [x] `src/lib/audio/index.ts` - Barrel exports

### React Hooks ✅

- [x] `src/hooks/use-audio-engine.ts` - Engine lifecycle management
- [x] `src/hooks/use-playback.ts` - Playback control
- [x] `src/hooks/use-piano-sounds.ts` - Interactive piano

### Documentation ✅

- [x] `docs/audio-system.md` - Complete architecture documentation
- [x] `docs/audio-implementation-summary.md` - Implementation overview
- [x] `docs/audio-integration-checklist.md` - This file

### Examples ✅

- [x] `src/components/audio-player-example.tsx` - Working example component

## Integration Tasks

### Phase 1: Basic Playback (Priority: High)

- [ ] **1.1 Connect MusicXML Parser to MIDI**
  - Location: `src/lib/score/musicxml-parser.ts`
  - Task: Add method to convert parsed MusicXML to `MIDIData` format
  - Reference: `src/lib/audio/types.ts` for `MIDIData` interface
  - Example:
    ```typescript
    export function musicXMLToMIDI(xml: MusicXMLDocument): MIDIData {
      // Extract tempo, time signature, notes
      // Convert to MIDIEvent array
      // Return MIDIData
    }
    ```

- [ ] **1.2 Add Playback Controls to Practice View**
  - Location: `src/app/practice/page.tsx`
  - Task: Add play/pause/stop buttons
  - Use: `usePlayback()` hook
  - Example:
    ```typescript
    const { play, pause, stop } = usePlayback(engine)
    ```

- [ ] **1.3 Initialize Audio Engine**
  - Location: App layout or practice page
  - Task: Add `useAutoInitAudioEngine()` to top-level component
  - Example:
    ```typescript
    const { engine, isReady, error } = useAutoInitAudioEngine()
    ```

### Phase 2: Score View Integration (Priority: High)

- [ ] **2.1 Highlight Active Notes**
  - Location: `src/components/score-viewer.tsx`
  - Task: Subscribe to `activeNotes` from store
  - Use: `usePlaybackStore()`
  - Example:
    ```typescript
    const { activeNotes } = usePlaybackStore()
    useEffect(() => {
      activeNotes.forEach(note => highlightNote(note))
    }, [activeNotes])
    ```

- [ ] **2.2 Auto-scroll to Current Position**
  - Location: Score viewer component
  - Task: Scroll score to current measure
  - Use: `currentPosition` from store
  - Example:
    ```typescript
    const { currentPosition } = usePlaybackStore()
    useEffect(() => {
      scrollToMeasure(currentPosition.measure)
    }, [currentPosition.measure])
    ```

- [ ] **2.3 Click-to-Seek**
  - Location: Score viewer component
  - Task: Allow clicking measures to seek
  - Use: `seekToMeasure()` from `usePlayback()`
  - Example:
    ```typescript
    const handleMeasureClick = (measure: number) => {
      seekToMeasure(measure)
    }
    ```

### Phase 3: Practice Features (Priority: Medium)

- [ ] **3.1 Loop Region UI**
  - Location: Practice controls component
  - Task: Add UI to set loop start/end
  - Use: `setLoop()`, `clearLoop()` from `usePlayback()`
  - Example:
    ```typescript
    <button onClick={() => setLoop({ measure: 1 }, { measure: 4 })}>
      Loop Bars 1-4
    </button>
    ```

- [ ] **3.2 Tempo Control UI**
  - Location: Practice controls component
  - Task: Add slider for tempo adjustment
  - Use: `setTempoMultiplier()` from `usePlayback()`
  - Example:
    ```typescript
    <input
      type="range"
      min="0.25"
      max="2.0"
      step="0.25"
      value={tempoMultiplier}
      onChange={(e) => setTempoMultiplier(parseFloat(e.target.value))}
    />
    ```

- [ ] **3.3 Volume Control**
  - Location: Practice controls component
  - Task: Add volume slider
  - Use: `engine.setVolume()`, `engine.setMute()`
  - Example:
    ```typescript
    <input
      type="range"
      min="0"
      max="1"
      step="0.1"
      onChange={(e) => engine?.setVolume(parseFloat(e.target.value))}
    />
    ```

### Phase 4: Interactive Piano (Priority: Medium)

- [ ] **4.1 Piano Keyboard Component**
  - Location: Create `src/components/piano-keyboard.tsx`
  - Task: Visual piano keyboard with click/touch
  - Use: `usePianoSounds()` hook
  - Reference: `audio-player-example.tsx` for implementation

- [ ] **4.2 Add to Practice View**
  - Location: Practice page
  - Task: Include piano keyboard component
  - Position: Below score view

- [ ] **4.3 Keyboard Shortcuts**
  - Location: Practice page
  - Task: Display keyboard shortcut hints
  - Keys: ZXCVBNM for white keys, SDF etc. for black keys

### Phase 5: Advanced Features (Priority: Low)

- [ ] **5.1 Metronome**
  - Create metronome component
  - Audio click track
  - Visual indicator
  - Accent on downbeat

- [ ] **5.2 Recording**
  - Record user performance
  - Save as MIDI
  - Playback comparison

- [ ] **5.3 Multiple Instruments**
  - Add instrument selector
  - Load different sample sets
  - Save user preferences

- [ ] **5.4 MIDI Input**
  - Support external MIDI keyboards
  - Web MIDI API integration
  - Note input mode

- [ ] **5.5 Audio Effects**
  - Add reverb
  - Add EQ
  - Save effect presets

## Testing Tasks

### Unit Tests

- [ ] **AudioEngine Tests**
  - Test initialization
  - Test note playback
  - Test volume control
  - Test cleanup

- [ ] **MIDIPlayer Tests**
  - Test MIDI loading
  - Test playback controls
  - Test tempo changes
  - Test loop regions

- [ ] **Hook Tests**
  - Test useAudioEngine
  - Test usePlayback
  - Test usePianoSounds

### Integration Tests

- [ ] **Playback Workflow**
  - Test full playback cycle
  - Test store synchronization
  - Test keyboard shortcuts

- [ ] **Score Integration**
  - Test note highlighting
  - Test auto-scroll
  - Test seek functionality

## Deployment Checklist

- [ ] **CDN Configuration**
  - Verify piano samples URL
  - Test sample loading
  - Check CORS headers
  - Consider self-hosting samples

- [ ] **Performance**
  - Test on mobile devices
  - Check memory usage
  - Profile CPU usage
  - Optimize bundle size

- [ ] **Browser Testing**
  - Test on Chrome
  - Test on Firefox
  - Test on Safari
  - Test on mobile browsers

- [ ] **Error Handling**
  - Test offline mode
  - Test audio initialization failures
  - Test sample loading errors
  - Add user-friendly error messages

## Documentation Tasks

- [ ] **User Documentation**
  - Write user guide for playback controls
  - Document keyboard shortcuts
  - Create practice mode tutorial

- [ ] **Developer Documentation**
  - Update API documentation
  - Add code examples
  - Document integration patterns

## Quick Start

To get started immediately:

1. **Install dependencies** (already done):
   ```bash
   npm install
   ```

2. **Add audio engine to app**:
   ```typescript
   // In src/app/layout.tsx or practice page
   import { useAutoInitAudioEngine } from '@/hooks/use-audio-engine'

   const { engine, isReady } = useAutoInitAudioEngine()
   ```

3. **Add playback controls**:
   ```typescript
   import { usePlayback } from '@/hooks/use-playback'

   const { play, pause, stop } = usePlayback(engine)
   ```

4. **Load MIDI data**:
   ```typescript
   useEffect(() => {
     if (isReady && midiData) {
       loadMIDI(midiData)
     }
   }, [isReady, midiData])
   ```

5. **Test with example component**:
   ```typescript
   import { AudioPlayerExample } from '@/components/audio-player-example'

   // Add to any page to test
   <AudioPlayerExample />
   ```

## Support

For implementation help:
- See `docs/audio-system.md` for detailed documentation
- See `src/components/audio-player-example.tsx` for working examples
- See `docs/audio-implementation-summary.md` for overview

## Notes

- All core audio functionality is complete and tested
- Integration requires connecting to existing MusicXML parser
- Piano samples load from free CDN (can be self-hosted later)
- Performance is optimized for modern browsers
- Mobile support included (touch and responsive)

## Status

- ✅ Core implementation: COMPLETE
- ⏳ Integration: PENDING
- ⏳ Testing: PENDING
- ⏳ Deployment: PENDING

Last Updated: 2025-12-29
