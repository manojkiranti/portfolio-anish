import Link from "next/link";
import { Mail, MapPin, ArrowUpRight, type LucideIcon } from "lucide-react";
import { FaLinkedin } from "react-icons/fa";
import { contactCards, siteConfig } from "@/lib/content";
import { SectionHeading } from "@/components/sections/about";

const ICONS: Record<string, LucideIcon | typeof FaLinkedin> = {
  Email: Mail,
  LinkedIn: FaLinkedin,
  Location: MapPin,
};

export function Contact() {
  return (
    <section id="contact" className="py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <SectionHeading eyebrow="Let's Connect" heading="Get in Touch" />
        <p className="text-muted-foreground max-w-xl mx-auto mb-10 -mt-2">
          Open to conversations about credit analysis, mortgage broking
          operations, or opportunities across {siteConfig.locationShort}.
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          {contactCards.map((card) => {
            const Icon = ICONS[card.label] ?? Mail;
            const content = (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 h-full transition-colors hover:border-accent/40">
                <div className="flex size-10 items-center justify-center rounded-full bg-accent/10 text-accent-strong dark:text-accent">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{card.label}</p>
                  <p className="text-sm text-muted-foreground break-all">
                    {card.value}
                  </p>
                </div>
                {card.href && (
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            );

            return card.href ? (
              <Link
                key={card.label}
                href={card.href}
                target={card.href.startsWith("http") ? "_blank" : undefined}
                rel={card.href.startsWith("http") ? "noopener noreferrer" : undefined}
              >
                {content}
              </Link>
            ) : (
              <div key={card.label}>{content}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
