import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, MapPin } from "lucide-react";
import { siteConfig, heroStats } from "@/lib/content";

export function Hero() {
  return (
    <section
      id="content"
      className="relative overflow-hidden pt-40 pb-20 sm:pt-48 sm:pb-28"
    >
      {/* grid glow backdrop */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8892b020_1px,transparent_1px),linear-gradient(to_bottom,#8892b020_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_60%,transparent_100%)]" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-96 w-[42rem] rounded-full bg-accent/10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-4xl px-4 flex flex-col items-center text-center gap-7 animate-fade-in-up">
        <Avatar className="size-28 sm:size-32 border-4 border-card shadow-xl animate-float">
          <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
            {siteConfig.initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex items-center gap-2">
          <Badge variant="gold">{siteConfig.title}</Badge>
          <Badge variant="outline" className="gap-1.5">
            <MapPin className="h-3 w-3" />
            {siteConfig.locationShort}
          </Badge>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
          {siteConfig.name}
        </h1>

        <p className="max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed">
          {siteConfig.tagline}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link href="#contact">
            <Button variant="gold" size="default" className="gap-2">
              Get in Touch
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href={siteConfig.resumeUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="default" className="gap-2">
              <FileText className="h-4 w-4" />
              Download Resume
            </Button>
          </Link>
        </div>

        <div className="mt-6 grid w-full grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {heroStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-border bg-card px-4 py-5 flex flex-col items-center gap-1"
            >
              <span className="text-lg sm:text-xl font-bold text-accent-strong dark:text-accent leading-tight">
                {stat.value}
              </span>
              <span className="text-xs text-muted-foreground text-center leading-tight">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
