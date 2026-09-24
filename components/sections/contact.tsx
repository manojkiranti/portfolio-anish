import { Button } from "@/components/ui/button";
import { Section } from "@/components/sections/section";
import { linkTargetProps } from "@/lib/contact";
import { contact, contactAction } from "@/lib/content";

export function Contact() {
  return (
    <Section id="contact" heading={contact.heading}>
      <p className="mb-5 max-w-[32ch] text-2xl leading-[1.35] font-semibold tracking-[-0.01em]">
        {contact.sentence}
      </p>
      <dl className="max-w-[40rem]">
        {contact.rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-[6.25rem_1fr] gap-x-4 border-t border-border py-3 first:border-t-0 first:pt-0.5 sm:grid-cols-[8rem_1fr]"
          >
            <dt className="text-[0.9375rem] text-muted-foreground">{row.label}</dt>
            <dd className="min-w-0 [overflow-wrap:anywhere]">
              {row.href ? (
                <a
                  href={row.href}
                  {...linkTargetProps(row.href.startsWith("http"))}
                  className="rounded-sm underline decoration-1 underline-offset-4 hover:decoration-2"
                >
                  {row.value}
                </a>
              ) : (
                row.value
              )}
            </dd>
          </div>
        ))}
      </dl>
      <Button asChild className="mt-6">
        <a href={contactAction.href} {...linkTargetProps(contactAction.external)}>
          {contactAction.label}
        </a>
      </Button>
    </Section>
  );
}
