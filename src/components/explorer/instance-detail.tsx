'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import type { InstanceDetailProps, RelatedInstanceWithPiece } from '@/types/explorer';
import Link from 'next/link';
import { ScoreDisplay, ScoreDisplayRef, DEFAULT_VOICE_COLORS } from '@/components/score';
import { fetchScore } from '@/lib/api/fetchers';
import { Play, Pause, SkipBack, ExternalLink, Eye, Loader2 } from 'lucide-react';

/**
 * Formats the measure range for display
 */
function formatMeasureRange(start: number, end: number): string {
  return start === end ? `m. ${start}` : `mm. ${start}-${end}`;
}

/**
 * Gets the display title for a related instance with piece context
 */
function getRelatedInstanceTitle(related: RelatedInstanceWithPiece): string {
  if (related.piece) {
    return `BWV ${related.piece.bwvNumber} ${related.piece.type.toLowerCase()}`;
  }
  return 'Related Instance';
}

/**
 * Gets the key display for a piece
 */
function getKeyDisplay(piece: RelatedInstanceWithPiece['piece']): string {
  if (!piece) return '';
  const mode = piece.keyMode === 'MAJOR' ? 'Major' : 'Minor';
  return `${piece.keyTonic} ${mode}`;
}

export function InstanceDetail({
  instance,
  onPlayback,
  onNavigateToWalkthrough: _onNavigateToWalkthrough,
}: InstanceDetailProps) {
  const { feature, piece } = instance;

  const [musicXML, setMusicXML] = useState<string | null>(null);
  const [isLoadingScore, setIsLoadingScore] = useState(true);
  const [scoreError, setScoreError] = useState<Error | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMeasure, setCurrentMeasure] = useState(instance.measureStart);
  const [voiceColorsEnabled, setVoiceColorsEnabled] = useState(false);

  const scoreRef = useRef<ScoreDisplayRef>(null);

  const measureRange =
    instance.measureStart === instance.measureEnd
      ? `Measure ${instance.measureStart}`
      : `Measures ${instance.measureStart}-${instance.measureEnd}`;

  // Highlighted measures for the feature instance
  const highlightedMeasures = Array.from(
    { length: instance.measureEnd - instance.measureStart + 1 },
    (_, i) => instance.measureStart + i
  );

  // Load score
  useEffect(() => {
    let cancelled = false;

    const loadScore = async () => {
      try {
        setIsLoadingScore(true);
        setScoreError(null);

        const scoreData = await fetchScore(piece.id);

        if (!cancelled) {
          setMusicXML(scoreData);
          setIsLoadingScore(false);
        }
      } catch (err) {
        if (!cancelled) {
          setScoreError(err instanceof Error ? err : new Error('Failed to load score'));
          setIsLoadingScore(false);
        }
      }
    };

    loadScore();

    return () => {
      cancelled = true;
    };
  }, [piece.id]);

  // Handle playback
  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      onPlayback?.();
    }
  }, [isPlaying, onPlayback]);

  // Reset to start of instance
  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setCurrentMeasure(instance.measureStart);
    scoreRef.current?.scrollToMeasure(instance.measureStart);
    scoreRef.current?.cursorToMeasure(instance.measureStart);
  }, [instance.measureStart]);

  // Handle measure click in score
  const handleMeasureClick = useCallback((measure: number) => {
    setCurrentMeasure(measure);
    scoreRef.current?.cursorToMeasure(measure);
  }, []);

  // Handle score ready
  const handleScoreReady = useCallback((_totalMeasures: number) => {
    // Scroll to the start of the instance when score loads
    setTimeout(() => {
      scoreRef.current?.scrollToMeasure(instance.measureStart);
    }, 100);
  }, [instance.measureStart]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {feature.name}
            </h1>
            <div className="flex items-center gap-3 text-gray-600">
              <span className="font-mono text-lg">BWV {piece.bwvNumber}</span>
              <span className="text-gray-400">|</span>
              <span className="text-lg">{piece.keyTonic} {piece.keyMode}</span>
              <span className="text-gray-400">|</span>
              <Badge variant="outline">{piece.type}</Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handlePlayPause} variant="default">
              {isPlaying ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Play
                </>
              )}
            </Button>
            <Link href={`/walkthrough/${piece.id}?measure=${instance.measureStart}`}>
              <Button variant="outline">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in Walkthrough
              </Button>
            </Link>
          </div>
        </div>
        <p className="text-gray-600">{measureRange}</p>
      </div>

      {/* Score excerpt */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Score Excerpt</CardTitle>
            <div className="flex items-center gap-4">
              {/* Voice colors toggle */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="voice-colors"
                  checked={voiceColorsEnabled}
                  onCheckedChange={setVoiceColorsEnabled}
                />
                <Label htmlFor="voice-colors" className="text-sm flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Voice colors
                </Label>
              </div>

              {/* Voice color legend */}
              {voiceColorsEnabled && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: DEFAULT_VOICE_COLORS.soprano }} />
                    S
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: DEFAULT_VOICE_COLORS.alto }} />
                    A
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: DEFAULT_VOICE_COLORS.tenor }} />
                    T
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: DEFAULT_VOICE_COLORS.bass }} />
                    B
                  </span>
                </div>
              )}

              {/* Playback controls */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  disabled={!musicXML}
                  title="Reset to start"
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingScore ? (
            <div className="min-h-[300px] bg-gray-50 rounded-lg border flex items-center justify-center">
              <div className="text-center space-y-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                <p className="text-sm text-muted-foreground">Loading score...</p>
              </div>
            </div>
          ) : scoreError ? (
            <div className="min-h-[300px] bg-gray-50 rounded-lg border flex items-center justify-center">
              <div className="text-center space-y-2 px-4">
                <p className="text-sm text-destructive">Failed to load score</p>
                <p className="text-xs text-muted-foreground">{scoreError.message}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsLoadingScore(true);
                    setScoreError(null);
                    fetchScore(piece.id)
                      .then(setMusicXML)
                      .catch((err) => setScoreError(err))
                      .finally(() => setIsLoadingScore(false));
                  }}
                >
                  Try again
                </Button>
              </div>
            </div>
          ) : musicXML ? (
            <ScoreDisplay
              ref={scoreRef}
              musicXML={musicXML}
              currentMeasure={currentMeasure}
              highlightedMeasures={highlightedMeasures}
              highlightColor="rgba(37, 99, 235, 0.15)"
              voiceColors={voiceColorsEnabled}
              showControls
              showStatusBar
              enableAutoScroll={false}
              enableCursor={isPlaying}
              height={350}
              onMeasureClick={handleMeasureClick}
              onReady={handleScoreReady}
            />
          ) : (
            <div className="min-h-[300px] bg-gray-50 rounded-lg border flex items-center justify-center text-muted-foreground">
              No score available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feature description */}
      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          {feature.description ? (
            <div className="prose prose-sm max-w-none">
              <p>{feature.description}</p>
            </div>
          ) : (
            <p className="text-gray-500 italic">No description available</p>
          )}
        </CardContent>
      </Card>

      {/* Instance-specific notes */}
      {instance.description && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p>{instance.description}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Related instances */}
      {instance.relatedInstances && instance.relatedInstances.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Similar Instances</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Other occurrences of {feature.name} in the Well-Tempered Clavier
            </p>
            <div className="space-y-3">
              {instance.relatedInstances.map((related) => (
                <Link
                  key={related.id}
                  href={`/explorer/instance/${related.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="font-medium text-gray-900 group-hover:text-blue-600">
                        {getRelatedInstanceTitle(related)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>{formatMeasureRange(related.measureStart, related.measureEnd)}</span>
                        {related.piece && (
                          <>
                            <span className="text-gray-400">|</span>
                            <span>{getKeyDisplay(related.piece)}</span>
                          </>
                        )}
                        {related.qualityScore && (
                          <>
                            <span className="text-gray-400">|</span>
                            <Badge variant="outline" className="text-xs">
                              Quality: {related.qualityScore}/10
                            </Badge>
                          </>
                        )}
                      </div>
                      {related.description && (
                        <div className="text-sm text-gray-500 line-clamp-1">
                          {related.description}
                        </div>
                      )}
                    </div>
                    <span className="text-blue-600 group-hover:translate-x-1 transition-transform">
                      <ExternalLink className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Curriculum references */}
      {instance.curriculumReferences && instance.curriculumReferences.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Related Curriculum</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {instance.curriculumReferences.map((ref) => (
                <Link
                  key={ref.lessonId}
                  href={`/curriculum/lesson/${ref.lessonId}`}
                  className="block p-3 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 group-hover:text-blue-600">
                        {ref.lessonTitle}
                      </div>
                      <div className="text-sm text-gray-600">
                        {ref.unitTitle}
                      </div>
                    </div>
                    <span className="text-blue-600">
                      <ExternalLink className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
