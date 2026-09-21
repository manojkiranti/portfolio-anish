import { about } from "@/lib/content";

export function About() {
  return (
    <section id="about" className="py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4">
        <SectionHeading eyebrow="Who I Am" heading={about.heading} />
        <div className="space-y-5">
          {about.paragraphs.map((p, i) => (
            <p key={i} className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              {p}
            </p>
          ))}
        </div>
      </div>
    </section>
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
