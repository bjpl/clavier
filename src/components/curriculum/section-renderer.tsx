'use client';

import { LessonSection } from '@/lib/types/curriculum';
import ReactMarkdown from 'react-markdown';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, ExternalLink, Lightbulb } from 'lucide-react';

interface SectionRendererProps {
  section: LessonSection;
  onComplete?: () => void;
  isCompleted?: boolean;
}

export function SectionRenderer({ section, onComplete, isCompleted }: SectionRendererProps) {
  switch (section.type) {
    case 'text':
      return <TextSectionView section={section} onComplete={onComplete} isCompleted={isCompleted} />;
    case 'guided-example':
      return <GuidedExampleSectionView section={section} onComplete={onComplete} isCompleted={isCompleted} />;
    case 'recognition':
      return <RecognitionSectionView section={section} onComplete={onComplete} isCompleted={isCompleted} />;
    case 'summary':
      return <SummarySectionView section={section} onComplete={onComplete} isCompleted={isCompleted} />;
    default:
      return <div>Unknown section type</div>;
  }
}

function TextSectionView({
  section,
  onComplete,
  isCompleted,
}: {
  section: Extract<LessonSection, { type: 'text' }>;
  onComplete?: () => void;
  isCompleted?: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="prose prose-slate max-w-none">
        <ReactMarkdown>{section.content}</ReactMarkdown>
      </div>

      {section.images && section.images.length > 0 && (
        <div className="space-y-4">
          {section.images.map((image, idx) => (
            <figure key={idx} className="border rounded-lg overflow-hidden">
              <img src={image.url} alt={image.alt} className="w-full" />
              {image.caption && (
                <figcaption className="text-sm text-muted-foreground p-3 bg-gray-50">
                  {image.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      )}

      {section.narration && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <BookOpen className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-2 flex-1">
              <h4 className="text-sm font-medium text-blue-900">Narration</h4>
              <p className="text-sm text-blue-800">{section.narration}</p>
            </div>
          </div>
        </Card>
      )}

      {onComplete && !isCompleted && (
        <div className="flex justify-end">
          <Button onClick={onComplete}>Mark Section Complete</Button>
        </div>
      )}
    </div>
  );
}

function GuidedExampleSectionView({
  section,
  onComplete,
  isCompleted,
}: {
  section: Extract<LessonSection, { type: 'guided-example' }>;
  onComplete?: () => void;
  isCompleted?: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="prose prose-slate max-w-none">
        <p>{section.introduction}</p>
      </div>

      <Card className="p-6 bg-amber-50 border-amber-200">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-amber-900">Musical Example</h4>
          <Badge variant="outline" className="bg-white">
            Score ID: {section.scoreId}
          </Badge>
        </div>
        <div className="space-y-4">
          <p className="text-sm text-amber-800">
            This example will be displayed with the score viewer once integrated.
          </p>
          <Button variant="outline" className="w-full">
            <ExternalLink className="h-4 w-4 mr-2" />
            Open in Walkthrough Mode
          </Button>
        </div>
      </Card>

      <div className="space-y-4">
        <h4 className="font-medium">Walkthrough Steps</h4>
        {section.walkthroughSteps.map((step, idx) => (
          <Card key={step.id} className="p-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-medium text-sm">
                {idx + 1}
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-sm">{step.description}</p>
                {step.annotation && (
                  <p className="text-sm text-muted-foreground italic">{step.annotation}</p>
                )}
                {step.highlightMeasures && step.highlightMeasures.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    Measures {step.highlightMeasures.join(', ')}
                  </Badge>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {section.conclusion && (
        <div className="prose prose-slate max-w-none">
          <p>{section.conclusion}</p>
        </div>
      )}

      {onComplete && !isCompleted && (
        <div className="flex justify-end">
          <Button onClick={onComplete}>Mark Section Complete</Button>
        </div>
      )}
    </div>
  );
}

function RecognitionSectionView({
  section,
  onComplete,
  isCompleted,
}: {
  section: Extract<LessonSection, { type: 'recognition' }>;
  onComplete?: () => void;
  isCompleted?: boolean;
}) {
  return (
    <div className="space-y-6">
      <Card className="p-4 bg-purple-50 border-purple-200">
        <div className="flex items-start gap-3">
          <Lightbulb className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-purple-900 mb-1">Practice Exercise</h4>
            <p className="text-sm text-purple-800">{section.instructions}</p>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {section.examples.map((example, idx) => (
          <Card key={example.id} className="p-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <h4 className="font-medium">Question {idx + 1}</h4>
                <Badge variant="outline">Score: {example.scoreId}</Badge>
              </div>
              <p className="text-sm">{example.question}</p>
              {example.options && (
                <div className="space-y-2">
                  {example.options.map((option, optIdx) => (
                    <Button
                      key={optIdx}
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-3"
                    >
                      <span className="mr-3 font-medium text-muted-foreground">
                        {String.fromCharCode(65 + optIdx)}.
                      </span>
                      {option}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {section.passingScore && (
        <p className="text-sm text-muted-foreground">
          Passing score: {section.passingScore}%
        </p>
      )}

      {onComplete && !isCompleted && (
        <div className="flex justify-end">
          <Button onClick={onComplete}>Complete Practice</Button>
        </div>
      )}
    </div>
  );
}

function SummarySectionView({
  section,
  onComplete,
  isCompleted,
}: {
  section: Extract<LessonSection, { type: 'summary' }>;
  onComplete?: () => void;
  isCompleted?: boolean;
}) {
  return (
    <div className="space-y-6">
      <Card className="p-6 bg-green-50 border-green-200">
        <h3 className="text-lg font-semibold text-green-900 mb-4">Key Takeaways</h3>
        <ul className="space-y-2">
          {section.keyPoints.map((point, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white text-xs font-medium">
                {idx + 1}
              </span>
              <span className="text-sm text-green-900 pt-0.5">{point}</span>
            </li>
          ))}
        </ul>
      </Card>

      {section.keyTerms && section.keyTerms.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">Key Terms</h4>
          <div className="flex flex-wrap gap-2">
            {section.keyTerms.map((term, idx) => (
              <Badge key={idx} variant="secondary">
                {term}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {section.additionalResources && section.additionalResources.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">Additional Resources</h4>
          <div className="space-y-2">
            {section.additionalResources.map((resource, idx) => (
              <Card key={idx} className="p-3 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs">
                      {resource.type}
                    </Badge>
                    <span className="text-sm font-medium">{resource.title}</span>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {onComplete && !isCompleted && (
        <div className="flex justify-end">
          <Button onClick={onComplete}>Complete Lesson</Button>
        </div>
      )}
    </div>
  );
}
