import { describe, expect, it } from "vitest";
import { buildContactAction, buildContactRows, buildHeroActions, linkTargetProps } from "@/lib/contact";

const LINKEDIN = "https://www.linkedin.com/in/example/";

describe("buildContactAction", () => {
  it("uses email when an address is set", () => {
    expect(buildContactAction("anesh@example.org", LINKEDIN)).toEqual({
      label: "Email Anesh",
      href: "mailto:anesh@example.org",
      external: false,
    });
  });

  it("falls back to LinkedIn when there is no email", () => {
    expect(buildContactAction(null, LINKEDIN)).toEqual({
      label: "Message on LinkedIn",
      href: LINKEDIN,
      external: true,
    });
  });

  it("treats a blank email as missing", () => {
    expect(buildContactAction("   ", LINKEDIN).label).toBe("Message on LinkedIn");
  });
});

describe("buildHeroActions", () => {
  const contact = buildContactAction(null, LINKEDIN);

  it("leads with the resume when there is one, contact second", () => {
    expect(buildHeroActions("/resume.pdf", contact)).toEqual({
      primary: { label: "Download resume", href: "/resume.pdf", external: true },
      secondary: contact,
    });
  });

  it("leads with contact and shows nothing second when there is no resume", () => {
    expect(buildHeroActions(null, contact)).toEqual({ primary: contact, secondary: null });
    expect(buildHeroActions("  ", contact)).toEqual({ primary: contact, secondary: null });
  });
});

describe("linkTargetProps", () => {
  it("opens external links in a new tab safely", () => {
    expect(linkTargetProps(true)).toEqual({ target: "_blank", rel: "noopener noreferrer" });
    expect(linkTargetProps(false)).toEqual({});
  });
});

describe("buildContactRows", () => {
  const rest = [
    { label: "LinkedIn", value: "linkedin.com/in/example", href: LINKEDIN },
    { label: "Based", value: "Nepal and Australia" },
  ];

  it("leads with a trimmed email row when an address is set", () => {
    expect(buildContactRows(" anesh@example.org ", rest)).toEqual([
      { label: "Email", value: "anesh@example.org", href: "mailto:anesh@example.org" },
      ...rest,
    ]);
  });

  it("leaves the email row out when there is no address or only whitespace", () => {
    expect(buildContactRows(null, rest)).toEqual(rest);
    expect(buildContactRows("   ", rest)).toEqual(rest);
  });
});
