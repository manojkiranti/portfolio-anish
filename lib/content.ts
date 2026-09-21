// ---------------------------------------------------------------------------
// SINGLE SOURCE OF CONTENT
// Every placeholder string below is marked "[PLACEHOLDER]" or otherwise
// noted. Replace with real details, then the "[PLACEHOLDER]" markers can be
// removed from any strings that show them literally (none are shown to
// visitors as-is — they're just comments/flags for you while editing).
// ---------------------------------------------------------------------------

export const siteConfig = {
  name: "Anesh Thapa Magar",
  initials: "ATM",
  title: "Credit Analyst",
  tagline: "Turning complex financial profiles into confident lending decisions.",
  baseUrl: "https://anesh-thapa.vercel.app",
  locationShort: "Nepal & Australia",
  email: "anish.thapamagar@example.com", // PLACEHOLDER — replace with real email
  linkedin: "https://www.linkedin.com/in/anesh-thapa-magar-aa29501a0/",
  resumeUrl: "/resume.pdf", // add the real file to /public/resume.pdf
  avatarImage: "/profile.jpg",
};

export const heroStats = [
  { label: "Years Experience", value: "4+" },
  { label: "Applications Assessed", value: "1,000+" }, // PLACEHOLDER figure
  { label: "Based Across", value: "2 Countries" },
  { label: "Currently At", value: "ODIN Mortgage" },
];

export const about = {
  heading: "About",
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
  current?: boolean;
  bullets: string[];
};

export const experience: ExperienceEntry[] = [
  {
    role: "Credit Analyst",
    company: "ODIN Mortgage",
    location: "Australia (remote from Nepal & Australia)",
    period: "2023 — Present", // PLACEHOLDER dates
    current: true,
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
    period: "2021 — 2023", // PLACEHOLDER dates
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
    heading: "Credit & Risk Assessment",
    skills: [
      "Serviceability Analysis",
      "Credit Risk Assessment",
      "Financial Statement Analysis",
      "Loan Structuring",
    ],
  },
  {
    heading: "Compliance & Lending",
    skills: [
      "Responsible Lending (NCCP)",
      "AML / KYC Verification",
      "Lender Policy Interpretation",
      "Documentation Review",
    ],
  },
  {
    heading: "Tools & Communication",
    skills: [
      "Loan Management CRMs",
      "Microsoft Excel / Financial Modelling",
      "Broker & Lender Liaison",
      "Attention to Detail",
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
    period: "2018 — 2024",
  },
  {
    qualification: "Master of Arts in Economics",
    institution: "Tribhuvan University, Nepal",
    period: "2024 — Present", // PLACEHOLDER — confirm exact end year
  },
];

export const contactCards = [
  {
    label: "Email",
    value: siteConfig.email,
    href: `mailto:${siteConfig.email}`,
  },
  {
    label: "LinkedIn",
    value: "linkedin.com/in/anesh-thapa-magar-aa29501a0",
    href: siteConfig.linkedin,
  },
  {
    label: "Location",
    value: "Nepal & Australia",
    href: undefined,
  },
];
