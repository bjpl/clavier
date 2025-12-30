'use client'

import { useState, useCallback } from 'react'
import { PieceSelector } from './piece-selector'
import { MeasureNavigation } from './measure-navigation'
import { CommentaryPanel } from './commentary-panel'
import { PlaybackControls } from './playback-controls'
import { Button } from '@/components/ui/button'
import { SplitView } from '@/components/layout/split-view'
import { ViewControls } from '@/components/layout/view-controls'
import { useViewStore, selectSplitViewSettings } from '@/lib/stores/view-store'
import { useViewShortcuts } from '@/hooks/use-keyboard-shortcuts'
import { Settings } from 'lucide-react'

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
  title: string
  bwv: number
  key: string
  measures: Measure[]
  annotations: Annotation[]
}

interface WalkthroughViewProps {
  piece: Piece
  measures: Measure[]
  annotations: Annotation[]
}

export function WalkthroughView({ piece, measures, annotations }: WalkthroughViewProps) {
  const [currentMeasure, setCurrentMeasure] = useState(1)
  const [isPlaying, setIsPlaying] = useState(false)

  // Split view state from Zustand store
  const splitViewSettings = useViewStore(selectSplitViewSettings)
  const setSplitRatio = useViewStore((state) => state.setSplitRatio)
  const toggleScore = useViewStore((state) => state.toggleScore)
  const toggleKeyboard = useViewStore((state) => state.toggleKeyboard)
  const toggleOrientation = useViewStore((state) => state.toggleOrientation)
  const resetLayout = useViewStore((state) => state.resetLayout)
  const swapPanels = useViewStore((state) => state.swapPanels)

  // Keyboard shortcuts
  useViewShortcuts({
    onToggleScore: toggleScore,
    onToggleKeyboard: toggleKeyboard,
    onResetLayout: resetLayout,
  })

  const handlePrevious = useCallback(() => {
    setCurrentMeasure((prev) => Math.max(1, prev - 1))
  }, [])

  const handleNext = useCallback(() => {
    setCurrentMeasure((prev) => Math.min(measures.length, prev + 1))
  }, [measures.length])

  const handleGoTo = useCallback((measure: number) => {
    setCurrentMeasure(Math.max(1, Math.min(measures.length, measure)))
  }, [measures.length])

  const handlePlayMeasure = useCallback(() => {
    setIsPlaying(!isPlaying)
    // TODO: Implement actual playback
  }, [isPlaying])

  const handlePlayInContext = useCallback(() => {
    // TODO: Play measure with surrounding context
  }, [])

  const handleLearnMore = useCallback((lessonId: string) => {
    // TODO: Navigate to lesson or open modal
    console.log('Learn more:', lessonId)
  }, [])

  const handleFindSimilar = useCallback((featureId: string) => {
    // TODO: Search for similar patterns
    console.log('Find similar:', featureId)
  }, [])

  const currentMeasureData = measures[currentMeasure - 1]
  const currentAnnotations = annotations.filter(
    (a) => a.measureNumber === currentMeasure
  )

  // Mock commentary data
  const commentary = {
    text: `This measure demonstrates a typical broken chord pattern in ${piece.key}. The arpeggiated progression creates a sense of harmonic movement while maintaining the tonic foundation.`,
    terms: ['broken chord', 'arpeggiated', 'harmonic movement', 'tonic'],
    lessonId: 'arpeggios-101',
    featureId: 'broken-chord-pattern',
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="border-b bg-background p-4 flex items-center justify-between">
        <PieceSelector currentBwv={piece.bwv} currentType="prelude" />

        <div className="flex items-center gap-2">
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

          <Button variant="outline" size="icon">
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
              <div className="h-full flex items-center justify-center p-8">
                <div className="text-center space-y-4">
                  <div className="text-2xl font-semibold">
                    {piece.title} - Measure {currentMeasure}
                  </div>
                  <div className="text-muted-foreground">
                    Score notation will be rendered here using VexFlow or similar library
                  </div>
                  {/* TODO: Integrate actual score rendering */}
                </div>
              </div>
            </div>
          }
          secondPanel={
            // Keyboard Panel
            <div className="h-full bg-background overflow-auto">
              <div className="h-full flex items-center justify-center p-8">
                <div className="text-center text-muted-foreground">
                  Interactive piano keyboard will be rendered here
                </div>
                {/* TODO: Integrate piano keyboard component */}
              </div>
            </div>
          }
        />
      </div>

      {/* Controls Bar */}
      <div className="border-t bg-background px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <MeasureNavigation
            currentMeasure={currentMeasure}
            totalMeasures={measures.length}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onGoTo={handleGoTo}
          />
          <PlaybackControls
            isPlaying={isPlaying}
            onPlayPause={() => setIsPlaying(!isPlaying)}
          />
        </div>
      </div>

      {/* Commentary Panel */}
      <div className="border-t bg-background overflow-auto" style={{ maxHeight: '300px' }}>
        <CommentaryPanel
          measure={currentMeasureData}
          commentary={commentary}
          annotations={currentAnnotations}
          onPlayMeasure={handlePlayMeasure}
          onPlayInContext={handlePlayInContext}
          onLearnMore={handleLearnMore}
          onFindSimilar={handleFindSimilar}
        />
      </div>
    </div>
  )
}
