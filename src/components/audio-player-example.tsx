/**
 * Audio Player Example Component
 * Demonstrates complete audio system integration
 *
 * This component shows how to:
 * 1. Initialize the audio engine
 * 2. Load and play MIDI data
 * 3. Control playback
 * 4. Display current position
 * 5. Handle interactive piano keyboard
 */

'use client'

import { useEffect } from 'react'
import { useAutoInitAudioEngine } from '@/hooks/use-audio-engine'
import { usePlaybackWithKeyboard } from '@/hooks/use-playback'
import { usePianoSounds } from '@/hooks/use-piano-sounds'
import { usePlaybackStore } from '@/lib/stores/playback-store'
import { MIDIData } from '@/lib/audio/types'

export function AudioPlayerExample() {
  // Initialize audio engine (auto-initializes on first user interaction)
  const { engine, isReady, isLoading, error, initialize } = useAutoInitAudioEngine()

  // Get playback controls with keyboard shortcuts
  const playback = usePlaybackWithKeyboard(engine, {
    onNoteOn: (note) => {
      console.log('Note on:', note.midiNote)
    },
    onMeasureChange: (measure) => {
      console.log('Measure:', measure)
    }
  })

  // Get piano keyboard controls
  const piano = usePianoSounds(engine, {
    fixedDuration: 0.8,
    velocity: 0.7
  })

  // Get playback state from store - use primitive selectors to prevent re-render loops
  const isPlaying = usePlaybackStore((s) => s.isPlaying)
  const currentMeasure = usePlaybackStore((s) => s.currentMeasure)
  const currentBeat = usePlaybackStore((s) => s.currentBeat)
  const tempoMultiplier = usePlaybackStore((s) => s.tempoMultiplier)
  const loopEnabled = usePlaybackStore((s) => s.loopEnabled)

  // Derived state for UI
  const state = isPlaying ? 'playing' : 'stopped'
  const currentPosition = { measure: currentMeasure, beat: currentBeat }
  const loopRegion = { enabled: loopEnabled }

  // Example: Load sample MIDI data
  useEffect(() => {
    if (!isReady) return

    // Create simple test MIDI data
    const testMIDI: MIDIData = {
      name: 'Test Song',
      tempo: 120,
      timeSignature: {
        numerator: 4,
        denominator: 4
      },
      events: [
        // Simple C major scale
        { type: 'noteOn', time: 0.0, data: { midiNote: 60, velocity: 80 } },
        { type: 'noteOff', time: 0.5, data: { midiNote: 60, velocity: 0 } },
        { type: 'noteOn', time: 0.5, data: { midiNote: 62, velocity: 80 } },
        { type: 'noteOff', time: 1.0, data: { midiNote: 62, velocity: 0 } },
        { type: 'noteOn', time: 1.0, data: { midiNote: 64, velocity: 80 } },
        { type: 'noteOff', time: 1.5, data: { midiNote: 64, velocity: 0 } },
        { type: 'noteOn', time: 1.5, data: { midiNote: 65, velocity: 80 } },
        { type: 'noteOff', time: 2.0, data: { midiNote: 65, velocity: 0 } },
      ],
      duration: 2.0,
      measures: 1
    }

    playback.loadMIDI(testMIDI)
  }, [isReady, playback])

  // Manual initialization button (in case auto-init doesn't work)
  const handleManualInit = async () => {
    try {
      await initialize()
    } catch (err) {
      console.error('Failed to initialize:', err)
    }
  }

  // Handle tempo change
  const handleTempoChange = (value: number) => {
    playback.setTempoMultiplier(value)
  }

  // Handle loop toggle
  const handleLoopToggle = () => {
    if (loopRegion?.enabled) {
      playback.clearLoop()
    } else {
      playback.setLoop({ measure: 1 }, { measure: 2 })
    }
  }

  // Render loading state
  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
        <p>Loading audio engine...</p>
      </div>
    )
  }

  // Render error state
  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        <p className="mb-4">Failed to load audio: {error.message}</p>
        <button
          onClick={handleManualInit}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    )
  }

  // Render audio not ready state
  if (!isReady) {
    return (
      <div className="p-8 text-center">
        <p className="mb-4">Audio engine not initialized</p>
        <button
          onClick={handleManualInit}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Initialize Audio
        </button>
        <p className="text-sm text-gray-500 mt-2">
          Click any button to enable audio
        </p>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Audio Player</h2>
        <p className="text-gray-600">
          Playback: {state} | Measure: {currentPosition.measure} | Beat: {currentPosition.beat}
        </p>
      </div>

      {/* Playback Controls */}
      <div className="flex justify-center gap-2">
        <button
          onClick={playback.play}
          disabled={state === 'playing'}
          className="px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          Play
        </button>
        <button
          onClick={playback.pause}
          disabled={state !== 'playing'}
          className="px-6 py-3 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
        >
          Pause
        </button>
        <button
          onClick={playback.stop}
          disabled={state === 'stopped'}
          className="px-6 py-3 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
        >
          Stop
        </button>
      </div>

      {/* Tempo Control */}
      <div className="flex items-center justify-center gap-4">
        <label className="font-medium">Tempo:</label>
        <input
          type="range"
          min="0.25"
          max="2.0"
          step="0.25"
          value={tempoMultiplier}
          onChange={(e) => handleTempoChange(parseFloat(e.target.value))}
          className="w-48"
        />
        <span className="w-16 text-right">
          {(tempoMultiplier * 100).toFixed(0)}%
        </span>
      </div>

      {/* Loop Control */}
      <div className="flex justify-center">
        <button
          onClick={handleLoopToggle}
          className={`px-4 py-2 rounded ${
            loopRegion?.enabled
              ? 'bg-blue-500 text-white'
              : 'bg-gray-300 text-gray-700'
          }`}
        >
          Loop {loopRegion?.enabled ? 'On' : 'Off'}
        </button>
      </div>

      {/* Interactive Piano Keys */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4 text-center">
          Interactive Piano (or use QWERTY keys)
        </h3>
        <div className="flex justify-center gap-1">
          {[60, 62, 64, 65, 67, 69, 71, 72].map((midiNote) => (
            <button
              key={midiNote}
              onClick={() => piano.playNote(midiNote)}
              className={`
                w-16 h-32 border-2 rounded
                ${piano.isNotePlaying(midiNote)
                  ? 'bg-blue-500 border-blue-700 text-white'
                  : 'bg-white border-gray-300 hover:bg-gray-100'
                }
              `}
            >
              {['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C'][midiNote - 60]}
            </button>
          ))}
        </div>
        <p className="text-center text-sm text-gray-500 mt-2">
          Keyboard: Z X C V B N M , for C D E F G A B C
        </p>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="border-t pt-6 text-sm text-gray-600">
        <h4 className="font-semibold mb-2">Keyboard Shortcuts:</h4>
        <ul className="space-y-1">
          <li><kbd className="px-2 py-1 bg-gray-100 rounded">Space</kbd> - Play/Pause</li>
          <li><kbd className="px-2 py-1 bg-gray-100 rounded">Esc</kbd> - Stop</li>
          <li><kbd className="px-2 py-1 bg-gray-100 rounded">Shift+Left</kbd> - Previous measure</li>
          <li><kbd className="px-2 py-1 bg-gray-100 rounded">Shift+Right</kbd> - Next measure</li>
        </ul>
      </div>
    </div>
  )
}
