/**
 * Playback Settings Component
 *
 * Controls for playback behavior preferences.
 */

import { SettingsSection, SettingRow } from './settings-section';
import { usePlaybackSettings, useLayoutSettings } from '@/hooks/use-settings';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { CONSTRAINTS } from '@/lib/settings/settings-schema';

export function PlaybackSettings() {
  const { loopByDefault, autoAdvance, toggleLoopByDefault, toggleAutoAdvance } =
    usePlaybackSettings();

  const { keyboardVisible, sidebarOpen, splitPosition, toggleKeyboard, toggleSidebar, setSplitPosition } =
    useLayoutSettings();

  return (
    <SettingsSection
      title="Playback & Layout"
      description="Configure playback behavior and interface layout"
    >
      {/* Loop by Default */}
      <SettingRow
        label="Loop by Default"
        description="Enable looping when playback starts"
      >
        <Switch checked={loopByDefault} onCheckedChange={toggleLoopByDefault} />
      </SettingRow>

      {/* Auto-Advance */}
      <SettingRow
        label="Auto-Advance"
        description="Automatically advance to next piece after completion"
      >
        <Switch checked={autoAdvance} onCheckedChange={toggleAutoAdvance} />
      </SettingRow>

      {/* Keyboard Visibility */}
      <SettingRow
        label="Show Piano Keyboard"
        description="Display the virtual piano keyboard"
      >
        <Switch checked={keyboardVisible} onCheckedChange={toggleKeyboard} />
      </SettingRow>

      {/* Sidebar Visibility */}
      <SettingRow
        label="Show Sidebar"
        description="Display the navigation sidebar"
      >
        <Switch checked={sidebarOpen} onCheckedChange={toggleSidebar} />
      </SettingRow>

      {/* Split Position */}
      <SettingRow
        label="Score/Keyboard Split"
        description={`${splitPosition}% score, ${100 - splitPosition}% keyboard`}
      >
        <div className="flex items-center gap-2">
          <div className="w-48">
            <Slider
              value={[splitPosition]}
              onValueChange={([value]) => setSplitPosition(value)}
              min={CONSTRAINTS.splitPosition.min}
              max={CONSTRAINTS.splitPosition.max}
              className="cursor-pointer"
            />
          </div>
          <span className="text-sm text-muted-foreground w-12">
            {splitPosition}%
          </span>
        </div>
      </SettingRow>
    </SettingsSection>
  );
}
