
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Force the theme provider to update the DOM with the correct class on initial mount
  React.useEffect(() => {
    // This ensures the theme class is applied to the document element
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(
      localStorage.getItem('theme') === 'dark' ? 'dark' : 'light'
    );
  }, []);

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
