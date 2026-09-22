import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ComponentProps<"button"> {
  variant?: "default" | "outline";
  size: "sm" | "lg";
}

export function Button({ className, variant = "default", size, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex touch-manipulation select-none items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors disabled:pointer-events-none",
        variant === "default" ? "bg-accent text-accent-fg hover:bg-accent-hover" : "border border-edge bg-surface text-ink hover:bg-muted",
        size === "sm" ? "h-11 px-3 text-xs fine-pointer:h-9" : "h-11 rounded-lg px-8 text-base",
        className,
      )}
      {...props}
    />
  );
}
