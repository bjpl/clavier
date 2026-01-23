/**
 * Integrated Walkthrough View
 * Complete playback synchronization using the unified useScorePlaybackSync hook
 *
 * This component demonstrates the recommended approach for:
 * - MIDI playback synchronized with score display
 * - Smooth cursor animation during playback
 * - Keyboard highlighting for currently playing notes
 * - Transport controls with seeking and tempo adjustment
 */

'use client'

import { useEffect, useState, useMemo } from 'react'
import { AudioEngine } from '@/lib/audio/audio-engine'
import { useScorePlaybackSync } from '@/hooks/use-score-playback-sync'
import { usePlaybackSync } from '@/lib/playback'
import { ScoreViewer } from '@/components/score/score-viewer'
import { PianoKeyboard } from '@/components/keyboard/piano-keyboard'
import { PlaybackControls } from './playback-controls'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { MIDIData } from '@/lib/audio/types'

interface IntegratedWalkthroughViewProps {
  /** MusicXML content for score display */
  musicXML: string
  /** MIDI data for playback */
  midiData: MIDIData
  /** Total number of measures in piece */
  totalMeasures: number
  /** Time signature numerator (beats per measure) */
  beatsPerMeasure: number
}

/**
 * Complete integrated walkthrough component with synchronized playback
 */
export function IntegratedWalkthroughView({
  musicXML,
  midiData,
  totalMeasures,
  beatsPerMeasure: _beatsPerMeasure
}: IntegratedWalkthroughViewProps) {
  // Audio engine state
  const [audioEngine, setAudioEngine] = useState<AudioEngine | null>(null)
  const [engineReady, setEngineReady] = useState(false)
  const [engineError, setEngineError] = useState<string | null>(null)

  // Initialize audio engine
  useEffect(() => {
    const initAudio = async () => {
      try {
        const engine = new AudioEngine({
          sampleBaseUrl: '/audio/samples',
          volume: 0.7
        })

        await engine.initialize()
        setAudioEngine(engine)
        setEngineReady(true)
      } catch (error) {
        console.error('Failed to initialize audio engine:', error)
        setEngineError('Failed to initialize audio. Please check your browser settings.')
      }
    }

    initAudio()

    return () => {
      audioEngine?.dispose()
    }
  }, [])

  // Use the unified score playback sync hook - this handles everything:
  // - MIDIPlayer creation and management
  // - SyncManager for time-to-position mapping
  // - PlaybackCoordinator connection
  // - Smooth cursor animation
  const {
    playbackState,
    cursorPosition,
    currentMeasure,
    currentBeat,
    tempoMultiplier,
    stop,
    togglePlayback,
    seekToMeasure,
    setTempoMultiplier,
    loadMIDI,
    handleMeasureClick
  } = useScorePlaybackSync({
    engine: audioEngine,
    autoScroll: true,
    syncConfig: {
      smoothCursor: true,
      cursorLookahead: 0.5
    }
  })

  // Subscribe to keyboard highlights from coordinator
  const {
    keyboardHighlights,
    highlightedMeasures
  } = usePlaybackSync({
    enableScoreSync: true,
    enableKeyboardSync: true,
    keyboardSyncConfig: {
      voiceColors: true,
      velocityOpacity: true,
      fadeOutDuration: 150
    }
  })

  // Load MIDI data when engine is ready
  useEffect(() => {
    if (engineReady && audioEngine && midiData) {
      loadMIDI(midiData)
    }
  }, [engineReady, audioEngine, midiData, loadMIDI])

  // Transport control handlers
  const handlePlayPause = () => {
    togglePlayback()
  }

  const handleStop = () => {
    stop()
  }

  const handleSkipBack = () => {
    const newMeasure = Math.max(1, currentMeasure - 1)
    seekToMeasure(newMeasure)
  }

  const handleSkipForward = () => {
    const newMeasure = Math.min(totalMeasures, currentMeasure + 1)
    seekToMeasure(newMeasure)
  }

  const handleTempoChange = (multiplier: number) => {
    setTempoMultiplier(multiplier)
  }

  // Convert keyboard highlights to format expected by PianoKeyboard
  // CRITICAL: Must memoize to prevent creating new array on every render
  const keyboardActiveNotes = useMemo(() =>
    keyboardHighlights.map(highlight => ({
      midiNote: highlight.midiNote,
      voice: highlight.voice?.toLowerCase() as 'soprano' | 'alto' | 'tenor' | 'bass' | undefined,
      velocity: highlight.velocity,
      color: highlight.color
    })),
    [keyboardHighlights]
  )

  if (!engineReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        {engineError ? (
          <div className="text-center">
            <p className="text-destructive font-medium">{engineError}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Please ensure your browser supports Web Audio API
            </p>
          </div>
        ) : (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Initializing audio engine...
            </p>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen p-4 gap-4">
      {/* Playback Controls */}
      <Card>
        <CardContent className="pt-6">
          <PlaybackControls
            isPlaying={playbackState === 'playing'}
            onPlayPause={handlePlayPause}
            onStop={handleStop}
            onSkipBack={handleSkipBack}
            onSkipForward={handleSkipForward}
            onTempoChange={handleTempoChange}
            currentMeasure={currentMeasure}
            currentBeat={currentBeat}
            totalMeasures={totalMeasures}
            tempoMultiplier={tempoMultiplier}
          />
        </CardContent>
      </Card>

      {/* Score Display */}
      <Card className="flex-1 overflow-hidden">
        <CardContent className="p-4 h-full">
          <ScoreViewer
            musicXML={musicXML}
            currentMeasure={currentMeasure}
            currentBeat={currentBeat}
            cursorPosition={cursorPosition.beatProgress}
            highlightedMeasures={highlightedMeasures}
            voiceColors={true}
            enableAutoScroll={true}
            onMeasureClick={handleMeasureClick}
          />
        </CardContent>
      </Card>

      {/* Piano Keyboard */}
      <Card>
        <CardContent className="pt-6 flex justify-center">
          <PianoKeyboard
            activeNotes={keyboardActiveNotes}
            startNote={36} // C2
            endNote={96}   // C7
            showLabels={true}
            voiceColors={true}
          />
        </CardContent>
      </Card>

      {/* Debug Info (can be removed in production) */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="bg-muted">
          <CardContent className="pt-6">
            <div className="text-xs font-mono space-y-1">
              <div>State: {playbackState}</div>
              <div>
                Position: M{cursorPosition.measure}:B{cursorPosition.beat}
                {cursorPosition.beatProgress > 0 && (
                  <span className="ml-1 text-muted-foreground">
                    (+{(cursorPosition.beatProgress * 100).toFixed(1)}%)
                  </span>
                )}
              </div>
              <div>Active Notes: {keyboardHighlights.length}</div>
              <div>
                Highlighted Measures: {highlightedMeasures.join(', ') || 'none'}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
