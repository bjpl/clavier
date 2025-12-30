/**
 * Settings Library Index
 *
 * Re-exports all settings-related functionality.
 */

export {
  useSettingsStore,
  selectTheme,
  selectScoreSettings,
  selectLayoutSettings,
  selectAudioSettings,
  selectPlaybackSettings,
} from './settings-store';

export type {
  Theme,
  AnnotationLayer,
  UserSettings,
} from './settings-schema';

export {
  DEFAULT_SETTINGS,
  CONSTRAINTS,
  SETTINGS_VERSION,
  validateSettings,
  migrateSettings,
  sanitizeSettings,
  clampValue,
} from './settings-schema';
