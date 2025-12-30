'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Music,
  Piano,
  Maximize2,
  RotateCw,
  Layout,
  SplitSquareHorizontal,
  SplitSquareVertical,
  Eye,
  EyeOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Orientation } from './resizable-panel';

export interface ViewControlsProps {
  /**
   * Show/hide score panel
   */
  showScore: boolean;

  /**
   * Show/hide keyboard panel
   */
  showKeyboard: boolean;

  /**
   * Current orientation
   */
  orientation: Orientation;

  /**
   * Is in fullscreen mode
   */
  isFullscreen?: boolean;

  /**
   * Toggle score visibility
   */
  onToggleScore: () => void;

  /**
   * Toggle keyboard visibility
   */
  onToggleKeyboard: () => void;

  /**
   * Toggle orientation
   */
  onToggleOrientation: () => void;

  /**
   * Reset layout to default
   */
  onResetLayout: () => void;

  /**
   * Toggle fullscreen mode
   */
  onToggleFullscreen?: () => void;

  /**
   * Swap panel positions
   */
  onSwapPanels?: () => void;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Compact mode (icon-only buttons)
   */
  compact?: boolean;
}

export function ViewControls({
  showScore,
  showKeyboard,
  orientation,
  isFullscreen = false,
  onToggleScore,
  onToggleKeyboard,
  onToggleOrientation,
  onResetLayout,
  onToggleFullscreen,
  onSwapPanels,
  className,
  compact = false,
}: ViewControlsProps) {
  const isHorizontal = orientation === 'horizontal';

  return (
    <TooltipProvider>
      <div className={cn('flex items-center gap-1', className)}>
        {/* Score Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={showScore ? 'default' : 'ghost'}
              size={compact ? 'icon' : 'sm'}
              onClick={onToggleScore}
              aria-label="Toggle score visibility"
            >
              <Music className="h-4 w-4" />
              {!compact && <span className="ml-2">Score</span>}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Toggle Score (Cmd+S)</p>
          </TooltipContent>
        </Tooltip>

        {/* Keyboard Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={showKeyboard ? 'default' : 'ghost'}
              size={compact ? 'icon' : 'sm'}
              onClick={onToggleKeyboard}
              aria-label="Toggle keyboard visibility"
            >
              <Piano className="h-4 w-4" />
              {!compact && <span className="ml-2">Keyboard</span>}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Toggle Keyboard (Cmd+B)</p>
          </TooltipContent>
        </Tooltip>

        {/* Layout Dropdown */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size={compact ? 'icon' : 'sm'}
                  aria-label="Layout options"
                >
                  <Layout className="h-4 w-4" />
                  {!compact && <span className="ml-2">Layout</span>}
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Layout Options</p>
            </TooltipContent>
          </Tooltip>

          <DropdownMenuContent align="end">
            {/* Orientation */}
            <DropdownMenuItem onClick={onToggleOrientation}>
              {isHorizontal ? (
                <SplitSquareVertical className="mr-2 h-4 w-4" />
              ) : (
                <SplitSquareHorizontal className="mr-2 h-4 w-4" />
              )}
              {isHorizontal ? 'Vertical Split' : 'Horizontal Split'}
            </DropdownMenuItem>

            {/* Swap Panels */}
            {onSwapPanels && (
              <DropdownMenuItem onClick={onSwapPanels}>
                <RotateCw className="mr-2 h-4 w-4" />
                Swap Panels
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            {/* Visibility Controls */}
            <DropdownMenuItem onClick={onToggleScore}>
              {showScore ? (
                <EyeOff className="mr-2 h-4 w-4" />
              ) : (
                <Eye className="mr-2 h-4 w-4" />
              )}
              {showScore ? 'Hide' : 'Show'} Score
            </DropdownMenuItem>

            <DropdownMenuItem onClick={onToggleKeyboard}>
              {showKeyboard ? (
                <EyeOff className="mr-2 h-4 w-4" />
              ) : (
                <Eye className="mr-2 h-4 w-4" />
              )}
              {showKeyboard ? 'Hide' : 'Show'} Keyboard
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Fullscreen */}
            {onToggleFullscreen && (
              <>
                <DropdownMenuItem onClick={onToggleFullscreen}>
                  <Maximize2 className="mr-2 h-4 w-4" />
                  {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}

            {/* Reset */}
            <DropdownMenuItem onClick={onResetLayout}>
              <RotateCw className="mr-2 h-4 w-4" />
              Reset Layout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </TooltipProvider>
  );
}

/**
 * Compact version for mobile or sidebar
 */
export function ViewControlsCompact(props: ViewControlsProps) {
  return <ViewControls {...props} compact />;
}
