"use client";

import { useState } from "react";
import { ASSUMPTIONS, calculateServiceability } from "@/lib/calculators";
import { formatCurrency, formatNumber, formatPct, formatYears } from "@/lib/format";
import { Headline, Note, NumberField, Worksheet } from "@/components/calculators/parts";

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
  const hasCapacity = r.maxLoan > 0;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 content-start">
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
          <NumberField
            label="Loan term"
            suffix="years"
            value={termYears}
            onChange={setTermYears}
          />
        </div>
      </div>

      <div className="space-y-5">
        <Headline
          label="Indicative borrowing capacity"
          value={hasCapacity ? formatCurrency(r.maxLoan) : "No capacity"}
          sub={
            hasCapacity
              ? `Principal & interest over ${formatYears(term)}, assessed at ${formatPct(r.assessmentRatePct, 2)}.`
              : `Commitments exceed income by ${formatCurrency(-r.monthlySurplus)} a month on these numbers.`
          }
        />

        <Worksheet
          rows={[
            { label: "Net monthly income", value: formatCurrency(netMonthlyIncome) },
            { op: "−", label: "Living expenses", value: formatCurrency(monthlyExpenses) },
            { op: "−", label: "Other loan repayments", value: formatCurrency(otherMonthlyRepayments) },
            {
              op: "−",
              label: `Credit cards (${formatNumber(ASSUMPTIONS.creditCardMonthlyFactor * 100, 1)}% of limits)`,
              value: formatCurrency(r.creditCardCommitment),
            },
            {
              op: "=",
              label: "Surplus available for the new loan",
              value: formatCurrency(r.monthlySurplus),
              strong: true,
            },
            {
              label: `Assessment rate: ${formatPct(annualRatePct, 2)} + ${formatPct(ASSUMPTIONS.serviceabilityBufferPct, 1)} buffer`,
              value: formatPct(r.assessmentRatePct, 2),
            },
          ]}
        />

        {hasCapacity && (
          <div className="rounded-xl border border-accent/30 bg-accent/5 p-4 text-sm leading-relaxed">
            <p className="font-semibold">Why the buffer matters</p>
            <p className="mt-1 text-muted-foreground">
              At the actual {formatPct(annualRatePct, 2)} rate, this loan costs{" "}
              <span className="font-semibold text-foreground">
                {formatCurrency(r.repaymentAtActualRate)}/month
              </span>
              , leaving{" "}
              <span className="font-semibold text-foreground">
                {formatCurrency(r.bufferHeadroom)}/month
              </span>{" "}
              of headroom. That headroom is what lets the borrower absorb rate rises.
            </p>
          </div>
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
