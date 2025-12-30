/**
 * Settings Provider Component
 *
 * Syncs settings with external systems like theme providers.
 * Add this component to your root layout to ensure settings are applied.
 */

'use client';

import { useEffect } from 'react';
import { useTheme as useNextTheme } from 'next-themes';
import { useTheme } from '@/hooks/use-settings';

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { theme: settingsTheme } = useTheme();
  const { setTheme: setNextTheme } = useNextTheme();

  // Sync settings theme with next-themes
  useEffect(() => {
    setNextTheme(settingsTheme);
  }, [settingsTheme, setNextTheme]);

  return <>{children}</>;
}

/**
 * Usage in app/layout.tsx:
 *
 * import { SettingsProvider } from '@/components/settings/settings-provider';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <ThemeProvider>
 *           <SettingsProvider>
 *             {children}
 *           </SettingsProvider>
 *         </ThemeProvider>
 *       </body>
 *     </html>
 *   );
 * }
 */
