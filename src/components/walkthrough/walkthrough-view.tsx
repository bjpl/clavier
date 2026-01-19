'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { PieceSelector } from './piece-selector'
import { MeasureNavigation } from './measure-navigation'
import { CommentaryPanel } from './commentary-panel'
import { PlaybackControls } from './playback-controls'
import { SimilarPatternsModal } from './similar-patterns-modal'
import { LearnMoreModal } from './learn-more-modal'
import { Button } from '@/components/ui/button'
import { SplitView } from '@/components/layout/split-view'
import { ViewControls } from '@/components/layout/view-controls'
import { ScoreDisplay, ScoreDisplayRef } from '@/components/score/score-display'
import { PianoKeyboard, ActiveNote } from '@/components/keyboard/piano-keyboard'
import { useViewStore, selectSplitViewSettings } from '@/lib/stores/view-store'
import { useWalkthroughStore } from '@/lib/stores/walkthrough-store'
import { usePlaybackStore } from '@/lib/stores/playback-store'
import { useViewShortcuts } from '@/hooks/use-keyboard-shortcuts'
import { useAudioEngine } from '@/hooks/use-audio-engine'
import { useMeasurePlayback } from '@/hooks/use-playback'
import { useMeasureCommentary, useScoreXML, useMidiData } from '@/lib/hooks/use-walkthrough-data'
import { Settings, Loader2 } from 'lucide-react'

interface Measure {
  number: number
  notes: unknown[]
  duration: number
}

interface Annotation {
  id: string
  measureNumber: number
  type: string
  content: string
}

interface Piece {
  id?: string
  title: string
  bwv: number
  key: string
  type?: 'prelude' | 'fugue'
  measures: Measure[]
  annotations: Annotation[]
  totalMeasures?: number
}

interface WalkthroughViewProps {
  piece: Piece
  measures: Measure[]
  annotations: Annotation[]
}

export function WalkthroughView({ piece, measures, annotations }: WalkthroughViewProps) {
  const router = useRouter()
  const scoreRef = useRef<ScoreDisplayRef>(null)

  // Local state
  const [currentMeasure, setCurrentMeasure] = useState(1)
  const [similarPatternsOpen, setSimilarPatternsOpen] = useState(false)
  const [learnMoreOpen, setLearnMoreOpen] = useState(false)
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null)
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null)

  // Split view state from Zustand store
  const splitViewSettings = useViewStore(selectSplitViewSettings)
  const setSplitRatio = useViewStore((state) => state.setSplitRatio)
  const toggleScore = useViewStore((state) => state.toggleScore)
  const toggleKeyboard = useViewStore((state) => state.toggleKeyboard)
  const toggleOrientation = useViewStore((state) => state.toggleOrientation)
  const resetLayout = useViewStore((state) => state.resetLayout)
  const swapPanels = useViewStore((state) => state.swapPanels)

  // Walkthrough store for progress tracking
  const markVisited = useWalkthroughStore((state) => state.markVisited)

  // Playback store for active notes
  const activeNotes = usePlaybackStore((state) => state.activeNotes)

  // Audio engine and playback
  const { engine, isReady: audioReady, initialize: initAudio, isLoading: audioLoading } = useAudioEngine()
  const {
    play,
    pause,
    stop,
    playMeasure,
    playMeasureRange,
    playbackState,
    loadFromAPI,
    seekToMeasure,
    setTempoMultiplier,
    tempoMultiplier,
    isLooping,
    setLoop,
    clearLoop,
  } = useMeasurePlayback(engine, {
    onMeasureChange: (measure) => {
      setCurrentMeasure(measure)
      markVisited(measure)
    },
  })

  // Fetch commentary for current measure
  const {
    commentary: fetchedCommentary,
    annotations: fetchedAnnotations,
    isLoading: commentaryLoading,
  } = useMeasureCommentary(piece.id || null, currentMeasure)

  // Fetch score XML
  const { scoreXML, isLoading: scoreLoading } = useScoreXML(piece.id || null)

  // Fetch MIDI data
  const { midiData } = useMidiData(piece.id || null)

  // Load MIDI data when available
  useEffect(() => {
    if (midiData && audioReady) {
      loadFromAPI(midiData)
    }
  }, [midiData, audioReady, loadFromAPI])

  // Keyboard shortcuts
  useViewShortcuts({
    onToggleScore: toggleScore,
    onToggleKeyboard: toggleKeyboard,
    onResetLayout: resetLayout,
  })

  // Keyboard navigation for measures
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if in input field
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      switch (e.key) {
        case 'ArrowLeft':
          if (!e.shiftKey && !e.ctrlKey && !e.metaKey) {
            e.preventDefault()
            handlePrevious()
          }
          break
        case 'ArrowRight':
          if (!e.shiftKey && !e.ctrlKey && !e.metaKey) {
            e.preventDefault()
            handleNext()
          }
          break
        case ' ':
          e.preventDefault()
          if (playbackState === 'playing') {
            pause()
          } else {
            play()
          }
          break
        case 'Escape':
          e.preventDefault()
          stop()
          break
        case 'm':
        case 'M':
          // Play current measure
          e.preventDefault()
          handlePlayMeasure()
          break
        case 'c':
        case 'C':
          // Play in context (measure before and after)
          e.preventDefault()
          handlePlayInContext()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentMeasure, playbackState])

  const handlePrevious = useCallback(() => {
    const newMeasure = Math.max(1, currentMeasure - 1)
    setCurrentMeasure(newMeasure)
    markVisited(newMeasure)
    seekToMeasure(newMeasure)
    scoreRef.current?.scrollToMeasure(newMeasure)
  }, [currentMeasure, markVisited, seekToMeasure])

  const handleNext = useCallback(() => {
    const total = piece.totalMeasures || measures.length
    const newMeasure = Math.min(total, currentMeasure + 1)
    setCurrentMeasure(newMeasure)
    markVisited(newMeasure)
    seekToMeasure(newMeasure)
    scoreRef.current?.scrollToMeasure(newMeasure)
  }, [currentMeasure, measures.length, piece.totalMeasures, markVisited, seekToMeasure])

  const handleGoTo = useCallback((measure: number) => {
    const total = piece.totalMeasures || measures.length
    const clampedMeasure = Math.max(1, Math.min(total, measure))
    setCurrentMeasure(clampedMeasure)
    markVisited(clampedMeasure)
    seekToMeasure(clampedMeasure)
    scoreRef.current?.scrollToMeasure(clampedMeasure)
  }, [measures.length, piece.totalMeasures, markVisited, seekToMeasure])

  const handlePlayMeasure = useCallback(async () => {
    if (!audioReady) {
      await initAudio()
    }
    playMeasure(currentMeasure)
  }, [audioReady, initAudio, playMeasure, currentMeasure])

  const handlePlayInContext = useCallback(async () => {
    if (!audioReady) {
      await initAudio()
    }
    const total = piece.totalMeasures || measures.length
    const start = Math.max(1, currentMeasure - 1)
    const end = Math.min(total, currentMeasure + 1)
    playMeasureRange(start, end)
  }, [audioReady, initAudio, playMeasureRange, currentMeasure, measures.length, piece.totalMeasures])

  const handleLearnMore = useCallback((lessonId: string) => {
    setSelectedLessonId(lessonId)
    setLearnMoreOpen(true)
  }, [])

  const handleFindSimilar = useCallback((featureId: string) => {
    setSelectedFeatureId(featureId)
    setSimilarPatternsOpen(true)
  }, [])

  const handleNavigateToPattern = useCallback((pieceId: string, measureStart: number) => {
    setSimilarPatternsOpen(false)
    // Navigate to the piece and measure
    router.push(`/walkthrough/${pieceId}?measure=${measureStart}`)
  }, [router])

  const handleVolumeChange = useCallback((volume: number) => {
    if (engine) {
      engine.setVolume(volume / 100)
    }
  }, [engine])

  const handleLoopToggle = useCallback(() => {
    if (isLooping) {
      clearLoop()
    } else {
      const total = piece.totalMeasures || measures.length
      setLoop(
        { measure: currentMeasure, beat: 1 },
        { measure: Math.min(currentMeasure + 1, total), beat: 1 }
      )
    }
  }, [isLooping, clearLoop, setLoop, currentMeasure, measures.length, piece.totalMeasures])

  const handleMeasureClick = useCallback((measure: number) => {
    handleGoTo(measure)
  }, [handleGoTo])

  // Current measure data
  const currentMeasureData = measures[currentMeasure - 1] || { number: currentMeasure, notes: [], duration: 4 }

  // Use fetched commentary or fallback
  const commentary = fetchedCommentary || {
    text: `Measure ${currentMeasure} in ${piece.key}.`,
    terms: [],
    lessonId: null,
    featureId: null,
  }

  // Map annotations to expected format
  interface AnnotationInput {
    id: string
    measureNumber?: number
    measureStart?: number
    annotationType?: string
    type?: string
    content: string
  }
  const currentAnnotations = (fetchedAnnotations || annotations.filter(
    (a) => a.measureNumber === currentMeasure
  )).map((a: AnnotationInput) => ({
    id: a.id,
    measureNumber: currentMeasure,
    type: a.annotationType || a.type || 'general',
    content: a.content,
  }))

  // Convert active notes for piano keyboard
  const pianoActiveNotes: ActiveNote[] = activeNotes.map((midiNote) => ({
    midiNote,
    velocity: 0.8,
  }))

  const totalMeasures = piece.totalMeasures || measures.length
  const isPlaying = playbackState === 'playing'

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="border-b bg-background p-4 flex items-center justify-between">
        <PieceSelector currentBwv={piece.bwv} currentType={piece.type || 'prelude'} />

        <div className="flex items-center gap-2">
          {/* Audio initialization button if needed */}
          {!audioReady && (
            <Button
              variant="outline"
              size="sm"
              onClick={initAudio}
              disabled={audioLoading}
            >
              {audioLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading Audio...
                </>
              ) : (
                'Enable Audio'
              )}
            </Button>
          )}

          {/* View Controls */}
          <ViewControls
            showScore={splitViewSettings.showScore}
            showKeyboard={splitViewSettings.showKeyboard}
            orientation={splitViewSettings.orientation}
            onToggleScore={toggleScore}
            onToggleKeyboard={toggleKeyboard}
            onToggleOrientation={toggleOrientation}
            onResetLayout={resetLayout}
            onSwapPanels={swapPanels}
            compact
          />

          <Button variant="outline" size="icon" title="Settings">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Split View Area */}
      <div className="flex-1 overflow-hidden">
        <SplitView
          orientation={splitViewSettings.orientation}
          splitRatio={splitViewSettings.splitRatio}
          onSplitRatioChange={setSplitRatio}
          showFirstPanel={splitViewSettings.showScore}
          showSecondPanel={splitViewSettings.showKeyboard}
          minFirstPanel={30}
          maxFirstPanel={70}
          firstPanel={
            // Score Panel
            <div className="h-full bg-muted/20 overflow-auto">
              {scoreLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Loading score...</p>
                  </div>
                </div>
              ) : scoreXML ? (
                <ScoreDisplay
                  ref={scoreRef}
                  musicXML={scoreXML}
                  currentMeasure={currentMeasure}
                  highlightedMeasures={[currentMeasure]}
                  highlightColor="rgba(37, 99, 235, 0.2)"
                  voiceColors={true}
                  showControls={true}
                  showStatusBar={true}
                  enableAutoScroll={true}
                  enableCursor={true}
                  onMeasureClick={handleMeasureClick}
                  height="100%"
                />
              ) : (
                <div className="h-full flex items-center justify-center p-8">
                  <div className="text-center space-y-4">
                    <div className="text-2xl font-semibold">
                      {piece.title} - Measure {currentMeasure}
                    </div>
                    <div className="text-muted-foreground">
                      Score not available for this piece.
                    </div>
                  </div>
                </div>
              )}
            </div>
          }
          secondPanel={
            // Keyboard Panel
            <div className="h-full bg-background overflow-auto flex items-center justify-center p-4">
              <PianoKeyboard
                activeNotes={pianoActiveNotes}
                startNote={36}
                endNote={96}
                showLabels={true}
                onNoteClick={(midiNote) => {
                  if (engine?.isReady) {
                    engine.playNote(midiNote, 0.5)
                  }
                }}
                voiceColors={true}
              />
            </div>
          }
        />
      </div>

      {/* Controls Bar */}
      <div className="border-t bg-background px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <MeasureNavigation
            currentMeasure={currentMeasure}
            totalMeasures={totalMeasures}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onGoTo={handleGoTo}
          />
          <PlaybackControls
            isPlaying={isPlaying}
            onPlayPause={() => {
              if (!audioReady) {
                initAudio().then(() => {
                  if (isPlaying) pause()
                  else play()
                })
              } else {
                if (isPlaying) pause()
                else play()
              }
            }}
            onStop={stop}
            onSkipBack={handlePrevious}
            onSkipForward={handleNext}
            onTempoChange={(tempo) => setTempoMultiplier(tempo)}
            onVolumeChange={handleVolumeChange}
            onLoopToggle={handleLoopToggle}
            currentMeasure={currentMeasure}
            totalMeasures={totalMeasures}
            tempoMultiplier={tempoMultiplier}
            isLooping={isLooping}
          />
        </div>
      </div>

      {/* Commentary Panel */}
      <div className="border-t bg-background overflow-auto" style={{ maxHeight: '300px' }}>
        {commentaryLoading ? (
          <div className="p-4 flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading commentary...</span>
          </div>
        ) : (
          <CommentaryPanel
            measure={currentMeasureData}
            commentary={commentary}
            annotations={currentAnnotations}
            onPlayMeasure={handlePlayMeasure}
            onPlayInContext={handlePlayInContext}
            onLearnMore={handleLearnMore}
            onFindSimilar={handleFindSimilar}
          />
        )}
      </div>

      {/* Modals */}
      <SimilarPatternsModal
        open={similarPatternsOpen}
        onOpenChange={setSimilarPatternsOpen}
        featureId={selectedFeatureId}
        currentPieceId={piece.id}
        onNavigate={handleNavigateToPattern}
      />

      <LearnMoreModal
        open={learnMoreOpen}
        onOpenChange={setLearnMoreOpen}
        lessonId={selectedLessonId}
      />
    </div>
  )
}
