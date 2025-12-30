/**
 * Settings Section Component
 *
 * Reusable section component for organizing settings into logical groups.
 */

import { ReactNode } from 'react';
import { Separator } from '@/components/ui/separator';

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function SettingsSection({
  title,
  description,
  children,
  className = '',
}: SettingsSectionProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h3 className="text-lg font-medium">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
      <Separator className="my-6" />
    </div>
  );
}

interface SettingRowProps {
  label: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function SettingRow({
  label,
  description,
  children,
  className = '',
}: SettingRowProps) {
  return (
    <div className={`flex items-center justify-between gap-4 ${className}`}>
      <div className="flex-1 space-y-1">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}
