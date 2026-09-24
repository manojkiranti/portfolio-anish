import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const containerClass = "mx-auto w-full max-w-[70rem] px-4 sm:px-10";

export function Section({
  id,
  heading,
  note,
  className,
  children,
}: {
  id: string;
  heading: string;
  note?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="border-t border-border">
      <div className={cn(containerClass, "grid gap-5 py-14 md:grid-cols-12 md:gap-8 md:py-20")}>
        <div className="md:col-span-3">
          <h2
            id={`${id}-heading`}
            className="text-[1.75rem] leading-[1.1] font-bold tracking-[-0.015em] md:text-4xl"
          >
            {heading}
          </h2>
          {note && (
            <p className="mt-2.5 max-w-[24ch] text-sm leading-normal text-muted-foreground">{note}</p>
          )}
        </div>
        <div className={cn("min-w-0 md:col-span-9", className)}>{children}</div>
      </div>
    </section>
  );
}
