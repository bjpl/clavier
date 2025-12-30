/**
 * Settings System Usage Examples
 *
 * This file demonstrates how to use the settings system in your components.
 * It's for reference only and not imported into the app.
 */

'use client';

import React from 'react';
import { useTheme, useScoreSettings, useAudioSettings, useLayoutSettings } from '@/hooks/use-settings';

/**
 * Example 1: Using theme settings
 */
export function ThemeExample() {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={() => setTheme('light')}>Light</button>
      <button onClick={() => setTheme('dark')}>Dark</button>
      <button onClick={() => setTheme('system')}>System</button>
    </div>
  );
}

/**
 * Example 2: Using score display settings
 */
export function ScoreDisplayExample() {
  const {
    zoom,
    voiceColors,
    showAnnotations,
    increaseZoom,
    decreaseZoom,
    resetZoom,
    toggleVoiceColors,
    toggleAnnotations,
  } = useScoreSettings();

  return (
    <div>
      {/* Zoom controls */}
      <div>
        <p>Zoom: {Math.round(zoom * 100)}%</p>
        <button onClick={increaseZoom}>Zoom In</button>
        <button onClick={decreaseZoom}>Zoom Out</button>
        <button onClick={resetZoom}>Reset</button>
      </div>

      {/* Visual options */}
      <div>
        <label>
          <input
            type="checkbox"
            checked={voiceColors}
            onChange={toggleVoiceColors}
          />
          Voice Colors
        </label>
        <label>
          <input
            type="checkbox"
            checked={showAnnotations}
            onChange={toggleAnnotations}
          />
          Show Annotations
        </label>
      </div>

      {/* Apply settings to score */}
      <div style={{ transform: `scale(${zoom})` }}>
        {/* Score content would go here */}
        {voiceColors && <p>Voice colors enabled</p>}
        {showAnnotations && <p>Annotations visible</p>}
      </div>
    </div>
  );
}

/**
 * Example 3: Using audio settings
 */
export function AudioControlsExample() {
  const {
    masterVolume,
    narrationVolume,
    musicVolume,
    narrationAutoPlay,
    defaultTempo,
    setMasterVolume,
    setNarrationVolume,
    setMusicVolume,
    toggleNarrationAutoPlay,
    setDefaultTempo,
  } = useAudioSettings();

  return (
    <div>
      {/* Volume controls */}
      <div>
        <label>
          Master Volume: {masterVolume}%
          <input
            type="range"
            min={0}
            max={100}
            value={masterVolume}
            onChange={(e) => setMasterVolume(Number(e.target.value))}
          />
        </label>
      </div>

      <div>
        <label>
          Narration Volume: {narrationVolume}%
          <input
            type="range"
            min={0}
            max={100}
            value={narrationVolume}
            onChange={(e) => setNarrationVolume(Number(e.target.value))}
          />
        </label>
      </div>

      <div>
        <label>
          Music Volume: {musicVolume}%
          <input
            type="range"
            min={0}
            max={100}
            value={musicVolume}
            onChange={(e) => setMusicVolume(Number(e.target.value))}
          />
        </label>
      </div>

      {/* Auto-play */}
      <div>
        <label>
          <input
            type="checkbox"
            checked={narrationAutoPlay}
            onChange={toggleNarrationAutoPlay}
          />
          Auto-play narration
        </label>
      </div>

      {/* Tempo */}
      <div>
        <label>
          Default Tempo: {defaultTempo} BPM
          <input
            type="number"
            min={40}
            max={240}
            value={defaultTempo}
            onChange={(e) => setDefaultTempo(Number(e.target.value))}
          />
        </label>
      </div>
    </div>
  );
}

/**
 * Example 4: Using layout settings
 */
export function LayoutExample() {
  const {
    keyboardVisible,
    sidebarOpen,
    splitPosition,
    toggleKeyboard,
    toggleSidebar,
    setSplitPosition,
  } = useLayoutSettings();

  return (
    <div>
      {/* Layout toggles */}
      <div>
        <button onClick={toggleKeyboard}>
          {keyboardVisible ? 'Hide' : 'Show'} Keyboard
        </button>
        <button onClick={toggleSidebar}>
          {sidebarOpen ? 'Hide' : 'Show'} Sidebar
        </button>
      </div>

      {/* Split position */}
      <div>
        <label>
          Score/Keyboard Split: {splitPosition}%
          <input
            type="range"
            min={20}
            max={80}
            value={splitPosition}
            onChange={(e) => setSplitPosition(Number(e.target.value))}
          />
        </label>
      </div>

      {/* Apply layout */}
      <div style={{ display: 'flex' }}>
        {sidebarOpen && <aside style={{ width: '20%' }}>Sidebar</aside>}
        <main style={{ flex: 1 }}>
          <div style={{ height: `${splitPosition}%` }}>Score</div>
          {keyboardVisible && (
            <div style={{ height: `${100 - splitPosition}%` }}>
              Keyboard
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

/**
 * Example 5: Bulk settings update
 */
export function ImportExportExample() {
  const { useSettingsMutation } = require('@/hooks/use-settings');
  const { mutate, reset } = useSettingsMutation();

  const exportSettings = () => {
    const { useSettingsStore } = require('@/lib/settings');
    const settings = useSettingsStore.getState();
    const json = JSON.stringify(settings, null, 2);

    // Download as file
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'clavier-settings.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importSettings = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const settings = JSON.parse(e.target?.result as string);
        mutate(settings);
        alert('Settings imported successfully!');
      } catch (error) {
        alert('Invalid settings file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <button onClick={exportSettings}>Export Settings</button>
      <input
        type="file"
        accept=".json"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) importSettings(file);
        }}
      />
      <button onClick={reset}>Reset to Defaults</button>
    </div>
  );
}

/**
 * Example 6: Performance-optimized component
 * Only subscribes to the specific settings it needs
 */
export function OptimizedScoreViewer() {
  // Only subscribes to these specific settings
  // Component won't re-render when other settings change
  const { zoom } = useScoreSettings();
  const { masterVolume } = useAudioSettings();

  return (
    <div style={{ transform: `scale(${zoom})` }}>
      <p>Score viewer</p>
      <p>Volume: {masterVolume}%</p>
    </div>
  );
}

/**
 * Example 7: Using settings in an effect
 */
export function EffectExample() {
  const { defaultTempo, masterVolume } = useAudioSettings();

  // Settings can be used in effects
  React.useEffect(() => {
    console.log('Tempo changed to:', defaultTempo);
    // Update audio engine tempo
  }, [defaultTempo]);

  React.useEffect(() => {
    console.log('Volume changed to:', masterVolume);
    // Update audio engine volume
  }, [masterVolume]);

  return <div>Check console for setting changes</div>;
}

/**
 * Example 8: Conditional rendering based on settings
 */
export function ConditionalRenderExample() {
  const { voiceColors, showAnnotations, annotationLayers } = useScoreSettings();

  return (
    <div>
      {voiceColors && <div className="voice-colors">Voice colors enabled</div>}

      {showAnnotations && (
        <div className="annotations">
          {annotationLayers.includes('harmonic') && (
            <div>Harmonic annotations</div>
          )}
          {annotationLayers.includes('melodic') && (
            <div>Melodic annotations</div>
          )}
          {annotationLayers.includes('structural') && (
            <div>Structural annotations</div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Example 9: Custom hook for derived settings
 */
export function useDerivedSettings() {
  const { defaultTempo, defaultTempoMultiplier } = useAudioSettings();
  const { masterVolume, musicVolume } = useAudioSettings();

  // Calculate derived values
  const effectiveTempo = defaultTempo * defaultTempoMultiplier;
  const effectiveVolume = (masterVolume / 100) * (musicVolume / 100) * 100;

  return {
    effectiveTempo,
    effectiveVolume,
  };
}

export function DerivedSettingsExample() {
  const { effectiveTempo, effectiveVolume } = useDerivedSettings();

  return (
    <div>
      <p>Effective tempo: {effectiveTempo.toFixed(0)} BPM</p>
      <p>Effective volume: {effectiveVolume.toFixed(0)}%</p>
    </div>
  );
}

/**
 * Example 10: Settings in server components (Next.js App Router)
 * Note: Settings are client-side only, so you need 'use client'
 */
'use client';

export function ServerComponentExample() {
  const { theme } = useTheme();

  // This component can now be used in server components
  // because it's marked with 'use client'
  return (
    <div className={theme === 'dark' ? 'dark-mode' : 'light-mode'}>
      Content
    </div>
  );
}
