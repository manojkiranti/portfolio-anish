import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(join(process.cwd(), "app/globals.css"), "utf8");

function tokens(selector: ":root" | ".dark"): Record<string, string> {
  const escaped = selector.replace(".", "\\.");
  const block = css.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`))?.[1];
  if (!block) throw new Error(`No ${selector} block in app/globals.css`);
  return Object.fromEntries(
    [...block.matchAll(/--([a-z-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)].map((m) => [m[1], m[2]]),
  );
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const TEXT = ["foreground", "muted-foreground", "success", "warning", "destructive"];
const SURFACES = ["background", "card", "secondary"];
const NON_TEXT = ["input", "ring"];

describe.each([":root", ".dark"] as const)("%s colour tokens", (selector) => {
  const t = tokens(selector);

  it.each(TEXT.flatMap((fg) => SURFACES.map((bg) => [fg, bg])))(
    "%s text on %s meets 4.5:1",
    (fg, bg) => {
      expect(contrast(t[fg], t[bg])).toBeGreaterThanOrEqual(4.5);
    },
  );

  it("button text on ink meets 4.5:1", () => {
    expect(contrast(t["primary-foreground"], t.primary)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(NON_TEXT.flatMap((fg) => ["background", "card"].map((bg) => [fg, bg])))(
    "%s on %s meets 3:1",
    (fg, bg) => {
      expect(contrast(t[fg], t[bg])).toBeGreaterThanOrEqual(3);
    },
  );

  it("defines margin red and drops the old gold accent", () => {
    expect(t.margin).toBeDefined();
    expect(t.accent).toBeUndefined();
    expect(t["accent-strong"]).toBeUndefined();
  });
});
