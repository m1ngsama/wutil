import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ComponentProps<"button"> {
  variant?: "default" | "outline" | "ghost";
  size: "sm" | "lg" | "icon";
}

export function Button({ className, variant = "default", size, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex touch-manipulation select-none items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors disabled:pointer-events-none",
        variant === "default" ? "bg-accent text-accent-fg hover:bg-accent-hover" : variant === "outline" ? "border border-edge bg-surface text-ink hover:bg-muted" : "text-ink-3 hover:bg-muted hover:text-ink",
        size === "icon" ? "h-11 w-11 shrink-0 rounded-md" : size === "sm" ? "h-11 rounded-md px-3 text-sm fine-pointer:h-9" : "h-11 rounded-lg px-8 text-base",
        className,
      )}
      {...props}
    />
  );
}
