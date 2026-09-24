import { siteConfig } from "@/lib/content";

export function JsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.name,
    url: siteConfig.baseUrl,
    image: new URL(siteConfig.avatarImage, siteConfig.baseUrl).toString(),
    jobTitle: siteConfig.title,
    worksFor: {
      "@type": "Organization",
      name: "ODIN Mortgage",
    },
    description: siteConfig.tagline,
    sameAs: [siteConfig.linkedin],
    knowsAbout: [
      "Credit Analysis",
      "Mortgage Broking",
      "Serviceability Assessment",
      "Risk Assessment",
      "Responsible Lending",
      "Financial Analysis",
    ],
    mainEntityOfPage: {
      "@type": "WebSite",
      "@id": siteConfig.baseUrl,
      name: `${siteConfig.name} Portfolio`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
