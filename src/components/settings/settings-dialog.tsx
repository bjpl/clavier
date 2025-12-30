/**
 * Settings Dialog Component
 *
 * Main modal dialog for user preferences.
 * Includes keyboard shortcuts (Cmd/Ctrl+,) to open.
 */

'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppearanceSettings } from './appearance-settings';
import { AudioSettings } from './audio-settings';
import { PlaybackSettings } from './playback-settings';
import { useResetSettings } from '@/hooks/use-settings';
import { Settings, Palette, Volume2, PlayCircle, RotateCcw } from 'lucide-react';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const resetSettings = useResetSettings();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Keyboard shortcut: Cmd/Ctrl+,
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault();
        onOpenChange(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenChange]);

  const handleReset = () => {
    if (showResetConfirm) {
      resetSettings();
      setShowResetConfirm(false);
      // Optional: show a toast notification
    } else {
      setShowResetConfirm(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings
          </DialogTitle>
          <DialogDescription>
            Customize your Clavier experience. Press{' '}
            <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">
              {typeof window !== 'undefined' && navigator.platform.includes('Mac')
                ? '⌘'
                : 'Ctrl'}
              +,
            </kbd>{' '}
            to open settings anytime.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="appearance" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="audio" className="flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              Audio
            </TabsTrigger>
            <TabsTrigger value="playback" className="flex items-center gap-2">
              <PlayCircle className="h-4 w-4" />
              Playback
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="appearance" className="space-y-4">
              <AppearanceSettings />
            </TabsContent>

            <TabsContent value="audio" className="space-y-4">
              <AudioSettings />
            </TabsContent>

            <TabsContent value="playback" className="space-y-4">
              <PlaybackSettings />
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="mt-6 flex items-center justify-between">
          <div>
            {showResetConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Are you sure? This will reset all settings.
                </span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleReset}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-3 w-3" />
                  Confirm Reset
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowResetConfirm(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset to Defaults
              </Button>
            )}
          </div>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Hook to control the settings dialog
 */
export function useSettingsDialog() {
  const [open, setOpen] = useState(false);

  return {
    open,
    setOpen,
    openSettings: () => setOpen(true),
    closeSettings: () => setOpen(false),
  };
}
