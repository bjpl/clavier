'use client';

import { useState } from 'react';
import { PracticeExample, PracticeResult } from '@/lib/types/curriculum';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, ArrowRight } from 'lucide-react';

interface RecognitionPracticeProps {
  examples: PracticeExample[];
  onComplete: (results: PracticeResult[]) => void;
  passingScore?: number;
}

export function RecognitionPractice({
  examples,
  onComplete,
  passingScore = 70,
}: RecognitionPracticeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<PracticeResult[]>([]);

  const currentExample = examples[currentIndex];
  const isLastExample = currentIndex === examples.length - 1;
  const hasAnswered = answers[currentExample.id] !== undefined;

  const handleAnswer = (answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentExample.id]: answer,
    }));
  };

  const handleNext = () => {
    if (isLastExample) {
      // Calculate results
      const practiceResults: PracticeResult[] = examples.map((example) => ({
        exampleId: example.id,
        userAnswer: answers[example.id] || '',
        correct: answers[example.id] === example.correctAnswer,
      }));
      setResults(practiceResults);
      setShowResults(true);
      onComplete(practiceResults);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setAnswers({});
    setShowResults(false);
    setResults([]);
  };

  if (showResults) {
    const correctCount = results.filter((r) => r.correct).length;
    const percentage = (correctCount / results.length) * 100;
    const passed = percentage >= passingScore;

    return (
      <Card className="p-6">
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">
              {passed ? 'Congratulations!' : 'Keep Practicing'}
            </h3>
            <p className="text-muted-foreground">
              You scored {correctCount} out of {results.length} ({percentage.toFixed(0)}%)
            </p>
            {passed ? (
              <Badge className="mt-3 bg-green-500">Passed</Badge>
            ) : (
              <Badge className="mt-3 bg-orange-500">Try Again</Badge>
            )}
          </div>

          <div className="space-y-4">
            {examples.map((example, idx) => {
              const result = results[idx];
              const isCorrect = result.correct;

              return (
                <Card
                  key={example.id}
                  className={`p-4 ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full ${
                        isCorrect
                          ? 'bg-green-500 text-white'
                          : 'bg-red-500 text-white'
                      }`}
                    >
                      {isCorrect ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="text-sm font-medium">{example.question}</p>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="font-medium">Your answer:</span>{' '}
                          {result.userAnswer || 'No answer'}
                        </p>
                        {!isCorrect && (
                          <p>
                            <span className="font-medium">Correct answer:</span>{' '}
                            {example.correctAnswer}
                          </p>
                        )}
                        {example.explanation && (
                          <p className="text-muted-foreground italic mt-2">
                            {example.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={handleRetry}>
              Try Again
            </Button>
            {passed && (
              <Button onClick={() => onComplete(results)}>
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-6">
          {/* Progress indicator */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Question {currentIndex + 1} of {examples.length}
            </span>
            <Badge variant="outline">
              {Object.keys(answers).length} / {examples.length} answered
            </Badge>
          </div>

          {/* Question */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{currentExample.question}</h3>
            {currentExample.scoreId && (
              <Card className="p-4 bg-amber-50 border-amber-200 mb-4">
                <div className="text-sm text-amber-800">
                  Score ID: {currentExample.scoreId}
                  {currentExample.measures && (
                    <span className="ml-2">
                      (Measures {currentExample.measures.join(', ')})
                    </span>
                  )}
                </div>
                <p className="text-xs text-amber-700 mt-2">
                  Score viewer integration pending
                </p>
              </Card>
            )}
          </div>

          {/* Options */}
          {currentExample.options && (
            <div className="space-y-3">
              {currentExample.options.map((option, idx) => {
                const isSelected = answers[currentExample.id] === option;
                return (
                  <Button
                    key={idx}
                    variant={isSelected ? 'default' : 'outline'}
                    className="w-full justify-start text-left h-auto py-4 px-6"
                    onClick={() => handleAnswer(option)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground text-sm font-medium">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{option}</span>
                    </div>
                  </Button>
                );
              })}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              Previous
            </Button>

            <div className="flex gap-1">
              {examples.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full ${
                    idx === currentIndex
                      ? 'bg-blue-500'
                      : answers[examples[idx].id]
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <Button onClick={handleNext} disabled={!hasAnswered}>
              {isLastExample ? 'Finish' : 'Next'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
