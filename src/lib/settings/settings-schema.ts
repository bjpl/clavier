/**
 * Settings Schema and Validation
 *
 * Defines the structure and validation rules for user preferences.
 * Includes migration support for schema changes across versions.
 */

export const SETTINGS_VERSION = 1;

export type Theme = 'light' | 'dark' | 'system';
export type AnnotationLayer = 'harmonic' | 'melodic' | 'structural' | 'pedagogical';

export interface UserSettings {
  version: number;

  // Appearance
  theme: Theme;
  scoreZoom: number; // 0.5 to 2.0 (50% to 200%)
  voiceColorsEnabled: boolean;

  // Annotations
  showAnnotations: boolean;
  annotationLayers: AnnotationLayer[];

  // Layout
  keyboardVisible: boolean;
  sidebarOpen: boolean;
  splitPosition: number; // 0 to 100

  // Audio & Playback
  narrationAutoPlay: boolean;
  defaultTempo: number; // 40 to 240 BPM
  defaultTempoMultiplier: number; // 0.25 to 2.0
  masterVolume: number; // 0 to 100
  narrationVolume: number; // 0 to 100
  musicVolume: number; // 0 to 100

  // Playback behavior
  loopByDefault: boolean;
  autoAdvance: boolean;
}

export const DEFAULT_SETTINGS: UserSettings = {
  version: SETTINGS_VERSION,

  // Appearance
  theme: 'system',
  scoreZoom: 1.0,
  voiceColorsEnabled: true,

  // Annotations
  showAnnotations: true,
  annotationLayers: ['harmonic', 'melodic', 'structural'],

  // Layout
  keyboardVisible: true,
  sidebarOpen: true,
  splitPosition: 50,

  // Audio & Playback
  narrationAutoPlay: false,
  defaultTempo: 120,
  defaultTempoMultiplier: 1.0,
  masterVolume: 75,
  narrationVolume: 80,
  musicVolume: 75,

  // Playback behavior
  loopByDefault: false,
  autoAdvance: true,
};

// Validation constraints
export const CONSTRAINTS = {
  scoreZoom: { min: 0.5, max: 2.0, step: 0.1 },
  splitPosition: { min: 20, max: 80 },
  tempo: { min: 40, max: 240 },
  tempoMultiplier: { min: 0.25, max: 2.0, step: 0.05 },
  volume: { min: 0, max: 100 },
} as const;

/**
 * Validates settings object
 */
export function validateSettings(settings: Partial<UserSettings>): settings is UserSettings {
  if (!settings || typeof settings !== 'object') return false;

  // Check required version
  if (typeof settings.version !== 'number') return false;

  // Validate theme
  if (settings.theme && !['light', 'dark', 'system'].includes(settings.theme)) {
    return false;
  }

  // Validate numeric ranges
  if (settings.scoreZoom !== undefined) {
    const { min, max } = CONSTRAINTS.scoreZoom;
    if (settings.scoreZoom < min || settings.scoreZoom > max) return false;
  }

  if (settings.splitPosition !== undefined) {
    const { min, max } = CONSTRAINTS.splitPosition;
    if (settings.splitPosition < min || settings.splitPosition > max) return false;
  }

  if (settings.defaultTempo !== undefined) {
    const { min, max } = CONSTRAINTS.tempo;
    if (settings.defaultTempo < min || settings.defaultTempo > max) return false;
  }

  if (settings.defaultTempoMultiplier !== undefined) {
    const { min, max } = CONSTRAINTS.tempoMultiplier;
    if (settings.defaultTempoMultiplier < min || settings.defaultTempoMultiplier > max) {
      return false;
    }
  }

  // Validate volumes
  const volumes = [
    settings.masterVolume,
    settings.narrationVolume,
    settings.musicVolume,
  ];

  for (const volume of volumes) {
    if (volume !== undefined) {
      const { min, max } = CONSTRAINTS.volume;
      if (volume < min || volume > max) return false;
    }
  }

  // Validate annotation layers
  if (settings.annotationLayers && Array.isArray(settings.annotationLayers)) {
    const validLayers: AnnotationLayer[] = ['harmonic', 'melodic', 'structural', 'pedagogical'];
    if (!settings.annotationLayers.every(layer => validLayers.includes(layer))) {
      return false;
    }
  }

  return true;
}

/**
 * Clamps a value to a valid range
 */
export function clampValue(
  value: number,
  constraint: { min: number; max: number }
): number {
  return Math.max(constraint.min, Math.min(constraint.max, value));
}

/**
 * Migrates settings from older versions to current version
 */
export function migrateSettings(settings: Partial<UserSettings>): UserSettings {
  // If no version, assume it's version 1 or use defaults
  const version = settings.version ?? 0;

  let migrated = { ...settings };

  // Migration from v0 (initial) to v1
  if (version < 1) {
    // Add any new v1 fields with defaults
    migrated = {
      ...DEFAULT_SETTINGS,
      ...migrated,
      version: 1,
    };
  }

  // Future migrations would go here
  // if (version < 2) { ... }

  // Ensure all fields exist and are valid
  const result: UserSettings = {
    ...DEFAULT_SETTINGS,
    ...migrated,
    version: SETTINGS_VERSION,
  };

  // Clamp numeric values to valid ranges
  result.scoreZoom = clampValue(result.scoreZoom, CONSTRAINTS.scoreZoom);
  result.splitPosition = clampValue(result.splitPosition, CONSTRAINTS.splitPosition);
  result.defaultTempo = clampValue(result.defaultTempo, CONSTRAINTS.tempo);
  result.defaultTempoMultiplier = clampValue(
    result.defaultTempoMultiplier,
    CONSTRAINTS.tempoMultiplier
  );
  result.masterVolume = clampValue(result.masterVolume, CONSTRAINTS.volume);
  result.narrationVolume = clampValue(result.narrationVolume, CONSTRAINTS.volume);
  result.musicVolume = clampValue(result.musicVolume, CONSTRAINTS.volume);

  return result;
}

/**
 * Sanitizes settings for storage
 */
export function sanitizeSettings(settings: UserSettings): UserSettings {
  return migrateSettings(settings);
}
