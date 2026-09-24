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
