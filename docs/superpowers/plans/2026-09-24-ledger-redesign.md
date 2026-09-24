# Ledger Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the portfolio's generic look with the approved "ledger" identity. The first screen is a
live serviceability worksheet, the palette and rules come from accountant's ledger paper, Libre Franklin is
the only typeface, and every section uses a heading-column layout.

**Architecture:** Only design tokens change in `app/globals.css`; Tailwind class names stay the same, so
components pick up the new palette. A new `Section` component gives every section the same
heading-column grid. Calculator maths stays untouched in `lib/calculators.ts`. Two new pure helpers get
unit tests: accounting formatting (`lib/format.ts`) and the choice of actions when email or resume are
missing (`lib/contact.ts`). The hero worksheet is a small client component built on the existing
`Worksheet`. A Playwright script in the git-ignored `.superpowers/checks/` directory checks the built site
after each task.

**Tech Stack:** Next.js 16.3 (App Router, Turbopack), React 19, Tailwind CSS v4, Radix Tabs,
`next/font/google` (Libre Franklin), `next/image`, `next/og` `ImageResponse`, Vitest 5, and Playwright 1.63
from the npx cache (not a project dependency).

**Spec:** `docs/superpowers/specs/2026-09-24-ledger-redesign-design.md`

## Global Constraints

- Work on branch `redesign-ledger`. Never push, and never merge to `main`, without the user's explicit
  go-ahead. Pushing `main` is a production deploy.
- Read `AGENTS.md`: this is Next.js 16. `next/image` `priority` is deprecated; use `loading="eager"` plus
  `fetchPriority="high"`. `images.qualities` defaults to `[75]`, so never pass another `quality`.
- Light tokens: background `#F3F6F1`, card `#FFFFFF`, foreground/primary/ring `#14211A`,
  primary-foreground `#F3F6F1`, muted-foreground `#4A5A50`, border `#C9D8CB`, input `#7F9284`,
  secondary/muted `#E7EEE5`, margin `#D98F88`, success `#1F6B3A`, warning `#9A5B07`,
  destructive `#B3261E`.
- Dark tokens: background `#0E1511`, card `#151F19`, foreground/primary/ring `#E7EEE8`,
  primary-foreground `#0E1511`, muted-foreground `#9FB0A4`, border `#2B3B31`, input `#5E7265`,
  secondary/muted `#1B2820`, margin `#C4736C`, success `#6FCB8E`, warning `#E8A94B`,
  destructive `#F2837B`.
- `--accent` and `--accent-strong` (the old gold) are removed. Margin red is decorative only and never
  used for text.
- Type: Libre Franklin only.

  | Role | Size / line-height, weight | Details |
  |---|---|---|
  | Display (the name) | 72px / 0.95 (44px on phones), 800 | letter-spacing −0.025em, max-width 9ch |
  | Section headings | 36px / 1.1 (28px on phones), 700 | letter-spacing −0.015em |
  | Lead | 21px / 1.45 (18px on phones) | |
  | Body | 18px / 1.55 (16px on phones) | |
  | Small | 14px, 500 | |

  Figures use `tabular-nums lining-nums`.
- Layout: container max-width 1120px (`max-w-[70rem]`); gutters 40px desktop, 16px phones
  (`px-4 sm:px-10`); sections are a 12-column grid from `md`, heading in columns 1–3 and content in 4–12;
  every section has a 1px top rule; no alternating backgrounds.
- Radii: 4px (worksheets, inputs, photo) = `rounded-md`; 6px (buttons) = `rounded-lg`;
  3px (flags) = `rounded-sm`. These are redefined in Task 2. No shadows.
- Section order and anchor ids stay the same: hero `#content`, then `#about`, `#experience`, `#skills`,
  `#toolkit`, `#education`, `#contact`.
- Never: ALL-CAPS labels, eyebrow labels above headings, pill shapes, stat tiles, per-section fade-up or
  float animations, "A · B" dot-separated strings, arrows appended to button text, floating pill header.
- Copy: sentence case. Periods use an en dash with "now": "2023 – now", "2018 – 2024".
- Accounting conventions: subtracted amounts in brackets `(3,500)`. Plain row figures carry no `$`; only
  totals and headline figures do. The bottom line gets a double rule in margin red.
- One motion moment only: the hero worksheet figures fade in with a 60ms stagger, then the double rule
  draws. With `prefers-reduced-motion: reduce` nothing animates.
- Contrast: every text/background pair ≥ 4.5:1; `--input` and `--ring` ≥ 3:1 against background and card.
- Do not change `ASSUMPTIONS`, the calculator maths, or the copy of `toolkit.disclaimer`. No lead capture,
  no ODIN branding.
- Every commit message ends with the line
  `Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>`.

### Browser check procedure (used by Tasks 3–8)

1. `npm run build`
2. Start the server in the background: run `npx next start -p 3100` with the Bash tool's
   `run_in_background: true`. Then wait until
   `curl -s -o /dev/null -w "%{http_code}" http://localhost:3100` prints `200`.
3. `node .superpowers/checks/ui-check.cjs`. It prints one PASS/FAIL line per check and exits 1 if any
   fail.
4. Stop the server by port:
   `kill $(ss -ltnp | grep ':3100 ' | grep -o 'pid=[0-9]*' | head -1 | cut -d= -f2)`. Never use
   `pkill -f "next start"`: it matches your own shell and kills it. If step 2 fails with `EADDRINUSE`,
   run this step first.

The script loads Playwright from the npx cache at `/home/manoj/.npm/_npx/e41f203b7505f1fb/`. If that path
is gone, run `npx -y playwright@1.63.0 --version` once. Then find the new copy with
`find ~/.npm/_npx -maxdepth 3 -name playwright -type d` and update the `require(...)` line at the top of the
script. Its browsers are already in `~/.cache/ms-playwright`.

## Review Focus

1. **Surplus exactly zero or negative** (hero sliders at their extremes, toolkit inputs): the surplus shows
   bracketed or `0`, capacity shows "No capacity" with a plain explanation, and nothing ever shows `-$0`,
   `NaN` or `Infinity`. Pinned by Task 1 (`formatAccounting` zero cases, slider ranges reach no capacity),
   Task 4 (zero-surplus sentence) and Task 5 (Home/End on the sliders).
2. **A real email or resume added later** (config switched from `null` to a value, or a blank string): the
   header Resume link, the hero primary and secondary actions, and the contact action all switch correctly.
   Pinned by the Task 1 unit tests for `buildContactAction` and `buildHeroActions`.
3. **Very narrow phones (320px) and long unbroken strings** (the LinkedIn URL): no sideways scroll. Pinned by
   Task 8 (320px and 390px sweep on every tab); Task 6 wraps the URL with `[overflow-wrap:anywhere]`.
4. **Keyboard-only visitors:** every tab stop shows a visible focus indicator, including the visually hidden
   radios and checkboxes. Pinned by Task 8's focus walk.
5. **JavaScript disabled or slow to hydrate:** the first screen still shows the worksheet's starting figures
   at full opacity, because the animation is CSS-only. Pinned by Task 8's no-JavaScript check.

---

### Task 1: Accounting format, action fallbacks and hero worksheet config

**Files:**
- Modify: `lib/format.ts`
- Create: `lib/format.test.ts`
- Create: `lib/contact.ts`
- Create: `lib/contact.test.ts`
- Modify: `lib/content.ts` (append `heroWorksheet`)
- Modify: `lib/calculators.test.ts` (append hero-defaults tests)

**Interfaces:**
- Consumes: `calculateServiceability(input: ServiceabilityInput): ServiceabilityResult` and `ASSUMPTIONS`
  from `lib/calculators.ts`; `formatCurrency(value: number, cents?: boolean): string` from `lib/format.ts`.
- Produces:
  - `formatAccounting(value: number, options?: { deduct?: boolean; currency?: boolean }): string`
  - `type ContactAction = { label: string; href: string; external: boolean }`
  - `buildContactAction(email: string | null, linkedin: string): ContactAction`
  - `type HeroActions = { primary: ContactAction; secondary: ContactAction | null }`
  - `buildHeroActions(resumeHref: string | null, contact: ContactAction): HeroActions`
  - `linkTargetProps(external: boolean): { target?: "_blank"; rel?: string }`
  - `heroWorksheet: HeroWorksheetConfig`, where
    `type SliderRange = { min: number; max: number; step: number; initial: number }` and
    `type HeroWorksheetConfig = { income: SliderRange; expenses: SliderRange; otherMonthlyRepayments: number; creditCardLimits: number; annualRatePct: number; termYears: number }`

- [ ] **Step 1: Write the failing formatter tests**

Create `lib/format.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { formatAccounting } from "@/lib/format";

describe("formatAccounting", () => {
  it("prints a plain figure with thousands separators", () => {
    expect(formatAccounting(9000)).toBe("9,000");
  });

  it("brackets a deduction", () => {
    expect(formatAccounting(3500, { deduct: true })).toBe("(3,500)");
  });

  it("brackets a negative figure", () => {
    expect(formatAccounting(-4720)).toBe("(4,720)");
  });

  it("rounds to whole dollars before bracketing", () => {
    expect(formatAccounting(3499.6, { deduct: true })).toBe("(3,500)");
    expect(formatAccounting(-380.2)).toBe("(380)");
  });

  it("never brackets or signs zero", () => {
    expect(formatAccounting(0, { deduct: true })).toBe("0");
    expect(formatAccounting(-0.4)).toBe("0");
    expect(formatAccounting(0, { currency: true })).toBe("$0");
  });

  it("adds the dollar sign when asked", () => {
    expect(formatAccounting(586610.4, { currency: true })).toBe("$586,610");
    expect(formatAccounting(-1200, { currency: true })).toBe("($1,200)");
  });
});
```

- [ ] **Step 2: Write the failing action tests**

Create `lib/contact.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildContactAction, buildHeroActions, linkTargetProps } from "@/lib/contact";

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
```

- [ ] **Step 3: Write the failing hero-defaults tests**

Append to the end of `lib/calculators.test.ts`:

```ts
import { heroWorksheet } from "@/lib/content";
import { formatCurrency } from "@/lib/format";

describe("hero worksheet config", () => {
  const run = (netMonthlyIncome: number, monthlyExpenses: number) =>
    calculateServiceability({
      netMonthlyIncome,
      monthlyExpenses,
      otherMonthlyRepayments: heroWorksheet.otherMonthlyRepayments,
      creditCardLimits: heroWorksheet.creditCardLimits,
      annualRatePct: heroWorksheet.annualRatePct,
      termYears: heroWorksheet.termYears,
    });

  it("shows $586,610 on first load", () => {
    const r = run(heroWorksheet.income.initial, heroWorksheet.expenses.initial);
    expect(formatCurrency(r.maxLoan)).toBe("$586,610");
  });

  it("starts each slider inside its range, on a step", () => {
    for (const range of [heroWorksheet.income, heroWorksheet.expenses]) {
      expect(range.initial).toBeGreaterThanOrEqual(range.min);
      expect(range.initial).toBeLessThanOrEqual(range.max);
      expect((range.initial - range.min) % range.step).toBe(0);
      expect((range.max - range.min) % range.step).toBe(0);
    }
  });

  it("can reach no capacity within the slider ranges", () => {
    expect(run(heroWorksheet.income.min, heroWorksheet.expenses.max).maxLoan).toBe(0);
  });
});
```

(Vitest hoists `import` statements, so appending imports at the end of the file is fine.)

- [ ] **Step 4: Run the tests and confirm they fail**

Run: `npm test`
Expected: FAIL. `lib/format.test.ts` fails with "formatAccounting is not a function" (or an export error),
`lib/contact.test.ts` fails because it can't resolve `@/lib/contact`, and the hero tests fail because
`heroWorksheet` is undefined.

- [ ] **Step 5: Implement `formatAccounting`**

In `lib/format.ts`, add after the `audCents` constant:

```ts
const plain = new Intl.NumberFormat("en-AU", { maximumFractionDigits: 0 });

export function formatAccounting(
  value: number,
  { deduct = false, currency = false }: { deduct?: boolean; currency?: boolean } = {},
): string {
  const rounded = Math.round(value);
  if (rounded === 0) return currency ? "$0" : "0";
  const body = (currency ? aud : plain).format(Math.abs(rounded));
  return deduct || rounded < 0 ? `(${body})` : body;
}
```

- [ ] **Step 6: Implement the action helpers**

Create `lib/contact.ts`:

```ts
export type ContactAction = { label: string; href: string; external: boolean };

export type HeroActions = { primary: ContactAction; secondary: ContactAction | null };

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
```

- [ ] **Step 7: Add the hero worksheet config**

Append to the end of `lib/content.ts`:

```ts
export type SliderRange = { min: number; max: number; step: number; initial: number };

export type HeroWorksheetConfig = {
  income: SliderRange;
  expenses: SliderRange;
  otherMonthlyRepayments: number;
  creditCardLimits: number;
  annualRatePct: number;
  termYears: number;
};

// Fixed figures for the first-screen demo. The buffer and card factor come from ASSUMPTIONS.
export const heroWorksheet: HeroWorksheetConfig = {
  income: { min: 4_000, max: 20_000, step: 100, initial: 9_000 },
  expenses: { min: 1_500, max: 10_000, step: 100, initial: 3_500 },
  otherMonthlyRepayments: 400,
  creditCardLimits: 10_000,
  annualRatePct: 6,
  termYears: 30,
};
```

- [ ] **Step 8: Run the tests and confirm they pass**

Run: `npm test`
Expected: PASS. All files pass: the 35 existing tests plus 6 formatter, 6 action and 3 hero tests, 50 in
total.

- [ ] **Step 9: Type-check and commit**

```bash
npx tsc --noEmit
git add lib/format.ts lib/format.test.ts lib/contact.ts lib/contact.test.ts lib/content.ts lib/calculators.test.ts
git commit -m "$(cat <<'EOF'
Add accounting formatter, action fallbacks and hero worksheet config

Pure helpers the redesign builds on: bracketed deductions, the
LinkedIn/resume fallbacks while email and resume are missing, and the
fixed figures behind the first-screen worksheet, all under test.

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Ledger tokens, Libre Franklin and system theme

**Files:**
- Modify: `app/globals.css` (full replacement)
- Modify: `app/layout.tsx` (fonts, viewport colours, body class)
- Modify: `components/theme-provider.tsx`
- Create: `lib/theme-contrast.test.ts`

**Interfaces:**
- Consumes: nothing from Task 1.
- Produces:
  - **Colour utilities:** `bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`,
    `border-border`, `border-input`, `bg-secondary`, `bg-margin`/`border-margin`, `text-success`,
    `text-warning`, `text-destructive`, `outline-ring`.
  - **Radii:** `rounded-sm` = 3px, `rounded-md` = 4px, `rounded-lg` = 6px.
  - **Font:** `font-sans` = Libre Franklin.
  - **Animation hooks:** `[data-enter]` on a container animates descendants with class `.enter-figure`
    and `.draw-rule`, staggered by the inline custom property `--row` (an integer index).

Until Tasks 3–6 land, components still using `accent` classes lose that colour. That's expected on this
branch.

The spec described the contrast check as a scratch script. This task makes it a committed Vitest test
instead, so the palette stays guarded after the redesign.

- [ ] **Step 1: Write the failing contrast test**

Create `lib/theme-contrast.test.ts`:

```ts
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
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `npx vitest run lib/theme-contrast.test.ts`
Expected: FAIL. At least "defines margin red and drops the old gold accent" fails (today's `:root` has
`--accent` and no `--margin`), and several token lookups are `undefined`.

- [ ] **Step 3: Replace `app/globals.css`**

Replace the whole file with:

```css
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-margin: var(--margin);
  --color-success: var(--success);
  --color-warning: var(--warning);
  --color-destructive: var(--destructive);
  --font-sans: var(--font-franklin);
  --radius-sm: 3px;
  --radius-md: 4px;
  --radius-lg: 6px;
}

:root {
  --background: #F3F6F1;
  --foreground: #14211A;
  --card: #FFFFFF;
  --primary: #14211A;
  --primary-foreground: #F3F6F1;
  --secondary: #E7EEE5;
  --muted: #E7EEE5;
  --muted-foreground: #4A5A50;
  --border: #C9D8CB;
  --input: #7F9284;
  --ring: #14211A;
  --margin: #D98F88;
  --success: #1F6B3A;
  --warning: #9A5B07;
  --destructive: #B3261E;
}

.dark {
  --background: #0E1511;
  --foreground: #E7EEE8;
  --card: #151F19;
  --primary: #E7EEE8;
  --primary-foreground: #0E1511;
  --secondary: #1B2820;
  --muted: #1B2820;
  --muted-foreground: #9FB0A4;
  --border: #2B3B31;
  --input: #5E7265;
  --ring: #E7EEE8;
  --margin: #C4736C;
  --success: #6FCB8E;
  --warning: #E8A94B;
  --destructive: #F2837B;
}

@layer base {
  * {
    @apply border-border;
  }
  html {
    scroll-behavior: smooth;
  }
  @media (prefers-reduced-motion: reduce) {
    html {
      scroll-behavior: auto;
    }
  }
  body {
    @apply bg-background text-base leading-[1.55] text-foreground md:text-lg;
  }
  :focus-visible {
    outline: 2px solid var(--ring);
    outline-offset: 2px;
  }
  [id] {
    scroll-margin-top: 5rem;
  }
}

/* The one motion moment: hero worksheet figures fill in, then the total's double rule draws. */
@keyframes enter-figure {
  from {
    opacity: 0;
    transform: translateY(3px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes draw-rule {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

@media (prefers-reduced-motion: no-preference) {
  [data-enter] .enter-figure {
    animation: enter-figure 240ms ease-out calc(var(--row, 0) * 60ms) both;
  }
  [data-enter] .draw-rule {
    transform-origin: left;
    animation: draw-rule 300ms ease-out calc(var(--row, 0) * 60ms + 240ms) both;
  }
}
```

- [ ] **Step 4: Switch the font and theme colours in `app/layout.tsx`**

Replace:

```tsx
import { Geist, Geist_Mono } from "next/font/google";
```

with:

```tsx
import { Libre_Franklin } from "next/font/google";
```

Replace:

```tsx
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
```

with:

```tsx
const franklin = Libre_Franklin({
  variable: "--font-franklin",
  subsets: ["latin"],
  display: "swap",
});
```

Replace:

```tsx
    { media: "(prefers-color-scheme: light)", color: "#f7f8fb" },
    { media: "(prefers-color-scheme: dark)", color: "#070b16" },
```

with:

```tsx
    { media: "(prefers-color-scheme: light)", color: "#F3F6F1" },
    { media: "(prefers-color-scheme: dark)", color: "#0E1511" },
```

Replace:

```tsx
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
```

with:

```tsx
      <body className={`${franklin.variable} font-sans antialiased`}>
```

- [ ] **Step 5: Follow the system theme**

In `components/theme-provider.tsx`, replace:

```tsx
      defaultTheme="dark"
      enableSystem={false}
```

with:

```tsx
      defaultTheme="system"
      enableSystem
```

- [ ] **Step 6: Run the tests and build**

Run: `npm test && npx tsc --noEmit && npm run lint && npm run build`
Expected: every test passes (the contrast file adds 42 cases: 21 per theme), lint is clean, and the build
compiles.

- [ ] **Step 7: Commit**

```bash
git add app/globals.css app/layout.tsx components/theme-provider.tsx lib/theme-contrast.test.ts
git commit -m "$(cat <<'EOF'
Switch to the ledger palette, Libre Franklin and system theme

Tokens keep their names so components pick up the new colours; a
contrast test now guards every text/background pair in both themes.

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Section layout and the four content sections

**Files:**
- Create: `components/sections/section.tsx`
- Modify: `components/sections/about.tsx` (keep `SectionHeading` exported; it's deleted in Task 6)
- Modify: `components/sections/experience.tsx` (full replacement)
- Modify: `components/sections/skills.tsx` (full replacement)
- Modify: `components/sections/education.tsx` (full replacement)
- Modify: `lib/content.ts` (about heading, experience, skills, education)
- Delete: `components/ui/card.tsx`, `components/ui/separator.tsx`
- Modify: `package.json` / `package-lock.json` (uninstall `@radix-ui/react-separator`)
- Create: `.superpowers/checks/ui-check.cjs` (git-ignored browser check script)

**Interfaces:**
- Consumes: the Task 2 tokens.
- Produces:
  - `containerClass: string` (`"mx-auto w-full max-w-[70rem] px-4 sm:px-10"`)
  - `Section(props: { id: string; heading: string; note?: string; className?: string; children: ReactNode })`,
    rendering `<section id>` with a top rule, the heading column and the content column.
  - `.superpowers/checks/ui-check.cjs` with helpers `newPage(browser, { context?, theme? })`,
    `setField(scope, label, value)`, `styleAudit(page, selectorList)`, `within(locator, height)`, and
    `check(name, ok, detail)`. Later tasks append groups with `GROUPS.push(async function name(browser) {...})`.

- [ ] **Step 1: Create the browser check script with the sections group**

Create `.superpowers/checks/ui-check.cjs`:

```js
// Browser checks for the ledger redesign. Run against `next start -p 3100` (see the plan's procedure).
const fs = require("fs");
const path = require("path");
const { chromium } = require("/home/manoj/.npm/_npx/e41f203b7505f1fb/node_modules/playwright");

const BASE = process.env.BASE || "http://localhost:3100";
const SHOTS = path.join(__dirname, "shots");
fs.mkdirSync(SHOTS, { recursive: true });

const results = [];
const check = (name, ok, detail = "") =>
  results.push(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
const GROUPS = [];

async function newPage(browser, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...opts.context });
  if (opts.theme) await ctx.addInitScript((t) => localStorage.setItem("theme", t), opts.theme);
  const page = await ctx.newPage();
  page.failures = [];
  page.on("response", (r) => r.status() >= 400 && page.failures.push(`${r.status()} ${r.url()}`));
  page.on("pageerror", (e) => page.failures.push(`pageerror ${e.message}`));
  page.on("console", (m) => m.type() === "error" && page.failures.push(`console ${m.text()}`));
  await page.goto(BASE, { waitUntil: "load" });
  return page;
}

async function setField(scope, label, value) {
  const field = scope.getByLabel(label, { exact: true });
  await field.click();
  await field.fill(String(value));
  await field.blur();
}

async function styleAudit(page, selectorList) {
  const selector = selectorList.split(",").map((s) => `${s.trim()} *`).join(", ");
  return page.$$eval(selector, (els) => ({
    caps: els.filter((e) => getComputedStyle(e).textTransform === "uppercase").length,
    pills: els.filter((e) => parseFloat(getComputedStyle(e).borderTopLeftRadius) >= 999).length,
  }));
}

async function within(locator, height) {
  const box = await locator.boundingBox();
  return !!box && box.y >= 0 && box.y + box.height <= height;
}

GROUPS.push(async function sections(browser) {
  const page = await newPage(browser);
  const ids = await page.$$eval("main section[id]", (els) => els.map((e) => e.id));
  const order = ["about", "experience", "skills", "toolkit", "education", "contact"];
  const positions = order.map((id) => ids.indexOf(id));
  check("section order", positions.every((p, i) => p >= 0 && (i === 0 || p > positions[i - 1])), ids.join(","));

  for (const [id, text] of [["about", "Profile"], ["experience", "Experience"], ["skills", "Skills"], ["education", "Education"]]) {
    const heading = (await page.locator(`#${id} h2`).first().innerText()).trim();
    check(`#${id} heading is "${text}"`, heading === text, heading);
    const audit = await styleAudit(page, `#${id}`);
    check(`#${id} has no all-caps text`, audit.caps === 0, `${audit.caps} elements`);
    check(`#${id} has no pill shapes`, audit.pills === 0, `${audit.pills} elements`);
  }

  const edu = await page.locator("#education li").first().innerText();
  check("education row: period then qualification", /^2018 – 2024\s+Bachelor of Business Administration/.test(edu), edu.replace(/\n/g, " | "));
  const job = await page.locator("#experience li").first().innerText();
  check("experience entry starts with its period", job.startsWith("2023 – now"), job.split("\n")[0]);
  const skill = await page.locator("#skills li").first().innerText();
  check("skills are sentence case", skill === "Serviceability analysis", skill);
  const sectionRule = await page.locator("#experience").evaluate((el) => getComputedStyle(el).borderTopWidth);
  check("sections are separated by a rule", sectionRule === "1px", sectionRule);
  await page.context().close();
});

// ---- later tasks append groups above this line ----

(async () => {
  const browser = await chromium.launch();
  try {
    for (const group of GROUPS) {
      try {
        await group(browser);
      } catch (e) {
        check(`group ${group.name} crashed`, false, e.message.split("\n")[0]);
      }
    }
  } finally {
    await browser.close();
  }
  console.log(results.join("\n"));
  const failed = results.filter((r) => r.startsWith("FAIL")).length;
  console.log(`\n${results.length - failed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})();
```

- [ ] **Step 2: Run the checks and confirm they fail**

Run the browser check procedure (Global Constraints).
Expected: FAIL. The headings are "About" and "Education & Certifications", the eyebrow labels are
uppercase, the experience "Current" badge is a pill, the dates use an em dash, and there's no section rule.

- [ ] **Step 3: Create `components/sections/section.tsx`**

```tsx
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const containerClass = "mx-auto w-full max-w-[70rem] px-4 sm:px-10";

export function Section({
  id,
  heading,
  note,
  className,
  children,
}: {
  id: string;
  heading: string;
  note?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="border-t border-border">
      <div className={cn(containerClass, "grid gap-5 py-14 md:grid-cols-12 md:gap-8 md:py-20")}>
        <div className="md:col-span-3">
          <h2
            id={`${id}-heading`}
            className="text-[1.75rem] leading-[1.1] font-bold tracking-[-0.015em] md:text-4xl"
          >
            {heading}
          </h2>
          {note && (
            <p className="mt-2.5 max-w-[24ch] text-sm leading-normal text-muted-foreground">{note}</p>
          )}
        </div>
        <div className={cn("min-w-0 md:col-span-9", className)}>{children}</div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Rewrite the `About` component**

In `components/sections/about.tsx`, replace the `About` function (keep `SectionHeading` below it unchanged
for now) and its import line:

```tsx
import { Section } from "@/components/sections/section";
import { about } from "@/lib/content";

export function About() {
  return (
    <Section id="about" heading={about.heading}>
      <div className="max-w-[62ch] space-y-4">
        {about.paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 40)}>{paragraph}</p>
        ))}
      </div>
    </Section>
  );
}
```

- [ ] **Step 5: Replace `components/sections/experience.tsx`**

```tsx
import { Section } from "@/components/sections/section";
import { experience } from "@/lib/content";

export function Experience() {
  return (
    <Section id="experience" heading="Experience">
      <ol className="divide-y divide-border">
        {experience.map((job) => (
          <li
            key={`${job.company}-${job.period}`}
            className="grid gap-1 py-5 first:pt-0 last:pb-0 sm:grid-cols-[8rem_1fr] sm:gap-5"
          >
            <p className="pt-0.5 text-[0.9375rem] text-muted-foreground tabular-nums">{job.period}</p>
            <div>
              <h3 className="text-[1.1875rem] font-bold">{job.role}</h3>
              <p className="mb-2 text-[0.9375rem] text-muted-foreground">
                {job.company}, {job.location}
              </p>
              <ul className="list-disc space-y-1 pl-[1.125rem] text-[0.96875rem] leading-[1.55] marker:text-muted-foreground">
                {job.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
```

- [ ] **Step 6: Replace `components/sections/skills.tsx`**

```tsx
import { Section } from "@/components/sections/section";
import { skillGroups } from "@/lib/content";

export function Skills() {
  return (
    <Section id="skills" heading="Skills">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
        {skillGroups.map((group) => (
          <div key={group.heading}>
            <h3 className="mb-1.5 text-base font-bold">{group.heading}</h3>
            <ul className="text-[0.9375rem]">
              {group.skills.map((skill) => (
                <li key={skill} className="border-t border-border py-[0.4375rem]">
                  {skill}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}
```

- [ ] **Step 7: Replace `components/sections/education.tsx`**

```tsx
import { Section } from "@/components/sections/section";
import { education } from "@/lib/content";

export function Education() {
  return (
    <Section id="education" heading="Education">
      <ul className="max-w-[40rem] divide-y divide-border">
        {education.map((entry) => (
          <li
            key={entry.qualification}
            className="grid gap-0.5 py-3 first:pt-0 last:pb-0 sm:grid-cols-[8rem_1fr] sm:gap-5"
          >
            <span className="text-[0.9375rem] text-muted-foreground tabular-nums">{entry.period}</span>
            <span>
              {entry.qualification}, {entry.institution}
            </span>
          </li>
        ))}
      </ul>
    </Section>
  );
}
```

- [ ] **Step 8: Update the content in `lib/content.ts`**

Replace `heading: "About",` with `heading: "Profile",`.

Replace the whole `ExperienceEntry` type and `experience` array with:

```ts
export type ExperienceEntry = {
  role: string;
  company: string;
  location: string;
  period: string;
  bullets: string[];
};

export const experience: ExperienceEntry[] = [
  {
    role: "Credit Analyst",
    company: "ODIN Mortgage",
    location: "Australia (remote from Nepal and Australia)",
    period: "2023 – now", // PLACEHOLDER dates
    bullets: [
      "Assess serviceability and credit files for residential and investment loan applications against lender policy.",
      "Review income, employment, and asset documentation for accuracy and lender-readiness before submission.",
      "Liaise directly with brokers and lenders to resolve conditions and clear applications through to approval.",
      "Contribute to faster average turnaround times through consistent, thorough first-pass file preparation.",
    ],
  },
  {
    role: "Credit Analyst", // PLACEHOLDER role title
    company: "[Previous Company]", // PLACEHOLDER
    location: "Nepal",
    period: "2021 – 2023", // PLACEHOLDER dates
    bullets: [
      "Analysed financial statements and credit history to support lending recommendations.",
      "Prepared structured credit assessment reports for underwriting review.",
      "Built the foundation in serviceability analysis and risk assessment carried into mortgage broking work.",
    ],
  },
];
```

Replace the whole `skillGroups` array with:

```ts
export const skillGroups: SkillGroup[] = [
  {
    heading: "Credit & risk",
    skills: [
      "Serviceability analysis",
      "Credit risk assessment",
      "Financial statement analysis",
      "Loan structuring",
    ],
  },
  {
    heading: "Compliance & lending",
    skills: [
      "Responsible lending (NCCP)",
      "AML / KYC verification",
      "Lender policy interpretation",
      "Documentation review",
    ],
  },
  {
    heading: "Tools & communication",
    skills: [
      "Loan management CRMs",
      "Excel and financial modelling",
      "Broker and lender liaison",
      "Attention to detail",
    ],
  },
];
```

Replace the whole `education` array with:

```ts
export const education: EducationEntry[] = [
  {
    qualification: "Bachelor of Business Administration (BBA)",
    institution: "Tribhuvan University, Nepal",
    period: "2018 – 2024",
  },
  {
    qualification: "Master of Arts in Economics",
    institution: "Tribhuvan University, Nepal",
    period: "2024 – now", // PLACEHOLDER — confirm exact end year
  },
];
```

- [ ] **Step 9: Remove the card and separator components**

```bash
grep -rn "ui/card\|ui/separator" app components lib   # expect no output
git rm -q components/ui/card.tsx components/ui/separator.tsx
npm uninstall @radix-ui/react-separator
```

- [ ] **Step 10: Run the unit tests, type-check and browser checks**

Run: `npm test && npx tsc --noEmit && npm run lint`, then the browser check procedure.
Expected: everything passes; the sections group reports all PASS.

- [ ] **Step 11: Commit**

```bash
git add components/sections/section.tsx components/sections/about.tsx components/sections/experience.tsx components/sections/skills.tsx components/sections/education.tsx lib/content.ts package.json package-lock.json
git commit -m "$(cat <<'EOF'
Add heading-column section layout and restyle content sections

Profile, Experience, Skills and Education now share one grid with a
single rule between sections; dates get their own column and the pill
badges and eyebrow labels are gone.

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Credit toolkit restyle

**Files:**
- Modify: `components/calculators/parts.tsx` (full replacement)
- Modify: `components/ui/tabs.tsx` (full replacement)
- Modify: `components/calculators/serviceability.tsx` (full replacement)
- Modify: `components/calculators/repayments.tsx` (worksheet rows and interest-only paragraph)
- Modify: `components/calculators/lvr-dti.tsx` (flags and card styling)
- Modify: `components/calculators/file-readiness.tsx` (full replacement)
- Modify: `components/sections/toolkit.tsx` (full replacement)
- Modify: `lib/content.ts` (the `toolkit` object)
- Modify: `.superpowers/checks/ui-check.cjs` (append the toolkit group)

**Interfaces:**
- Consumes: `formatAccounting` (Task 1), `Section` (Task 3), the Task 2 tokens.
- Produces, from `parts.tsx`:
  - `parseAmount`, `NumberField` and `ChoiceField`: same signatures as today.
  - `Flag({ tone, children }: { tone: Tone; children: ReactNode })`, which replaces `ToneBadge`.
  - `Headline`: same signature, with the figure in ink.
  - `type WorksheetRow = { label: ReactNode; value: ReactNode; kind?: "line" | "subtotal" | "note" | "total" }`
  - `Worksheet({ rows, caption }: { rows: WorksheetRow[]; caption?: ReactNode })`
  - `Meter` and `Note`: same signatures.
  - The total row renders `<dd aria-live="polite">` with a double-rule `<span aria-hidden>` inside it.

- [ ] **Step 1: Append the toolkit group to the browser check script**

In `.superpowers/checks/ui-check.cjs`, insert above the line `// ---- later tasks append groups above this line ----`:

```js
GROUPS.push(async function toolkit(browser) {
  const page = await newPage(browser);
  check("toolkit heading", (await page.locator("#toolkit h2").innerText()).trim() === "Credit toolkit");

  let panel = page.getByRole("tabpanel", { name: "Serviceability" });
  const total = () => panel.locator("dd[aria-live=polite]").innerText();
  check("serviceability starts at $586,610", (await total()) === "$586,610", await total());
  check("deductions are bracketed", (await panel.getByText("(3,500)", { exact: true }).count()) === 1);
  await setField(panel, "Net monthly income (after tax)", 12000);
  check("capacity updates with income", (await total()) !== "$586,610", await total());
  await setField(panel, "Monthly living expenses", 20000);
  check("big expenses give No capacity", (await total()) === "No capacity", await total());
  check("negative surplus explained", await panel.getByText(/Commitments exceed income by \$[\d,]+ a month\./).isVisible());
  await setField(panel, "Net monthly income (after tax)", 4280);
  await setField(panel, "Monthly living expenses", 3500);
  const zeroText = await panel.innerText();
  check(
    "zero surplus explained, never -$0",
    zeroText.includes("Commitments use the whole income, leaving nothing for a new loan.") && !zeroText.includes("-$0"),
  );
  await setField(panel, "Net monthly income (after tax)", 12000);

  await page.getByRole("tab", { name: "Repayments" }).click();
  panel = page.getByRole("tabpanel", { name: "Repayments" });
  const headline = () => panel.locator("[aria-live=polite]").first().innerText();
  check("P&I $600k at 6% over 30 years = $3,597/month", (await headline()).includes("$3,597/month"), await headline());
  await panel.getByText("Interest-only", { exact: true }).click();
  check("IO repayment is $3,000/month", (await headline()).includes("$3,000/month"), await headline());
  check("IO jump paragraph shown", await panel.getByText("Repayment jump when interest-only ends.").isVisible());
  await panel.getByText("Weekly", { exact: true }).click();
  check("weekly relabels the repayment", (await headline()).includes("/week"), await headline());
  check("total repaid carries the double rule", (await panel.locator("dd[aria-live=polite] span[aria-hidden]").count()) === 1);

  await page.getByRole("tab", { name: "LVR & DTI" }).click();
  panel = page.getByRole("tabpanel", { name: "LVR & DTI" });
  let txt = await panel.innerText();
  check("LVR 80.0% is Standard", txt.includes("80.0%") && txt.includes("Standard"));
  check("DTI 4.3× is Moderate", txt.includes("4.3×") && txt.includes("Moderate"));
  await setField(panel, "Loan amount", 780000);
  txt = await panel.innerText();
  check("LVR 91.8% is High LVR with a $100,000 hint", txt.includes("91.8%") && txt.includes("High LVR") && txt.includes("$100,000"));
  await setField(panel, "Gross annual income", 0);
  txt = await panel.innerText();
  check("zero income shows — not NaN", !/NaN|Infinity/.test(txt) && txt.includes("—"));

  await page.getByRole("tab", { name: "File readiness" }).click();
  panel = page.getByRole("tabpanel", { name: "File readiness" });
  txt = await panel.innerText();
  check("readiness starts Not ready with a Blocking list", txt.includes("Not ready") && /^Blocking$/m.test(txt));
  for (const label of [
    "Three months of transaction account statements",
    "Savings statements showing the deposit",
    "Statements for every existing loan and credit card",
  ]) {
    await panel.locator("label", { hasText: label }).click();
  }
  txt = await panel.innerText();
  check("all critical done → Nearly there", txt.includes("Nearly there") && !/^Blocking$/m.test(txt));
  const boxes = panel.getByRole("checkbox");
  for (let i = 0; i < (await boxes.count()); i++) {
    if (!(await boxes.nth(i).isChecked())) await boxes.nth(i).check({ force: true });
  }
  txt = await panel.innerText();
  check("everything done → Ready to submit at 100%", txt.includes("Ready to submit") && txt.includes("100%"));
  await panel.getByText("Self-employed", { exact: true }).click();
  txt = await panel.innerText();
  check("self-employed reopens critical gaps", txt.includes("Not ready") && txt.includes("Two years of personal & business tax returns"));

  await page.getByRole("tab", { name: "Serviceability" }).click();
  const income = page.getByRole("tabpanel", { name: "Serviceability" }).getByLabel("Net monthly income (after tax)", { exact: true });
  check("inputs survive tab switches", (await income.inputValue()) === "12,000", await income.inputValue());
  await page.getByRole("tab", { name: "Serviceability" }).click();
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(200);
  check("arrow key moves to the next tab", (await page.getByRole("tab", { name: "Repayments" }).getAttribute("aria-selected")) === "true");

  const audit = await styleAudit(page, "#toolkit");
  check("toolkit has no all-caps text", audit.caps === 0, `${audit.caps} elements`);
  check("toolkit has no pill shapes", audit.pills === 0, `${audit.pills} elements`);
  await page.context().close();
});
```

- [ ] **Step 2: Run the checks and confirm the toolkit group fails**

Run the browser check procedure.
Expected: FAIL in the toolkit group. The heading is "Credit Toolkit", there's no `dd[aria-live]` total,
"(3,500)" isn't present, "Repayment jump…" is missing, the Blocking label is uppercase, and there are pill
shapes. The sections group still passes.

- [ ] **Step 3: Replace `components/calculators/parts.tsx`**

```tsx
"use client";

import { useId, useState, type ReactNode } from "react";
import type { Tone } from "@/lib/calculators";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

export function parseAmount(raw: string): number {
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : 0;
}

export function NumberField({
  label,
  value,
  onChange,
  prefix,
  suffix,
  hint,
  decimals = 0,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
  hint?: string;
  decimals?: number;
}) {
  const id = useId();
  const [draft, setDraft] = useState<string | null>(null);
  const shown = draft ?? formatNumber(value, decimals);

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <div className="flex items-center rounded-md border border-input bg-card focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring">
        {prefix && <span className="pl-3 text-[0.9375rem] text-muted-foreground">{prefix}</span>}
        <input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          value={shown}
          aria-describedby={hint ? `${id}-hint` : undefined}
          onFocus={() => setDraft(value ? String(value) : "")}
          onChange={(e) => {
            const cleaned = e.target.value.replace(/[^0-9.]/g, "");
            setDraft(cleaned);
            onChange(parseAmount(cleaned));
          }}
          onBlur={() => setDraft(null)}
          className="w-full min-w-0 bg-transparent px-3 py-2.5 text-[0.9375rem] tabular-nums outline-none"
        />
        {suffix && <span className="pr-3 text-sm whitespace-nowrap text-muted-foreground">{suffix}</span>}
      </div>
      {hint && (
        <p id={`${id}-hint`} className="text-[0.8125rem] leading-snug text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}

export function ChoiceField<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  const name = useId();
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-medium">{label}</legend>
      <div className="flex flex-wrap gap-1 rounded-md border border-input bg-card p-1">
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              "flex-1 cursor-pointer rounded-sm px-3 py-1.5 text-center text-[0.9375rem] transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring",
              value === option.value
                ? "bg-secondary font-semibold text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

const toneText: Record<Tone, string> = {
  good: "text-success",
  caution: "text-warning",
  risk: "text-destructive",
};

export function Flag({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-sm border border-current px-2 py-0.5 text-[0.8125rem] font-semibold",
        toneText[tone]
      )}
    >
      {children}
    </span>
  );
}

export function Headline({
  label,
  value,
  sub,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
}) {
  return (
    <div className="space-y-1" aria-live="polite">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-3xl font-extrabold tracking-tight tabular-nums sm:text-4xl">{value}</p>
      {sub && <p className="text-sm text-muted-foreground">{sub}</p>}
    </div>
  );
}

export type WorksheetRow = {
  label: ReactNode;
  value: ReactNode;
  kind?: "line" | "subtotal" | "note" | "total";
};

export function Worksheet({ rows, caption }: { rows: WorksheetRow[]; caption?: ReactNode }) {
  return (
    <div className="relative rounded-md border border-border bg-card py-3 pr-5 pl-10 tabular-nums lining-nums before:absolute before:inset-y-0 before:left-6 before:w-px before:bg-margin">
      {caption && (
        <p className="mb-2 flex items-baseline justify-between gap-4 text-[0.8125rem] text-muted-foreground">
          {caption}
        </p>
      )}
      <dl>
        {rows.map((row, i) => (
          <WorksheetLine key={i} row={row} />
        ))}
      </dl>
    </div>
  );
}

function WorksheetLine({ row }: { row: WorksheetRow }) {
  const kind = row.kind ?? "line";
  if (kind === "total") {
    return (
      <div className="flex items-baseline justify-between gap-4 pt-4 pb-2">
        <dt className="text-[1.0625rem] font-extrabold">{row.label}</dt>
        <dd aria-live="polite" className="relative text-[1.625rem] leading-none font-extrabold tracking-[-0.01em]">
          {row.value}
          <span aria-hidden className="absolute inset-x-0 -bottom-2 h-1 border-y border-margin" />
        </dd>
      </div>
    );
  }
  return (
    <div
      className={cn(
        "grid grid-cols-[1fr_auto] items-baseline gap-x-4 border-b border-border text-[0.9375rem]",
        kind === "subtotal" && "-mt-px border-t border-t-foreground font-bold",
        kind === "note" && "text-sm text-muted-foreground"
      )}
    >
      <dt className="py-2">{row.label}</dt>
      <dd className="py-2 text-right">{row.value}</dd>
    </div>
  );
}

export function Meter({
  value,
  max,
  tone,
  marks,
  label,
}: {
  value: number;
  max: number;
  tone: Tone;
  marks: { at: number; label?: string }[];
  label: string;
}) {
  const pct = Math.min(Math.max(value / max, 0), 1) * 100;
  const fill = { good: "bg-success", caution: "bg-warning", risk: "bg-destructive" }[tone];
  return (
    <div role="img" aria-label={label} className="pt-1 pb-5">
      <div className="relative h-2 rounded-sm bg-secondary">
        <div className={cn("h-full rounded-sm transition-[width]", fill)} style={{ width: `${pct}%` }} />
        {marks.map((mark) => (
          <div key={mark.at} className="absolute top-0 h-full" style={{ left: `${(mark.at / max) * 100}%` }}>
            <div className="h-full w-px -translate-x-1/2 bg-foreground/40" />
            {mark.label && (
              <span className="absolute top-3.5 -translate-x-1/2 text-[11px] text-muted-foreground tabular-nums">
                {mark.label}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Note({ children }: { children: ReactNode }) {
  return <p className="text-xs leading-relaxed text-muted-foreground">{children}</p>;
}
```

- [ ] **Step 4: Replace `components/ui/tabs.tsx`**

```tsx
"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

function Tabs(props: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root {...props} />;
}

function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn("grid grid-cols-2 gap-x-6 border-b border-border sm:flex sm:gap-7", className)}
      {...props}
    />
  );
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "-mb-px rounded-sm pt-1 pb-2.5 text-left text-[0.9375rem] font-medium text-muted-foreground transition-colors hover:text-foreground data-[state=active]:font-bold data-[state=active]:text-foreground data-[state=active]:shadow-[inset_0_-2px_0_var(--color-foreground)]",
        className
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      className={cn("mt-6 rounded-sm focus-visible:outline-offset-4 data-[state=inactive]:hidden", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
```

(The focus outline comes from the global `:focus-visible` rule added in Task 2.)

- [ ] **Step 5: Replace `components/calculators/serviceability.tsx`**

```tsx
"use client";

import { useState } from "react";
import { ASSUMPTIONS, calculateServiceability } from "@/lib/calculators";
import { formatAccounting, formatCurrency, formatNumber, formatPct, formatYears } from "@/lib/format";
import { Note, NumberField, Worksheet } from "@/components/calculators/parts";

export function ServiceabilityCalculator() {
  const [netMonthlyIncome, setNetMonthlyIncome] = useState(9_000);
  const [monthlyExpenses, setMonthlyExpenses] = useState(3_500);
  const [otherMonthlyRepayments, setOtherMonthlyRepayments] = useState(400);
  const [creditCardLimits, setCreditCardLimits] = useState(10_000);
  const [annualRatePct, setAnnualRatePct] = useState(6);
  const [termYears, setTermYears] = useState(30);

  const term = Math.min(Math.max(termYears, 1), 40);
  const r = calculateServiceability({
    netMonthlyIncome,
    monthlyExpenses,
    otherMonthlyRepayments,
    creditCardLimits,
    annualRatePct,
    termYears: term,
  });
  const surplus = Math.round(r.monthlySurplus);
  const hasCapacity = r.maxLoan > 0;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <div className="grid content-start gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <NumberField
          label="Net monthly income (after tax)"
          prefix="$"
          value={netMonthlyIncome}
          onChange={setNetMonthlyIncome}
          hint="Household take-home pay."
        />
        <NumberField
          label="Monthly living expenses"
          prefix="$"
          value={monthlyExpenses}
          onChange={setMonthlyExpenses}
        />
        <NumberField
          label="Other loan repayments / month"
          prefix="$"
          value={otherMonthlyRepayments}
          onChange={setOtherMonthlyRepayments}
          hint="Car, personal and other home loans."
        />
        <NumberField
          label="Total credit card limits"
          prefix="$"
          value={creditCardLimits}
          onChange={setCreditCardLimits}
          hint="Limits, not balances: lenders assume you could use the full limit."
        />
        <div className="grid grid-cols-2 gap-4">
          <NumberField
            label="Example rate"
            suffix="% p.a."
            decimals={2}
            value={annualRatePct}
            onChange={setAnnualRatePct}
          />
          <NumberField label="Loan term" suffix="years" value={termYears} onChange={setTermYears} />
        </div>
      </div>

      <div className="space-y-4">
        <Worksheet
          caption="Monthly figures, AUD"
          rows={[
            { label: "Net monthly income", value: formatAccounting(netMonthlyIncome) },
            { label: "Living expenses", value: formatAccounting(monthlyExpenses, { deduct: true }) },
            { label: "Other loan repayments", value: formatAccounting(otherMonthlyRepayments, { deduct: true }) },
            {
              label: `Credit cards, ${formatNumber(ASSUMPTIONS.creditCardMonthlyFactor * 100, 1)}% of limits`,
              value: formatAccounting(r.creditCardCommitment, { deduct: true }),
            },
            { kind: "subtotal", label: "Surplus for the new loan", value: formatAccounting(r.monthlySurplus) },
            {
              kind: "note",
              label: `Assessment rate: ${formatPct(annualRatePct, 2)} + ${formatPct(ASSUMPTIONS.serviceabilityBufferPct, 1)} buffer`,
              value: formatPct(r.assessmentRatePct, 2),
            },
            {
              kind: "total",
              label: "Borrowing capacity",
              value: hasCapacity ? formatCurrency(r.maxLoan) : "No capacity",
            },
          ]}
        />

        {hasCapacity ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            <span className="font-bold text-foreground">Why the buffer matters.</span> At the actual{" "}
            {formatPct(annualRatePct, 2)} rate over {formatYears(term)}, this loan costs{" "}
            <span className="font-semibold text-foreground">{formatCurrency(r.repaymentAtActualRate)}/month</span>,
            leaving{" "}
            <span className="font-semibold text-foreground">{formatCurrency(r.bufferHeadroom)}/month</span> of
            headroom. That headroom is what lets the borrower absorb rate rises.
          </p>
        ) : (
          <p className="text-sm leading-relaxed text-muted-foreground">
            <span className="font-bold text-foreground">No capacity on these numbers.</span>{" "}
            {surplus < 0
              ? `Commitments exceed income by ${formatCurrency(-surplus)} a month.`
              : "Commitments use the whole income, leaving nothing for a new loan."}
          </p>
        )}

        <Note>
          A real assessment also uses the higher of declared expenses or a benchmark such as HEM,
          shades variable income like bonuses and rent, and applies each lender&apos;s own policy.
          This shows the core logic only.
        </Note>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Update `components/calculators/repayments.tsx`**

Replace the `<Worksheet … />` element with:

```tsx
        <Worksheet
          rows={[
            ...(r.revertRepayment !== undefined
              ? [
                  {
                    label: `Then P&I for the remaining ${formatYears(term - io)}`,
                    value: `${formatCurrency(r.revertRepayment)}/${per}`,
                  },
                ]
              : []),
            { label: "Total interest", value: formatCurrency(r.totalInterest) },
            { kind: "total" as const, label: "Total repaid", value: formatCurrency(r.totalPaid) },
          ]}
        />
```

Replace the whole `{type === "io" && r.revertRepayment !== undefined && ( <div …> … </div> )}` block with:

```tsx
        {type === "io" && r.revertRepayment !== undefined && (
          <p className="text-sm leading-relaxed text-muted-foreground">
            <span className="font-bold text-warning">Repayment jump when interest-only ends.</span>{" "}
            Repayments rise by{" "}
            <span className="font-semibold text-foreground">
              {formatCurrency(jump)}/{per} ({formatPct(jumpPct, 0)})
            </span>
            , and interest-only costs{" "}
            <span className="font-semibold text-foreground">
              {formatCurrency(r.totalInterest - pi.totalInterest)}
            </span>{" "}
            more in total than P&amp;I from day one. Lenders assess the higher P&amp;I repayment over
            the shorter remaining term.
          </p>
        )}
```

- [ ] **Step 7: Update `components/calculators/lvr-dti.tsx`**

- Replace `import { Meter, Note, NumberField, ToneBadge } from "@/components/calculators/parts";` with
  `import { Flag, Meter, Note, NumberField } from "@/components/calculators/parts";`.
- In `RatioCard`, replace `className="rounded-xl border border-border p-5 space-y-3"` with
  `className="space-y-3 rounded-md border border-border bg-card p-5"`.
- Replace `{band && <ToneBadge tone={band.tone}>{band.label}</ToneBadge>}` with
  `{band && <Flag tone={band.tone}>{band.label}</Flag>}`.

- [ ] **Step 8: Replace `components/calculators/file-readiness.tsx`**

```tsx
"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { assessReadiness, type IncomeType, type Tone } from "@/lib/calculators";
import { checklistGroups } from "@/lib/content";
import { ChoiceField, Flag, Note } from "@/components/calculators/parts";
import { cn } from "@/lib/utils";

const allItems = checklistGroups.flatMap((group) => group.items);

const VERDICT: Record<"ready" | "nearly" | "not-ready", { label: string; tone: Tone; note: string }> = {
  ready: {
    label: "Ready to submit",
    tone: "good",
    note: "Everything a lender typically asks for is in. Clean first submissions get fewer conditions.",
  },
  nearly: {
    label: "Nearly there",
    tone: "caution",
    note: "Nothing blocking, but the gaps below usually come back as conditions and slow approval.",
  },
  "not-ready": {
    label: "Not ready",
    tone: "risk",
    note: "Critical documents are missing. A lender can't assess the application without them.",
  },
};

const FILL: Record<Tone, string> = { good: "bg-success", caution: "bg-warning", risk: "bg-destructive" };

export function FileReadinessChecklist() {
  const [incomeType, setIncomeType] = useState<IncomeType>("payg");
  const [checked, setChecked] = useState<string[]>(["id", "payslips"]);

  const r = assessReadiness(allItems, checked, incomeType);
  const verdict = VERDICT[r.verdict];

  const toggle = (id: string) =>
    setChecked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
      <div className="space-y-6">
        <ChoiceField
          label="Main income type"
          value={incomeType}
          onChange={setIncomeType}
          options={[
            { value: "payg", label: "PAYG employee" },
            { value: "self-employed", label: "Self-employed" },
          ]}
        />

        {checklistGroups.map((group) => {
          const items = group.items.filter((item) => item.appliesTo.includes(incomeType));
          if (!items.length) return null;
          return (
            <fieldset key={group.heading} className="space-y-2">
              <legend className="mb-2 text-sm font-semibold text-muted-foreground">{group.heading}</legend>
              {items.map((item) => {
                const on = checked.includes(item.id);
                return (
                  <label
                    key={item.id}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-md border bg-card p-3 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring",
                      on ? "border-success" : "border-border hover:border-input"
                    )}
                  >
                    <input type="checkbox" checked={on} onChange={() => toggle(item.id)} className="sr-only" />
                    <span
                      aria-hidden
                      className={cn(
                        "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-sm border",
                        on ? "border-success bg-success text-card" : "border-input bg-card"
                      )}
                    >
                      {on && <Check className="size-3.5" strokeWidth={3} />}
                    </span>
                    <span className="space-y-0.5">
                      <span className="flex flex-wrap items-center gap-2 text-[0.9375rem] font-medium">
                        {item.label}
                        {item.critical && <Flag tone="risk">Critical</Flag>}
                      </span>
                      {item.hint && <span className="block text-[0.8125rem] text-muted-foreground">{item.hint}</span>}
                    </span>
                  </label>
                );
              })}
            </fieldset>
          );
        })}
      </div>

      <div className="h-fit space-y-4 rounded-md border border-border bg-card p-5 lg:sticky lg:top-20" aria-live="polite">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-muted-foreground">File status</p>
          <Flag tone={verdict.tone}>{verdict.label}</Flag>
        </div>
        <p className="text-3xl font-extrabold tracking-tight tabular-nums">{r.completedPct}%</p>
        <div
          role="progressbar"
          aria-label="Documents collected"
          aria-valuenow={r.completedPct}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-2 rounded-sm bg-secondary"
        >
          <div className={cn("h-full rounded-sm transition-[width]", FILL[verdict.tone])} style={{ width: `${r.completedPct}%` }} />
        </div>
        <p className="text-sm text-muted-foreground">{verdict.note}</p>

        {r.missingCritical.length > 0 && (
          <MissingList title="Blocking" items={r.missingCritical.map((i) => i.label)} tone="risk" />
        )}
        {r.missingOther.length > 0 && (
          <MissingList
            title="Will likely come back as conditions"
            items={r.missingOther.map((i) => i.label)}
            tone="caution"
          />
        )}

        <Note>A typical document list. Each lender and scenario adds its own requirements.</Note>
      </div>
    </div>
  );
}

function MissingList({ title, items, tone }: { title: string; items: string[]; tone: Tone }) {
  return (
    <div className="space-y-1.5">
      <p className={cn("text-sm font-semibold", tone === "risk" ? "text-destructive" : "text-warning")}>{title}</p>
      <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 9: Replace `components/sections/toolkit.tsx`**

```tsx
import { Info } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Section } from "@/components/sections/section";
import { ServiceabilityCalculator } from "@/components/calculators/serviceability";
import { RepaymentCalculator } from "@/components/calculators/repayments";
import { LvrDtiCalculator } from "@/components/calculators/lvr-dti";
import { FileReadinessChecklist } from "@/components/calculators/file-readiness";
import { toolkit } from "@/lib/content";

const TOOLS = [
  { value: "serviceability", label: "Serviceability", Tool: ServiceabilityCalculator },
  { value: "repayments", label: "Repayments", Tool: RepaymentCalculator },
  { value: "lvr-dti", label: "LVR & DTI", Tool: LvrDtiCalculator },
  { value: "readiness", label: "File readiness", Tool: FileReadinessChecklist },
];

export function Toolkit() {
  return (
    <Section id="toolkit" heading={toolkit.heading} note={toolkit.intro}>
      <Tabs defaultValue="serviceability">
        <TabsList aria-label="Credit tools">
          {TOOLS.map(({ value, label }) => (
            <TabsTrigger key={value} value={value}>
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
        {TOOLS.map(({ value, Tool }) => (
          <TabsContent key={value} value={value} forceMount>
            <Tool />
          </TabsContent>
        ))}
      </Tabs>
      <p className="mt-6 flex gap-2 text-xs leading-relaxed text-muted-foreground">
        <Info aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        {toolkit.disclaimer}
      </p>
    </Section>
  );
}
```

- [ ] **Step 10: Update the `toolkit` content**

In `lib/content.ts`, replace the whole `toolkit` object with:

```ts
export const toolkit = {
  heading: "Credit toolkit",
  intro: "The core checks behind a credit assessment, as working calculators.",
  disclaimer:
    "Illustrative only. These tools show general assessment logic. They are not financial advice or credit assistance, and every lender's policy differs. Nothing you enter leaves your browser.",
};
```

- [ ] **Step 11: Verify**

Run `npm test && npx tsc --noEmit && npm run lint`, then the browser check procedure.
Expected: all PASS in the sections and toolkit groups. Also run
`grep -rn "ToneBadge" components`, which should print nothing.

- [ ] **Step 12: Commit**

```bash
git add components/calculators components/ui/tabs.tsx components/sections/toolkit.tsx lib/content.ts
git commit -m "$(cat <<'EOF'
Restyle the credit toolkit as ledger worksheets

Deductions in brackets, the bottom line double-ruled, underlined text
tabs and squared result flags; explanation boxes become plain
paragraphs, and a zero surplus now gets its own sentence.

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Hero worksheet, photo, header and actions

**Files:**
- Modify: `components/calculators/parts.tsx` (add `Slider`; replace `Worksheet`/`WorksheetLine` with the hero-capable version)
- Create: `components/calculators/hero-worksheet.tsx`
- Modify: `components/sections/hero.tsx` (full replacement)
- Modify: `components/site-header.tsx` (full replacement)
- Modify: `components/ui/button.tsx` (full replacement)
- Modify: `components/seo/JsonLd.tsx` (add `image`)
- Modify: `lib/content.ts` (siteConfig, heroStats → heroFacts, actions, contactCards email guard)
- Create: `public/anesh-thapa-magar.jpg`
- Delete: `public/profile.jpg`, `components/ui/avatar.tsx`, `components/ui/badge.tsx`
- Modify: `package.json` / `package-lock.json` (uninstall `@radix-ui/react-avatar`)
- Modify: `.superpowers/checks/ui-check.cjs` (append the hero group)

**Interfaces:**
- Consumes: `formatAccounting`, `buildContactAction`, `buildHeroActions`, `linkTargetProps` and
  `heroWorksheet` (Task 1); `containerClass` (Task 3); `Worksheet` and `WorksheetRow` (Task 4); the
  animation hooks from Task 2.
- Produces:
  - `WorksheetRow` gains `control?: ReactNode`, rendered as a full-width `<dd>` under the row.
  - `Worksheet` gains `footer?: ReactNode` and `variant?: "tool" | "hero"`. `"hero"` sets `data-enter`
    (animation) and a 30px total.
  - `Slider(props: { labelledBy: string; value: number; min: number; max: number; step: number; onChange: (value: number) => void; valueText: string })`
  - `HeroWorksheet()`
  - `siteConfig.email: string | null`, `siteConfig.resumeUrl: string | null`
  - `resumeHref: string | null`, `contactAction: ContactAction`, `heroActions: HeroActions`
  - `heroFacts: { label: string; value: string }[]`
  - Button variants `default | ghost | link` and sizes `default | icon | inline`.

- [ ] **Step 1: Append the hero group to the browser check script**

Insert above `// ---- later tasks append groups above this line ----`:

```js
GROUPS.push(async function hero(browser) {
  const TAGLINE = "Credit Analyst assessing Australian home loans the way the lender will.";
  const page = await newPage(browser);
  const hero = page.locator("#content");
  const ws = hero.locator("[data-enter]");
  const total = () => ws.locator("dd[aria-live=polite]").innerText();
  const img = hero.locator("img").first();
  const cta = hero.getByRole("link", { name: "Message on LinkedIn" });

  check(
    "first screen (1440×900) shows name, photo, worksheet total and action",
    (await within(hero.locator("h1"), 900)) && (await within(img, 900)) &&
      (await within(ws.locator("dd[aria-live=polite]"), 900)) && (await within(cta, 900)),
  );
  check("h1 is the name", (await hero.locator("h1").innerText()).trim() === "Anesh Thapa Magar");
  const imgInfo = await img.evaluate((el) => ({ alt: el.alt, w: el.naturalWidth, src: el.currentSrc }));
  check("photo loads with alt text", imgInfo.w > 0 && imgInfo.alt === "Anesh Thapa Magar", imgInfo.src);
  const imgBytes = (await (await page.request.get(imgInfo.src)).body()).length;
  check("photo is small (< 40 KB)", imgBytes < 40_000, `${imgBytes} bytes`);

  check("hero capacity starts at $586,610", (await total()) === "$586,610", await total());
  const income = ws.getByRole("slider", { name: "Net monthly income" });
  const expenses = ws.getByRole("slider", { name: "Living expenses" });
  check("income slider announces its value", (await income.getAttribute("aria-valuetext")) === "$9,000 a month");
  await income.focus();
  await page.keyboard.press("ArrowRight");
  check("arrow key steps income by 100", (await ws.innerText()).includes("9,100"));
  await page.keyboard.press("Home");
  await expenses.focus();
  await page.keyboard.press("End");
  const wsText = await ws.innerText();
  check(
    "slider extremes give No capacity and a bracketed surplus",
    (await total()) === "No capacity" && /Monthly surplus\s+\([\d,]+\)/.test(wsText),
    wsText.replace(/\n/g, " | "),
  );
  check("no -$0, NaN or Infinity in the worksheet", !/-\$0|NaN|Infinity/.test(wsText));

  const nav = await page.locator("header nav a").allInnerTexts();
  check("header nav links", nav.join(",") === "Profile,Experience,Toolkit,Contact", nav.join(","));
  check("no Resume link while there is no resume file", (await page.getByRole("link", { name: "Resume", exact: true }).count()) === 0);
  check(
    "primary action opens LinkedIn in a new tab",
    ((await cta.getAttribute("href")) || "").includes("linkedin.com/in/anesh-thapa-magar") && (await cta.getAttribute("target")) === "_blank",
  );
  const audit = await styleAudit(page, "header, #content");
  check("header and hero: no all-caps text", audit.caps === 0, `${audit.caps} elements`);
  check("header and hero: no pill shapes", audit.pills === 0, `${audit.pills} elements`);

  await page.mouse.wheel(0, 2000);
  await page.waitForTimeout(300);
  const headerBox = await page.locator("header").boundingBox();
  check("header stays at the top when scrolling", !!headerBox && Math.abs(headerBox.y) < 1, `y=${headerBox && headerBox.y}`);

  const animOn = await page.locator("#content [data-enter] .enter-figure").first().evaluate((el) => getComputedStyle(el).animationName);
  check("worksheet figures animate in", animOn === "enter-figure", animOn);
  const rm = await newPage(browser, { context: { reducedMotion: "reduce" } });
  const animOff = await rm.locator("#content [data-enter] .enter-figure").first().evaluate((el) => getComputedStyle(el).animationName);
  check("reduced motion: worksheet figures don't animate", animOff === "none", animOff);

  const phone = await newPage(browser, { context: { viewport: { width: 390, height: 844 } } });
  const ph = phone.locator("#content");
  check(
    "phone first screen shows name, tagline and action",
    (await within(ph.locator("h1"), 844)) && (await within(ph.getByText(TAGLINE), 844)) &&
      (await within(ph.getByRole("link", { name: "Message on LinkedIn" }), 844)),
  );

  const failures = [...page.failures, ...rm.failures, ...phone.failures];
  check("no failed requests or errors", failures.length === 0, failures.join(" || "));
  for (const p of [page, rm, phone]) await p.context().close();
});
```

- [ ] **Step 2: Run the checks and confirm the hero group fails**

Run the browser check procedure.
Expected: FAIL in the hero group. There's no `[data-enter]`, the header links are different, the
`/resume.pdf` Resume link and 404 are still there, and the pill badges and uppercase remain. The earlier
groups pass.

- [ ] **Step 3: Create the photo and remove the old one**

```bash
node -e "require('sharp')('public/profile.jpg').resize(704, 704).jpeg({ quality: 82, mozjpeg: true }).toFile('public/anesh-thapa-magar.jpg').then((i) => console.log(i.size, 'bytes'))"
git rm -q public/profile.jpg
```

Expected: prints a size under 80,000 bytes. The browser receives a much smaller optimised copy from `next/image`.

- [ ] **Step 4: Update `lib/content.ts` for the site config and actions**

Replace the `import type { ChecklistItem } …` line with:

```ts
import type { ChecklistItem } from "@/lib/calculators";
import { buildContactAction, buildHeroActions } from "@/lib/contact";
```

Replace the whole `siteConfig` object and the `heroStats` array with:

```ts
type SiteConfig = {
  name: string;
  title: string;
  tagline: string;
  baseUrl: string;
  locationShort: string;
  email: string | null;
  linkedin: string;
  resumeUrl: string | null;
  avatarImage: string;
};

export const siteConfig: SiteConfig = {
  name: "Anesh Thapa Magar",
  title: "Credit Analyst",
  tagline: "Credit Analyst assessing Australian home loans the way the lender will.",
  baseUrl: "https://anesh-thapa.vercel.app",
  locationShort: "Nepal & Australia",
  email: null, // Set a real address to switch every "Message on LinkedIn" action to "Email Anesh".
  linkedin: "https://www.linkedin.com/in/anesh-thapa-magar-aa29501a0/",
  resumeUrl: null, // Add the PDF to /public and set its path to show the Resume links.
  avatarImage: "/anesh-thapa-magar.jpg",
};

export const resumeHref = siteConfig.resumeUrl?.trim() || null;
export const contactAction = buildContactAction(siteConfig.email, siteConfig.linkedin);
export const heroActions = buildHeroActions(resumeHref, contactAction);

export const heroFacts = [
  { label: "Currently", value: "Credit Analyst, ODIN Mortgage" },
  { label: "Experience", value: "4+ years in Australian lending" },
  { label: "Based", value: "Nepal and Australia" },
];
```

Replace the whole `contactCards` array with the version below. It keeps the current contact section
working until Task 6 replaces it.

```ts
export const contactCards = [
  ...(siteConfig.email
    ? [{ label: "Email", value: siteConfig.email, href: `mailto:${siteConfig.email}` as string | undefined }]
    : []),
  {
    label: "LinkedIn",
    value: "linkedin.com/in/anesh-thapa-magar-aa29501a0",
    href: siteConfig.linkedin as string | undefined,
  },
  {
    label: "Location",
    value: "Nepal & Australia",
    href: undefined as string | undefined,
  },
];
```

- [ ] **Step 5: Extend `parts.tsx` with `Slider` and the hero-capable `Worksheet`**

In `components/calculators/parts.tsx`, change the React import to:

```tsx
import { useId, useState, type CSSProperties, type ReactNode } from "react";
```

Replace the `WorksheetRow` type and the `Worksheet` and `WorksheetLine` functions with:

```tsx
export type WorksheetRow = {
  label: ReactNode;
  value: ReactNode;
  kind?: "line" | "subtotal" | "note" | "total";
  control?: ReactNode;
};

export function Worksheet({
  rows,
  caption,
  footer,
  variant = "tool",
}: {
  rows: WorksheetRow[];
  caption?: ReactNode;
  footer?: ReactNode;
  variant?: "tool" | "hero";
}) {
  const hero = variant === "hero";
  return (
    <div
      data-enter={hero ? "" : undefined}
      className={cn(
        "relative rounded-md border border-border bg-card pr-5 pl-10 tabular-nums lining-nums before:absolute before:inset-y-0 before:left-6 before:w-px before:bg-margin",
        hero ? "py-5" : "py-3"
      )}
    >
      {caption && (
        <p className="mb-2 flex items-baseline justify-between gap-4 text-[0.8125rem] text-muted-foreground">
          {caption}
        </p>
      )}
      <dl>
        {rows.map((row, i) => (
          <WorksheetLine key={i} row={row} index={i} large={hero} />
        ))}
      </dl>
      {footer && <div className="mt-4 text-[0.8125rem] leading-normal text-muted-foreground">{footer}</div>}
    </div>
  );
}

function WorksheetLine({ row, index, large }: { row: WorksheetRow; index: number; large: boolean }) {
  const kind = row.kind ?? "line";
  const stagger = { "--row": index } as CSSProperties;
  if (kind === "total") {
    return (
      <div className="flex items-baseline justify-between gap-4 pt-4 pb-2">
        <dt className="text-[1.0625rem] font-extrabold">{row.label}</dt>
        <dd
          aria-live="polite"
          style={stagger}
          className={cn(
            "enter-figure relative leading-none font-extrabold tracking-[-0.01em]",
            large ? "text-[1.875rem]" : "text-[1.625rem]"
          )}
        >
          {row.value}
          <span aria-hidden style={stagger} className="draw-rule absolute inset-x-0 -bottom-2 h-1 border-y border-margin" />
        </dd>
      </div>
    );
  }
  return (
    <div
      className={cn(
        "grid grid-cols-[1fr_auto] items-baseline gap-x-4 border-b border-border text-[0.9375rem]",
        kind === "subtotal" && "-mt-px border-t border-t-foreground font-bold",
        kind === "note" && "text-sm text-muted-foreground"
      )}
    >
      <dt className="py-2">{row.label}</dt>
      <dd style={stagger} className="enter-figure py-2 text-right">
        {row.value}
      </dd>
      {row.control && <dd className="col-span-2 pb-2">{row.control}</dd>}
    </div>
  );
}

export function Slider({
  labelledBy,
  value,
  min,
  max,
  step,
  onChange,
  valueText,
}: {
  labelledBy: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  valueText: string;
}) {
  return (
    <input
      type="range"
      aria-labelledby={labelledBy}
      aria-valuetext={valueText}
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="block h-6 w-full cursor-pointer accent-foreground"
    />
  );
}
```

- [ ] **Step 6: Create `components/calculators/hero-worksheet.tsx`**

```tsx
"use client";

import { useId, useState } from "react";
import { ASSUMPTIONS, calculateServiceability } from "@/lib/calculators";
import { heroWorksheet as cfg } from "@/lib/content";
import { formatAccounting, formatCurrency, formatNumber, formatPct } from "@/lib/format";
import { Slider, Worksheet } from "@/components/calculators/parts";

export function HeroWorksheet() {
  const incomeId = useId();
  const expensesId = useId();
  const [income, setIncome] = useState(cfg.income.initial);
  const [expenses, setExpenses] = useState(cfg.expenses.initial);

  const r = calculateServiceability({
    netMonthlyIncome: income,
    monthlyExpenses: expenses,
    otherMonthlyRepayments: cfg.otherMonthlyRepayments,
    creditCardLimits: cfg.creditCardLimits,
    annualRatePct: cfg.annualRatePct,
    termYears: cfg.termYears,
  });

  return (
    <Worksheet
      variant="hero"
      caption={
        <>
          <span className="text-[1.0625rem] font-bold text-foreground">Serviceability check</span>
          <span>Move the sliders</span>
        </>
      }
      rows={[
        {
          label: <span id={incomeId}>Net monthly income</span>,
          value: formatAccounting(income),
          control: (
            <Slider
              labelledBy={incomeId}
              min={cfg.income.min}
              max={cfg.income.max}
              step={cfg.income.step}
              value={income}
              onChange={setIncome}
              valueText={`${formatCurrency(income)} a month`}
            />
          ),
        },
        {
          label: <span id={expensesId}>Living expenses</span>,
          value: formatAccounting(expenses, { deduct: true }),
          control: (
            <Slider
              labelledBy={expensesId}
              min={cfg.expenses.min}
              max={cfg.expenses.max}
              step={cfg.expenses.step}
              value={expenses}
              onChange={setExpenses}
              valueText={`${formatCurrency(expenses)} a month`}
            />
          ),
        },
        { label: "Other loan repayments", value: formatAccounting(cfg.otherMonthlyRepayments, { deduct: true }) },
        {
          label: `Card limits at ${formatNumber(ASSUMPTIONS.creditCardMonthlyFactor * 100, 1)}% of ${formatCurrency(cfg.creditCardLimits)}`,
          value: formatAccounting(r.creditCardCommitment, { deduct: true }),
        },
        { kind: "subtotal", label: "Monthly surplus", value: formatAccounting(r.monthlySurplus) },
        {
          kind: "note",
          label: `Assessed at ${formatPct(cfg.annualRatePct, 2)} + ${formatPct(ASSUMPTIONS.serviceabilityBufferPct, 2)} buffer, ${cfg.termYears} years`,
          value: formatPct(r.assessmentRatePct, 2),
        },
        {
          kind: "total",
          label: "Borrowing capacity",
          value: r.maxLoan > 0 ? formatCurrency(r.maxLoan) : "No capacity",
        },
      ]}
      footer={
        <>
          Illustrative only. Not financial advice or credit assistance.{" "}
          <a href="#toolkit" className="font-semibold text-foreground underline underline-offset-[3px]">
            Open the full toolkit
          </a>
        </>
      }
    />
  );
}
```

- [ ] **Step 7: Replace `components/ui/button.tsx`**

```tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-[0.9375rem] font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "rounded-lg bg-primary text-primary-foreground hover:bg-primary/90",
        ghost: "rounded-md text-foreground hover:bg-secondary",
        link: "rounded-sm text-foreground underline decoration-1 underline-offset-4 hover:decoration-2",
      },
      size: {
        default: "h-11 px-[1.125rem]",
        icon: "size-10",
        inline: "h-auto p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
```

- [ ] **Step 8: Replace `components/sections/hero.tsx`**

```tsx
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
```

- [ ] **Step 9: Replace `components/site-header.tsx`**

```tsx
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
```

- [ ] **Step 10: Add the photo to structured data**

In `components/seo/JsonLd.tsx`, after the line `url: siteConfig.baseUrl,` add:

```tsx
    image: new URL(siteConfig.avatarImage, siteConfig.baseUrl).toString(),
```

- [ ] **Step 11: Remove the avatar and badge components**

```bash
grep -rn "ui/avatar\|ui/badge\|heroStats\|initials\|react-icons" components/sections/hero.tsx components/site-header.tsx lib/content.ts   # expect no output
git rm -q components/ui/avatar.tsx components/ui/badge.tsx
npm uninstall @radix-ui/react-avatar
grep -rn "ui/avatar\|ui/badge" app components lib   # expect no output
```

- [ ] **Step 12: Verify**

Run `npm test && npx tsc --noEmit && npm run lint`, then the browser check procedure.
Expected: all PASS in the sections, toolkit and hero groups.

- [ ] **Step 13: Commit**

```bash
git add components/calculators/parts.tsx components/calculators/hero-worksheet.tsx components/sections/hero.tsx components/site-header.tsx components/ui/button.tsx components/seo/JsonLd.tsx lib/content.ts public/anesh-thapa-magar.jpg package.json package-lock.json
git commit -m "$(cat <<'EOF'
Open with a live serviceability worksheet and a flat header

The first screen now runs a real assessment beside Anesh's name and
photo. The photo drops from 1.5 MB to a properly sized JPEG, and
Resume/email actions fall back to LinkedIn until real ones exist, so
nothing leads to a 404 or a fake address.

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Contact, footer and leftover cleanup

**Files:**
- Modify: `components/sections/contact.tsx` (full replacement)
- Modify: `components/site-footer.tsx` (full replacement)
- Modify: `components/sections/about.tsx` (delete `SectionHeading`)
- Modify: `lib/content.ts` (replace `contactCards` with `contact`)
- Modify: `package.json` / `package-lock.json` (uninstall `react-icons`)
- Modify: `.superpowers/checks/ui-check.cjs` (append the contact/footer group)

**Interfaces:**
- Consumes: `Section` and `containerClass` (Task 3), `contactAction` and `siteConfig` (Task 5),
  `linkTargetProps` (Task 1), and `Button` (Task 5).
- Produces: `contact: { heading: string; sentence: string; rows: ContactRow[] }` where
  `type ContactRow = { label: string; value: string; href?: string }`.

- [ ] **Step 1: Append the contact and footer group**

Insert above `// ---- later tasks append groups above this line ----`:

```js
GROUPS.push(async function contactAndFooter(browser) {
  const page = await newPage(browser);
  const contact = page.locator("#contact");
  check("contact heading", (await contact.locator("h2").innerText()).trim() === "Contact");
  check(
    "contact sentence",
    await contact.getByText("Open to credit analyst roles and conversations about Australian lending.").isVisible(),
  );
  const labels = await contact.locator("dt").allInnerTexts();
  check("contact rows: LinkedIn and Based only", labels.join(",") === "LinkedIn,Based", labels.join(","));
  check("no example.com address anywhere", !(await page.content()).includes("example.com"));
  check(
    "contact action goes to LinkedIn",
    ((await contact.getByRole("link", { name: "Message on LinkedIn" }).getAttribute("href")) || "").includes("linkedin.com"),
  );
  const footer = await page.locator("footer").innerText();
  check(
    "footer has copyright and back to top",
    footer.includes(`© ${new Date().getFullYear()} Anesh Thapa Magar`) && footer.includes("Back to top"),
    footer.replace(/\n/g, " | "),
  );
  const audit = await styleAudit(page, "main");
  check("whole page: no all-caps text", audit.caps === 0, `${audit.caps} elements`);
  check("whole page: no pill shapes", audit.pills === 0, `${audit.pills} elements`);
  check("no failed requests or errors", page.failures.length === 0, page.failures.join(" || "));
  await page.context().close();
});
```

- [ ] **Step 2: Run the checks and confirm this group fails**

Run the browser check procedure.
Expected: FAIL in contactAndFooter. The heading is "Get in Touch", the labels come from the old cards,
there are uppercase eyebrows, and the footer is the old one.

- [ ] **Step 3: Replace `contactCards` in `lib/content.ts`**

Replace the whole `contactCards` array with:

```ts
export type ContactRow = { label: string; value: string; href?: string };

export const contact: { heading: string; sentence: string; rows: ContactRow[] } = {
  heading: "Contact",
  sentence: "Open to credit analyst roles and conversations about Australian lending.",
  rows: [
    ...(siteConfig.email
      ? [{ label: "Email", value: siteConfig.email, href: `mailto:${siteConfig.email}` }]
      : []),
    {
      label: "LinkedIn",
      value: "linkedin.com/in/anesh-thapa-magar-aa29501a0",
      href: siteConfig.linkedin,
    },
    { label: "Based", value: "Nepal and Australia" },
  ],
};
```

- [ ] **Step 4: Replace `components/sections/contact.tsx`**

```tsx
import { Button } from "@/components/ui/button";
import { Section } from "@/components/sections/section";
import { linkTargetProps } from "@/lib/contact";
import { contact, contactAction } from "@/lib/content";

export function Contact() {
  return (
    <Section id="contact" heading={contact.heading}>
      <p className="mb-5 max-w-[32ch] text-2xl leading-[1.35] font-semibold tracking-[-0.01em]">
        {contact.sentence}
      </p>
      <dl className="max-w-[40rem]">
        {contact.rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-[6.25rem_1fr] gap-x-4 border-t border-border py-3 first:border-t-0 first:pt-0.5 sm:grid-cols-[8rem_1fr]"
          >
            <dt className="text-[0.9375rem] text-muted-foreground">{row.label}</dt>
            <dd className="min-w-0 [overflow-wrap:anywhere]">
              {row.href ? (
                <a
                  href={row.href}
                  {...linkTargetProps(row.href.startsWith("http"))}
                  className="rounded-sm underline decoration-1 underline-offset-4 hover:decoration-2"
                >
                  {row.value}
                </a>
              ) : (
                row.value
              )}
            </dd>
          </div>
        ))}
      </dl>
      <Button asChild className="mt-6">
        <a href={contactAction.href} {...linkTargetProps(contactAction.external)}>
          {contactAction.label}
        </a>
      </Button>
    </Section>
  );
}
```

- [ ] **Step 5: Replace `components/site-footer.tsx`**

```tsx
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
```

- [ ] **Step 6: Delete `SectionHeading` and `react-icons`**

In `components/sections/about.tsx`, delete the whole `SectionHeading` function. Then:

```bash
grep -rn "SectionHeading\|react-icons\|contactCards" app components lib   # expect no output
npm uninstall react-icons
```

- [ ] **Step 7: Verify**

Run `npm test && npx tsc --noEmit && npm run lint`, then the browser check procedure.
Expected: all PASS in the sections, toolkit, hero and contactAndFooter groups.

- [ ] **Step 8: Commit**

```bash
git add components/sections/contact.tsx components/site-footer.tsx components/sections/about.tsx lib/content.ts package.json package-lock.json
git commit -m "$(cat <<'EOF'
Turn contact into a closing entry and simplify the footer

One sentence, ruled rows and a single action replace the three centred
cards; the placeholder email is gone from the page, and the old
SectionHeading and react-icons are removed now nothing uses them.

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: Generated share image

**Files:**
- Create: `assets/fonts/LibreFranklin-Regular.ttf`, `assets/fonts/LibreFranklin-ExtraBold.ttf`, `assets/fonts/OFL.txt`
- Create: `app/opengraph-image.tsx`
- Modify: `app/layout.tsx` (drop the manual `/og-image.jpg` entries)
- Modify: `.superpowers/checks/ui-check.cjs` (append the share-image group)

**Interfaces:**
- Consumes: `calculateServiceability` (existing), `heroWorksheet`, `formatAccounting` and `formatCurrency`
  (Task 1), and `siteConfig` (Task 5).
- Produces: the `/opengraph-image` route (PNG, 1200×630). Next adds `og:image`, `og:image:width`,
  `og:image:height` and `og:image:alt` automatically.

- [ ] **Step 1: Append the share-image group**

Insert above `// ---- later tasks append groups above this line ----`:

```js
GROUPS.push(async function shareImage(browser) {
  const page = await newPage(browser);
  const meta = (p) => page.locator(`meta[property="${p}"]`).getAttribute("content");
  const og = await meta("og:image");
  check("og:image points at the generated image", !!og && new URL(og).pathname.startsWith("/opengraph-image"), og);
  const [w, h, alt] = [await meta("og:image:width"), await meta("og:image:height"), await meta("og:image:alt")];
  check("og:image is 1200×630 with alt text", w === "1200" && h === "630" && alt === "Anesh Thapa Magar, Credit Analyst", `${w}×${h} "${alt}"`);
  if (og) {
    const u = new URL(og);
    const res = await page.request.get(BASE + u.pathname + u.search);
    const body = await res.body();
    check(
      "share image serves a PNG",
      res.status() === 200 && res.headers()["content-type"] === "image/png" && body.length > 10_000,
      `${res.status()} ${res.headers()["content-type"]} ${body.length} bytes`,
    );
    fs.writeFileSync(path.join(SHOTS, "og.png"), body);
  }
  check("no reference to the old og-image.jpg", !(await page.content()).includes("og-image.jpg"));
  await page.context().close();
});
```

- [ ] **Step 2: Run the checks and confirm this group fails**

Run the browser check procedure.
Expected: FAIL in shareImage. `og:image` is `…/og-image.jpg`, and `og-image.jpg` is still referenced.

- [ ] **Step 3: Vendor the fonts**

```bash
mkdir -p assets/fonts
curl -s "https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@400" | grep -o "https://[^)]*\.ttf" | head -1 | xargs curl -s -o assets/fonts/LibreFranklin-Regular.ttf
curl -s "https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@800" | grep -o "https://[^)]*\.ttf" | head -1 | xargs curl -s -o assets/fonts/LibreFranklin-ExtraBold.ttf
curl -s -o assets/fonts/OFL.txt https://raw.githubusercontent.com/google/fonts/main/ofl/librefranklin/OFL.txt
file assets/fonts/*.ttf && du -ch assets/fonts/*.ttf | tail -1
```

Expected: both files report "TrueType Font data", the total is under 450K (the `ImageResponse` bundle limit
is 500KB), and `OFL.txt` begins with the Libre Franklin copyright line.

- [ ] **Step 4: Create `app/opengraph-image.tsx`**

```tsx
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { calculateServiceability } from "@/lib/calculators";
import { heroWorksheet as cfg, siteConfig } from "@/lib/content";
import { formatAccounting, formatCurrency } from "@/lib/format";

export const alt = `${siteConfig.name}, ${siteConfig.title}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAPER = "#F3F6F1";
const SHEET = "#FFFFFF";
const INK = "#14211A";
const PENCIL = "#4A5A50";
const RULE = "#C9D8CB";
const MARGIN = "#D98F88";

export default async function Image() {
  const [regular, extraBold] = await Promise.all([
    readFile(join(process.cwd(), "assets/fonts/LibreFranklin-Regular.ttf")),
    readFile(join(process.cwd(), "assets/fonts/LibreFranklin-ExtraBold.ttf")),
  ]);

  const r = calculateServiceability({
    netMonthlyIncome: cfg.income.initial,
    monthlyExpenses: cfg.expenses.initial,
    otherMonthlyRepayments: cfg.otherMonthlyRepayments,
    creditCardLimits: cfg.creditCardLimits,
    annualRatePct: cfg.annualRatePct,
    termYears: cfg.termYears,
  });

  const rows: [string, string][] = [
    ["Net monthly income", formatAccounting(cfg.income.initial)],
    ["Living expenses", formatAccounting(cfg.expenses.initial, { deduct: true })],
    ["Other loan repayments", formatAccounting(cfg.otherMonthlyRepayments, { deduct: true })],
    ["Card limits", formatAccounting(r.creditCardCommitment, { deduct: true })],
    ["Monthly surplus", formatAccounting(r.monthlySurplus)],
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: PAPER,
          color: INK,
          fontFamily: "Libre Franklin",
          padding: 72,
          gap: 64,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1 }}>
          <div style={{ fontSize: 96, fontWeight: 800, lineHeight: 0.95, letterSpacing: "-0.025em" }}>
            {siteConfig.name}
          </div>
          <div style={{ fontSize: 34, color: PENCIL, marginTop: 28, lineHeight: 1.35 }}>{siteConfig.tagline}</div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignSelf: "center",
            width: 440,
            background: SHEET,
            border: `2px solid ${RULE}`,
            borderRadius: 6,
            padding: "28px 32px 28px 56px",
            position: "relative",
          }}
        >
          <div style={{ position: "absolute", left: 30, top: 0, bottom: 0, width: 2, background: MARGIN }} />
          {rows.map(([label, value], i) => {
            const last = i === rows.length - 1;
            return (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 24,
                  padding: "10px 0",
                  borderBottom: `1.5px solid ${RULE}`,
                  borderTop: last ? `2px solid ${INK}` : undefined,
                  fontWeight: last ? 800 : 400,
                }}
              >
                <span>{label}</span>
                <span>{value}</span>
              </div>
            );
          })}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 22 }}>
            <span style={{ fontSize: 26, fontWeight: 800 }}>Capacity</span>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <span style={{ fontSize: 44, fontWeight: 800 }}>{formatCurrency(r.maxLoan)}</span>
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  height: 7,
                  marginTop: 6,
                  borderTop: `2px solid ${MARGIN}`,
                  borderBottom: `2px solid ${MARGIN}`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Libre Franklin", data: regular, style: "normal", weight: 400 },
        { name: "Libre Franklin", data: extraBold, style: "normal", weight: 800 },
      ],
    }
  );
}
```

- [ ] **Step 5: Drop the manual image entries from `app/layout.tsx`**

In the `openGraph` object, delete this block:

```tsx
    images: [
      {
        url: "/og-image.jpg", // TODO: add this image to /public
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} — ${siteConfig.title}`,
      },
    ],
```

In the `twitter` object, delete this line:

```tsx
    images: ["/og-image.jpg"],
```

- [ ] **Step 6: Verify, and look at the image**

Run `npx tsc --noEmit && npm run lint`, then the browser check procedure.
Expected: all groups PASS. Open `.superpowers/checks/shots/og.png` with the Read tool and check:
- the name sits on the left over the tagline;
- the worksheet card sits on the right, with a margin line, bracketed deductions, a ruled surplus row,
  "$586,610" and a double rule;
- nothing is clipped.

- [ ] **Step 7: Commit**

```bash
git add assets/fonts app/opengraph-image.tsx app/layout.tsx
git commit -m "$(cat <<'EOF'
Generate the link-preview image in the ledger style

LinkedIn and Slack previews now show the name, tagline and a worksheet
card instead of pointing at a missing og-image.jpg. Libre Franklin TTFs
(OFL) are vendored only for image generation.

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: Whole-site quality pass and CLAUDE.md

**Files:**
- Modify: `.superpowers/checks/ui-check.cjs` (append the quality group)
- Modify: `CLAUDE.md` (full replacement)

**Interfaces:**
- Consumes: everything above.
- Produces: screenshots in `.superpowers/checks/shots/` and an updated `CLAUDE.md`.

- [ ] **Step 1: Append the quality group**

Insert above `// ---- later tasks append groups above this line ----`:

```js
GROUPS.push(async function quality(browser) {
  const page = await newPage(browser);
  const misses = [];
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press("Tab");
    const info = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      // Hidden radios/checkboxes show focus on their label; number inputs show it on their wrapper.
      const hasRing = (node) => {
        if (!node) return false;
        const cs = getComputedStyle(node);
        return cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) >= 2;
      };
      const name = (el.getAttribute("aria-label") || el.textContent || el.tagName).trim().slice(0, 40);
      return { name, ok: hasRing(el) || hasRing(el.closest("label")) || hasRing(el.parentElement) };
    });
    if (info && !info.ok) misses.push(info.name);
  }
  check("keyboard focus is visible on the first 40 tab stops", misses.length === 0, misses.join(" | "));
  await page.context().close();

  for (const width of [390, 320]) {
    const p = await newPage(browser, { context: { viewport: { width, height: 800 } } });
    const overflow = [];
    for (const tab of ["Serviceability", "Repayments", "LVR & DTI", "File readiness"]) {
      await p.getByRole("tab", { name: tab }).click();
      const o = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (o > 0) overflow.push(`${tab}: ${o}px`);
    }
    check(`no sideways scroll at ${width}px on any tab`, overflow.length === 0, overflow.join(", "));
    await p.context().close();
  }

  for (const scheme of ["dark", "light"]) {
    const p = await newPage(browser, { context: { colorScheme: scheme } });
    const dark = await p.evaluate(() => document.documentElement.classList.contains("dark"));
    check(`follows a ${scheme} system setting`, dark === (scheme === "dark"));
    if (scheme === "dark") {
      await p.getByRole("button", { name: "Toggle theme" }).click();
      await p.reload({ waitUntil: "load" });
      check("the toggle's choice survives a reload", !(await p.evaluate(() => document.documentElement.classList.contains("dark"))));
    }
    await p.context().close();
  }

  const nojs = await newPage(browser, { context: { javaScriptEnabled: false } });
  await nojs.waitForTimeout(1200);
  const t = await nojs.locator("#content [data-enter] dd[aria-live=polite]").innerText();
  const op = await nojs.locator("#content [data-enter] .enter-figure").last().evaluate((el) => getComputedStyle(el).opacity);
  check("without JavaScript the worksheet shows its starting figures", t === "$586,610" && op === "1", `${t} opacity=${op}`);
  await nojs.context().close();

  const shots = [
    ["desktop-light", { width: 1440, height: 900 }, "light"],
    ["desktop-dark", { width: 1440, height: 900 }, "dark"],
    ["phone-light", { width: 390, height: 844 }, "light"],
    ["phone-dark", { width: 390, height: 844 }, "dark"],
  ];
  for (const [name, viewport, theme] of shots) {
    const p = await newPage(browser, { context: { viewport, reducedMotion: "reduce" }, theme });
    await p.waitForTimeout(500);
    await p.screenshot({ path: path.join(SHOTS, `${name}-fold.png`) });
    await p.screenshot({ path: path.join(SHOTS, `${name}-full.png`), fullPage: true });
    check(`${name}: no failed requests or errors`, p.failures.length === 0, p.failures.join(" || "));
    await p.context().close();
  }
});
```

- [ ] **Step 2: Run the checks**

Run the browser check procedure.
Expected: all groups PASS. If the focus walk reports misses, fix the named element's focus style in its
component (its focus outline must be ≥ 2px, from the global `:focus-visible` rule or an `outline-*`
utility) and re-run.

- [ ] **Step 3: Review the screenshots against the spec**

Open each of `.superpowers/checks/shots/{desktop,phone}-{light,dark}-{fold,full}.png` with the Read tool
and confirm:
- The name sets on two lines, "Anesh Thapa" / "Magar".
- On the desktop first screen: photo, name, tagline, action and facts on the left; the worksheet with the
  margin line and double-ruled total on the right.
- On the phone: worksheet under the action, facts under the worksheet.
- Every section has its heading on the left (stacked on phones) and a single rule above it.
- No gold anywhere; margin red only on the worksheet margin line and total rules.

Fix anything that doesn't match, then re-run step 2.

- [ ] **Step 4: Sweep for leftovers**

```bash
grep -rnE "(text|bg|border|ring|outline)-accent|--accent|accent-strong|SectionHeading|react-icons|ui/(badge|avatar|card|separator)|uppercase|tracking-widest|rounded-(full|xl|2xl)|font-mono|animate-fade|animate-float|heroStats|initials|og-image|ArrowRight|ArrowUpRight|&middot;|·" app components lib
grep -nE "react-avatar|react-separator|react-icons" package.json
```

Expected: no output from either command.

- [ ] **Step 5: Replace `CLAUDE.md`**

````markdown
@AGENTS.md

# Anesh Thapa Magar — Credit Analyst portfolio

Single-page Next.js 16 (App Router, Turbopack) portfolio for Anesh Thapa Magar, Credit Analyst at
ODIN Mortgage. Audience: recruiters and employers. Live at https://anesh-thapa.vercel.app.

The name is **Anesh**, not "Anish". The package name `anish-portfolio` and the GitHub repo
`portfolio-anish` predate that correction; don't rename them without asking.

**Keep this file current.** When a change touches structure, commands, compliance rules, design rules,
SEO, deployment or the placeholder list below, update this file in the same commit.

## Commands

- `npm run dev`: dev server
- `npm run build`: production build (must pass before pushing)
- `npm run lint`: ESLint
- `npm test`: Vitest unit tests (`**/*.test.ts`, config in `vitest.config.mts`), including the colour
  contrast test that reads `app/globals.css`

## Design system ("ledger")

The design spec is `docs/superpowers/specs/2026-09-24-ledger-redesign-design.md`. The page reads like a
credit analyst's working paper:

- **Palette:** colour tokens live in `app/globals.css` (`:root` and `.dark`), guarded by
  `lib/theme-contrast.test.ts` (text ≥ 4.5:1; input borders and focus ring ≥ 3:1). `--margin` (margin red)
  is decorative only, never text.
- **Type:** Libre Franklin only, via `next/font/google` in `app/layout.tsx`. Figures use
  `tabular-nums lining-nums`.
- **Accounting conventions:** deductions in brackets via `formatAccounting` (`lib/format.ts`), and the
  bottom line double-ruled in margin red.
- **Lines mean rows:** rules only where content really is rows. One grid, left-aligned. No all-caps labels,
  pills, stat tiles, eyebrow labels or per-section animations.
- **One motion moment:** the hero worksheet's figures fill in (the `[data-enter]` / `.enter-figure` /
  `.draw-rule` CSS in `globals.css`), and `prefers-reduced-motion` turns it off.
- **Radii:** `rounded-sm` 3px (flags), `rounded-md` 4px (sheets, inputs, photo), `rounded-lg` 6px (buttons).
- **Theme:** follows the visitor's system setting (`components/theme-provider.tsx`); the toggle overrides it.

## Structure

- `app/page.tsx` composes the page: header, Hero (`#content`), Profile (`#about`), Experience, Skills,
  Credit toolkit (`#toolkit`), Education, Contact, footer.
- `components/sections/section.tsx`: `Section` (heading column + content, top rule) and `containerClass`.
  Every section except the hero uses it.
- `components/sections/*`: one file per section.
- `components/calculators/*`: toolkit client components. `parts.tsx` holds `NumberField`, `ChoiceField`,
  `Slider`, `Worksheet` (`variant="hero"` animates), `Flag`, `Meter`, `Headline` and `Note`.
  `hero-worksheet.tsx` is the first-screen demo.
- `components/ui/*`: `button.tsx` (default / ghost / link) and `tabs.tsx` (Radix).
- `lib/content.ts`: single source for all copy and data (profile, hero facts, hero worksheet figures,
  experience, skills, education, toolkit copy, checklist items, contact). Edit content here, not in
  components.
- `lib/contact.ts`: which actions show while email or resume are missing.
- `lib/calculators.ts`: pure calculation logic plus `ASSUMPTIONS`; covered by `lib/calculators.test.ts`.
- `lib/format.ts`: AUD, accounting, percent and year formatting.
- Next 16 notes: `next/image` `priority` is deprecated, so use `loading="eager"` plus `fetchPriority="high"`;
  `images.qualities` defaults to `[75]`.

## Credit Toolkit rules (compliance)

The toolkit is educational and recruiter-facing. It runs entirely in the browser: no data is sent or
stored, and there is no lead capture.

- Keep the framing general and educational. Keep `toolkit.disclaimer` and the per-tool notes.
- Never present a rate as a current rate. Rate inputs are labelled "Example rate".
- Policy figures (3% APRA buffer, 3.8% card-limit factor, LVR bands 60/80/90/95, DTI bands 4/6) live only
  in `ASSUMPTIONS`. Confirm them against current APRA and lender guidance before changing, and update any
  UI copy that mentions them in the same change. The hero worksheet and the share image read the same
  values.
- No ATO tax tables or HEM figures: serviceability deliberately takes after-tax income.
- Changes to the maths get a failing test first (`npm test`).

## SEO & Search Console

- `siteConfig.baseUrl` in `lib/content.ts` feeds metadata, canonical URL, sitemap and robots.
  Currently `https://anesh-thapa.vercel.app`.
- `app/sitemap.ts`, `app/robots.ts`, `components/seo/JsonLd.tsx` (Person schema with photo); metadata in
  `app/layout.tsx`.
- Link previews come from `app/opengraph-image.tsx` (`ImageResponse`), which uses the Libre Franklin TTFs
  vendored in `assets/fonts/` (OFL). Keep fonts plus JSX under the 500KB `ImageResponse` limit.
- Google Search Console: URL-prefix property for `https://anesh-thapa.vercel.app`, verified with the
  HTML-file method. **Never delete or rename `public/googlece94c736c051e53f.html`**: Google re-checks it,
  and verification is lost if it 404s. Sitemap submitted 2026-09-21.
- Moving to a custom domain means: update `baseUrl`, add a new GSC property, resubmit the sitemap.

## Deployment

Vercel auto-deploys on every push to `main` (remote `origin` is
`git@github-personal:manojkiranti/portfolio-anish.git`), so pushing to `main` is a production deploy.
Other branches normally get a Vercel preview URL.

## Open placeholders

- `siteConfig.email` is `null`. Actions show "Message on LinkedIn" until a real address is set.
- `siteConfig.resumeUrl` is `null`. Resume links are hidden until the PDF is in `public/` and its path is set.
- Master of Arts in Economics end year: shown as "2024 – now".
- The second `experience` entry (company and dates) and the first entry's dates.
````

- [ ] **Step 6: Final verification**

Run: `npm test && npx tsc --noEmit && npm run lint && npm run build`, then the browser check procedure.
Expected: all unit tests, the build and every browser group pass.

- [ ] **Step 7: Commit**

```bash
git add CLAUDE.md
git commit -m "$(cat <<'EOF'
Document the ledger design system and updated placeholders

CLAUDE.md now records the palette and contrast test, type, accounting
conventions, section layout, share image and the LinkedIn/resume
fallbacks, so future edits keep to the redesign.

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 8: Hand back to the user**

Stop here. Report the branch state, including `git log --oneline main..redesign-ledger`, and ask whether to
push `redesign-ledger` for a Vercel preview. Do not push without an explicit yes.
