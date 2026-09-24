import Image from "next/image";
import { HeroWorksheet } from "@/components/calculators/hero-worksheet";
import { Button } from "@/components/ui/button";
import { containerClass } from "@/components/sections/section";
import { linkTargetProps } from "@/lib/contact";
import { heroActions, heroFacts, siteConfig } from "@/lib/content";
import { cn } from "@/lib/utils";

export function Hero() {
  const { primary, secondary } = heroActions;
  return (
    <section id="content" aria-label="Introduction">
      <div
        className={cn(
          containerClass,
          "grid gap-8 pt-8 pb-12 md:grid-cols-12 md:gap-x-14 md:gap-y-10 md:pt-14 md:pb-16"
        )}
      >
        <div className="md:col-span-7">
          <Image
            src={siteConfig.avatarImage}
            alt={siteConfig.name}
            width={88}
            height={88}
            loading="eager"
            fetchPriority="high"
            className="mb-4 size-[4.5rem] rounded-md object-cover md:mb-5.5 md:size-22"
          />
          <h1 className="mb-5 max-w-[9ch] text-[2.75rem] leading-[0.95] font-extrabold tracking-[-0.025em] md:text-7xl">
            {siteConfig.name}
          </h1>
          <p className="mb-6 max-w-[30ch] text-lg leading-[1.45] text-muted-foreground md:mb-7 md:text-[1.3125rem]">
            {siteConfig.tagline}
          </p>
          <div className="flex flex-wrap items-center gap-5">
            <Button asChild>
              <a href={primary.href} {...linkTargetProps(primary.external)}>
                {primary.label}
              </a>
            </Button>
            {secondary && (
              <Button asChild variant="link" size="inline">
                <a href={secondary.href} {...linkTargetProps(secondary.external)}>
                  {secondary.label}
                </a>
              </Button>
            )}
          </div>
        </div>

        <div className="md:col-span-5 md:col-start-8 md:row-span-2 md:row-start-1">
          <HeroWorksheet />
        </div>

        <dl className="max-w-[27.5rem] self-start text-[0.9375rem] md:col-span-7 md:row-start-2">
          {heroFacts.map((fact) => (
            <div
              key={fact.label}
              className="grid grid-cols-[6.25rem_1fr] border-t border-border py-2.5 md:grid-cols-[7.5rem_1fr]"
            >
              <dt className="text-muted-foreground">{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
