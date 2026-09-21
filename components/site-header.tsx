import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mail, FileText } from "lucide-react";
import { FaLinkedin } from "react-icons/fa";
import { ThemeToggle } from "@/components/theme-toggle";
import { siteConfig } from "@/lib/content";

const NAV_LINKS = [
  { href: "#about", label: "About" },
  { href: "#experience", label: "Experience" },
  { href: "#skills", label: "Skills" },
  { href: "#contact", label: "Contact" },
];

export function SiteHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-border bg-background/80 backdrop-blur-md px-5 py-3 shadow-lg shadow-black/5">
          <Link
            href="/"
            className="text-xl font-black tracking-tighter text-foreground hover:text-accent-strong dark:hover:text-accent transition"
          >
            {siteConfig.initials}<span className="text-accent">.</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <Link href={siteConfig.linkedin} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon" aria-label="LinkedIn">
                <FaLinkedin className="h-4.5 w-4.5" />
              </Button>
            </Link>
            <Link href={`mailto:${siteConfig.email}`}>
              <Button variant="ghost" size="icon" aria-label="Email">
                <Mail className="h-5 w-5" />
              </Button>
            </Link>
            <Link href={siteConfig.resumeUrl} target="_blank" rel="noopener noreferrer" className="hidden sm:block">
              <Button variant="outline" size="sm" className="gap-2">
                <FileText className="h-4 w-4" />
                Resume
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
