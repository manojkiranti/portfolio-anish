import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { skillGroups } from "@/lib/content";
import { SectionHeading } from "@/components/sections/about";

export function Skills() {
  return (
    <section id="skills" className="py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-4">
        <SectionHeading eyebrow="Expertise" heading="Skills & Focus Areas" />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {skillGroups.map((group) => (
            <Card key={group.heading} className="hover:border-accent/40 transition-colors">
              <CardHeader>
                <CardTitle className="text-base">{group.heading}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2 pt-0">
                {group.skills.map((skill) => (
                  <Badge key={skill} variant="default">
                    {skill}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
