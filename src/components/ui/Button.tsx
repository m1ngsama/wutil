import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "link" | "secondary" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", type = "button", ...props }, ref) => {
    return (
      <button
        type={type}
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--w-ring)] focus-visible:ring-offset-1",
          "disabled:pointer-events-none disabled:opacity-40",
          variant === "default" &&
            "bg-accent text-accent-fg hover:bg-accent-hover",
          variant === "destructive" &&
            "bg-red-600 text-white hover:bg-red-700",
          variant === "outline" &&
            "border border-edge bg-surface text-ink hover:bg-muted",
          variant === "secondary" &&
            "bg-muted text-ink hover:bg-[var(--w-edge)]",
          variant === "ghost" &&
            "text-ink hover:bg-muted",
          variant === "link" &&
            "text-accent underline-offset-4 hover:underline",
          size === "default" && "h-10 px-4 py-2 text-sm",
          size === "sm" && "h-8 px-3 text-xs rounded",
          size === "lg" && "h-11 px-8 text-base rounded-lg",
          size === "icon" && "h-9 w-9",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
