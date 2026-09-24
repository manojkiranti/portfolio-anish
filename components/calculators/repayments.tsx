"use client";

import { useState } from "react";
import { calculateRepayments, type Frequency } from "@/lib/calculators";
import { formatCurrency, formatPct, formatYears } from "@/lib/format";
import { ChoiceField, Headline, Note, NumberField, Worksheet } from "@/components/calculators/parts";

const PER: Record<Frequency, string> = {
  weekly: "week",
  fortnightly: "fortnight",
  monthly: "month",
};

export function RepaymentCalculator() {
  const [principal, setPrincipal] = useState(600_000);
  const [annualRatePct, setAnnualRatePct] = useState(6);
  const [termYears, setTermYears] = useState(30);
  const [frequency, setFrequency] = useState<Frequency>("monthly");
  const [type, setType] = useState<"pi" | "io">("pi");
  const [ioYears, setIoYears] = useState(5);

  const term = Math.min(Math.max(termYears, 1), 40);
  const io = Math.min(Math.max(ioYears, 1), Math.max(term - 1, 0));
  const base = { principal, annualRatePct, termYears: term, frequency, ioYears: io };
  const pi = calculateRepayments({ ...base, type: "pi" });
  const r = type === "io" ? calculateRepayments({ ...base, type: "io" }) : pi;
  const per = PER[frequency];

  const jump = r.revertRepayment !== undefined ? r.revertRepayment - r.repayment : 0;
  const jumpPct = r.repayment > 0 ? (jump / r.repayment) * 100 : 0;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 content-start">
        <NumberField label="Loan amount" prefix="$" value={principal} onChange={setPrincipal} />
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
        <ChoiceField
          label="Repayment type"
          value={type}
          onChange={setType}
          options={[
            { value: "pi", label: "Principal & interest" },
            { value: "io", label: "Interest-only" },
          ]}
        />
        {type === "io" && (
          <NumberField
            label="Interest-only period"
            suffix="years"
            value={ioYears}
            onChange={setIoYears}
            hint="Often capped at 5 years for owner-occupiers."
          />
        )}
        <ChoiceField
          label="Frequency"
          value={frequency}
          onChange={setFrequency}
          options={[
            { value: "weekly", label: "Weekly" },
            { value: "fortnightly", label: "Fortnightly" },
            { value: "monthly", label: "Monthly" },
          ]}
        />
      </div>

      <div className="space-y-5">
        <Headline
          label={type === "io" ? `Interest-only repayment for ${formatYears(io)}` : "Repayment"}
          value={`${formatCurrency(r.repayment)}/${per}`}
          sub={`${formatCurrency(principal)} at ${formatPct(annualRatePct, 2)} over ${formatYears(term)}.`}
        />

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

        <Note>
          Assumes the rate stays the same for the whole term, with no fees, offset or extra
          repayments.
        </Note>
      </div>
    </div>
  );
}
