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
  bottom line double-ruled in margin red. On narrow screens the total wraps below its label rather than
  overflowing.
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
  vendored in `assets/fonts/` (OFL). Keep fonts plus JSX under the 500KB `ImageResponse` limit, and never
  pass `undefined` for a style property there: Satori calls `.trim()` on every value and the build fails.
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
- Master of Arts in Economics end year: shown as "2024 – now".
- The second `experience` entry (company and dates) and the first entry's dates.
