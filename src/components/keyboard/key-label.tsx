/**
 * Key label component for displaying note names on piano keys
 */

import { getPitchClass, getOctave } from '@/lib/music/note-utils';

interface KeyLabelProps {
  midiNote: number;
  isBlack: boolean;
  showOctave?: boolean;
  className?: string;
}

export function KeyLabel({
  midiNote,
  isBlack,
  showOctave = false,
  className = '',
}: KeyLabelProps) {
  const pitchClass = getPitchClass(midiNote);
  const octave = getOctave(midiNote);
  const showOctaveNumber = showOctave && pitchClass === 'C';

  return (
    <div
      className={`
        absolute bottom-2 left-1/2 -translate-x-1/2
        pointer-events-none select-none
        text-xs font-medium
        ${isBlack ? 'text-gray-400' : 'text-gray-600'}
        ${className}
      `}
    >
      <div className="flex flex-col items-center">
        <span>{pitchClass}</span>
        {showOctaveNumber && (
          <span className="text-[10px] text-gray-500">{octave}</span>
        )}
      </div>
    </div>
  );
}
