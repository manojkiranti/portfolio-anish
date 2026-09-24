import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { containerClass } from "@/components/sections/section";
import { resumeHref, siteConfig } from "@/lib/content";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "#about", label: "Profile" },
  { href: "#experience", label: "Experience" },
  { href: "#toolkit", label: "Toolkit" },
  { href: "#contact", label: "Contact" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className={cn(containerClass, "flex h-14 items-center justify-between gap-4")}>
        <Link href="/" className="rounded-sm text-[0.9375rem] font-bold tracking-[-0.01em]">
          {siteConfig.name}
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          <nav aria-label="Sections" className="hidden items-center gap-6 pr-4 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-sm text-[0.9375rem] text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>
          {resumeHref && (
            <Button asChild variant="link" size="inline" className="mr-2">
              <a href={resumeHref} target="_blank" rel="noopener noreferrer">
                Resume
              </a>
            </Button>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
