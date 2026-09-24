// Pure calculation logic for the Credit Toolkit. No React, no side effects.
//
// Every policy figure lives in ASSUMPTIONS. These are illustrative defaults,
// not verified current settings — confirm each against current APRA guidance
// and lender policy before changing the copy that describes them.

export const ASSUMPTIONS = {
  // APRA's serviceability buffer; 3 percentage points since Oct 2021. Confirm current setting.
  serviceabilityBufferPct: 3,
  // Monthly commitment assessed per $1 of credit card limit. Common lender assumption; varies by lender.
  creditCardMonthlyFactor: 0.038,
  lowLvrMax: 60,
  // Above this LVR most lenders require Lenders Mortgage Insurance (schemes/professions excepted).
  lmiLvrThreshold: 80,
  highLvrMax: 90,
  typicalMaxLvr: 95,
  moderateDti: 4,
  // APRA treats DTI of 6x or more as high-DTI lending. Confirm current APRA settings.
  highDti: 6,
} as const;

export type Frequency = "weekly" | "fortnightly" | "monthly";

export const PERIODS_PER_YEAR: Record<Frequency, number> = {
  weekly: 52,
  fortnightly: 26,
  monthly: 12,
};

export function amortisedRepayment(
  principal: number,
  annualRatePct: number,
  years: number,
  periodsPerYear = 12,
): number {
  const n = Math.round(years * periodsPerYear);
  if (principal <= 0 || n <= 0) return 0;
  const r = annualRatePct / 100 / periodsPerYear;
  if (r === 0) return principal / n;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

export function interestOnlyRepayment(
  principal: number,
  annualRatePct: number,
  periodsPerYear = 12,
): number {
  if (principal <= 0) return 0;
  return (principal * annualRatePct) / 100 / periodsPerYear;
}

// Largest monthly P&I loan whose repayment equals `monthlyRepayment`.
export function maxLoanFromRepayment(
  monthlyRepayment: number,
  annualRatePct: number,
  years: number,
): number {
  const n = Math.round(years * 12);
  if (monthlyRepayment <= 0 || n <= 0) return 0;
  const r = annualRatePct / 100 / 12;
  if (r === 0) return monthlyRepayment * n;
  return (monthlyRepayment * (1 - Math.pow(1 + r, -n))) / r;
}

export type RepaymentInput = {
  principal: number;
  annualRatePct: number;
  termYears: number;
  frequency: Frequency;
  type: "pi" | "io";
  ioYears: number;
};

export type RepaymentResult = {
  repayment: number;
  revertRepayment?: number;
  totalInterest: number;
  totalPaid: number;
};

export function calculateRepayments(input: RepaymentInput): RepaymentResult {
  const { principal, annualRatePct, termYears, frequency, type } = input;
  const periods = PERIODS_PER_YEAR[frequency];

  if (type === "pi") {
    const repayment = amortisedRepayment(principal, annualRatePct, termYears, periods);
    const totalPaid = repayment * Math.round(termYears * periods);
    return { repayment, totalInterest: Math.max(0, totalPaid - principal), totalPaid };
  }

  // Leave at least one year of P&I so the loan still amortises.
  const ioYears = Math.min(Math.max(input.ioYears, 0), Math.max(termYears - 1, 0));
  const repayment = interestOnlyRepayment(principal, annualRatePct, periods);
  const revertRepayment = amortisedRepayment(principal, annualRatePct, termYears - ioYears, periods);
  const totalPaid =
    repayment * Math.round(ioYears * periods) +
    revertRepayment * Math.round((termYears - ioYears) * periods);
  return {
    repayment,
    revertRepayment,
    totalInterest: Math.max(0, totalPaid - principal),
    totalPaid,
  };
}

export type ServiceabilityInput = {
  netMonthlyIncome: number;
  monthlyExpenses: number;
  otherMonthlyRepayments: number;
  creditCardLimits: number;
  annualRatePct: number;
  termYears: number;
};

export type ServiceabilityResult = {
  assessmentRatePct: number;
  creditCardCommitment: number;
  totalCommitments: number;
  monthlySurplus: number;
  maxLoan: number;
  repaymentAtActualRate: number;
  bufferHeadroom: number;
};

export function calculateServiceability(input: ServiceabilityInput): ServiceabilityResult {
  const assessmentRatePct = input.annualRatePct + ASSUMPTIONS.serviceabilityBufferPct;
  const creditCardCommitment = input.creditCardLimits * ASSUMPTIONS.creditCardMonthlyFactor;
  const totalCommitments =
    input.monthlyExpenses + input.otherMonthlyRepayments + creditCardCommitment;
  const monthlySurplus = input.netMonthlyIncome - totalCommitments;
  const maxLoan = maxLoanFromRepayment(monthlySurplus, assessmentRatePct, input.termYears);
  const repaymentAtActualRate = amortisedRepayment(maxLoan, input.annualRatePct, input.termYears);

  return {
    assessmentRatePct,
    creditCardCommitment,
    totalCommitments,
    monthlySurplus,
    maxLoan,
    repaymentAtActualRate,
    bufferHeadroom: maxLoan > 0 ? monthlySurplus - repaymentAtActualRate : 0,
  };
}

export type Tone = "good" | "caution" | "risk";

export type Band<K extends string = string> = {
  key: K;
  label: string;
  tone: Tone;
  note: string;
};

export function lvrBand(lvrPct: number): Band<"low" | "standard" | "lmi" | "high" | "outside"> {
  if (lvrPct <= ASSUMPTIONS.lowLvrMax) {
    return {
      key: "low",
      label: "Low LVR",
      tone: "good",
      note: "A strong equity buffer: the lowest-risk band for a lender.",
    };
  }
  if (lvrPct <= ASSUMPTIONS.lmiLvrThreshold) {
    return {
      key: "standard",
      label: "Standard",
      tone: "good",
      note: "Within the usual limit for lending without Lenders Mortgage Insurance.",
    };
  }
  if (lvrPct <= ASSUMPTIONS.highLvrMax) {
    return {
      key: "lmi",
      label: "LMI likely",
      tone: "caution",
      note: "Above 80%, most lenders require LMI (some schemes and professions are exceptions).",
    };
  }
  if (lvrPct <= ASSUMPTIONS.typicalMaxLvr) {
    return {
      key: "high",
      label: "High LVR",
      tone: "risk",
      note: "LMI applies and policy tightens; genuine savings are usually checked closely.",
    };
  }
  return {
    key: "outside",
    label: "Outside typical policy",
    tone: "risk",
    note: "Above 95% generally needs a guarantor or an eligible government scheme.",
  };
}

export function dtiBand(dti: number): Band<"lower" | "moderate" | "high"> {
  if (dti < ASSUMPTIONS.moderateDti) {
    return {
      key: "lower",
      label: "Lower",
      tone: "good",
      note: "Total debt is under 4× gross income.",
    };
  }
  if (dti < ASSUMPTIONS.highDti) {
    return {
      key: "moderate",
      label: "Moderate",
      tone: "caution",
      note: "Common in high-priced markets; the rest of the file carries more weight.",
    };
  }
  return {
    key: "high",
    label: "High (6× or more)",
    tone: "risk",
    note: "APRA treats 6× or more as high-DTI lending, so lenders scrutinise it closely.",
  };
}

export type LvrDtiInput = {
  propertyValue: number;
  loanAmount: number;
  grossAnnualIncome: number;
  otherDebts: number;
};

export type LvrDtiResult = {
  lvrPct: number | null;
  depositAmount: number;
  depositPct: number | null;
  dti: number | null;
  lvr: ReturnType<typeof lvrBand> | null;
  dtiResult: ReturnType<typeof dtiBand> | null;
};

export function calculateLvrDti(input: LvrDtiInput): LvrDtiResult {
  const { propertyValue, loanAmount, grossAnnualIncome, otherDebts } = input;
  const lvrPct = propertyValue > 0 ? (loanAmount / propertyValue) * 100 : null;
  const dti = grossAnnualIncome > 0 ? (loanAmount + otherDebts) / grossAnnualIncome : null;
  return {
    lvrPct,
    depositAmount: Math.max(0, propertyValue - loanAmount),
    depositPct: lvrPct === null ? null : Math.max(0, 100 - lvrPct),
    dti,
    lvr: lvrPct === null ? null : lvrBand(lvrPct),
    dtiResult: dti === null ? null : dtiBand(dti),
  };
}

export type IncomeType = "payg" | "self-employed";

export type ChecklistItem = {
  id: string;
  label: string;
  hint?: string;
  critical: boolean;
  appliesTo: IncomeType[];
};

export type ReadinessResult = {
  completedPct: number;
  missingCritical: ChecklistItem[];
  missingOther: ChecklistItem[];
  verdict: "ready" | "nearly" | "not-ready";
};

export function assessReadiness(
  items: ChecklistItem[],
  checkedIds: string[],
  incomeType: IncomeType,
): ReadinessResult {
  const applicable = items.filter((item) => item.appliesTo.includes(incomeType));
  const checked = new Set(checkedIds);
  const missing = applicable.filter((item) => !checked.has(item.id));
  const missingCritical = missing.filter((item) => item.critical);
  const missingOther = missing.filter((item) => !item.critical);
  const done = applicable.length - missing.length;

  return {
    completedPct: applicable.length ? Math.round((done / applicable.length) * 100) : 0,
    missingCritical,
    missingOther,
    verdict: missingCritical.length ? "not-ready" : missingOther.length ? "nearly" : "ready",
  };
}
