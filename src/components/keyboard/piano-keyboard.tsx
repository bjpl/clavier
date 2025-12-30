/**
 * Piano keyboard component for note visualization and interaction
 */

import { useMemo } from 'react';
import { VoiceName, getWhiteKeys, getBlackKeys, getBlackKeyPosition } from '@/lib/music/note-utils';
import { useKeyboardInteraction } from '@/hooks/use-keyboard-interaction';
import { PianoKey } from './piano-key';

export interface ActiveNote {
  midiNote: number;
  voice?: VoiceName;
  velocity?: number;
  color?: string;
}

export interface PianoKeyboardProps {
  activeNotes?: ActiveNote[];
  startNote?: number;
  endNote?: number;
  showLabels?: boolean;
  onNoteClick?: (midiNote: number) => void;
  onNoteRelease?: (midiNote: number) => void;
  className?: string;
  whiteKeyWidth?: number;
  whiteKeyHeight?: number;
  voiceColors?: boolean;
}

/**
 * Piano keyboard component with configurable range and active note highlighting
 */
export function PianoKeyboard({
  activeNotes = [],
  startNote = 36, // C2
  endNote = 96,   // C7
  showLabels = true,
  onNoteClick,
  onNoteRelease,
  className = '',
  whiteKeyWidth = 24,
  whiteKeyHeight = 120,
  voiceColors: _voiceColors = true,
}: PianoKeyboardProps) {
  // Calculate dimensions
  const blackKeyWidth = whiteKeyWidth * 0.58;
  const blackKeyHeight = whiteKeyHeight * 0.625;

  // Get all keys in range
  const whiteKeys = useMemo(() => getWhiteKeys(startNote, endNote), [startNote, endNote]);
  const blackKeys = useMemo(() => getBlackKeys(startNote, endNote), [startNote, endNote]);

  // Create active notes map for quick lookup
  const activeNotesMap = useMemo(() => {
    const map = new Map<number, ActiveNote>();
    activeNotes.forEach((note) => {
      map.set(note.midiNote, note);
    });
    return map;
  }, [activeNotes]);

  // Keyboard interaction handlers
  const {
    handleMouseDown,
    handleMouseUp,
    handleMouseEnter,
    handleMouseLeave,
    handleTouchStart,
    handleTouchEnd,
  } = useKeyboardInteraction({
    onNoteOn: (midi) => onNoteClick?.(midi),
    onNoteOff: (midi) => onNoteRelease?.(midi),
    enabled: Boolean(onNoteClick || onNoteRelease),
  });

  // Calculate total width based on white keys
  const totalWidth = whiteKeys.length * whiteKeyWidth;

  // Calculate position for black keys
  const getBlackKeyStyle = (midi: number): React.CSSProperties => {
    const { offsetPercent } = getBlackKeyPosition(midi);

    // Find the position of the white key to the left of this black key
    const whiteKeysBefore = whiteKeys.filter(wk => wk < midi).length;
    const leftPosition = whiteKeysBefore * whiteKeyWidth + (whiteKeyWidth * offsetPercent) - (blackKeyWidth / 2);

    return {
      position: 'absolute',
      left: `${leftPosition}px`,
      width: `${blackKeyWidth}px`,
      height: `${blackKeyHeight}px`,
    };
  };

  return (
    <div
      className={`relative bg-gray-100 rounded-lg p-4 ${className}`}
      style={{ width: `${totalWidth + 8}px` }}
    >
      {/* Container for all keys */}
      <div className="relative" style={{ height: `${whiteKeyHeight}px` }}>
        {/* White keys layer */}
        <div className="absolute inset-0 flex">
          {whiteKeys.map((midi) => {
            const activeNote = activeNotesMap.get(midi);
            const isActive = !!activeNote;
            const activeVoice = activeNote?.voice;

            return (
              <PianoKey
                key={midi}
                midiNote={midi}
                isBlack={false}
                isActive={isActive}
                activeVoice={activeVoice}
                showLabel={showLabels}
                onPress={() => handleMouseDown(midi)}
                onRelease={() => handleMouseUp(midi)}
                onEnter={() => handleMouseEnter(midi)}
                onLeave={() => handleMouseLeave(midi)}
                onTouchStart={(e) => handleTouchStart(midi, e)}
                onTouchEnd={(e) => handleTouchEnd(midi, e)}
                style={{
                  width: `${whiteKeyWidth}px`,
                  height: `${whiteKeyHeight}px`,
                }}
              />
            );
          })}
        </div>

        {/* Black keys layer (positioned absolutely over white keys) */}
        {blackKeys.map((midi) => {
          const activeNote = activeNotesMap.get(midi);
          const isActive = !!activeNote;
          const activeVoice = activeNote?.voice;

          return (
            <PianoKey
              key={midi}
              midiNote={midi}
              isBlack={true}
              isActive={isActive}
              activeVoice={activeVoice}
              showLabel={showLabels}
              onPress={() => handleMouseDown(midi)}
              onRelease={() => handleMouseUp(midi)}
              onEnter={() => handleMouseEnter(midi)}
              onLeave={() => handleMouseLeave(midi)}
              onTouchStart={(e) => handleTouchStart(midi, e)}
              onTouchEnd={(e) => handleTouchEnd(midi, e)}
              style={getBlackKeyStyle(midi)}
            />
          );
        })}
      </div>
    </div>
  );
}
