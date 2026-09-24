import { Section } from "@/components/sections/section";
import { experience } from "@/lib/content";

export function Experience() {
  return (
    <Section id="experience" heading="Experience">
      <ol className="divide-y divide-border">
        {experience.map((job) => (
          <li
            key={`${job.company}-${job.period}`}
            className="grid gap-1 py-5 first:pt-0 last:pb-0 sm:grid-cols-[8rem_1fr] sm:gap-5"
          >
            <p className="pt-0.5 text-[0.9375rem] text-muted-foreground tabular-nums">{job.period}</p>
            <div>
              <h3 className="text-[1.1875rem] font-bold">{job.role}</h3>
              <p className="mb-2 text-[0.9375rem] text-muted-foreground">
                {job.company}, {job.location}
              </p>
              <ul className="list-disc space-y-1 pl-[1.125rem] text-[0.96875rem] leading-[1.55] marker:text-muted-foreground">
                {job.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
