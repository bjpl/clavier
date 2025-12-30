/**
 * Audio Settings Component
 *
 * Controls for volume levels, tempo, and audio preferences.
 */

import { SettingsSection, SettingRow } from './settings-section';
import { useAudioSettings } from '@/hooks/use-settings';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Volume2, VolumeX, Music, Mic } from 'lucide-react';
import { CONSTRAINTS } from '@/lib/settings/settings-schema';

export function AudioSettings() {
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

  return (
    <SettingsSection
      title="Audio"
      description="Configure audio playback and volume settings"
    >
      {/* Narration Auto-Play */}
      <SettingRow
        label="Auto-Play Narration"
        description="Automatically play narration when a piece loads"
      >
        <Switch checked={narrationAutoPlay} onCheckedChange={toggleNarrationAutoPlay} />
      </SettingRow>

      {/* Default Tempo */}
      <SettingRow
        label="Default Tempo"
        description={`${defaultTempo} BPM`}
      >
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={defaultTempo}
            onChange={(e) => setDefaultTempo(Number(e.target.value))}
            min={CONSTRAINTS.tempo.min}
            max={CONSTRAINTS.tempo.max}
            className="w-20"
          />
          <span className="text-sm text-muted-foreground">BPM</span>
        </div>
      </SettingRow>

      {/* Default Tempo Multiplier */}
      <SettingRow
        label="Tempo Multiplier"
        description={`${(defaultTempoMultiplier * 100).toFixed(0)}% speed`}
      >
        <div className="flex items-center gap-2">
          <div className="w-48">
            <Slider
              value={[defaultTempoMultiplier]}
              onValueChange={([value]) => setDefaultTempoMultiplier(value)}
              min={CONSTRAINTS.tempoMultiplier.min}
              max={CONSTRAINTS.tempoMultiplier.max}
              step={CONSTRAINTS.tempoMultiplier.step}
              className="cursor-pointer"
            />
          </div>
          <span className="text-sm text-muted-foreground w-12">
            {(defaultTempoMultiplier * 100).toFixed(0)}%
          </span>
        </div>
      </SettingRow>

      {/* Master Volume */}
      <SettingRow
        label="Master Volume"
        description="Overall volume level"
      >
        <div className="flex items-center gap-2">
          {masterVolume === 0 ? (
            <VolumeX className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Volume2 className="h-4 w-4 text-muted-foreground" />
          )}
          <div className="w-48">
            <Slider
              value={[masterVolume]}
              onValueChange={([value]) => setMasterVolume(value)}
              min={CONSTRAINTS.volume.min}
              max={CONSTRAINTS.volume.max}
              className="cursor-pointer"
            />
          </div>
          <span className="text-sm text-muted-foreground w-12">
            {masterVolume}%
          </span>
        </div>
      </SettingRow>

      {/* Narration Volume */}
      <SettingRow
        label="Narration Volume"
        description="Volume for AI narration"
      >
        <div className="flex items-center gap-2">
          <Mic className="h-4 w-4 text-muted-foreground" />
          <div className="w-48">
            <Slider
              value={[narrationVolume]}
              onValueChange={([value]) => setNarrationVolume(value)}
              min={CONSTRAINTS.volume.min}
              max={CONSTRAINTS.volume.max}
              className="cursor-pointer"
            />
          </div>
          <span className="text-sm text-muted-foreground w-12">
            {narrationVolume}%
          </span>
        </div>
      </SettingRow>

      {/* Music Volume */}
      <SettingRow
        label="Music Volume"
        description="Volume for music playback"
      >
        <div className="flex items-center gap-2">
          <Music className="h-4 w-4 text-muted-foreground" />
          <div className="w-48">
            <Slider
              value={[musicVolume]}
              onValueChange={([value]) => setMusicVolume(value)}
              min={CONSTRAINTS.volume.min}
              max={CONSTRAINTS.volume.max}
              className="cursor-pointer"
            />
          </div>
          <span className="text-sm text-muted-foreground w-12">
            {musicVolume}%
          </span>
        </div>
      </SettingRow>
    </SettingsSection>
  );
}
