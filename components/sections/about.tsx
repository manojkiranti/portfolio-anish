import { Section } from "@/components/sections/section";
import { about } from "@/lib/content";

export function About() {
  return (
    <Section id="about" heading={about.heading}>
      <div className="max-w-[62ch] space-y-4">
        {about.paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 40)}>{paragraph}</p>
        ))}
      </div>
    </Section>
  );
}

export function SectionHeading({
  eyebrow,
  heading,
}: {
  eyebrow: string;
  heading: string;
}) {
  return (
    <div className="mb-8 space-y-2">
      <p className="text-sm font-semibold uppercase tracking-widest text-accent-strong dark:text-accent">
        {eyebrow}
      </p>
      <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{heading}</h2>
    </div>
  );
}
