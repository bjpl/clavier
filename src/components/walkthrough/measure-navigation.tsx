'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface MeasureNavigationProps {
  currentMeasure: number
  totalMeasures: number
  onPrevious: () => void
  onNext: () => void
  onGoTo: (measure: number) => void
}

export function MeasureNavigation({
  currentMeasure,
  totalMeasures,
  onPrevious,
  onNext,
  onGoTo,
}: MeasureNavigationProps) {
  const [inputValue, setInputValue] = useState(currentMeasure.toString())

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const measure = parseInt(inputValue, 10)
    if (!isNaN(measure)) {
      onGoTo(measure)
    }
  }

  const handleInputBlur = () => {
    setInputValue(currentMeasure.toString())
  }

  const progress = (currentMeasure / totalMeasures) * 100

  return (
    <div className="flex items-center gap-4 flex-1">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onPrevious}
          disabled={currentMeasure <= 1}
          aria-label="Previous measure"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <form onSubmit={handleInputSubmit} className="flex items-center gap-2" role="search" aria-label="Navigate to measure">
          <label htmlFor="measure-input" className="text-sm font-medium whitespace-nowrap">Measure</label>
          <Input
            id="measure-input"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className="w-16 text-center"
            aria-describedby="measure-total"
          />
          <span id="measure-total" className="text-sm text-muted-foreground">of {totalMeasures}</span>
        </form>

        <Button
          variant="outline"
          size="icon"
          onClick={onNext}
          disabled={currentMeasure >= totalMeasures}
          aria-label="Next measure"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 max-w-md">
        <Progress value={progress} className="h-2" />
      </div>
    </div>
  )
}
