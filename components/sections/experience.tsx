import { Badge } from "@/components/ui/badge";
import { experience } from "@/lib/content";
import { SectionHeading } from "@/components/sections/about";

export function Experience() {
  return (
    <section id="experience" className="py-20 sm:py-28 bg-secondary/40">
      <div className="mx-auto max-w-3xl px-4">
        <SectionHeading eyebrow="Career" heading="Experience" />

        <ol className="relative border-l border-border pl-8 space-y-10">
          {experience.map((job) => (
            <li key={`${job.company}-${job.period}`} className="relative">
              <span className="absolute -left-[calc(2rem+5px)] top-1.5 size-3 rounded-full bg-accent ring-4 ring-background" />
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="text-lg font-bold">{job.role}</h3>
                {job.current && <Badge variant="gold">Current</Badge>}
              </div>
              <p className="text-sm font-medium text-foreground/80">
                {job.company} &middot; {job.location}
              </p>
              <p className="text-sm text-muted-foreground mb-3">{job.period}</p>
              <ul className="space-y-1.5">
                {job.bullets.map((bullet, i) => (
                  <li
                    key={i}
                    className="text-sm sm:text-base text-muted-foreground leading-relaxed pl-4 relative before:content-['—'] before:absolute before:left-0 before:text-accent-strong dark:before:text-accent"
                  >
                    {bullet}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
