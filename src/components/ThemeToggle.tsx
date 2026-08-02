"use client";

import { SunMoon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;
const THEME_COLORS = { light: "#fafaf9", dark: "#11100f" } as const;

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  const selectedTheme = mounted ? theme ?? "system" : "system";
  const selectedLabel = selectedTheme[0].toUpperCase() + selectedTheme.slice(1);

  useEffect(() => {
    if (resolvedTheme !== "light" && resolvedTheme !== "dark") return;
    const color = THEME_COLORS[resolvedTheme];
    document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((meta) => {
      meta.content = color;
    });
  }, [resolvedTheme]);

  return (
    <label
      className="relative flex h-11 w-11 items-center justify-center rounded-md text-ink-3 transition-colors hover:bg-muted hover:text-ink focus-within:outline-none focus-within:ring-2 focus-within:ring-[var(--w-ring)] focus-within:ring-offset-2 focus-within:ring-offset-canvas fine-pointer:h-9 fine-pointer:w-9"
      title={`Appearance: ${selectedLabel}`}
    >
      <span className="sr-only">Appearance</span>
      <SunMoon aria-hidden="true" className="h-4 w-4" strokeWidth={1.75} />
      <select
        aria-label="Appearance"
        value={selectedTheme}
        disabled={!mounted}
        onChange={(event) => setTheme(event.target.value)}
        className="absolute inset-0 h-full w-full cursor-pointer appearance-none opacity-0 disabled:cursor-wait"
      >
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
  );
}
