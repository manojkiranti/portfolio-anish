// ---------------------------------------------------------------------------
// SINGLE SOURCE OF CONTENT
// Every placeholder string below is marked "[PLACEHOLDER]" or otherwise
// noted. Replace with real details, then the "[PLACEHOLDER]" markers can be
// removed from any strings that show them literally (none are shown to
// visitors as-is — they're just comments/flags for you while editing).
// ---------------------------------------------------------------------------

import type { ChecklistItem } from "@/lib/calculators";
import { buildContactAction, buildHeroActions } from "@/lib/contact";

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

export const about = {
  heading: "Profile",
  paragraphs: [
    "Anesh is a Credit Analyst with four years of experience assessing residential and investment lending applications for Australian borrowers. Splitting his time between Nepal and Australia, he combines meticulous financial analysis with a genuine understanding of the pressures brokers and clients face when navigating a loan application.",
    "At ODIN Mortgage, an Australian mortgage broker, he works closely with brokers to structure serviceability calculations, verify supporting documentation, and get complex applications loan-ready — turning around clean, lender-friendly submissions that move files forward with fewer conditions and less back-and-forth.",
  ],
};

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

export type SkillGroup = {
  heading: string;
  skills: string[];
};

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

export const toolkit = {
  heading: "Credit toolkit",
  intro: "The core checks behind a credit assessment, as working calculators.",
  disclaimer:
    "Illustrative only. These tools show general assessment logic. They are not financial advice or credit assistance, and every lender's policy differs. Nothing you enter leaves your browser.",
};

export const checklistGroups: { heading: string; items: ChecklistItem[] }[] = [
  {
    heading: "Identity",
    items: [
      {
        id: "id",
        label: "Photo ID plus secondary ID",
        hint: "Passport or driver licence, plus e.g. a Medicare card, for verification of identity.",
        critical: true,
        appliesTo: ["payg", "self-employed"],
      },
    ],
  },
  {
    heading: "Income",
    items: [
      {
        id: "payslips",
        label: "Two most recent payslips",
        critical: true,
        appliesTo: ["payg"],
      },
      {
        id: "income-statement",
        label: "Latest income statement (PAYG summary)",
        hint: "Supports bonus, overtime or allowance income.",
        critical: false,
        appliesTo: ["payg"],
      },
      {
        id: "employment-letter",
        label: "Employment letter",
        hint: "Needed if on probation, recently changed jobs, or relying on variable pay.",
        critical: false,
        appliesTo: ["payg"],
      },
      {
        id: "tax-returns",
        label: "Two years of personal & business tax returns",
        critical: true,
        appliesTo: ["self-employed"],
      },
      {
        id: "noas",
        label: "Matching ATO notices of assessment",
        critical: true,
        appliesTo: ["self-employed"],
      },
      {
        id: "bas",
        label: "Recent BAS statements",
        hint: "Shows current-year trading since the last return.",
        critical: false,
        appliesTo: ["self-employed"],
      },
    ],
  },
  {
    heading: "Banking & liabilities",
    items: [
      {
        id: "transaction-statements",
        label: "Three months of transaction account statements",
        hint: "Used to verify living expenses and spot undisclosed debts.",
        critical: true,
        appliesTo: ["payg", "self-employed"],
      },
      {
        id: "savings",
        label: "Savings statements showing the deposit",
        hint: "Shows where the deposit and purchase costs are coming from.",
        critical: true,
        appliesTo: ["payg", "self-employed"],
      },
      {
        id: "liabilities",
        label: "Statements for every existing loan and credit card",
        critical: true,
        appliesTo: ["payg", "self-employed"],
      },
      {
        id: "help",
        label: "HELP / HECS balance, if any",
        hint: "From myGov. Repayments reduce serviceability.",
        critical: false,
        appliesTo: ["payg", "self-employed"],
      },
    ],
  },
  {
    heading: "Property",
    items: [
      {
        id: "contract",
        label: "Signed contract of sale (or current loan statements for a refinance)",
        hint: "Not needed for a pre-approval.",
        critical: false,
        appliesTo: ["payg", "self-employed"],
      },
    ],
  },
];

export type EducationEntry = {
  qualification: string;
  institution: string;
  period: string;
};

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
