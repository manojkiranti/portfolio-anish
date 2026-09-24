export type ContactAction = { label: string; href: string; external: boolean };

export type HeroActions = { primary: ContactAction; secondary: ContactAction | null };

export type ContactRow = { label: string; value: string; href?: string };

export function buildContactAction(email: string | null, linkedin: string): ContactAction {
  const address = email?.trim();
  return address
    ? { label: "Email Anesh", href: `mailto:${address}`, external: false }
    : { label: "Message on LinkedIn", href: linkedin, external: true };
}

export function buildHeroActions(resumeHref: string | null, contact: ContactAction): HeroActions {
  const resume = resumeHref?.trim();
  return resume
    ? { primary: { label: "Download resume", href: resume, external: true }, secondary: contact }
    : { primary: contact, secondary: null };
}

export function linkTargetProps(external: boolean): { target?: "_blank"; rel?: string } {
  return external ? { target: "_blank", rel: "noopener noreferrer" } : {};
}

export function buildContactRows(email: string | null, rest: ContactRow[]): ContactRow[] {
  const address = email?.trim();
  return address ? [{ label: "Email", value: address, href: `mailto:${address}` }, ...rest] : rest;
}
