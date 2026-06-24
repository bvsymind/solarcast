import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  variant?: "default" | "secondary" | "glass";
}

const Section = forwardRef<HTMLElement, SectionProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    return (
      <section
        ref={ref}
        className={cn(
          "section-padding",
          variant === "secondary" && "bg-surface-secondary",
          variant === "glass" && "bg-glass/50 backdrop-blur-glass",
          className
        )}
        {...props}
      >
        {children}
      </section>
    );
  }
);

Section.displayName = "Section";

export { Section };
