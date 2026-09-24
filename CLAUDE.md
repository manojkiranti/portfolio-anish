@AGENTS.md

# Anesh Thapa Magar — Credit Analyst portfolio

Single-page Next.js 16 (App Router, Turbopack) portfolio for Anesh Thapa Magar, Credit Analyst at
ODIN Mortgage. Audience: recruiters and employers. Live at https://anesh-thapa.vercel.app.

The name is **Anesh**, not "Anish". The package name `anish-portfolio` and the GitHub repo
`portfolio-anish` predate that correction; don't rename them without asking.

**Keep this file current.** When a change touches structure, commands, compliance rules, SEO,
deployment or the placeholder list below, update this file in the same commit.

## Commands

- `npm run dev`: dev server
- `npm run build`: production build (must pass before pushing)
- `npm run lint`: ESLint
- `npm test`: Vitest unit tests (`**/*.test.ts`, config in `vitest.config.mts`)

## Structure

- `app/page.tsx` composes the sections in order: Hero, About, Experience, Skills, Toolkit,
  Education, Contact. Backgrounds alternate (`bg-secondary/40` on every other section); keep that
  rhythm when adding or reordering sections.
- `components/sections/*`: one file per section. `SectionHeading` lives in `about.tsx`.
- `components/ui/*`: shadcn-style primitives on Radix (avatar, tabs, slot).
- `components/calculators/*`: Credit Toolkit client components. `parts.tsx` holds the shared
  number input, option picker, worksheet, meter and badges.
- `lib/content.ts`: single source for all copy and data (profile, experience, skills, education,
  toolkit copy, checklist items). Edit content here, not in components.
- `lib/calculators.ts`: pure calculation logic plus `ASSUMPTIONS`; covered by
  `lib/calculators.test.ts`.
- `lib/format.ts`: AUD, percent and year formatting.
- Theme: `next-themes`, dark by default (`components/theme-provider.tsx`). Colour tokens are in
  `app/globals.css` under `:root` and `.dark`, including `success` and `warning` for result tones.

## Credit Toolkit rules (compliance)

The toolkit is educational and recruiter-facing. It runs entirely in the browser: no data is sent
or stored, and there is no lead capture.

- Keep the framing general and educational. Keep `toolkit.disclaimer` and the per-tool notes.
- Never present a rate as a current rate. Rate inputs are labelled "Example rate".
- Policy figures (3% APRA buffer, 3.8% card-limit factor, LVR bands 60/80/90/95, DTI bands 4/6)
  live only in `ASSUMPTIONS`. Confirm them against current APRA and lender guidance before
  changing, and update any UI copy that mentions them in the same change.
- No ATO tax tables or HEM figures: serviceability deliberately takes after-tax income.
- Changes to the maths get a failing test first (`npm test`).

## SEO & Search Console

- `siteConfig.baseUrl` in `lib/content.ts` feeds metadata, canonical URL, sitemap and robots.
  Currently `https://anesh-thapa.vercel.app`.
- `app/sitemap.ts`, `app/robots.ts`, `components/seo/JsonLd.tsx` (Person schema); metadata in
  `app/layout.tsx`.
- Google Search Console: URL-prefix property for `https://anesh-thapa.vercel.app`, verified with
  the HTML-file method. **Never delete or rename `public/googlece94c736c051e53f.html`**: Google
  re-checks it, and verification is lost if it 404s. Sitemap submitted 2026-09-21.
- Moving to a custom domain means: update `baseUrl`, add a new GSC property, resubmit the sitemap.

## Deployment

Vercel auto-deploys on every push to `main` (remote `origin` is
`git@github-personal:manojkiranti/portfolio-anish.git`), so pushing to `main` is a production
deploy.

## Open placeholders

- `siteConfig.email`: placeholder address
- `public/resume.pdf`: missing. The Resume links 404, and Next's link prefetch logs a 404 in the
  console.
- `public/og-image.jpg` (1200×630): missing, but referenced in `app/layout.tsx` for link previews
- Master of Arts in Economics end year: shown as "2024 — Present"
- `heroStats` "1,000+ applications", and the second `experience` entry (company and dates)
