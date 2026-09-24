# Ledger redesign: design spec

- Date: 2026-09-24
- Branch: `redesign-ledger`
- Status: design approved in brainstorming; spec awaiting review

## Goal

Replace the portfolio's generic look with a visual identity specific to Anesh's work. The site should
read like a credit analyst's working paper, and the first screen should show his skill, not just
state it.

- **Subject:** Anesh Thapa Magar, Credit Analyst assessing Australian residential and investment
  loans for ODIN Mortgage, working between Nepal and Australia.
- **Audience:** recruiters and hiring managers at lenders, brokers and aggregators.
- **Primary job:** within the first screen, show he reads a loan file the way a lender does, then get
  the visitor to open his resume or get in touch.
- **Identity:** his own, not ODIN's brand. ODIN appears only as his employer, in the copy.

### Success criteria

1. On a 1440×900 desktop, the name, photo, role line, live worksheet and a contact action are all
   visible without scrolling. On a 390×844 phone, the name, role line and primary action are.
2. None of the telltale signs of a templated page remain: no ALL-CAPS labels above headings, no
   big-number stat tiles, no pill badges, no per-section fade-up or float animations, no "A · B" dot-separated text, no arrows
   appended to button text, no floating pill header.
3. Accessibility: WCAG AA text contrast (4.5:1) for every text and background pair in both themes,
   3:1 for input borders and focus indicators (WCAG 1.4.11), visible keyboard focus on every
   interactive element, and reduced motion respected.
4. Nothing on the page leads to a missing file or a fake address (no 404s, no example.com email).
5. The existing 35 unit tests still pass. New tests cover the new logic. `npm run build` and
   `npm run lint` are clean, and the page loads with no console errors or failed requests.

### Out of scope

New real content (email, resume PDF, previous employer, Masters end year), a custom domain,
analytics, changes to the toolkit maths or `ASSUMPTIONS`, lead capture, and ODIN branding.

## Design principles

1. **It behaves like a working paper.** Figures are tabular and right-aligned. Amounts that are
   subtracted are shown in brackets, e.g. `(3,500)`, and the bottom-line total gets a double underline
   in margin red.
2. **Lines mean rows.** A rule appears only where content really is rows: worksheet lines, hero facts,
   experience and education entries, skill lists, contact rows, and the single rule between sections.
   No decorative rules, and no newspaper-style dense columns.
3. **One grid, left-aligned.** One content width, with headings in a left column like account names in
   a ledger.
4. **One bold element: the live hero worksheet.** Everything around it stays quiet.
5. **One motion moment.** On first load the hero worksheet's figures fill in row by row, then the
   double underline draws in. Nothing else animates on its own. With `prefers-reduced-motion: reduce`
   the finished state shows straight away.

## Design tokens

Token names stay the same so existing Tailwind classes keep working. Only the values change, plus
one new token, `--margin`.

| Token | Role | Light | Dark |
|---|---|---|---|
| `--background` | Ledger paper (page) | `#F3F6F1` | `#0E1511` |
| `--card` | Sheet (worksheets, inputs) | `#FFFFFF` | `#151F19` |
| `--foreground` / `--primary` | Ink (text, primary button) | `#14211A` | `#E7EEE8` |
| `--primary-foreground` | Text on ink | `#F3F6F1` | `#0E1511` |
| `--muted-foreground` | Pencil (secondary text) | `#4A5A50` | `#9FB0A4` |
| `--border` | Ledger rule (row lines) | `#C9D8CB` | `#2B3B31` |
| `--input` | Input borders (≥ 3:1 on sheet) | `#7F9284` | `#5E7265` |
| `--secondary` / `--muted` | Quiet fill (hover, selected option) | `#E7EEE5` | `#1B2820` |
| `--margin` (new) | Margin red: ledger margin line, total double rule | `#D98F88` | `#C4736C` |
| `--ring` | Focus ring | `#14211A` | `#E7EEE8` |
| `--success` | Good result | `#1F6B3A` | `#6FCB8E` |
| `--warning` | Caution result | `#9A5B07` | `#E8A94B` |
| `--destructive` | Risk result | `#B3261E` | `#F2837B` |

`--accent` and `--accent-strong` (the current gold) are removed, and every use is replaced. Margin
red is decorative only and never used for text. If the contrast check fails for any value in the
table, adjust that value and record it in this spec.

### Type

Libre Franklin only (variable, weights 400–800), loaded with `next/font/google`, replacing Geist and
Geist Mono. Scale:

| Role | Size / line-height | Weight | Notes |
|---|---|---|---|
| Display (name) | 72px / 0.95 (44px phones) | 800 | letter-spacing −0.025em, max-width 9ch so it sets on two lines, "Anesh Thapa" / "Magar" (confirm in screenshots) |
| Section heading | 36px / 1.1 (28px phones) | 700 | letter-spacing −0.015em |
| Lead | 21px / 1.45 (18px phones) | 400 | pencil colour, max 30ch |
| Body | 18px / 1.55 (16px phones) | 400 | max 62–68ch |
| Small / labels | 14px / 1.45 | 500 | sentence case, never all caps |
| Figures | inherit | inherit | `font-variant-numeric: tabular-nums lining-nums` |

### Layout

- Container max-width 1120px. Gutters are 40px on desktop and 16px on phones.
- Each section is a 12-column grid from `md` up: heading in columns 1–3 (with an optional short note
  under it), content in 4–12. On phones it's one column, with the heading above the content.
- Every section has a 1px `--border` rule on top. There are no alternating section backgrounds.
- Radii: 4px for worksheets, inputs and the photo; 6px for buttons; 3px for result flags. No shadows.

## Page, section by section

Section order is unchanged: header, hero, Profile, Experience, Skills, Credit toolkit, Education,
Contact, footer. Anchor ids stay the same (`#about`, `#experience`, `#skills`, `#toolkit`,
`#education`, `#contact`).

### Header

A sticky flat bar on paper with a bottom rule, about 56px tall, with no blur and no floating pill.

- **Left:** "Anesh Thapa Magar" (15px, 700). It links to the top of the page.
- **Right (md and up):** Profile (`#about`), Experience, Toolkit and Contact; a Resume link (only if
  `siteConfig.resumeUrl` is set); the theme toggle.
- **Phones:** name, Resume (if set) and the theme toggle.

### Hero

- **Desktop:** two columns, 7/5.
  - **Left:** a 88px square photo (radius 4px), the name at display size, the lead line
    "Credit Analyst assessing Australian home loans the way the lender will.", the actions, then
    three ruled fact rows: Currently / Credit Analyst, ODIN Mortgage; Experience / 4+ years in
    Australian lending; Based / Nepal and Australia.
  - **Right:** the hero worksheet.
- **Phones:** photo (72px), name, lead and actions, then the worksheet, then the facts.
- **Actions:**
  - The contact action is "Email Anesh" (`mailto:`) when `siteConfig.email` is set, otherwise
    "Message on LinkedIn" (opens `siteConfig.linkedin` in a new tab).
  - Primary button: "Download resume" when `siteConfig.resumeUrl` is set, otherwise the contact
    action.
  - Secondary, as an underlined link: the contact action, but only when the resume is the primary.
- **Photo:** `public/anesh-thapa-magar.jpg`, re-encoded from the current headshot at 704×704 as a
  quality-82 JPEG. Rendered with `next/image` at 88×88 (72 on phones), `priority`, alt
  "Anesh Thapa Magar". The old `public/profile.jpg` (a 1.5 MB PNG) is deleted.

### Hero worksheet (new client component)

A compact serviceability check laid out like a ledger sheet: sheet background, 1px `--border` frame,
4px radius, and a 1px margin-red vertical line inset from the left edge.

- **Header row:** "Serviceability check", with "Move the sliders" in small pencil text.
- **Rows, in order:**
  1. Net monthly income, with a slider under it
  2. Living expenses (bracketed), with a slider under it
  3. Other loan repayments (bracketed)
  4. Card limits at 3.8% of $10,000 (bracketed)
  5. Monthly surplus, as a subtotal with a 1px ink rule above; bracketed if negative
  6. The assessment note: "Assessed at 6.00% + 3.00% buffer, 30 years", then "9.00%"
  7. Borrowing capacity, the total: 30px, 800 weight, with a 4px double underline in `--margin`.
     It shows "No capacity" when the surplus is zero or less.
- **Footer:** "Illustrative only. Not financial advice or credit assistance." plus a link, "Open the
  full toolkit", to `#toolkit`.
- **Inputs:** income 4,000–20,000, step 100, default 9,000; expenses 1,500–10,000, step 100,
  default 3,500.
- **Fixed values:** other repayments 400, card limits 10,000, example rate 6.00%, term 30 years.
  These live in `lib/content.ts` as `heroWorksheet`:

  ```ts
  heroWorksheet = {
    income: { min: 4_000, max: 20_000, step: 100, initial: 9_000 },
    expenses: { min: 1_500, max: 10_000, step: 100, initial: 3_500 },
    otherMonthlyRepayments: 400,
    creditCardLimits: 10_000,
    annualRatePct: 6,
    termYears: 30,
  }
  ```

  The buffer and card factor come from `ASSUMPTIONS`, so the maths is `calculateServiceability`,
  unchanged.
- **Accessibility:**
  - Each slider is labelled by its row label and has an `aria-valuetext` such as "$9,000 a month".
  - The total sits in an `aria-live="polite"` region.
  - Sliders use `accent-color: var(--foreground)` and get the standard focus ring.
- **Motion:**
  - Value cells fade in with a 60ms stagger (about 7 rows, roughly 450ms), then the double
    underline grows from the left over 300ms.
  - This is pure CSS, so it works from the server-rendered HTML with no JavaScript needed.
  - With `prefers-reduced-motion: reduce` there is no animation.

### Profile (`#about`)

Heading "Profile". The two existing paragraphs, unchanged, at body size with a max width of 62ch.

### Experience

Each role is an entry with two inner columns: the date (130px, pencil, tabular) and the details. The
details are the role (19px, 700), then company and location (pencil), then bullets (15.5px, pencil
markers). Entries are separated by rules. Periods display as "2023 – now" and "2021 – 2023", with an
en dash. The "Current" badge and the `current` field are removed. On phones the date sits above
each entry.

### Skills

Three columns (one on phones), each a group heading (16px, 700) followed by a plain ruled list with
no pills.

- **Group headings:** "Credit & risk", "Compliance & lending", "Tools & communication".
- **Skill names:** in sentence case, e.g. "Serviceability analysis", "Responsible lending (NCCP)",
  "Excel and financial modelling".

### Credit toolkit

- **Heading:** "Credit toolkit", with the note "The core checks behind a credit assessment, as
  working calculators."
- **Tabs:** underlined text tabs (active tab: ink, 700, 2px ink underline; others pencil) on a
  bottom rule, in a 2×2 grid on phones. The tabs keep their keyboard behaviour (Radix Tabs) and all
  four panels stay mounted.
- **Surfaces:** each tool sits directly in the section with no card chrome. Worksheets use the hero's
  sheet style (margin line, rules, tabular figures).
- **Worksheet rows:**
  - The `op` column (−, =) is removed.
  - Subtracted amounts show in brackets. Plain figures carry no `$`, except totals and headline
    figures.
  - Subtotals get a 1px ink rule above.
  - Each tool's bottom line gets the double underline: borrowing capacity (serviceability) and
    total repaid (repayments).
- **Other styling:**
  - Headline figures are in ink, not gold.
  - The two explanation boxes ("Why the buffer matters", and the repayment jump at the end of
    interest-only) lose their box. Each becomes a short paragraph under the worksheet, led by a
    700-weight sentence; the interest-only one leads in `--warning`.
  - Tab labels lose their icons, as in the mockup.
  - Result flags become squared labels: 1px border in the tone colour, tone-coloured text,
    transparent background, 3px radius, 13px 600.
  - Meters keep their shape with the new tone colours.
  - Inputs: sheet background, `--input` border, 4px radius.
  - The option pickers keep native radios; the selected option gets the `--secondary` fill.
- The disclaimer stays under the tabs. The copy in `toolkit.disclaimer` is unchanged.

### Education

Ruled rows with two columns: period (130px, pencil) and "Qualification, Institution". Periods are
"2018 – 2024" and "2024 – now". No graduation-cap icons, no cards.

### Contact

- **Heading:** "Contact".
- **Content:**
  - A 24px 600 sentence: "Open to credit analyst roles and conversations about Australian lending."
  - Ruled rows: Email (only if `siteConfig.email` is set), LinkedIn (linked), Based.
  - One primary button: the contact action.
- The three centred cards are removed.

### Footer

A top rule. "© {year} Anesh Thapa Magar" on the left and "Back to top" (a link to `#`) on the right,
14px pencil.

## Content changes (`lib/content.ts`)

- `siteConfig.email`: `null`, since the current value is a placeholder. The type becomes
  `string | null`.
- `siteConfig.resumeUrl`: `null` until a PDF exists. Type `string | null`.
- `siteConfig.avatarImage`: `/anesh-thapa-magar.jpg`.
- `siteConfig.tagline`: "Credit Analyst assessing Australian home loans the way the lender will."
  It's also used in the metadata and share image.
- Remove `heroStats`, which also clears the "1,000+ applications" placeholder.
- Add `heroFacts` (the three rows above) and `heroWorksheet` (the fixed values and slider ranges
  above).
- `about.heading`: "Profile".
- `experience`: periods switch to en dashes with "now", and the `current` field is removed.
- `skillGroups`: new headings and sentence-case skill names.
- `education`: periods switch to en dashes with "now".
- `toolkit`: remove `eyebrow`. `heading` becomes "Credit toolkit", `intro` becomes the short note
  above, and `disclaimer` is unchanged.
- Replace `contactCards` with `contact`: `{ sentence, rows }`. The rows are built from `siteConfig`,
  with the email row only when an email is set.

## Behaviour and platform

- **Theme:** `ThemeProvider` uses `defaultTheme="system"` and `enableSystem`, and the toggle stays.
  The viewport `themeColor` becomes `#F3F6F1` for light and `#0E1511` for dark.
- **Share image:**
  - Add `app/opengraph-image.tsx`, a 1200×630 PNG generated with `ImageResponse`: ledger paper,
    name, tagline, a small worksheet column showing the default figures with the double rule, and
    the margin line.
  - Libre Franklin TTF files for it are vendored in `assets/fonts/` (SIL Open Font License,
    license file included).
  - Remove the manual `openGraph.images` and `twitter.images` entries pointing at the missing
    `/og-image.jpg`.
- **Structured data:** `components/seo/JsonLd.tsx` adds `image` (an absolute URL to the photo).
- **Removed components:** `components/ui/avatar.tsx`, `badge.tsx`, `card.tsx` and `separator.tsx`,
  and the `@radix-ui/react-avatar` and `@radix-ui/react-separator` packages. `react-icons` is also
  removed: its only use is the LinkedIn icon, and the redesign has no icon in the header or contact
  rows. `lucide-react` stays (theme toggle, checklist tick, disclaimer icon).
- **Button variants:** `components/ui/button.tsx` is reduced to what's used: `default` (ink),
  `ghost` (icon buttons) and `link`.

## Files

- **Create:**
  - `components/sections/section.tsx` (the shared heading-column layout; replaces `SectionHeading`)
  - `components/calculators/hero-worksheet.tsx`
  - `app/opengraph-image.tsx`
  - `assets/fonts/LibreFranklin-*.ttf` and `OFL.txt`
  - `public/anesh-thapa-magar.jpg`
  - `lib/format.test.ts`
- **Modify:**
  - `app/globals.css`, `app/layout.tsx`
  - `components/theme-provider.tsx`, `components/site-header.tsx`, `components/site-footer.tsx`
  - `components/sections/{hero,about,experience,skills,toolkit,education,contact}.tsx`
  - `components/calculators/{parts,serviceability,repayments,lvr-dti,file-readiness}.tsx`
  - `components/ui/{tabs,button}.tsx`, `components/seo/JsonLd.tsx`
  - `lib/content.ts`, `lib/format.ts`, `lib/calculators.test.ts` (the hero-defaults test),
    `CLAUDE.md`, `package.json`, `package-lock.json`
- **Delete:**
  - `components/ui/{avatar,badge,card,separator}.tsx`
  - `public/profile.jpg`

## Testing

1. **Unit tests (Vitest), written first:**
   - `formatAccounting` handles a positive figure, a deduction, a negative, zero and rounding.
   - `calculateServiceability` with the `heroWorksheet` defaults gives $586,610, so the hero and
     the maths can't drift apart.
   - The existing 35 tests still pass.
2. **Contrast check:** a scratch script computes the WCAG ratio for every text and background pair in
   both themes (ink, pencil and the three tones, each on paper and sheet, plus paper text on the ink
   button). Every pair must be at least 4.5:1. `--input` and `--ring` must be at least 3:1 against
   paper and sheet.
3. **Browser checks (Playwright, headless Chrome), against `next start`:**
   - Hero: the sliders change the surplus and the capacity. Dragging expenses past income shows a
     bracketed surplus and "No capacity". Arrow keys on a slider change its value.
   - Reduced motion: worksheet cells have no animation.
   - With no resume and no email: no Resume link, the primary action is "Message on LinkedIn", and
     no request returns 4xx or 5xx.
   - `/opengraph-image` returns 200 as `image/png`, and the page's `og:image` points to it.
   - The existing toolkit checks still pass after updating their selectors.
   - Keyboard focus is visible on links, buttons, tabs and sliders.
   - No sideways scrolling at 390px on any tab.
   - Screenshots of the full page in light and dark, at 1440 and 390 wide, reviewed against this
     spec.
4. `npm run build` and `npm run lint` are clean.

## Rollout

1. Implement on `redesign-ledger`. Commit the `CLAUDE.md` update in the same branch, covering
   structure, fonts, theme default, section layout, the hero worksheet and the placeholder list.
2. With the user's go-ahead, push the branch. Vercel normally creates a preview deployment for it,
   and the user reviews the preview URL.
3. With the user's go-ahead, merge to `main`, which is the production deploy to
   https://anesh-thapa.vercel.app.

## Risks

- **Numbers crowding out the person:** mitigated by the display-size name, the photo and the facts
  column, which take seven of twelve columns.
- **Share image font files add about 200 KB to the repo:** they're only loaded when the image is
  generated, never sent to visitors.
- **Hiding the email and resume removes two actions:** this is intentional until real ones exist. It
  goes in `CLAUDE.md`'s placeholder list, so adding them later is a one-line change each.
