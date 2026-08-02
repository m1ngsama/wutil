"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import * as React from "react";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  React.useEffect(() => {
    document.documentElement.dataset.wutilHydrated = "true";
    return () => {
      delete document.documentElement.dataset.wutilHydrated;
    };
  }, []);

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
