'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Volume2, VolumeX, Settings2 } from 'lucide-react'
import { useWalkthroughStore } from '@/lib/stores/walkthrough-store'

interface NarrationControlsProps {
  text: string
  onAutoNarrateChange?: (enabled: boolean) => void
}

// LocalStorage keys
const NARRATION_SPEED_KEY = 'clavier_narration_speed'
const NARRATION_VOICE_KEY = 'clavier_narration_voice'
const AUTO_NARRATE_KEY = 'clavier_auto_narrate'

export function NarrationControls({ text, onAutoNarrateChange }: NarrationControlsProps) {
  const [isNarrating, setIsNarrating] = useState(false)
  const [narrationSpeed, setNarrationSpeed] = useState(1.0)
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<string>('')
  const [isSupported, setIsSupported] = useState(true)

  // Get narration state from store
  const narrationEnabled = useWalkthroughStore((state) => state.narrationEnabled)
  const setNarrationEnabled = useWalkthroughStore((state) => state.setNarration)

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const prevTextRef = useRef<string>('')

  // Check for speech synthesis support
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsSupported(false)
      return
    }

    // Load saved preferences
    try {
      const savedSpeed = localStorage.getItem(NARRATION_SPEED_KEY)
      if (savedSpeed) setNarrationSpeed(parseFloat(savedSpeed))

      const savedVoice = localStorage.getItem(NARRATION_VOICE_KEY)
      if (savedVoice) setSelectedVoice(savedVoice)

      const savedAutoNarrate = localStorage.getItem(AUTO_NARRATE_KEY)
      if (savedAutoNarrate) {
        const enabled = savedAutoNarrate === 'true'
        setNarrationEnabled(enabled)
      }
    } catch {
      // Ignore localStorage errors
    }

    // Load available voices
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices()
      // Filter to English voices for better quality
      const englishVoices = voices.filter(
        (voice) => voice.lang.startsWith('en')
      )
      setAvailableVoices(englishVoices.length > 0 ? englishVoices : voices)

      // Set default voice if not already set
      if (!selectedVoice && voices.length > 0) {
        const defaultVoice = englishVoices.find(v => v.default) || englishVoices[0] || voices[0]
        if (defaultVoice) {
          setSelectedVoice(defaultVoice.name)
        }
      }
    }

    loadVoices()

    // Chrome loads voices asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [selectedVoice, setNarrationEnabled])

  // Auto-narrate when text changes and auto-narrate is enabled
  useEffect(() => {
    if (narrationEnabled && text && text !== prevTextRef.current && isSupported) {
      prevTextRef.current = text
      // Small delay to allow measure change to complete
      const timeoutId = setTimeout(() => {
        playNarration()
      }, 300)
      return () => clearTimeout(timeoutId)
    }
    return undefined
  }, [text, narrationEnabled, isSupported])

  const playNarration = useCallback(() => {
    if (!text || !window.speechSynthesis) {
      console.warn('Speech synthesis not available')
      return
    }

    if (!isSupported) return

    try {
      // Cancel any existing narration
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = narrationSpeed

      // Set voice if available
      if (selectedVoice) {
        const voice = availableVoices.find((v) => v.name === selectedVoice)
        if (voice) {
          utterance.voice = voice
        }
      }

      utterance.onstart = () => setIsNarrating(true)
      utterance.onend = () => setIsNarrating(false)
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error)
        setIsNarrating(false)
      }

      utteranceRef.current = utterance
      window.speechSynthesis.speak(utterance)
      setIsNarrating(true)
    } catch (error) {
      console.error('Failed to start speech synthesis:', error)
      setIsNarrating(false)
    }
  }, [text, narrationSpeed, selectedVoice, availableVoices, isSupported])

  const stopNarration = useCallback(() => {
    if (!isSupported) return
    window.speechSynthesis.cancel()
    setIsNarrating(false)
  }, [isSupported])

  const handlePlayPause = useCallback(() => {
    if (isNarrating) {
      stopNarration()
    } else {
      playNarration()
    }
  }, [isNarrating, playNarration, stopNarration])

  const handleSpeedChange = useCallback((value: number[]) => {
    const newSpeed = value[0]
    setNarrationSpeed(newSpeed)

    try {
      localStorage.setItem(NARRATION_SPEED_KEY, newSpeed.toString())
    } catch {
      // Ignore localStorage errors
    }

    // If currently narrating, restart with new speed
    if (isNarrating && isSupported) {
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = newSpeed

      if (selectedVoice) {
        const voice = availableVoices.find((v) => v.name === selectedVoice)
        if (voice) utterance.voice = voice
      }

      utterance.onstart = () => setIsNarrating(true)
      utterance.onend = () => setIsNarrating(false)
      utterance.onerror = () => setIsNarrating(false)

      window.speechSynthesis.speak(utterance)
    }
  }, [isNarrating, text, selectedVoice, availableVoices, isSupported])

  const handleVoiceChange = useCallback((voiceName: string) => {
    setSelectedVoice(voiceName)

    try {
      localStorage.setItem(NARRATION_VOICE_KEY, voiceName)
    } catch {
      // Ignore localStorage errors
    }
  }, [])

  const handleAutoNarrateChange = useCallback((enabled: boolean) => {
    setNarrationEnabled(enabled)
    onAutoNarrateChange?.(enabled)

    try {
      localStorage.setItem(AUTO_NARRATE_KEY, enabled.toString())
    } catch {
      // Ignore localStorage errors
    }
  }, [setNarrationEnabled, onAutoNarrateChange])

  if (!isSupported) {
    return (
      <div className="text-sm text-muted-foreground">
        Narration not supported in this browser
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={isNarrating ? 'default' : 'outline'}
        size="sm"
        onClick={handlePlayPause}
        disabled={!text}
      >
        {isNarrating ? (
          <>
            <VolumeX className="h-4 w-4 mr-2" />
            Stop
          </>
        ) : (
          <>
            <Volume2 className="h-4 w-4 mr-2" />
            Narrate
          </>
        )}
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings2 className="h-4 w-4" />
            <span className="sr-only">Narration settings</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Narration Settings</h4>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-narrate">Auto-narrate</Label>
                <Switch
                  id="auto-narrate"
                  checked={narrationEnabled}
                  onCheckedChange={handleAutoNarrateChange}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Automatically narrate commentary when changing measures
              </p>
            </div>

            <div className="space-y-2">
              <Label>Speed: {narrationSpeed.toFixed(1)}x</Label>
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

            {availableVoices.length > 0 && (
              <div className="space-y-2">
                <Label>Voice</Label>
                <Select value={selectedVoice} onValueChange={handleVoiceChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a voice" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableVoices.map((voice) => (
                      <SelectItem key={voice.name} value={voice.name}>
                        {voice.name} ({voice.lang})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
