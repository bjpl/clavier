/**
 * Appearance Settings Component
 *
 * Controls for theme, zoom level, voice colors, and visual preferences.
 */

import { SettingsSection, SettingRow } from './settings-section';
import { useTheme, useScoreSettings } from '@/hooks/use-settings';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { CONSTRAINTS } from '@/lib/settings/settings-schema';

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
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
  } = useScoreSettings();

  const zoomPercentage = Math.round(zoom * 100);

  return (
    <SettingsSection
      title="Appearance"
      description="Customize the visual appearance of the application"
    >
      {/* Theme */}
      <SettingRow
        label="Theme"
        description="Select your preferred color scheme"
      >
        <Select value={theme} onValueChange={setTheme}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
      </SettingRow>

      {/* Score Zoom */}
      <SettingRow
        label="Score Zoom"
        description={`Current: ${zoomPercentage}%`}
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={decreaseZoom}
            disabled={zoom <= CONSTRAINTS.scoreZoom.min}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <div className="w-32">
            <Slider
              value={[zoom]}
              onValueChange={([value]) => setZoom(value)}
              min={CONSTRAINTS.scoreZoom.min}
              max={CONSTRAINTS.scoreZoom.max}
              step={CONSTRAINTS.scoreZoom.step}
              className="cursor-pointer"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={increaseZoom}
            disabled={zoom >= CONSTRAINTS.scoreZoom.max}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={resetZoom}
            title="Reset to 100%"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </SettingRow>

      {/* Voice Colors */}
      <SettingRow
        label="Voice Colors"
        description="Color-code different voices in the score"
      >
        <Switch checked={voiceColors} onCheckedChange={toggleVoiceColors} />
      </SettingRow>

      {/* Annotations */}
      <SettingRow
        label="Show Annotations"
        description="Display analytical annotations on the score"
      >
        <Switch checked={showAnnotations} onCheckedChange={toggleAnnotations} />
      </SettingRow>

      {/* Annotation Layers */}
      {showAnnotations && (
        <div className="ml-4 space-y-2">
          <p className="text-sm font-medium">Annotation Layers</p>
          <div className="space-y-2">
            <SettingRow label="Harmonic Analysis">
              <Switch
                checked={annotationLayers.includes('harmonic')}
                onCheckedChange={() => toggleAnnotationLayer('harmonic')}
              />
            </SettingRow>
            <SettingRow label="Melodic Analysis">
              <Switch
                checked={annotationLayers.includes('melodic')}
                onCheckedChange={() => toggleAnnotationLayer('melodic')}
              />
            </SettingRow>
            <SettingRow label="Structural Analysis">
              <Switch
                checked={annotationLayers.includes('structural')}
                onCheckedChange={() => toggleAnnotationLayer('structural')}
              />
            </SettingRow>
            <SettingRow label="Pedagogical Notes">
              <Switch
                checked={annotationLayers.includes('pedagogical')}
                onCheckedChange={() => toggleAnnotationLayer('pedagogical')}
              />
            </SettingRow>
          </div>
        </div>
      )}
    </SettingsSection>
  );
}
