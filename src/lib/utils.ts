import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format measure number for display
 * @param measure - Measure number (0-based)
 * @returns Formatted measure string (1-based)
 */
export function formatMeasure(measure: number): string {
  return `M${measure + 1}`;
}

/**
 * Format duration in seconds as mm:ss
 * @param seconds - Duration in seconds
 * @returns Formatted time string
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format key signature for display
 * @param key - Key letter (C, D, E, F, G, A, B)
 * @param accidental - Accidental (sharp, flat, natural)
 * @param mode - Mode (major, minor)
 * @returns Formatted key signature string
 */
export function formatKey(
  key: string,
  accidental?: 'sharp' | 'flat' | 'natural',
  mode: 'major' | 'minor' = 'major'
): string {
  const accidentalSymbol = {
    sharp: '#',
    flat: '♭',
    natural: '',
  }[accidental || 'natural'];

  return `${key}${accidentalSymbol} ${mode}`;
}
