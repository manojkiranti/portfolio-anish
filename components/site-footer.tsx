import { siteConfig } from "@/lib/content";

export function SiteFooter() {
  return (
    <footer className="border-t border-border py-8">
      <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
        <p>
          &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </p>
        <p>{siteConfig.title} &middot; {siteConfig.locationShort}</p>
      </div>
    </footer>
  );
}
