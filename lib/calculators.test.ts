import { describe, expect, it } from "vitest";
import {
  ASSUMPTIONS,
  amortisedRepayment,
  assessReadiness,
  calculateLvrDti,
  calculateRepayments,
  calculateServiceability,
  dtiBand,
  interestOnlyRepayment,
  lvrBand,
  maxLoanFromRepayment,
  type ChecklistItem,
} from "@/lib/calculators";

describe("amortisedRepayment", () => {
  it("matches the textbook $500k / 6% / 30yr monthly repayment", () => {
    expect(amortisedRepayment(500_000, 6, 30, 12)).toBeCloseTo(2997.75, 2);
  });

  it("matches $500k / 6% / 25yr monthly", () => {
    expect(amortisedRepayment(500_000, 6, 25, 12)).toBeCloseTo(3221.51, 2);
  });

  it("splits principal evenly when the rate is zero", () => {
    expect(amortisedRepayment(500_000, 0, 25, 12)).toBeCloseTo(1666.67, 2);
  });

  it("costs less per year when paid weekly than monthly", () => {
    const weeklyYear = amortisedRepayment(500_000, 6, 30, 52) * 52;
    const monthlyYear = amortisedRepayment(500_000, 6, 30, 12) * 12;
    expect(weeklyYear).toBeLessThan(monthlyYear);
  });

  it("returns 0 for a zero principal or zero term", () => {
    expect(amortisedRepayment(0, 6, 30, 12)).toBe(0);
    expect(amortisedRepayment(500_000, 6, 0, 12)).toBe(0);
  });
});

describe("interestOnlyRepayment", () => {
  it("charges interest only", () => {
    expect(interestOnlyRepayment(500_000, 6, 12)).toBeCloseTo(2500, 2);
    expect(interestOnlyRepayment(520_000, 6, 52)).toBeCloseTo(600, 2);
  });
});

describe("maxLoanFromRepayment", () => {
  it("is the inverse of amortisedRepayment", () => {
    const loan = maxLoanFromRepayment(3000, 9, 30);
    expect(amortisedRepayment(loan, 9, 30, 12)).toBeCloseTo(3000, 6);
    expect(loan).toBeGreaterThan(372_000);
    expect(loan).toBeLessThan(373_500);
  });

  it("returns 0 when there is no surplus", () => {
    expect(maxLoanFromRepayment(0, 9, 30)).toBe(0);
    expect(maxLoanFromRepayment(-500, 9, 30)).toBe(0);
  });
});

describe("calculateRepayments", () => {
  it("P&I: repayment, total interest, no revert figure", () => {
    const r = calculateRepayments({
      principal: 500_000,
      annualRatePct: 6,
      termYears: 30,
      frequency: "monthly",
      type: "pi",
      ioYears: 5,
    });
    expect(r.repayment).toBeCloseTo(2997.75, 2);
    expect(r.revertRepayment).toBeUndefined();
    expect(r.totalInterest).toBeCloseTo(2997.7526 * 360 - 500_000, -1);
  });

  it("IO: interest-only first, then P&I over the remaining term", () => {
    const r = calculateRepayments({
      principal: 500_000,
      annualRatePct: 6,
      termYears: 30,
      frequency: "monthly",
      type: "io",
      ioYears: 5,
    });
    expect(r.repayment).toBeCloseTo(2500, 2);
    expect(r.revertRepayment).toBeCloseTo(3221.51, 2);
    expect(r.totalInterest).toBeCloseTo(2500 * 60 + 3221.51 * 300 - 500_000, -1);
  });

  it("IO period can't swallow the whole term", () => {
    const r = calculateRepayments({
      principal: 500_000,
      annualRatePct: 6,
      termYears: 5,
      frequency: "monthly",
      type: "io",
      ioYears: 5,
    });
    expect(Number.isFinite(r.revertRepayment)).toBe(true);
    expect(r.revertRepayment).toBeGreaterThan(0);
  });
});

describe("calculateServiceability", () => {
  const base = {
    netMonthlyIncome: 10_000,
    monthlyExpenses: 3_500,
    otherMonthlyRepayments: 500,
    creditCardLimits: 10_000,
    annualRatePct: 6,
    termYears: 30,
  };

  it("assesses at the product rate plus the buffer", () => {
    const r = calculateServiceability(base);
    expect(r.assessmentRatePct).toBe(6 + ASSUMPTIONS.serviceabilityBufferPct);
  });

  it("assesses card limits, not balances", () => {
    const r = calculateServiceability(base);
    expect(r.creditCardCommitment).toBeCloseTo(10_000 * ASSUMPTIONS.creditCardMonthlyFactor, 6);
    expect(r.monthlySurplus).toBeCloseTo(10_000 - 3_500 - 500 - r.creditCardCommitment, 6);
  });

  it("sizes the loan so the assessment-rate repayment uses the whole surplus", () => {
    const r = calculateServiceability(base);
    expect(amortisedRepayment(r.maxLoan, r.assessmentRatePct, 30, 12)).toBeCloseTo(r.monthlySurplus, 4);
    expect(r.repaymentAtActualRate).toBeLessThan(r.monthlySurplus);
    expect(r.bufferHeadroom).toBeCloseTo(r.monthlySurplus - r.repaymentAtActualRate, 6);
  });

  it("returns no capacity when commitments exceed income", () => {
    const r = calculateServiceability({ ...base, monthlyExpenses: 12_000 });
    expect(r.monthlySurplus).toBeLessThan(0);
    expect(r.maxLoan).toBe(0);
    expect(r.repaymentAtActualRate).toBe(0);
  });
});

describe("lvrBand", () => {
  it.each([
    [55, "low"],
    [60, "low"],
    [60.01, "standard"],
    [80, "standard"],
    [80.01, "lmi"],
    [90, "lmi"],
    [90.01, "high"],
    [95, "high"],
    [95.01, "outside"],
  ])("LVR %s%% → %s", (lvr, key) => {
    expect(lvrBand(lvr).key).toBe(key);
  });
});

describe("dtiBand", () => {
  it.each([
    [3.99, "lower"],
    [4, "moderate"],
    [5.99, "moderate"],
    [6, "high"],
    [8, "high"],
  ])("DTI %s → %s", (dti, key) => {
    expect(dtiBand(dti).key).toBe(key);
  });
});

describe("calculateLvrDti", () => {
  it("computes LVR, deposit and DTI including other debts", () => {
    const r = calculateLvrDti({
      propertyValue: 800_000,
      loanAmount: 640_000,
      grossAnnualIncome: 150_000,
      otherDebts: 20_000,
    });
    expect(r.lvrPct).toBeCloseTo(80, 6);
    expect(r.depositAmount).toBe(160_000);
    expect(r.depositPct).toBeCloseTo(20, 6);
    expect(r.dti).toBeCloseTo(4.4, 6);
    expect(r.lvr?.key).toBe("standard");
    expect(r.dtiResult?.key).toBe("moderate");
  });

  it("returns nulls rather than dividing by zero", () => {
    const r = calculateLvrDti({
      propertyValue: 0,
      loanAmount: 500_000,
      grossAnnualIncome: 0,
      otherDebts: 0,
    });
    expect(r.lvrPct).toBeNull();
    expect(r.lvr).toBeNull();
    expect(r.dti).toBeNull();
    expect(r.dtiResult).toBeNull();
  });
});

describe("assessReadiness", () => {
  const items: ChecklistItem[] = [
    { id: "id", label: "Photo ID", critical: true, appliesTo: ["payg", "self-employed"] },
    { id: "payslips", label: "Payslips", critical: true, appliesTo: ["payg"] },
    { id: "tax-returns", label: "Tax returns", critical: true, appliesTo: ["self-employed"] },
    { id: "rates", label: "Rates notice", critical: false, appliesTo: ["payg", "self-employed"] },
  ];

  it("is not ready while any critical item is missing", () => {
    const r = assessReadiness(items, ["id"], "payg");
    expect(r.verdict).toBe("not-ready");
    expect(r.missingCritical.map((i) => i.id)).toEqual(["payslips"]);
    expect(r.completedPct).toBe(33);
  });

  it("is nearly ready when only non-critical items remain", () => {
    const r = assessReadiness(items, ["id", "payslips"], "payg");
    expect(r.verdict).toBe("nearly");
    expect(r.missingOther.map((i) => i.id)).toEqual(["rates"]);
  });

  it("is ready when every applicable item is in", () => {
    const r = assessReadiness(items, ["id", "payslips", "rates"], "payg");
    expect(r.verdict).toBe("ready");
    expect(r.completedPct).toBe(100);
  });

  it("ignores items that don't apply to the income type", () => {
    const r = assessReadiness(items, ["id", "payslips", "rates"], "self-employed");
    expect(r.verdict).toBe("not-ready");
    expect(r.missingCritical.map((i) => i.id)).toEqual(["tax-returns"]);
  });
});

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
