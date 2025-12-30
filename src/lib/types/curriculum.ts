/**
 * Curriculum Type Definitions
 * Structured progressive music theory learning
 */

export interface Domain {
  id: string;
  name: string;
  description: string;
  order: number;
  units: Unit[];
  color?: string;
  icon?: string;
}

export interface Unit {
  id: string;
  domainId: string;
  name: string;
  description: string;
  order: number;
  modules: Module[];
}

export interface Module {
  id: string;
  unitId: string;
  name: string;
  description: string;
  order: number;
  lessons: LessonMetadata[];
}

export interface LessonMetadata {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  duration: number; // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  order: number;
  prerequisites?: string[]; // lesson IDs
  tags?: string[];
}

export interface Lesson {
  metadata: LessonMetadata;
  sections: LessonSection[];
  keyTerms?: KeyTerm[];
  summary?: string;
  nextLessonId?: string;
  previousLessonId?: string;
}

export type LessonSection =
  | TextSection
  | GuidedExampleSection
  | RecognitionSection
  | SummarySection;

export interface BaseSection {
  id: string;
  type: 'text' | 'guided-example' | 'recognition' | 'summary';
  title: string;
  order: number;
}

export interface TextSection extends BaseSection {
  type: 'text';
  content: string; // Markdown
  narration?: string; // Text for TTS
  images?: SectionImage[];
}

export interface SectionImage {
  url: string;
  alt: string;
  caption?: string;
}

export interface GuidedExampleSection extends BaseSection {
  type: 'guided-example';
  introduction: string;
  scoreId: string; // Reference to score in library
  walkthroughSteps: WalkthroughStep[];
  conclusion?: string;
}

export interface WalkthroughStep {
  id: string;
  description: string;
  highlightMeasures?: number[];
  highlightNotes?: NoteHighlight[];
  playbackStart?: number; // measure number
  playbackEnd?: number; // measure number
  annotation?: string;
}

export interface NoteHighlight {
  measure: number;
  voice: number;
  noteIndex: number;
  label?: string;
  color?: string;
}

export interface RecognitionSection extends BaseSection {
  type: 'recognition';
  instructions: string;
  examples: PracticeExample[];
  passingScore?: number; // percentage
}

export interface PracticeExample {
  id: string;
  scoreId: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  measures?: number[]; // which measures to display/focus
}

export interface SummarySection extends BaseSection {
  type: 'summary';
  keyPoints: string[];
  keyTerms?: string[];
  additionalResources?: Resource[];
}

export interface KeyTerm {
  term: string;
  definition: string;
  relatedTerms?: string[];
}

export interface Resource {
  title: string;
  type: 'link' | 'lesson' | 'score';
  url?: string;
  lessonId?: string;
  scoreId?: string;
}

export interface PracticeResult {
  exampleId: string;
  userAnswer: string;
  correct: boolean;
  timeSpent?: number; // seconds
}

export interface ProgressStatus {
  lessonId: string;
  percentage: number;
  completedSections: number[];
  lastAccessedAt: string;
  completed: boolean;
}

export interface CurriculumProgress {
  domainProgress: Record<string, DomainProgress>;
  unitProgress: Record<string, UnitProgress>;
  moduleProgress: Record<string, ModuleProgress>;
  lessonProgress: Record<string, ProgressStatus>;
  completedLessons: string[];
  totalLessonsCompleted: number;
  overallPercentage: number;
}

export interface DomainProgress {
  domainId: string;
  completedUnits: number;
  totalUnits: number;
  percentage: number;
}

export interface UnitProgress {
  unitId: string;
  completedModules: number;
  totalModules: number;
  percentage: number;
}

export interface ModuleProgress {
  moduleId: string;
  completedLessons: number;
  totalLessons: number;
  percentage: number;
}
