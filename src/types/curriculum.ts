/**
 * Curriculum type definitions for Clavier
 *
 * Defines the structured learning path including domains, units, modules, and lessons.
 * Supports various lesson section types for different pedagogical approaches.
 */

/**
 * Top-level learning domain
 */
export interface Domain {
  /** Unique identifier for the domain */
  id: string;
  /** Domain name (e.g., "Harmony", "Counterpoint") */
  name: string;
  /** Short description of the domain */
  description: string;
  /** Display order */
  order: number;
  /** Color for UI representation */
  color?: string;
  /** Icon identifier */
  icon?: string;
  /** Units within this domain */
  units: Unit[];
}

/**
 * Unit within a domain (collection of related modules)
 */
export interface Unit {
  /** Unique identifier for the unit */
  id: string;
  /** Domain this unit belongs to */
  domainId: string;
  /** Unit name */
  name: string;
  /** Description of what this unit covers */
  description: string;
  /** Display order within the domain */
  order: number;
  /** Prerequisites (unit IDs that should be completed first) */
  prerequisites?: string[];
  /** Estimated time to complete (in minutes) */
  estimatedTime?: number;
  /** Learning objectives for this unit */
  objectives?: string[];
  /** Modules within this unit */
  modules: Module[];
}

/**
 * Module within a unit (collection of related lessons)
 */
export interface Module {
  /** Unique identifier for the module */
  id: string;
  /** Unit this module belongs to */
  unitId: string;
  /** Module name */
  name: string;
  /** Description of module content */
  description: string;
  /** Display order within the unit */
  order: number;
  /** Prerequisites (module IDs that should be completed first) */
  prerequisites?: string[];
  /** Estimated time to complete (in minutes) */
  estimatedTime?: number;
  /** Learning objectives for this module */
  objectives?: string[];
  /** Lessons within this module */
  lessons: Lesson[];
}

/**
 * Individual lesson within a module
 */
export interface Lesson {
  /** Unique identifier for the lesson */
  id: string;
  /** Module this lesson belongs to */
  moduleId: string;
  /** Lesson title */
  title: string;
  /** Brief description */
  description: string;
  /** Display order within the module */
  order: number;
  /** Prerequisites (lesson IDs that should be completed first) */
  prerequisites?: string[];
  /** Estimated time to complete (in minutes) */
  estimatedTime?: number;
  /** Learning objectives for this lesson */
  objectives?: string[];
  /** Sections that make up this lesson */
  sections: LessonSection[];
  /** Assessment questions for the lesson */
  assessment?: AssessmentQuestion[];
  /** Resources and references */
  resources?: Resource[];
}

/**
 * Base interface for all lesson sections
 */
interface BaseLessonSection {
  /** Unique identifier for the section */
  id: string;
  /** Display order within the lesson */
  order: number;
  /** Optional title for the section */
  title?: string;
}

/**
 * Text content section (explanation, theory)
 */
export interface TextSection extends BaseLessonSection {
  type: 'text';
  /** Markdown-formatted content */
  content: string;
  /** Optional images or diagrams */
  images?: Array<{
    url: string;
    caption?: string;
    alt: string;
  }>;
}

/**
 * Guided example section (analysis walkthrough)
 */
export interface GuidedExampleSection extends BaseLessonSection {
  type: 'guided_example';
  /** Piece being analyzed */
  pieceId: string;
  /** Measure range for the example */
  measureRange: {
    start: number;
    end: number;
  };
  /** Step-by-step guidance */
  steps: Array<{
    id: string;
    description: string;
    highlightMeasures?: number[];
    highlightNotes?: string[];
    annotation?: string;
    audio?: boolean;
  }>;
  /** Summary of the example */
  summary?: string;
}

/**
 * Interactive recognition exercise section
 */
export interface RecognitionSection extends BaseLessonSection {
  type: 'recognition';
  /** Instructions for the exercise */
  instructions: string;
  /** Piece to analyze */
  pieceId: string;
  /** Measure range for the exercise */
  measureRange: {
    start: number;
    end: number;
  };
  /** Questions to answer */
  questions: RecognitionQuestion[];
  /** Feedback after completion */
  feedback?: string;
}

/**
 * Practice exercise section
 */
export interface PracticeSection extends BaseLessonSection {
  type: 'practice';
  /** Instructions for the practice */
  instructions: string;
  /** Type of practice */
  practiceType: 'listening' | 'identification' | 'composition' | 'analysis';
  /** Exercises to complete */
  exercises: Array<{
    id: string;
    prompt: string;
    pieceId?: string;
    measureRange?: {
      start: number;
      end: number;
    };
    expectedAnswer?: unknown;
    hints?: string[];
  }>;
}

/**
 * Summary section (key takeaways)
 */
export interface SummarySection extends BaseLessonSection {
  type: 'summary';
  /** Key points from the lesson */
  keyPoints: string[];
  /** Optional review questions */
  reviewQuestions?: string[];
  /** Next steps */
  nextSteps?: string;
}

/**
 * Quiz section
 */
export interface QuizSection extends BaseLessonSection {
  type: 'quiz';
  /** Instructions for the quiz */
  instructions?: string;
  /** Quiz questions */
  questions: AssessmentQuestion[];
  /** Passing score (percentage) */
  passingScore?: number;
  /** Whether to randomize question order */
  randomize?: boolean;
}

/**
 * Discriminated union of all lesson section types
 */
export type LessonSection =
  | TextSection
  | GuidedExampleSection
  | RecognitionSection
  | PracticeSection
  | SummarySection
  | QuizSection;

/**
 * Recognition question for interactive exercises
 */
export interface RecognitionQuestion {
  /** Unique identifier for the question */
  id: string;
  /** Question prompt */
  prompt: string;
  /** Type of recognition task */
  questionType: 'multiple-choice' | 'identification' | 'matching' | 'ordering';
  /** Measure(s) being asked about */
  targetMeasures: number[];
  /** Correct answer(s) */
  correctAnswer: unknown;
  /** Possible choices for multiple choice */
  choices?: Array<{
    id: string;
    text: string;
    value: unknown;
  }>;
  /** Explanation shown after answering */
  explanation?: string;
  /** Hints available to the student */
  hints?: string[];
}

/**
 * Assessment question for quizzes
 */
export interface AssessmentQuestion {
  /** Unique identifier for the question */
  id: string;
  /** Question text */
  question: string;
  /** Type of question */
  type: 'multiple-choice' | 'true-false' | 'fill-in-blank' | 'matching' | 'short-answer';
  /** Correct answer(s) */
  correctAnswer: unknown;
  /** Possible choices (for multiple choice) */
  choices?: Array<{
    id: string;
    text: string;
    value: unknown;
  }>;
  /** Points awarded for correct answer */
  points: number;
  /** Feedback for correct answer */
  correctFeedback?: string;
  /** Feedback for incorrect answer */
  incorrectFeedback?: string;
  /** Explanation of the answer */
  explanation?: string;
}

/**
 * Resource reference
 */
export interface Resource {
  /** Unique identifier */
  id: string;
  /** Resource title */
  title: string;
  /** Type of resource */
  type: 'article' | 'video' | 'audio' | 'score' | 'external-link' | 'book';
  /** URL or file path */
  url: string;
  /** Optional description */
  description?: string;
  /** Optional author */
  author?: string;
}

/**
 * User progress for a specific lesson
 */
export interface LessonProgress {
  /** Lesson ID */
  lessonId: string;
  /** Completion status */
  status: 'not-started' | 'in-progress' | 'completed';
  /** Percentage completed (0-100) */
  percentComplete: number;
  /** Sections completed */
  sectionsCompleted: string[];
  /** Assessment scores */
  assessmentScores?: Array<{
    questionId: string;
    score: number;
    maxScore: number;
    attempts: number;
  }>;
  /** Time spent on lesson (in seconds) */
  timeSpent?: number;
  /** Last accessed timestamp */
  lastAccessed?: string;
  /** Completion timestamp */
  completedAt?: string;
  /** User notes */
  notes?: string;
}

/**
 * Overall user progress across the curriculum
 */
export interface UserProgress {
  /** User identifier */
  userId: string;
  /** Progress for each lesson */
  lessonProgress: Map<string, LessonProgress>;
  /** Completed domain IDs */
  completedDomains: string[];
  /** Completed unit IDs */
  completedUnits: string[];
  /** Completed module IDs */
  completedModules: string[];
  /** Current lesson being worked on */
  currentLessonId?: string;
  /** Total time spent learning (in seconds) */
  totalTimeSpent: number;
  /** User's strengths (domain IDs) */
  strengths?: string[];
  /** Areas needing improvement (domain IDs) */
  areasForImprovement?: string[];
  /** Last active timestamp */
  lastActive?: string;
  /** Account created timestamp */
  createdAt: string;
}

/**
 * Curriculum metadata
 */
export interface CurriculumMetadata {
  /** Version of the curriculum */
  version: string;
  /** Last updated timestamp */
  lastUpdated: string;
  /** Total number of lessons */
  totalLessons: number;
  /** Total estimated time (in minutes) */
  totalEstimatedTime: number;
  /** Authors */
  authors?: string[];
  /** Description */
  description?: string;
}
