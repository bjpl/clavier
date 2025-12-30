/**
 * Music Files Configuration
 * Shared configuration for MusicXML download, parsing, and import system
 */

export const WTC_CATALOG = [
  // Book I - BWV 846-869
  { bwv: 846, book: 1, number: 1, key: 'C major', prelude: true, fugue: true, voices: 4 },
  { bwv: 847, book: 1, number: 2, key: 'C minor', prelude: true, fugue: true, voices: 3 },
  { bwv: 848, book: 1, number: 3, key: 'C# major', prelude: true, fugue: true, voices: 3 },
  { bwv: 849, book: 1, number: 4, key: 'C# minor', prelude: true, fugue: true, voices: 5 },
  { bwv: 850, book: 1, number: 5, key: 'D major', prelude: true, fugue: true, voices: 4 },
  { bwv: 851, book: 1, number: 6, key: 'D minor', prelude: true, fugue: true, voices: 3 },
  { bwv: 852, book: 1, number: 7, key: 'Eb major', prelude: true, fugue: true, voices: 3 },
  { bwv: 853, book: 1, number: 8, key: 'Eb minor', prelude: true, fugue: true, voices: 3 },
  { bwv: 854, book: 1, number: 9, key: 'E major', prelude: true, fugue: true, voices: 3 },
  { bwv: 855, book: 1, number: 10, key: 'E minor', prelude: true, fugue: true, voices: 2 },
  { bwv: 856, book: 1, number: 11, key: 'F major', prelude: true, fugue: true, voices: 3 },
  { bwv: 857, book: 1, number: 12, key: 'F minor', prelude: true, fugue: true, voices: 4 },
  { bwv: 858, book: 1, number: 13, key: 'F# major', prelude: true, fugue: true, voices: 3 },
  { bwv: 859, book: 1, number: 14, key: 'F# minor', prelude: true, fugue: true, voices: 4 },
  { bwv: 860, book: 1, number: 15, key: 'G major', prelude: true, fugue: true, voices: 3 },
  { bwv: 861, book: 1, number: 16, key: 'G minor', prelude: true, fugue: true, voices: 4 },
  { bwv: 862, book: 1, number: 17, key: 'Ab major', prelude: true, fugue: true, voices: 4 },
  { bwv: 863, book: 1, number: 18, key: 'G# minor', prelude: true, fugue: true, voices: 4 },
  { bwv: 864, book: 1, number: 19, key: 'A major', prelude: true, fugue: true, voices: 3 },
  { bwv: 865, book: 1, number: 20, key: 'A minor', prelude: true, fugue: true, voices: 4 },
  { bwv: 866, book: 1, number: 21, key: 'Bb major', prelude: true, fugue: true, voices: 3 },
  { bwv: 867, book: 1, number: 22, key: 'Bb minor', prelude: true, fugue: true, voices: 5 },
  { bwv: 868, book: 1, number: 23, key: 'B major', prelude: true, fugue: true, voices: 4 },
  { bwv: 869, book: 1, number: 24, key: 'B minor', prelude: true, fugue: true, voices: 4 },

  // Book II - BWV 870-893
  { bwv: 870, book: 2, number: 1, key: 'C major', prelude: true, fugue: true, voices: 3 },
  { bwv: 871, book: 2, number: 2, key: 'C minor', prelude: true, fugue: true, voices: 4 },
  { bwv: 872, book: 2, number: 3, key: 'C# major', prelude: true, fugue: true, voices: 3 },
  { bwv: 873, book: 2, number: 4, key: 'C# minor', prelude: true, fugue: true, voices: 4 },
  { bwv: 874, book: 2, number: 5, key: 'D major', prelude: true, fugue: true, voices: 3 },
  { bwv: 875, book: 2, number: 6, key: 'D minor', prelude: true, fugue: true, voices: 3 },
  { bwv: 876, book: 2, number: 7, key: 'Eb major', prelude: true, fugue: true, voices: 4 },
  { bwv: 877, book: 2, number: 8, key: 'D# minor', prelude: true, fugue: true, voices: 3 },
  { bwv: 878, book: 2, number: 9, key: 'E major', prelude: true, fugue: true, voices: 4 },
  { bwv: 879, book: 2, number: 10, key: 'E minor', prelude: true, fugue: true, voices: 3 },
  { bwv: 880, book: 2, number: 11, key: 'F major', prelude: true, fugue: true, voices: 3 },
  { bwv: 881, book: 2, number: 12, key: 'F minor', prelude: true, fugue: true, voices: 3 },
  { bwv: 882, book: 2, number: 13, key: 'F# major', prelude: true, fugue: true, voices: 3 },
  { bwv: 883, book: 2, number: 14, key: 'F# minor', prelude: true, fugue: true, voices: 3 },
  { bwv: 884, book: 2, number: 15, key: 'G major', prelude: true, fugue: true, voices: 3 },
  { bwv: 885, book: 2, number: 16, key: 'G minor', prelude: true, fugue: true, voices: 4 },
  { bwv: 886, book: 2, number: 17, key: 'Ab major', prelude: true, fugue: true, voices: 4 },
  { bwv: 887, book: 2, number: 18, key: 'G# minor', prelude: true, fugue: true, voices: 4 },
  { bwv: 888, book: 2, number: 19, key: 'A major', prelude: true, fugue: true, voices: 3 },
  { bwv: 889, book: 2, number: 20, key: 'A minor', prelude: true, fugue: true, voices: 3 },
  { bwv: 890, book: 2, number: 21, key: 'Bb major', prelude: true, fugue: true, voices: 4 },
  { bwv: 891, book: 2, number: 22, key: 'Bb minor', prelude: true, fugue: true, voices: 4 },
  { bwv: 892, book: 2, number: 23, key: 'B major', prelude: true, fugue: true, voices: 3 },
  { bwv: 893, book: 2, number: 24, key: 'B minor', prelude: true, fugue: true, voices: 4 },
] as const;

export interface WTCPiece {
  bwv: number;
  book: number;
  number: number;
  key: string;
  prelude: boolean;
  fugue: boolean;
  voices?: number;
}

export const MUSESCORE_BASE_URL = 'https://musescore.com/user/71163/scores/';

// MuseScore score IDs for Open Well-Tempered Clavier
// These need to be obtained from the actual MuseScore pages
export const MUSESCORE_SCORE_IDS: Record<number, { prelude?: number; fugue?: number }> = {
  // Book I
  846: { prelude: 89742, fugue: 89743 }, // C major
  847: { prelude: 89744, fugue: 89745 }, // C minor
  // ... Additional IDs would be added here after manual lookup
  // For now, we'll use a placeholder system
};

export const FILE_NAMING = {
  getFileName: (bwv: number, book: number, type: 'prelude' | 'fugue', key: string): string => {
    const keyNormalized = key
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/#/g, '-sharp')
      .replace(/♭/g, '-flat')
      .replace(/b(?=\s|$)/g, '-flat');
    return `BWV-${bwv}-book${book}-${type}-${keyNormalized}.musicxml`;
  },

  getFilePath: (book: number, fileName: string): string => {
    return `public/music/book${book}/${fileName}`;
  },
};

export const VALIDATION_RULES = {
  // MusicXML validation
  requiredElements: [
    'score-partwise',
    'part-list',
    'score-part',
    'part',
    'measure',
  ],

  // Note validation
  validPitchClasses: ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'],
  validOctaves: [0, 1, 2, 3, 4, 5, 6, 7, 8],
  validMidiRange: { min: 0, max: 127 },

  // Measure validation
  commonTimeSignatures: ['4/4', '3/4', '2/4', '6/8', '3/8', '9/8', '12/8'],

  // Quality thresholds
  minMeasuresPrelude: 10,
  minMeasuresFugue: 15,
  maxMeasures: 200,
};

export const DOWNLOAD_CONFIG = {
  retryAttempts: 3,
  retryDelayMs: 2000,
  timeoutMs: 30000,
  rateLimit: {
    requestsPerMinute: 10,
    delayBetweenRequests: 6000, // 6 seconds
  },
  userAgent: 'Clavier Music Learning Platform / Educational Use',
};

export const LOG_CONFIG = {
  logDirectory: 'scripts/music-files/logs',
  logToConsole: true,
  logToFile: true,
  logLevel: 'info' as 'debug' | 'info' | 'warn' | 'error',
};

export interface ParsedMusicXML {
  piece: {
    bwv: number;
    book: number;
    numberInBook: number;
    type: 'PRELUDE' | 'FUGUE';
    keyTonic: string;
    keyMode: 'MAJOR' | 'MINOR';
    timeSignature: string;
    totalMeasures: number;
    voiceCount?: number;
  };
  measures: Array<{
    measureNumber: number;
    beatCount: number;
    isPickup: boolean;
    isFinal: boolean;
    notes: Array<{
      voice: number;
      pitchClass: string;
      octave: number;
      midiNumber: number;
      startBeat: number;
      durationBeats: number;
      articulation?: string[];
      dynamic?: string;
    }>;
  }>;
}

export const PROGRESS_FILE = 'scripts/music-files/download-progress.json';

export interface DownloadProgress {
  lastUpdated: string;
  completed: Array<{
    bwv: number;
    type: 'prelude' | 'fugue';
    fileName: string;
    downloadedAt: string;
  }>;
  failed: Array<{
    bwv: number;
    type: 'prelude' | 'fugue';
    error: string;
    attemptedAt: string;
  }>;
}
