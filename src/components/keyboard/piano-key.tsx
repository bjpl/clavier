/**
 * Individual piano key component with interaction and styling
 */

import { VoiceName, getVoiceColor } from '@/lib/music/note-utils';
import { KeyLabel } from './key-label';

export interface PianoKeyProps {
  midiNote: number;
  isBlack: boolean;
  isActive: boolean;
  activeVoice?: VoiceName;
  showLabel: boolean;
  onPress: () => void;
  onRelease: () => void;
  onEnter: () => void;
  onLeave: () => void;
  onTouchStart: (event: React.TouchEvent) => void;
  onTouchEnd: (event: React.TouchEvent) => void;
  style?: React.CSSProperties;
}

export function PianoKey({
  midiNote,
  isBlack,
  isActive,
  activeVoice,
  showLabel,
  onPress,
  onRelease,
  onEnter,
  onLeave,
  onTouchStart,
  onTouchEnd,
  style,
}: PianoKeyProps) {
  const activeColor = activeVoice ? getVoiceColor(activeVoice) : '#6B7280';

  // Base styles for white and black keys
  const baseWhiteKeyClasses = `
    relative
    bg-white
    border border-gray-300
    rounded-b
    cursor-pointer
    transition-all duration-75
    hover:bg-gray-50
    active:bg-gray-100
    shadow-sm
  `;

  const baseBlackKeyClasses = `
    relative
    bg-gray-900
    border border-gray-950
    rounded-b
    cursor-pointer
    transition-all duration-75
    hover:bg-gray-800
    active:bg-gray-700
    shadow-md
    z-10
  `;

  // Active state styling
  const activeStyle = isActive
    ? {
        backgroundColor: activeColor,
        opacity: 0.8,
        transform: 'scale(0.98)',
      }
    : {};

  return (
    <div
      className={isBlack ? baseBlackKeyClasses : baseWhiteKeyClasses}
      style={{ ...style, ...activeStyle }}
      onMouseDown={onPress}
      onMouseUp={onRelease}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onContextMenu={(e) => e.preventDefault()} // Prevent context menu on long press
      role="button"
      aria-label={`Piano key ${midiNote}`}
      aria-pressed={isActive}
    >
      {showLabel && <KeyLabel midiNote={midiNote} isBlack={isBlack} showOctave />}
    </div>
  );
}
