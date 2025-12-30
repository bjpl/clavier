'use client';

import React, { useRef, useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { GripVertical, GripHorizontal } from 'lucide-react';

export type Orientation = 'horizontal' | 'vertical';

export interface ResizablePanelProps {
  /**
   * Panel orientation: horizontal = left/right split, vertical = top/bottom split
   */
  orientation?: Orientation;

  /**
   * Current size as percentage (0-100)
   */
  size: number;

  /**
   * Callback when size changes
   */
  onSizeChange: (size: number) => void;

  /**
   * Minimum size as percentage
   */
  minSize?: number;

  /**
   * Maximum size as percentage
   */
  maxSize?: number;

  /**
   * First panel content
   */
  children: [React.ReactNode, React.ReactNode];

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Disable resizing
   */
  disabled?: boolean;
}

export function ResizablePanel({
  orientation = 'vertical',
  size,
  onSizeChange,
  minSize = 20,
  maxSize = 80,
  children,
  className,
  disabled = false,
}: ResizablePanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; size: number } | null>(null);

  const isHorizontal = orientation === 'horizontal';
  const [firstPanel, secondPanel] = children;

  // Calculate new size based on mouse/touch position
  const calculateNewSize = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current || !dragStart) return size;

      const rect = containerRef.current.getBoundingClientRect();
      const totalSize = isHorizontal ? rect.width : rect.height;
      const currentPos = isHorizontal ? clientX : clientY;
      const startPos = isHorizontal ? dragStart.x : dragStart.y;
      const delta = currentPos - startPos;
      const deltaPercent = (delta / totalSize) * 100;

      const newSize = dragStart.size + deltaPercent;
      return Math.max(minSize, Math.min(maxSize, newSize));
    },
    [dragStart, isHorizontal, size, minSize, maxSize]
  );

  // Mouse handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY, size });
    },
    [disabled, size]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !dragStart) return;
      const newSize = calculateNewSize(e.clientX, e.clientY);
      onSizeChange(newSize);
    },
    [isDragging, dragStart, calculateNewSize, onSizeChange]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragStart(null);
  }, []);

  // Touch handlers
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (disabled) return;
      e.preventDefault();
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX, y: touch.clientY, size });
    },
    [disabled, size]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging || !dragStart) return;
      e.preventDefault();
      const touch = e.touches[0];
      const newSize = calculateNewSize(touch.clientX, touch.clientY);
      onSizeChange(newSize);
    },
    [isDragging, dragStart, calculateNewSize, onSizeChange]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setDragStart(null);
  }, []);

  // Setup global event listeners during drag
  useEffect(() => {
    if (!isDragging) return;

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    // Prevent text selection during drag
    document.body.style.userSelect = 'none';
    document.body.style.cursor = isHorizontal ? 'col-resize' : 'row-resize';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd, isHorizontal]);

  const GripIcon = isHorizontal ? GripVertical : GripHorizontal;

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative flex',
        isHorizontal ? 'flex-row' : 'flex-col',
        className
      )}
    >
      {/* First Panel */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-150',
          isHorizontal ? 'h-full' : 'w-full'
        )}
        style={{
          [isHorizontal ? 'width' : 'height']: `${size}%`,
        }}
      >
        {firstPanel}
      </div>

      {/* Resize Handle */}
      <div
        className={cn(
          'group relative flex items-center justify-center bg-border transition-colors',
          isHorizontal ? 'w-1 h-full cursor-col-resize' : 'h-1 w-full cursor-row-resize',
          !disabled && 'hover:bg-primary/50',
          isDragging && 'bg-primary',
          disabled && 'cursor-not-allowed opacity-50'
        )}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        role="separator"
        aria-label={`Resize ${orientation} split`}
        aria-valuenow={size}
        aria-valuemin={minSize}
        aria-valuemax={maxSize}
        aria-disabled={disabled}
      >
        {/* Grip indicator */}
        <div
          className={cn(
            'absolute bg-background/95 border border-border rounded-full p-1 shadow-sm transition-opacity',
            isHorizontal ? 'left-1/2 -translate-x-1/2' : 'top-1/2 -translate-y-1/2',
            !disabled && 'opacity-0 group-hover:opacity-100',
            isDragging && 'opacity-100'
          )}
        >
          <GripIcon className="h-3 w-3 text-muted-foreground" />
        </div>
      </div>

      {/* Second Panel */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-150',
          isHorizontal ? 'h-full' : 'w-full'
        )}
        style={{
          [isHorizontal ? 'width' : 'height']: `${100 - size}%`,
        }}
      >
        {secondPanel}
      </div>
    </div>
  );
}
