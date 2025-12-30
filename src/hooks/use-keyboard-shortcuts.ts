import { useEffect } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  callback: () => void;
  preventDefault?: boolean;
}

/**
 * Hook for registering keyboard shortcuts
 * @param shortcuts - Array of keyboard shortcuts to register
 * @param enabled - Whether shortcuts are enabled
 */
export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrlKey === undefined || event.ctrlKey === shortcut.ctrlKey;
        const metaMatch = shortcut.metaKey === undefined || event.metaKey === shortcut.metaKey;
        const shiftMatch = shortcut.shiftKey === undefined || event.shiftKey === shortcut.shiftKey;
        const altMatch = shortcut.altKey === undefined || event.altKey === shortcut.altKey;
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (ctrlMatch && metaMatch && shiftMatch && altMatch && keyMatch) {
          if (shortcut.preventDefault !== false) {
            event.preventDefault();
          }
          shortcut.callback();
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts, enabled]);
}

/**
 * Hook for common view layout keyboard shortcuts
 */
export function useViewShortcuts({
  onToggleScore,
  onToggleKeyboard,
  onResetLayout,
  onToggleFullscreen,
  enabled = true,
}: {
  onToggleScore: () => void;
  onToggleKeyboard: () => void;
  onResetLayout?: () => void;
  onToggleFullscreen?: () => void;
  enabled?: boolean;
}) {
  const shortcuts: KeyboardShortcut[] = [
    {
      key: 's',
      metaKey: true,
      callback: onToggleScore,
    },
    {
      key: 'b',
      metaKey: true,
      callback: onToggleKeyboard,
    },
  ];

  if (onResetLayout) {
    shortcuts.push({
      key: 'r',
      metaKey: true,
      shiftKey: true,
      callback: onResetLayout,
    });
  }

  if (onToggleFullscreen) {
    shortcuts.push({
      key: 'f',
      metaKey: true,
      callback: onToggleFullscreen,
    });
  }

  useKeyboardShortcuts(shortcuts, enabled);
}
