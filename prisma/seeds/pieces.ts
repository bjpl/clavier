import { PrismaClient, PieceType, KeyMode } from '@prisma/client';

/**
 * All 48 pieces from J.S. Bach's Well-Tempered Clavier (Books I & II)
 * BWV 846-893
 */

interface PieceData {
  bwvNumber: number;
  book: number;
  numberInBook: number;
  type: PieceType;
  keyTonic: string;
  keyMode: KeyMode;
  timeSignature: string;
  tempoSuggestionBpm?: number;
  totalMeasures: number;
  voiceCount?: number;
  totalDurationSeconds?: number;
}

const WTC_PIECES: PieceData[] = [
  // BOOK I - BWV 846-869 (Preludes)
  { bwvNumber: 846, book: 1, numberInBook: 1, type: 'PRELUDE', keyTonic: 'C', keyMode: 'MAJOR', timeSignature: '4/4', tempoSuggestionBpm: 96, totalMeasures: 35, totalDurationSeconds: 140 },
  { bwvNumber: 847, book: 1, numberInBook: 1, type: 'FUGUE', keyTonic: 'C', keyMode: 'MAJOR', timeSignature: '4/4', tempoSuggestionBpm: 72, totalMeasures: 27, voiceCount: 4, totalDurationSeconds: 120 },
  { bwvNumber: 848, book: 1, numberInBook: 2, type: 'PRELUDE', keyTonic: 'C', keyMode: 'MINOR', timeSignature: '4/4', tempoSuggestionBpm: 80, totalMeasures: 38, totalDurationSeconds: 150 },
  { bwvNumber: 849, book: 1, numberInBook: 2, type: 'FUGUE', keyTonic: 'C', keyMode: 'MINOR', timeSignature: '4/4', tempoSuggestionBpm: 66, totalMeasures: 31, voiceCount: 3, totalDurationSeconds: 140 },
  { bwvNumber: 850, book: 1, numberInBook: 3, type: 'PRELUDE', keyTonic: 'C#', keyMode: 'MAJOR', timeSignature: '3/4', tempoSuggestionBpm: 112, totalMeasures: 71, totalDurationSeconds: 130 },
  { bwvNumber: 851, book: 1, numberInBook: 3, type: 'FUGUE', keyTonic: 'C#', keyMode: 'MAJOR', timeSignature: 'C', tempoSuggestionBpm: 80, totalMeasures: 40, voiceCount: 3, totalDurationSeconds: 145 },
  { bwvNumber: 852, book: 1, numberInBook: 4, type: 'PRELUDE', keyTonic: 'C#', keyMode: 'MINOR', timeSignature: '3/8', tempoSuggestionBpm: 84, totalMeasures: 109, totalDurationSeconds: 240 },
  { bwvNumber: 853, book: 1, numberInBook: 4, type: 'FUGUE', keyTonic: 'C#', keyMode: 'MINOR', timeSignature: '9/8', tempoSuggestionBpm: 56, totalMeasures: 118, voiceCount: 5, totalDurationSeconds: 360 },
  { bwvNumber: 854, book: 1, numberInBook: 5, type: 'PRELUDE', keyTonic: 'D', keyMode: 'MAJOR', timeSignature: '4/4', tempoSuggestionBpm: 120, totalMeasures: 37, totalDurationSeconds: 90 },
  { bwvNumber: 855, book: 1, numberInBook: 5, type: 'FUGUE', keyTonic: 'D', keyMode: 'MAJOR', timeSignature: '4/4', tempoSuggestionBpm: 100, totalMeasures: 65, voiceCount: 4, totalDurationSeconds: 180 },
  { bwvNumber: 856, book: 1, numberInBook: 6, type: 'PRELUDE', keyTonic: 'D', keyMode: 'MINOR', timeSignature: '3/8', tempoSuggestionBpm: 66, totalMeasures: 27, totalDurationSeconds: 110 },
  { bwvNumber: 857, book: 1, numberInBook: 6, type: 'FUGUE', keyTonic: 'D', keyMode: 'MINOR', timeSignature: 'C', tempoSuggestionBpm: 84, totalMeasures: 46, voiceCount: 3, totalDurationSeconds: 140 },
  { bwvNumber: 858, book: 1, numberInBook: 7, type: 'PRELUDE', keyTonic: 'Eb', keyMode: 'MAJOR', timeSignature: '4/4', tempoSuggestionBpm: 72, totalMeasures: 51, totalDurationSeconds: 180 },
  { bwvNumber: 859, book: 1, numberInBook: 7, type: 'FUGUE', keyTonic: 'Eb', keyMode: 'MAJOR', timeSignature: 'C', tempoSuggestionBpm: 80, totalMeasures: 89, voiceCount: 3, totalDurationSeconds: 240 },
  { bwvNumber: 860, book: 1, numberInBook: 8, type: 'PRELUDE', keyTonic: 'Eb', keyMode: 'MINOR', timeSignature: '6/4', tempoSuggestionBpm: 52, totalMeasures: 24, totalDurationSeconds: 180 },
  { bwvNumber: 861, book: 1, numberInBook: 8, type: 'FUGUE', keyTonic: 'D#', keyMode: 'MINOR', timeSignature: 'C', tempoSuggestionBpm: 66, totalMeasures: 126, voiceCount: 3, totalDurationSeconds: 360 },
  { bwvNumber: 862, book: 1, numberInBook: 9, type: 'PRELUDE', keyTonic: 'E', keyMode: 'MAJOR', timeSignature: 'C', tempoSuggestionBpm: 108, totalMeasures: 71, totalDurationSeconds: 180 },
  { bwvNumber: 863, book: 1, numberInBook: 9, type: 'FUGUE', keyTonic: 'E', keyMode: 'MAJOR', timeSignature: 'C', tempoSuggestionBpm: 92, totalMeasures: 47, voiceCount: 3, totalDurationSeconds: 120 },
  { bwvNumber: 864, book: 1, numberInBook: 10, type: 'PRELUDE', keyTonic: 'E', keyMode: 'MINOR', timeSignature: 'C', tempoSuggestionBpm: 88, totalMeasures: 27, totalDurationSeconds: 100 },
  { bwvNumber: 865, book: 1, numberInBook: 10, type: 'FUGUE', keyTonic: 'E', keyMode: 'MINOR', timeSignature: '2/2', tempoSuggestionBpm: 60, totalMeasures: 44, voiceCount: 2, totalDurationSeconds: 90 },
  { bwvNumber: 866, book: 1, numberInBook: 11, type: 'PRELUDE', keyTonic: 'F', keyMode: 'MAJOR', timeSignature: '12/8', tempoSuggestionBpm: 52, totalMeasures: 19, totalDurationSeconds: 100 },
  { bwvNumber: 867, book: 1, numberInBook: 11, type: 'FUGUE', keyTonic: 'F', keyMode: 'MAJOR', timeSignature: '3/4', tempoSuggestionBpm: 72, totalMeasures: 79, voiceCount: 3, totalDurationSeconds: 180 },
  { bwvNumber: 868, book: 1, numberInBook: 12, type: 'PRELUDE', keyTonic: 'F', keyMode: 'MINOR', timeSignature: '12/8', tempoSuggestionBpm: 44, totalMeasures: 25, totalDurationSeconds: 180 },
  { bwvNumber: 869, book: 1, numberInBook: 12, type: 'FUGUE', keyTonic: 'F', keyMode: 'MINOR', timeSignature: '4/4', tempoSuggestionBpm: 60, totalMeasures: 33, voiceCount: 4, totalDurationSeconds: 150 },
  { bwvNumber: 870, book: 1, numberInBook: 13, type: 'PRELUDE', keyTonic: 'F#', keyMode: 'MAJOR', timeSignature: '4/4', tempoSuggestionBpm: 100, totalMeasures: 23, totalDurationSeconds: 70 },
  { bwvNumber: 871, book: 1, numberInBook: 13, type: 'FUGUE', keyTonic: 'F#', keyMode: 'MAJOR', timeSignature: '4/4', tempoSuggestionBpm: 76, totalMeasures: 70, voiceCount: 3, totalDurationSeconds: 180 },
  { bwvNumber: 872, book: 1, numberInBook: 14, type: 'PRELUDE', keyTonic: 'F#', keyMode: 'MINOR', timeSignature: '9/8', tempoSuggestionBpm: 50, totalMeasures: 38, totalDurationSeconds: 120 },
  { bwvNumber: 873, book: 1, numberInBook: 14, type: 'FUGUE', keyTonic: 'F#', keyMode: 'MINOR', timeSignature: 'C', tempoSuggestionBpm: 88, totalMeasures: 68, voiceCount: 4, totalDurationSeconds: 180 },
  { bwvNumber: 874, book: 1, numberInBook: 15, type: 'PRELUDE', keyTonic: 'G', keyMode: 'MAJOR', timeSignature: '2/4', tempoSuggestionBpm: 120, totalMeasures: 49, totalDurationSeconds: 70 },
  { bwvNumber: 875, book: 1, numberInBook: 15, type: 'FUGUE', keyTonic: 'G', keyMode: 'MAJOR', timeSignature: '3/4', tempoSuggestionBpm: 80, totalMeasures: 75, voiceCount: 3, totalDurationSeconds: 180 },
  { bwvNumber: 876, book: 1, numberInBook: 16, type: 'PRELUDE', keyTonic: 'G', keyMode: 'MINOR', timeSignature: 'C', tempoSuggestionBpm: 80, totalMeasures: 30, totalDurationSeconds: 130 },
  { bwvNumber: 877, book: 1, numberInBook: 16, type: 'FUGUE', keyTonic: 'G', keyMode: 'MINOR', timeSignature: 'C', tempoSuggestionBpm: 72, totalMeasures: 43, voiceCount: 4, totalDurationSeconds: 180 },
  { bwvNumber: 878, book: 1, numberInBook: 17, type: 'PRELUDE', keyTonic: 'Ab', keyMode: 'MAJOR', timeSignature: '3/4', tempoSuggestionBpm: 84, totalMeasures: 72, totalDurationSeconds: 160 },
  { bwvNumber: 879, book: 1, numberInBook: 17, type: 'FUGUE', keyTonic: 'Ab', keyMode: 'MAJOR', timeSignature: '4/4', tempoSuggestionBpm: 80, totalMeasures: 81, voiceCount: 4, totalDurationSeconds: 240 },
  { bwvNumber: 880, book: 1, numberInBook: 18, type: 'PRELUDE', keyTonic: 'G#', keyMode: 'MINOR', timeSignature: '4/4', tempoSuggestionBpm: 72, totalMeasures: 27, totalDurationSeconds: 120 },
  { bwvNumber: 881, book: 1, numberInBook: 18, type: 'FUGUE', keyTonic: 'G#', keyMode: 'MINOR', timeSignature: '6/8', tempoSuggestionBpm: 80, totalMeasures: 89, voiceCount: 4, totalDurationSeconds: 210 },
  { bwvNumber: 882, book: 1, numberInBook: 19, type: 'PRELUDE', keyTonic: 'A', keyMode: 'MAJOR', timeSignature: '3/8', tempoSuggestionBpm: 104, totalMeasures: 87, totalDurationSeconds: 120 },
  { bwvNumber: 883, book: 1, numberInBook: 19, type: 'FUGUE', keyTonic: 'A', keyMode: 'MAJOR', timeSignature: '3/8', tempoSuggestionBpm: 108, totalMeasures: 67, voiceCount: 3, totalDurationSeconds: 130 },
  { bwvNumber: 884, book: 1, numberInBook: 20, type: 'PRELUDE', keyTonic: 'A', keyMode: 'MINOR', timeSignature: '9/16', tempoSuggestionBpm: 72, totalMeasures: 32, totalDurationSeconds: 90 },
  { bwvNumber: 885, book: 1, numberInBook: 20, type: 'FUGUE', keyTonic: 'A', keyMode: 'MINOR', timeSignature: 'C', tempoSuggestionBpm: 76, totalMeasures: 111, voiceCount: 4, totalDurationSeconds: 300 },
  { bwvNumber: 886, book: 1, numberInBook: 21, type: 'PRELUDE', keyTonic: 'Bb', keyMode: 'MAJOR', timeSignature: 'C', tempoSuggestionBpm: 96, totalMeasures: 23, totalDurationSeconds: 80 },
  { bwvNumber: 887, book: 1, numberInBook: 21, type: 'FUGUE', keyTonic: 'Bb', keyMode: 'MAJOR', timeSignature: 'C', tempoSuggestionBpm: 84, totalMeasures: 55, voiceCount: 3, totalDurationSeconds: 150 },
  { bwvNumber: 888, book: 1, numberInBook: 22, type: 'PRELUDE', keyTonic: 'Bb', keyMode: 'MINOR', timeSignature: 'C', tempoSuggestionBpm: 72, totalMeasures: 38, totalDurationSeconds: 180 },
  { bwvNumber: 889, book: 1, numberInBook: 22, type: 'FUGUE', keyTonic: 'Bb', keyMode: 'MINOR', timeSignature: '4/4', tempoSuggestionBpm: 72, totalMeasures: 75, voiceCount: 5, totalDurationSeconds: 270 },
  { bwvNumber: 890, book: 1, numberInBook: 23, type: 'PRELUDE', keyTonic: 'B', keyMode: 'MAJOR', timeSignature: 'C', tempoSuggestionBpm: 96, totalMeasures: 31, totalDurationSeconds: 100 },
  { bwvNumber: 891, book: 1, numberInBook: 23, type: 'FUGUE', keyTonic: 'B', keyMode: 'MAJOR', timeSignature: 'C', tempoSuggestionBpm: 88, totalMeasures: 72, voiceCount: 4, totalDurationSeconds: 180 },
  { bwvNumber: 892, book: 1, numberInBook: 24, type: 'PRELUDE', keyTonic: 'B', keyMode: 'MINOR', timeSignature: '2/2', tempoSuggestionBpm: 72, totalMeasures: 27, totalDurationSeconds: 120 },
  { bwvNumber: 893, book: 1, numberInBook: 24, type: 'FUGUE', keyTonic: 'B', keyMode: 'MINOR', timeSignature: '12/8', tempoSuggestionBpm: 48, totalMeasures: 67, voiceCount: 4, totalDurationSeconds: 270 },

  // BOOK II - BWV 870-893 (Different numbering)
  { bwvNumber: 870, book: 2, numberInBook: 1, type: 'PRELUDE', keyTonic: 'C', keyMode: 'MAJOR', timeSignature: 'C', tempoSuggestionBpm: 88, totalMeasures: 44, totalDurationSeconds: 140 },
  { bwvNumber: 870, book: 2, numberInBook: 1, type: 'FUGUE', keyTonic: 'C', keyMode: 'MAJOR', timeSignature: 'C', tempoSuggestionBpm: 80, totalMeasures: 42, voiceCount: 3, totalDurationSeconds: 130 },
  { bwvNumber: 871, book: 2, numberInBook: 2, type: 'PRELUDE', keyTonic: 'C', keyMode: 'MINOR', timeSignature: 'C', tempoSuggestionBpm: 76, totalMeasures: 30, totalDurationSeconds: 110 },
  { bwvNumber: 871, book: 2, numberInBook: 2, type: 'FUGUE', keyTonic: 'C', keyMode: 'MINOR', timeSignature: 'C', tempoSuggestionBpm: 72, totalMeasures: 56, voiceCount: 3, totalDurationSeconds: 180 },
  { bwvNumber: 872, book: 2, numberInBook: 3, type: 'PRELUDE', keyTonic: 'C#', keyMode: 'MAJOR', timeSignature: '12/16', tempoSuggestionBpm: 60, totalMeasures: 97, totalDurationSeconds: 210 },
  { bwvNumber: 872, book: 2, numberInBook: 3, type: 'FUGUE', keyTonic: 'C#', keyMode: 'MAJOR', timeSignature: 'C', tempoSuggestionBpm: 84, totalMeasures: 73, voiceCount: 3, totalDurationSeconds: 190 },
  { bwvNumber: 873, book: 2, numberInBook: 4, type: 'PRELUDE', keyTonic: 'C#', keyMode: 'MINOR', timeSignature: 'C', tempoSuggestionBpm: 72, totalMeasures: 49, totalDurationSeconds: 180 },
  { bwvNumber: 873, book: 2, numberInBook: 4, type: 'FUGUE', keyTonic: 'C#', keyMode: 'MINOR', timeSignature: '3/4', tempoSuggestionBpm: 72, totalMeasures: 113, voiceCount: 3, totalDurationSeconds: 270 },
  { bwvNumber: 874, book: 2, numberInBook: 5, type: 'PRELUDE', keyTonic: 'D', keyMode: 'MAJOR', timeSignature: '6/8', tempoSuggestionBpm: 76, totalMeasures: 96, totalDurationSeconds: 200 },
  { bwvNumber: 874, book: 2, numberInBook: 5, type: 'FUGUE', keyTonic: 'D', keyMode: 'MAJOR', timeSignature: 'C', tempoSuggestionBpm: 84, totalMeasures: 50, voiceCount: 3, totalDurationSeconds: 140 },
  { bwvNumber: 875, book: 2, numberInBook: 6, type: 'PRELUDE', keyTonic: 'D', keyMode: 'MINOR', timeSignature: '3/4', tempoSuggestionBpm: 80, totalMeasures: 67, totalDurationSeconds: 150 },
  { bwvNumber: 875, book: 2, numberInBook: 6, type: 'FUGUE', keyTonic: 'D', keyMode: 'MINOR', timeSignature: 'C', tempoSuggestionBpm: 76, totalMeasures: 48, voiceCount: 3, totalDurationSeconds: 140 },
  { bwvNumber: 876, book: 2, numberInBook: 7, type: 'PRELUDE', keyTonic: 'Eb', keyMode: 'MAJOR', timeSignature: '3/4', tempoSuggestionBpm: 88, totalMeasures: 77, totalDurationSeconds: 160 },
  { bwvNumber: 876, book: 2, numberInBook: 7, type: 'FUGUE', keyTonic: 'Eb', keyMode: 'MAJOR', timeSignature: 'C', tempoSuggestionBpm: 80, totalMeasures: 116, voiceCount: 4, totalDurationSeconds: 300 },
  { bwvNumber: 877, book: 2, numberInBook: 8, type: 'PRELUDE', keyTonic: 'D#', keyMode: 'MINOR', timeSignature: '3/4', tempoSuggestionBpm: 72, totalMeasures: 106, totalDurationSeconds: 240 },
  { bwvNumber: 877, book: 2, numberInBook: 8, type: 'FUGUE', keyTonic: 'D#', keyMode: 'MINOR', timeSignature: '6/8', tempoSuggestionBpm: 72, totalMeasures: 131, voiceCount: 3, totalDurationSeconds: 300 },
  { bwvNumber: 878, book: 2, numberInBook: 9, type: 'PRELUDE', keyTonic: 'E', keyMode: 'MAJOR', timeSignature: '12/8', tempoSuggestionBpm: 52, totalMeasures: 49, totalDurationSeconds: 210 },
  { bwvNumber: 878, book: 2, numberInBook: 9, type: 'FUGUE', keyTonic: 'E', keyMode: 'MAJOR', timeSignature: '4/4', tempoSuggestionBpm: 76, totalMeasures: 69, voiceCount: 4, totalDurationSeconds: 210 },
  { bwvNumber: 879, book: 2, numberInBook: 10, type: 'PRELUDE', keyTonic: 'E', keyMode: 'MINOR', timeSignature: '3/4', tempoSuggestionBpm: 84, totalMeasures: 63, totalDurationSeconds: 140 },
  { bwvNumber: 879, book: 2, numberInBook: 10, type: 'FUGUE', keyTonic: 'E', keyMode: 'MINOR', timeSignature: 'C', tempoSuggestionBpm: 72, totalMeasures: 70, voiceCount: 3, totalDurationSeconds: 180 },
  { bwvNumber: 880, book: 2, numberInBook: 11, type: 'PRELUDE', keyTonic: 'F', keyMode: 'MAJOR', timeSignature: 'C', tempoSuggestionBpm: 100, totalMeasures: 86, totalDurationSeconds: 180 },
  { bwvNumber: 880, book: 2, numberInBook: 11, type: 'FUGUE', keyTonic: 'F', keyMode: 'MAJOR', timeSignature: '3/8', tempoSuggestionBpm: 96, totalMeasures: 131, voiceCount: 3, totalDurationSeconds: 240 },
  { bwvNumber: 881, book: 2, numberInBook: 12, type: 'PRELUDE', keyTonic: 'F', keyMode: 'MINOR', timeSignature: '4/4', tempoSuggestionBpm: 76, totalMeasures: 64, totalDurationSeconds: 180 },
  { bwvNumber: 881, book: 2, numberInBook: 12, type: 'FUGUE', keyTonic: 'F', keyMode: 'MINOR', timeSignature: 'C', tempoSuggestionBpm: 72, totalMeasures: 73, voiceCount: 3, totalDurationSeconds: 210 },
  { bwvNumber: 882, book: 2, numberInBook: 13, type: 'PRELUDE', keyTonic: 'F#', keyMode: 'MAJOR', timeSignature: 'C', tempoSuggestionBpm: 92, totalMeasures: 64, totalDurationSeconds: 160 },
  { bwvNumber: 882, book: 2, numberInBook: 13, type: 'FUGUE', keyTonic: 'F#', keyMode: 'MAJOR', timeSignature: 'C', tempoSuggestionBpm: 80, totalMeasures: 74, voiceCount: 3, totalDurationSeconds: 190 },
  { bwvNumber: 883, book: 2, numberInBook: 14, type: 'PRELUDE', keyTonic: 'F#', keyMode: 'MINOR', timeSignature: 'C', tempoSuggestionBpm: 80, totalMeasures: 42, totalDurationSeconds: 130 },
  { bwvNumber: 883, book: 2, numberInBook: 14, type: 'FUGUE', keyTonic: 'F#', keyMode: 'MINOR', timeSignature: 'C', tempoSuggestionBpm: 76, totalMeasures: 101, voiceCount: 3, totalDurationSeconds: 240 },
  { bwvNumber: 884, book: 2, numberInBook: 15, type: 'PRELUDE', keyTonic: 'G', keyMode: 'MAJOR', timeSignature: '3/4', tempoSuggestionBpm: 84, totalMeasures: 84, totalDurationSeconds: 180 },
  { bwvNumber: 884, book: 2, numberInBook: 15, type: 'FUGUE', keyTonic: 'G', keyMode: 'MAJOR', timeSignature: 'C', tempoSuggestionBpm: 84, totalMeasures: 88, voiceCount: 3, totalDurationSeconds: 210 },
  { bwvNumber: 885, book: 2, numberInBook: 16, type: 'PRELUDE', keyTonic: 'G', keyMode: 'MINOR', timeSignature: 'C', tempoSuggestionBpm: 76, totalMeasures: 97, totalDurationSeconds: 240 },
  { bwvNumber: 885, book: 2, numberInBook: 16, type: 'FUGUE', keyTonic: 'G', keyMode: 'MINOR', timeSignature: 'C', tempoSuggestionBpm: 72, totalMeasures: 86, voiceCount: 4, totalDurationSeconds: 240 },
  { bwvNumber: 886, book: 2, numberInBook: 17, type: 'PRELUDE', keyTonic: 'Ab', keyMode: 'MAJOR', timeSignature: '9/8', tempoSuggestionBpm: 56, totalMeasures: 80, totalDurationSeconds: 240 },
  { bwvNumber: 886, book: 2, numberInBook: 17, type: 'FUGUE', keyTonic: 'Ab', keyMode: 'MAJOR', timeSignature: 'C', tempoSuggestionBpm: 76, totalMeasures: 95, voiceCount: 3, totalDurationSeconds: 240 },
  { bwvNumber: 887, book: 2, numberInBook: 18, type: 'PRELUDE', keyTonic: 'G#', keyMode: 'MINOR', timeSignature: 'C', tempoSuggestionBpm: 80, totalMeasures: 114, totalDurationSeconds: 270 },
  { bwvNumber: 887, book: 2, numberInBook: 18, type: 'FUGUE', keyTonic: 'G#', keyMode: 'MINOR', timeSignature: 'C', tempoSuggestionBpm: 76, totalMeasures: 121, voiceCount: 3, totalDurationSeconds: 300 },
  { bwvNumber: 888, book: 2, numberInBook: 19, type: 'PRELUDE', keyTonic: 'A', keyMode: 'MAJOR', timeSignature: 'C', tempoSuggestionBpm: 88, totalMeasures: 83, totalDurationSeconds: 180 },
  { bwvNumber: 888, book: 2, numberInBook: 19, type: 'FUGUE', keyTonic: 'A', keyMode: 'MAJOR', timeSignature: '3/4', tempoSuggestionBpm: 84, totalMeasures: 111, voiceCount: 3, totalDurationSeconds: 240 },
  { bwvNumber: 889, book: 2, numberInBook: 20, type: 'PRELUDE', keyTonic: 'A', keyMode: 'MINOR', timeSignature: 'C', tempoSuggestionBpm: 80, totalMeasures: 27, totalDurationSeconds: 90 },
  { bwvNumber: 889, book: 2, numberInBook: 20, type: 'FUGUE', keyTonic: 'A', keyMode: 'MINOR', timeSignature: 'C', tempoSuggestionBpm: 76, totalMeasures: 113, voiceCount: 3, totalDurationSeconds: 270 },
  { bwvNumber: 890, book: 2, numberInBook: 21, type: 'PRELUDE', keyTonic: 'Bb', keyMode: 'MAJOR', timeSignature: '12/8', tempoSuggestionBpm: 52, totalMeasures: 41, totalDurationSeconds: 180 },
  { bwvNumber: 890, book: 2, numberInBook: 21, type: 'FUGUE', keyTonic: 'Bb', keyMode: 'MAJOR', timeSignature: 'C', tempoSuggestionBpm: 80, totalMeasures: 138, voiceCount: 3, totalDurationSeconds: 330 },
  { bwvNumber: 891, book: 2, numberInBook: 22, type: 'PRELUDE', keyTonic: 'Bb', keyMode: 'MINOR', timeSignature: 'C', tempoSuggestionBpm: 76, totalMeasures: 28, totalDurationSeconds: 100 },
  { bwvNumber: 891, book: 2, numberInBook: 22, type: 'FUGUE', keyTonic: 'Bb', keyMode: 'MINOR', timeSignature: 'C', tempoSuggestionBpm: 72, totalMeasures: 78, voiceCount: 4, totalDurationSeconds: 210 },
  { bwvNumber: 892, book: 2, numberInBook: 23, type: 'PRELUDE', keyTonic: 'B', keyMode: 'MAJOR', timeSignature: 'C', tempoSuggestionBpm: 92, totalMeasures: 71, totalDurationSeconds: 150 },
  { bwvNumber: 892, book: 2, numberInBook: 23, type: 'FUGUE', keyTonic: 'B', keyMode: 'MAJOR', timeSignature: 'C', tempoSuggestionBpm: 84, totalMeasures: 89, voiceCount: 4, totalDurationSeconds: 210 },
  { bwvNumber: 893, book: 2, numberInBook: 24, type: 'PRELUDE', keyTonic: 'B', keyMode: 'MINOR', timeSignature: 'C', tempoSuggestionBpm: 76, totalMeasures: 32, totalDurationSeconds: 110 },
  { bwvNumber: 893, book: 2, numberInBook: 24, type: 'FUGUE', keyTonic: 'B', keyMode: 'MINOR', timeSignature: 'C', tempoSuggestionBpm: 72, totalMeasures: 82, voiceCount: 3, totalDurationSeconds: 210 },
];

export async function seedPieces(prisma: PrismaClient) {
  console.log('Seeding WTC pieces...');

  let createdCount = 0;
  let skippedCount = 0;

  for (const pieceData of WTC_PIECES) {
    try {
      await prisma.piece.upsert({
        where: { bwvNumber: pieceData.bwvNumber },
        update: {},
        create: pieceData,
      });
      createdCount++;
    } catch (error) {
      console.warn(`Skipped duplicate piece BWV ${pieceData.bwvNumber}`);
      skippedCount++;
    }
  }

  console.log(`✓ Created ${createdCount} pieces, skipped ${skippedCount} duplicates`);
}
