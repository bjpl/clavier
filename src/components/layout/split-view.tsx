'use client';

import React, { useCallback } from 'react';
import { ResizablePanel, type Orientation } from './resizable-panel';
import { cn } from '@/lib/utils';

export interface SplitViewProps {
  /**
   * Orientation: horizontal = left/right, vertical = top/bottom
   */
  orientation?: Orientation;

  /**
   * Current split ratio as percentage (0-100)
   */
  splitRatio: number;

  /**
   * Callback when split ratio changes
   */
  onSplitRatioChange: (ratio: number) => void;

  /**
   * First panel content
   */
  firstPanel: React.ReactNode;

  /**
   * Second panel content
   */
  secondPanel: React.ReactNode;

  /**
   * Minimum size for first panel (percentage)
   */
  minFirstPanel?: number;

  /**
   * Maximum size for first panel (percentage)
   */
  maxFirstPanel?: number;

  /**
   * Show/hide first panel
   */
  showFirstPanel?: boolean;

  /**
   * Show/hide second panel
   */
  showSecondPanel?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Disable resizing
   */
  disabled?: boolean;
}

export function SplitView({
  orientation = 'vertical',
  splitRatio,
  onSplitRatioChange,
  firstPanel,
  secondPanel,
  minFirstPanel = 30,
  maxFirstPanel = 70,
  showFirstPanel = true,
  showSecondPanel = true,
  className,
  disabled = false,
}: SplitViewProps) {
  const handleSizeChange = useCallback(
    (size: number) => {
      onSplitRatioChange(size);
    },
    [onSplitRatioChange]
  );

  // If both panels hidden, show nothing
  if (!showFirstPanel && !showSecondPanel) {
    return null;
  }

  // If only one panel visible, show it at full size
  if (!showFirstPanel) {
    return (
      <div className={cn('h-full w-full', className)}>
        {secondPanel}
      </div>
    );
  }

  if (!showSecondPanel) {
    return (
      <div className={cn('h-full w-full', className)}>
        {firstPanel}
      </div>
    );
  }

  // Both panels visible - show split view
  return (
    <ResizablePanel
      orientation={orientation}
      size={splitRatio}
      onSizeChange={handleSizeChange}
      minSize={minFirstPanel}
      maxSize={maxFirstPanel}
      className={cn('h-full w-full', className)}
      disabled={disabled}
    >
      {[firstPanel, secondPanel]}
    </ResizablePanel>
  );
}

/**
 * Hook for managing split view state with collapse/expand
 */
export function useSplitView(
  initialRatio: number = 50,
  initialOrientation: Orientation = 'vertical'
) {
  const [splitRatio, setSplitRatio] = React.useState(initialRatio);
  const [orientation, setOrientation] = React.useState<Orientation>(initialOrientation);
  const [showFirstPanel, setShowFirstPanel] = React.useState(true);
  const [showSecondPanel, setShowSecondPanel] = React.useState(true);
  const [lastRatio, setLastRatio] = React.useState(initialRatio);

  const handleSplitRatioChange = useCallback((ratio: number) => {
    setSplitRatio(ratio);
    setLastRatio(ratio);
  }, []);

  const toggleFirstPanel = useCallback(() => {
    setShowFirstPanel((prev) => !prev);
  }, []);

  const toggleSecondPanel = useCallback(() => {
    setShowSecondPanel((prev) => !prev);
  }, []);

  const toggleOrientation = useCallback(() => {
    setOrientation((prev) => (prev === 'horizontal' ? 'vertical' : 'horizontal'));
  }, []);

  const resetLayout = useCallback(() => {
    setSplitRatio(initialRatio);
    setOrientation(initialOrientation);
    setShowFirstPanel(true);
    setShowSecondPanel(true);
  }, [initialRatio, initialOrientation]);

  const collapseFirstPanel = useCallback(() => {
    setShowFirstPanel(false);
  }, []);

  const expandFirstPanel = useCallback(() => {
    setShowFirstPanel(true);
    if (!showSecondPanel) {
      setShowSecondPanel(true);
    }
  }, [showSecondPanel]);

  const collapseSecondPanel = useCallback(() => {
    setShowSecondPanel(false);
  }, []);

  const expandSecondPanel = useCallback(() => {
    setShowSecondPanel(true);
    if (!showFirstPanel) {
      setShowFirstPanel(true);
    }
  }, [showFirstPanel]);

  return {
    splitRatio,
    orientation,
    showFirstPanel,
    showSecondPanel,
    lastRatio,
    handleSplitRatioChange,
    toggleFirstPanel,
    toggleSecondPanel,
    toggleOrientation,
    resetLayout,
    collapseFirstPanel,
    expandFirstPanel,
    collapseSecondPanel,
    expandSecondPanel,
  };
}
