import { containerClass } from "@/components/sections/section";
import { siteConfig } from "@/lib/content";
import { cn } from "@/lib/utils";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className={cn(containerClass, "flex items-center justify-between gap-4 py-5 text-sm text-muted-foreground")}>
        <p>
          © {new Date().getFullYear()} {siteConfig.name}
        </p>
        <a href="#" className="rounded-sm underline underline-offset-4 hover:text-foreground">
          Back to top
        </a>
      </div>
    </footer>
  );
}
