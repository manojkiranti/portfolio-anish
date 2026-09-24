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
