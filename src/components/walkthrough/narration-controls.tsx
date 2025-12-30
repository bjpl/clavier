'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Volume2, VolumeX } from 'lucide-react'

interface NarrationControlsProps {
  text: string
}

export function NarrationControls({ text }: NarrationControlsProps) {
  const [isNarrating, setIsNarrating] = useState(false)
  const [autoNarrate, setAutoNarrate] = useState(false)
  const [narrationSpeed, setNarrationSpeed] = useState(1.0)

  const handlePlayNarration = () => {
    if (isNarrating) {
      // Stop narration
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
      setIsNarrating(false)
    } else {
      // Start narration
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = narrationSpeed
        utterance.onend = () => setIsNarrating(false)
        window.speechSynthesis.speak(utterance)
        setIsNarrating(true)
      }
    }
  }

  const handleSpeedChange = (value: number[]) => {
    const newSpeed = value[0]
    setNarrationSpeed(newSpeed)

    // If currently narrating, restart with new speed
    if (isNarrating && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = newSpeed
      utterance.onend = () => setIsNarrating(false)
      window.speechSynthesis.speak(utterance)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={isNarrating ? 'default' : 'outline'}
        size="sm"
        onClick={handlePlayNarration}
      >
        {isNarrating ? (
          <>
            <VolumeX className="h-4 w-4 mr-2" />
            Stop Narration
          </>
        ) : (
          <>
            <Volume2 className="h-4 w-4 mr-2" />
            Play Narration
          </>
        )}
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm">
            Settings
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-narrate">Auto-narrate</Label>
                <Switch
                  id="auto-narrate"
                  checked={autoNarrate}
                  onCheckedChange={setAutoNarrate}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Automatically narrate commentary when changing measures
              </p>
            </div>

            <div className="space-y-2">
              <Label>Narration Speed: {narrationSpeed.toFixed(1)}x</Label>
              <Slider
                value={[narrationSpeed]}
                onValueChange={handleSpeedChange}
                min={0.5}
                max={2.0}
                step={0.1}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0.5x</span>
                <span>1.0x</span>
                <span>2.0x</span>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
