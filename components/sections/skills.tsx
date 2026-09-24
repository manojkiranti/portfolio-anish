import { Section } from "@/components/sections/section";
import { skillGroups } from "@/lib/content";

export function Skills() {
  return (
    <Section id="skills" heading="Skills">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
        {skillGroups.map((group) => (
          <div key={group.heading}>
            <h3 className="mb-1.5 text-base font-bold">{group.heading}</h3>
            <ul className="text-[0.9375rem]">
              {group.skills.map((skill) => (
                <li key={skill} className="border-t border-border py-[0.4375rem]">
                  {skill}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}
