/**
 * Hook for managing piano keyboard interactions (mouse and touch)
 */

import { useCallback, useRef, useEffect } from 'react';

interface UseKeyboardInteractionOptions {
  onNoteOn: (midi: number) => void;
  onNoteOff: (midi: number) => void;
  enabled?: boolean;
}

interface KeyboardInteractionHandlers {
  handleMouseDown: (midi: number) => void;
  handleMouseUp: (midi: number) => void;
  handleMouseEnter: (midi: number) => void;
  handleMouseLeave: (midi: number) => void;
  handleTouchStart: (midi: number, event: React.TouchEvent) => void;
  handleTouchEnd: (midi: number, event: React.TouchEvent) => void;
}

/**
 * Manages keyboard interaction state and provides event handlers
 */
export function useKeyboardInteraction({
  onNoteOn,
  onNoteOff,
  enabled = true,
}: UseKeyboardInteractionOptions): KeyboardInteractionHandlers {
  const activeNotesRef = useRef<Set<number>>(new Set());
  const isMouseDownRef = useRef(false);
  const activeTouchesRef = useRef<Map<number, number>>(new Map()); // touchId -> midiNote

  // Mouse down handler
  const handleMouseDown = useCallback(
    (midi: number) => {
      if (!enabled) return;

      isMouseDownRef.current = true;
      if (!activeNotesRef.current.has(midi)) {
        activeNotesRef.current.add(midi);
        onNoteOn(midi);
      }
    },
    [enabled, onNoteOn]
  );

  // Mouse up handler
  const handleMouseUp = useCallback(
    (midi: number) => {
      if (!enabled) return;

      isMouseDownRef.current = false;
      if (activeNotesRef.current.has(midi)) {
        activeNotesRef.current.delete(midi);
        onNoteOff(midi);
      }
    },
    [enabled, onNoteOff]
  );

  // Mouse enter handler (for drag playing)
  const handleMouseEnter = useCallback(
    (midi: number) => {
      if (!enabled || !isMouseDownRef.current) return;

      if (!activeNotesRef.current.has(midi)) {
        activeNotesRef.current.add(midi);
        onNoteOn(midi);
      }
    },
    [enabled, onNoteOn]
  );

  // Mouse leave handler
  const handleMouseLeave = useCallback(
    (midi: number) => {
      if (!enabled || !isMouseDownRef.current) return;

      if (activeNotesRef.current.has(midi)) {
        activeNotesRef.current.delete(midi);
        onNoteOff(midi);
      }
    },
    [enabled, onNoteOff]
  );

  // Touch start handler
  const handleTouchStart = useCallback(
    (midi: number, event: React.TouchEvent) => {
      if (!enabled) return;

      event.preventDefault(); // Prevent scrolling and context menu

      // Register all new touches on this key
      const touches = event.changedTouches;
      for (let i = 0; i < touches.length; i++) {
        const touch = touches[i];
        activeTouchesRef.current.set(touch.identifier, midi);
      }

      // Trigger note on if not already active
      if (!activeNotesRef.current.has(midi)) {
        activeNotesRef.current.add(midi);
        onNoteOn(midi);
      }
    },
    [enabled, onNoteOn]
  );

  // Touch end handler
  const handleTouchEnd = useCallback(
    (midi: number, event: React.TouchEvent) => {
      if (!enabled) return;

      event.preventDefault();

      // Remove ended touches
      const touches = event.changedTouches;
      let shouldReleaseNote = true;

      for (let i = 0; i < touches.length; i++) {
        const touch = touches[i];
        activeTouchesRef.current.delete(touch.identifier);
      }

      // Check if any other touches are still on this key
      for (const [, touchMidi] of activeTouchesRef.current) {
        if (touchMidi === midi) {
          shouldReleaseNote = false;
          break;
        }
      }

      // Release note if no touches remain on this key
      if (shouldReleaseNote && activeNotesRef.current.has(midi)) {
        activeNotesRef.current.delete(midi);
        onNoteOff(midi);
      }
    },
    [enabled, onNoteOff]
  );

  // Global mouse up listener (for mouse drag release outside key)
  useEffect(() => {
    if (!enabled) return;

    const handleGlobalMouseUp = () => {
      if (isMouseDownRef.current) {
        isMouseDownRef.current = false;
        // Release all active notes
        activeNotesRef.current.forEach((midi) => {
          onNoteOff(midi);
        });
        activeNotesRef.current.clear();
      }
    };

    const handleGlobalTouchEnd = () => {
      // Release all active notes when touches end
      activeTouchesRef.current.clear();
      activeNotesRef.current.forEach((midi) => {
        onNoteOff(midi);
      });
      activeNotesRef.current.clear();
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('touchend', handleGlobalTouchEnd);
    window.addEventListener('touchcancel', handleGlobalTouchEnd);

    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchend', handleGlobalTouchEnd);
      window.removeEventListener('touchcancel', handleGlobalTouchEnd);
    };
  }, [enabled, onNoteOff]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      activeNotesRef.current.clear();
      activeTouchesRef.current.clear();
      isMouseDownRef.current = false;
    };
  }, []);

  return {
    handleMouseDown,
    handleMouseUp,
    handleMouseEnter,
    handleMouseLeave,
    handleTouchStart,
    handleTouchEnd,
  };
}
