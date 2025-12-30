'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  Volume2,
  Repeat,
} from 'lucide-react'

interface PlaybackControlsProps {
  isPlaying: boolean
  onPlayPause: () => void
  onStop?: () => void
  onSkipBack?: () => void
  onSkipForward?: () => void
  onTempoChange?: (tempo: number) => void
  onVolumeChange?: (volume: number) => void
  onLoopToggle?: () => void
  currentMeasure?: number
  currentBeat?: number
  totalMeasures?: number
  tempoMultiplier?: number
  volume?: number
  isLooping?: boolean
}

export function PlaybackControls({
  isPlaying,
  onPlayPause,
  onStop,
  onSkipBack,
  onSkipForward,
  onTempoChange,
  onVolumeChange,
  onLoopToggle,
  currentMeasure = 0,
  currentBeat = 0,
  totalMeasures = 0,
  tempoMultiplier = 1.0,
  volume: externalVolume = 70,
  isLooping: externalIsLooping = false,
}: PlaybackControlsProps) {
  const [tempo, setTempo] = useState(tempoMultiplier * 100)
  const [volume, setVolume] = useState(externalVolume)
  const [isLooping, setIsLooping] = useState(externalIsLooping)

  // Sync with external state
  useEffect(() => {
    setTempo(tempoMultiplier * 100)
  }, [tempoMultiplier])

  useEffect(() => {
    setVolume(externalVolume)
  }, [externalVolume])

  useEffect(() => {
    setIsLooping(externalIsLooping)
  }, [externalIsLooping])

  const handleStop = () => {
    onStop?.()
  }

  const handleSkipBack = () => {
    onSkipBack?.()
  }

  const handleSkipForward = () => {
    onSkipForward?.()
  }

  const handleTempoChange = (value: number[]) => {
    const newTempo = value[0]
    setTempo(newTempo)
    onTempoChange?.(newTempo / 100)
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    onVolumeChange?.(newVolume)
  }

  const handleLoopToggle = () => {
    const newLooping = !isLooping
    setIsLooping(newLooping)
    onLoopToggle?.()
  }

  const formatPosition = (measure: number, beat: number) => {
    if (measure === 0) return '0:0'
    return `${measure}:${beat}`
  }

  return (
    <div className="flex items-center gap-4">
      {/* Transport Controls */}
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon" onClick={handleSkipBack}>
          <SkipBack className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={onPlayPause}>
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
        <Button variant="outline" size="icon" onClick={handleStop}>
          <Square className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={handleSkipForward}>
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>

      {/* Position Display */}
      <div className="text-sm font-mono text-muted-foreground min-w-[80px]">
        <span className="font-semibold">{formatPosition(currentMeasure, currentBeat)}</span>
        {totalMeasures > 0 && (
          <span className="text-xs ml-1">/ {totalMeasures}</span>
        )}
      </div>

      {/* Loop Toggle */}
      <Button
        variant={isLooping ? 'default' : 'outline'}
        size="icon"
        onClick={handleLoopToggle}
        title="Loop playback"
      >
        <Repeat className="h-4 w-4" />
      </Button>

      {/* Tempo Control */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            Tempo: {tempo}%
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tempo: {Math.round(tempo)}%</Label>
              <Slider
                value={[tempo]}
                onValueChange={handleTempoChange}
                min={25}
                max={200}
                step={5}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>25%</span>
                <span>100%</span>
                <span>200%</span>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Volume Control */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon">
            <Volume2 className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Volume: {Math.round(volume)}%</Label>
              <Slider
                value={[volume]}
                onValueChange={handleVolumeChange}
                min={0}
                max={100}
                step={5}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
