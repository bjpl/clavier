'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ExternalLink, Play, Pause, RotateCcw, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { ScoreExcerpt } from '@/components/score';
import { fetchScore } from '@/lib/api/fetchers';

interface EmbeddedScoreProps {
  /** Score/piece ID for fetching MusicXML */
  scoreId: string;
  /** Optional title to display */
  title?: string;
  /** Measure range to highlight [start, end] */
  measures?: number[];
  /** Enable annotations display */
  annotations?: boolean;
  /** Compact mode for smaller display */
  compact?: boolean;
  /** Enable voice coloring */
  voiceColors?: boolean;
  /** Additional class names */
  className?: string;
  /** Called when play is triggered */
  onPlay?: (startMeasure: number) => void;
}

/**
 * EmbeddedScore - Displays a score excerpt within curriculum lessons
 *
 * Fetches MusicXML for the given scoreId and renders the specified measure range
 * with optional annotations and voice coloring.
 */
export function EmbeddedScore({
  scoreId,
  title,
  measures,
  annotations = false,
  compact = true,
  voiceColors = false,
  className = '',
  onPlay,
}: EmbeddedScoreProps) {
  const [musicXML, setMusicXML] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVoiceColors, setShowVoiceColors] = useState(voiceColors);

  // Calculate measure range
  const startMeasure = measures?.[0] ?? 1;
  const endMeasure = measures?.[measures.length - 1] ?? startMeasure;

  // Fetch MusicXML score
  useEffect(() => {
    let cancelled = false;

    const loadScore = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const scoreData = await fetchScore(scoreId);

        if (!cancelled) {
          setMusicXML(scoreData);
          setIsLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to load score'));
          setIsLoading(false);
        }
      }
    };

    loadScore();

    return () => {
      cancelled = true;
    };
  }, [scoreId]);

  // Handle play button
  const handlePlay = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
      // Stop playback - would integrate with audio engine
    } else {
      setIsPlaying(true);
      onPlay?.(startMeasure);
    }
  }, [isPlaying, startMeasure, onPlay]);

  // Reset to start
  const handleReset = useCallback(() => {
    setIsPlaying(false);
    // Note: scrollToMeasure would require ref forwarding in ScoreExcerpt
  }, []);

  // Toggle voice colors
  const handleToggleVoiceColors = useCallback(() => {
    setShowVoiceColors((prev) => !prev);
  }, []);


  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {title && <h4 className="font-medium text-sm">{title}</h4>}
            {measures && (
              <span className="text-xs text-muted-foreground">
                {startMeasure === endMeasure
                  ? `m. ${startMeasure}`
                  : `mm. ${startMeasure}-${endMeasure}`}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Voice colors toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleVoiceColors}
              className="h-8"
              title={showVoiceColors ? 'Hide voice colors' : 'Show voice colors'}
            >
              {showVoiceColors ? (
                <EyeOff className="h-3 w-3 mr-1" />
              ) : (
                <Eye className="h-3 w-3 mr-1" />
              )}
              Voices
            </Button>

            {/* Playback controls */}
            <Button
              variant="outline"
              size="sm"
              onClick={handlePlay}
              disabled={!musicXML}
              className="h-8"
            >
              {isPlaying ? (
                <>
                  <Pause className="h-3 w-3 mr-1" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 mr-1" />
                  Play
                </>
              )}
            </Button>

            {/* Reset button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              disabled={!musicXML}
              className="h-8 w-8 p-0"
              title="Reset"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>

            {/* Walkthrough link */}
            <Link href={`/walkthrough/${scoreId}?measure=${startMeasure}`}>
              <Button variant="outline" size="sm" className="h-8">
                <ExternalLink className="h-3 w-3 mr-1" />
                Walkthrough
              </Button>
            </Link>
          </div>
        </div>

        {/* Score display */}
        <div className={compact ? 'h-48' : 'h-64'}>
          {musicXML ? (
            <ScoreExcerpt
              musicXML={musicXML}
              startMeasure={startMeasure}
              endMeasure={endMeasure}
              voiceColors={showVoiceColors}
              showControls={!compact}
              className="h-full"
              onMeasureClick={(measure) => {
                onPlay?.(measure);
              }}
            />
          ) : isLoading ? (
            <div className="h-full bg-gray-50 rounded-lg border flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                <p className="text-xs text-muted-foreground">Loading score...</p>
              </div>
            </div>
          ) : error ? (
            <div className="h-full bg-gray-50 rounded-lg border flex items-center justify-center">
              <div className="text-center space-y-2 px-4">
                <p className="text-sm text-destructive">Failed to load score</p>
                <p className="text-xs text-muted-foreground">{error.message}</p>
              </div>
            </div>
          ) : (
            <div className="h-full bg-gray-50 rounded-lg border flex items-center justify-center">
              <p className="text-xs text-muted-foreground">No score available</p>
            </div>
          )}
        </div>

        {/* Annotations note */}
        {annotations && (
          <div className="text-xs text-muted-foreground border-t pt-3">
            <span className="font-medium">Annotations:</span> Harmonic analysis and form labels are displayed on the score.
          </div>
        )}
      </div>
    </Card>
  );
}
