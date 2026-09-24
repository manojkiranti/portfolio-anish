import { Section } from "@/components/sections/section";
import { education } from "@/lib/content";

export function Education() {
  return (
    <Section id="education" heading="Education">
      <ul className="max-w-[40rem] divide-y divide-border">
        {education.map((entry) => (
          <li
            key={entry.qualification}
            className="grid gap-0.5 py-3 first:pt-0 last:pb-0 sm:grid-cols-[8rem_1fr] sm:gap-5"
          >
            <span className="text-[0.9375rem] text-muted-foreground tabular-nums">{entry.period}</span>
            <span>
              {entry.qualification}, {entry.institution}
            </span>
          </li>
        ))}
      </ul>
    </Section>
  );
}
