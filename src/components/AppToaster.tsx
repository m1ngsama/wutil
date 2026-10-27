"use client";

import type { CSSProperties } from "react";
import { useTheme } from "next-themes";
import { Toaster } from "sonner";
import { AlertCircle, CheckmarkCircle, CloseOutline, InformationCircle, Warning } from "@/components/ui/icons";

export function AppToaster() {
  const { resolvedTheme } = useTheme();

  return (
    <Toaster
      closeButton
      position="top-center"
      richColors
      icons={{
        success: <CheckmarkCircle />,
        error: <AlertCircle />,
        info: <InformationCircle />,
        warning: <Warning />,
        close: <CloseOutline size={12} />,
      }}
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      style={resolvedTheme === "dark" ? undefined : { "--success-text": "#166534" } as CSSProperties}
      toastOptions={{
        classNames: {
          toast: "font-sans",
        },
      }}
    />
  );
}
