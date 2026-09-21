import { GraduationCap } from "lucide-react";
import { education } from "@/lib/content";
import { SectionHeading } from "@/components/sections/about";

export function Education() {
  return (
    <section id="education" className="py-20 sm:py-28 bg-secondary/40">
      <div className="mx-auto max-w-3xl px-4">
        <SectionHeading eyebrow="Background" heading="Education & Certifications" />

        <div className="space-y-4">
          {education.map((entry) => (
            <div
              key={entry.qualification}
              className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent-strong dark:text-accent">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">{entry.qualification}</h3>
                <p className="text-sm text-muted-foreground">
                  {entry.institution} &middot; {entry.period}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
