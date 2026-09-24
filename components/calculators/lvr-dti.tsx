"use client";

import { useState, type ReactNode } from "react";
import { ASSUMPTIONS, calculateLvrDti, type Tone } from "@/lib/calculators";
import { formatCurrency, formatPct } from "@/lib/format";
import { Meter, Note, NumberField, ToneBadge } from "@/components/calculators/parts";

export function LvrDtiCalculator() {
  const [propertyValue, setPropertyValue] = useState(850_000);
  const [loanAmount, setLoanAmount] = useState(680_000);
  const [grossAnnualIncome, setGrossAnnualIncome] = useState(160_000);
  const [otherDebts, setOtherDebts] = useState(15_000);

  const r = calculateLvrDti({ propertyValue, loanAmount, grossAnnualIncome, otherDebts });
  const loanAtLmiLimit = propertyValue * (ASSUMPTIONS.lmiLvrThreshold / 100);
  const reductionToLmiLimit = loanAmount - loanAtLmiLimit;
  const highDtiDebtLimit = grossAnnualIncome * ASSUMPTIONS.highDti;
  const dtiHeadroom = highDtiDebtLimit - (loanAmount + otherDebts);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 content-start">
        <NumberField label="Property value" prefix="$" value={propertyValue} onChange={setPropertyValue} />
        <NumberField label="Loan amount" prefix="$" value={loanAmount} onChange={setLoanAmount} />
        <NumberField
          label="Gross annual income"
          prefix="$"
          value={grossAnnualIncome}
          onChange={setGrossAnnualIncome}
          hint="Before tax, all borrowers combined."
        />
        <NumberField
          label="Other debts (balances & card limits)"
          prefix="$"
          value={otherDebts}
          onChange={setOtherDebts}
          hint="Car loans, personal loans, HELP and card limits."
        />
      </div>

      <div className="grid gap-4 content-start">
        <RatioCard
          title="Loan-to-value ratio (LVR)"
          value={r.lvrPct === null ? "—" : formatPct(r.lvrPct, 1)}
          band={r.lvr}
          meter={
            r.lvrPct !== null &&
            r.lvr && (
              <Meter
                value={r.lvrPct}
                max={100}
                tone={r.lvr.tone}
                label={`LVR ${formatPct(r.lvrPct, 1)}`}
                marks={[{ at: 60, label: "60%" }, { at: 80, label: "80%" }, { at: 90 }, { at: 95, label: "95%" }]}
              />
            )
          }
        >
          {r.depositPct !== null && (
            <p>
              Deposit / equity: {formatCurrency(r.depositAmount)} ({formatPct(r.depositPct, 1)}).
            </p>
          )}
          {r.lvrPct !== null && reductionToLmiLimit > 0 && (
            <p>
              Reducing the loan by{" "}
              <span className="font-semibold text-foreground">{formatCurrency(reductionToLmiLimit)}</span>{" "}
              brings it to {ASSUMPTIONS.lmiLvrThreshold}% LVR.
            </p>
          )}
        </RatioCard>

        <RatioCard
          title="Debt-to-income ratio (DTI)"
          value={r.dti === null ? "—" : `${r.dti.toFixed(1)}×`}
          band={r.dtiResult}
          meter={
            r.dti !== null &&
            r.dtiResult && (
              <Meter
                value={r.dti}
                max={8}
                tone={r.dtiResult.tone}
                label={`DTI ${r.dti.toFixed(1)} times income`}
                marks={[4, 6].map((at) => ({ at, label: `${at}×` }))}
              />
            )
          }
        >
          <p>Total debt including the new loan ÷ gross annual income.</p>
          {r.dti !== null && dtiHeadroom > 0 && (
            <p>
              <span className="font-semibold text-foreground">{formatCurrency(dtiHeadroom)}</span> more
              debt would take this to {ASSUMPTIONS.highDti}×.
            </p>
          )}
        </RatioCard>

        <Note>
          Bands are indicative. LMI thresholds, scheme exceptions and DTI appetite differ by lender
          and change over time.
        </Note>
      </div>
    </div>
  );
}

function RatioCard({
  title,
  value,
  band,
  meter,
  children,
}: {
  title: string;
  value: string;
  band: { label: string; tone: Tone; note: string } | null;
  meter: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border p-5 space-y-3" aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {band && <ToneBadge tone={band.tone}>{band.label}</ToneBadge>}
      </div>
      <p className="text-3xl font-extrabold tracking-tight tabular-nums">{value}</p>
      {meter}
      <div className="space-y-1 text-sm text-muted-foreground">
        {band && <p>{band.note}</p>}
        {children}
      </div>
    </div>
  );
}
