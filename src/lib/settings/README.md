# Settings System

Comprehensive user preferences system for Clavier with localStorage persistence, type-safe validation, and reactive updates across the application.

## Features

- ✅ **Zustand Store** - Reactive state management with devtools support
- ✅ **LocalStorage Persistence** - Settings survive page reloads
- ✅ **Type-Safe** - Full TypeScript support with validation
- ✅ **Migration Support** - Automatic schema migration across versions
- ✅ **Keyboard Shortcuts** - Cmd/Ctrl+, to open settings
- ✅ **Organized UI** - Tabbed settings dialog with logical grouping
- ✅ **React Hooks** - Optimized hooks for component subscriptions

## Quick Start

### Opening Settings

The settings dialog can be opened in three ways:

1. **Keyboard Shortcut**: Press `Cmd+,` (Mac) or `Ctrl+,` (Windows/Linux)
2. **Header Button**: Click the settings icon in the application header
3. **Programmatically**: Use the `useSettingsDialog` hook

```tsx
import { useSettingsDialog } from '@/components/settings';

function MyComponent() {
  const { openSettings } = useSettingsDialog();

  return (
    <button onClick={openSettings}>Open Settings</button>
  );
}
```

### Using Settings in Components

Import specific hooks for optimized performance:

```tsx
import { useTheme, useScoreSettings, useAudioSettings } from '@/hooks/use-settings';

function ScoreViewer() {
  const { theme } = useTheme();
  const { zoom, voiceColors, showAnnotations } = useScoreSettings();
  const { masterVolume, musicVolume } = useAudioSettings();

  // Use settings in your component
  return (
    <div style={{ zoom }}>
      {/* Your component */}
    </div>
  );
}
```

### Updating Settings

```tsx
import { useScoreSettings, useAudioSettings } from '@/hooks/use-settings';

function SettingsExample() {
  const { setZoom, increaseZoom, decreaseZoom } = useScoreSettings();
  const { setMasterVolume } = useAudioSettings();

  return (
    <div>
      <button onClick={increaseZoom}>Zoom In</button>
      <button onClick={decreaseZoom}>Zoom Out</button>
      <button onClick={() => setZoom(1.0)}>Reset Zoom</button>
      <input
        type="range"
        min={0}
        max={100}
        onChange={(e) => setMasterVolume(Number(e.target.value))}
      />
    </div>
  );
}
```

## Settings Categories

### Appearance
- **Theme**: Light, Dark, or System
- **Score Zoom**: 50% to 200%
- **Voice Colors**: Enable/disable color-coding for different voices
- **Annotations**: Show/hide annotations and control layers

### Audio
- **Narration Auto-Play**: Auto-play narration when piece loads
- **Default Tempo**: 40-240 BPM
- **Tempo Multiplier**: 0.25x to 2.0x playback speed
- **Master Volume**: Overall volume level (0-100%)
- **Narration Volume**: Volume for AI narration (0-100%)
- **Music Volume**: Volume for music playback (0-100%)

### Playback & Layout
- **Loop by Default**: Enable looping on playback start
- **Auto-Advance**: Advance to next piece automatically
- **Keyboard Visible**: Show/hide piano keyboard
- **Sidebar Open**: Show/hide navigation sidebar
- **Split Position**: Score/keyboard split ratio (20-80%)

## Available Hooks

### General Hooks

```tsx
// Access all settings (use sparingly for performance)
const settings = useSettings();

// Bulk update settings
const { mutate, reset } = useSettingsMutation();
mutate({ theme: 'dark', scoreZoom: 1.5 });

// Reset to defaults
const resetSettings = useResetSettings();
resetSettings();

// Get specific setting
const theme = useSetting('theme');
```

### Specific Hooks (Recommended)

```tsx
// Theme only
const { theme, setTheme } = useTheme();

// Score display settings
const {
  zoom,
  voiceColors,
  showAnnotations,
  annotationLayers,
  setZoom,
  increaseZoom,
  decreaseZoom,
  resetZoom,
  toggleVoiceColors,
  toggleAnnotations,
  toggleAnnotationLayer,
  setAnnotationLayers,
} = useScoreSettings();

// Layout settings
const {
  keyboardVisible,
  sidebarOpen,
  splitPosition,
  toggleKeyboard,
  setKeyboardVisible,
  toggleSidebar,
  setSidebarOpen,
  setSplitPosition,
} = useLayoutSettings();

// Audio settings
const {
  narrationAutoPlay,
  defaultTempo,
  defaultTempoMultiplier,
  masterVolume,
  narrationVolume,
  musicVolume,
  toggleNarrationAutoPlay,
  setDefaultTempo,
  setDefaultTempoMultiplier,
  setMasterVolume,
  setNarrationVolume,
  setMusicVolume,
} = useAudioSettings();

// Playback behavior
const {
  loopByDefault,
  autoAdvance,
  toggleLoopByDefault,
  toggleAutoAdvance,
} = usePlaybackSettings();
```

## Store Selectors

For advanced use cases, you can use selectors directly:

```tsx
import { useSettingsStore, selectTheme, selectScoreSettings } from '@/lib/settings';

function MyComponent() {
  const theme = useSettingsStore(selectTheme);
  const scoreSettings = useSettingsStore(selectScoreSettings);

  // More optimized than useSettings()
}
```

## Validation & Constraints

Settings are automatically validated and clamped to valid ranges:

```typescript
import { CONSTRAINTS } from '@/lib/settings';

// Score zoom: 0.5 to 2.0 (50% to 200%)
CONSTRAINTS.scoreZoom; // { min: 0.5, max: 2.0, step: 0.1 }

// Split position: 20 to 80 (%)
CONSTRAINTS.splitPosition; // { min: 20, max: 80 }

// Tempo: 40 to 240 BPM
CONSTRAINTS.tempo; // { min: 40, max: 240 }

// Tempo multiplier: 0.25x to 2.0x
CONSTRAINTS.tempoMultiplier; // { min: 0.25, max: 2.0, step: 0.05 }

// Volume: 0 to 100 (%)
CONSTRAINTS.volume; // { min: 0, max: 100 }
```

## Migration System

The settings system includes automatic migration for schema changes:

```typescript
import { migrateSettings, validateSettings } from '@/lib/settings';

// Migrate old settings to current version
const updated = migrateSettings(oldSettings);

// Validate settings object
if (validateSettings(settings)) {
  // Settings are valid
}
```

## Default Values

```typescript
import { DEFAULT_SETTINGS } from '@/lib/settings';

// All default values
DEFAULT_SETTINGS = {
  version: 1,
  theme: 'system',
  scoreZoom: 1.0,
  voiceColorsEnabled: true,
  showAnnotations: true,
  annotationLayers: ['harmonic', 'melodic', 'structural'],
  keyboardVisible: true,
  sidebarOpen: true,
  splitPosition: 50,
  narrationAutoPlay: false,
  defaultTempo: 120,
  defaultTempoMultiplier: 1.0,
  masterVolume: 75,
  narrationVolume: 80,
  musicVolume: 75,
  loopByDefault: false,
  autoAdvance: true,
};
```

## Architecture

```
src/lib/settings/
├── settings-schema.ts      # Types, validation, migration
├── settings-store.ts       # Zustand store with persistence
└── index.ts               # Public API exports

src/hooks/
└── use-settings.ts         # React hooks for components

src/components/settings/
├── settings-dialog.tsx     # Main modal dialog
├── settings-section.tsx    # Reusable section component
├── appearance-settings.tsx # Appearance controls
├── audio-settings.tsx      # Audio controls
├── playback-settings.tsx   # Playback & layout controls
└── index.ts               # Component exports
```

## Performance Tips

1. **Use specific hooks** instead of `useSettings()` for better re-render optimization
2. **Use selectors** for fine-grained subscriptions to store state
3. **Batch updates** using `updateSettings()` when changing multiple values
4. **Avoid destructuring** the entire settings object in render

```tsx
// ❌ Bad - subscribes to all changes
const settings = useSettings();

// ✅ Good - only subscribes to theme changes
const { theme } = useTheme();

// ✅ Good - only subscribes to specific selector
const theme = useSettingsStore(selectTheme);
```

## Testing

```tsx
import { useSettingsStore } from '@/lib/settings';

// Reset state between tests
beforeEach(() => {
  useSettingsStore.getState().resetSettings();
});

// Test settings changes
it('should update zoom level', () => {
  const { setZoom } = useSettingsStore.getState();
  setZoom(1.5);
  expect(useSettingsStore.getState().scoreZoom).toBe(1.5);
});
```

## Persistence

Settings are automatically persisted to localStorage under the key `clavier-settings`. The persistence layer handles:

- Serialization/deserialization
- Version migration
- Validation on restore
- Fallback to defaults on error

## Future Enhancements

Potential additions for future versions:

- [ ] Cloud sync across devices
- [ ] User profiles with different setting sets
- [ ] Import/export settings
- [ ] Settings presets
- [ ] Per-piece settings overrides
- [ ] Settings history/undo
