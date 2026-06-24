import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "glass" | "ghost";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-semibold transition-all duration-300 active:scale-[0.98]",
          variant === "primary" &&
            "bg-primary-500 text-white hover:bg-primary-600 hover:shadow-lg hover:shadow-primary-500/25",
          variant === "glass" &&
            "border border-white/30 bg-white/70 text-gray-900 backdrop-blur-glass hover:bg-white/90 hover:shadow-glass",
          variant === "ghost" &&
            "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
          size === "sm" && "rounded-xl px-4 py-2 text-xs",
          size === "md" && "rounded-2xl px-6 py-3 text-sm",
          size === "lg" && "rounded-2xl px-8 py-4 text-base",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
