"use client";

import { useId, useState } from "react";
import { ASSUMPTIONS, calculateServiceability } from "@/lib/calculators";
import { heroWorksheet as cfg } from "@/lib/content";
import { formatAccounting, formatCurrency, formatNumber, formatPct } from "@/lib/format";
import { Slider, Worksheet } from "@/components/calculators/parts";

export function HeroWorksheet() {
  const incomeId = useId();
  const expensesId = useId();
  const [income, setIncome] = useState(cfg.income.initial);
  const [expenses, setExpenses] = useState(cfg.expenses.initial);

  const r = calculateServiceability({
    netMonthlyIncome: income,
    monthlyExpenses: expenses,
    otherMonthlyRepayments: cfg.otherMonthlyRepayments,
    creditCardLimits: cfg.creditCardLimits,
    annualRatePct: cfg.annualRatePct,
    termYears: cfg.termYears,
  });

  return (
    <Worksheet
      variant="hero"
      caption={
        <>
          <span className="text-[1.0625rem] font-bold text-foreground">Serviceability check</span>
          <span>Move the sliders</span>
        </>
      }
      rows={[
        {
          label: <span id={incomeId}>Net monthly income</span>,
          value: formatAccounting(income),
          control: (
            <Slider
              labelledBy={incomeId}
              min={cfg.income.min}
              max={cfg.income.max}
              step={cfg.income.step}
              value={income}
              onChange={setIncome}
              valueText={`${formatCurrency(income)} a month`}
            />
          ),
        },
        {
          label: <span id={expensesId}>Living expenses</span>,
          value: formatAccounting(expenses, { deduct: true }),
          control: (
            <Slider
              labelledBy={expensesId}
              min={cfg.expenses.min}
              max={cfg.expenses.max}
              step={cfg.expenses.step}
              value={expenses}
              onChange={setExpenses}
              valueText={`${formatCurrency(expenses)} a month`}
            />
          ),
        },
        { label: "Other loan repayments", value: formatAccounting(cfg.otherMonthlyRepayments, { deduct: true }) },
        {
          label: `Card limits at ${formatNumber(ASSUMPTIONS.creditCardMonthlyFactor * 100, 1)}% of ${formatCurrency(cfg.creditCardLimits)}`,
          value: formatAccounting(r.creditCardCommitment, { deduct: true }),
        },
        { kind: "subtotal", label: "Monthly surplus", value: formatAccounting(r.monthlySurplus) },
        {
          kind: "note",
          label: `Example rate ${formatPct(cfg.annualRatePct, 2)} + ${formatPct(ASSUMPTIONS.serviceabilityBufferPct, 2)} buffer, ${cfg.termYears} years`,
          value: formatPct(r.assessmentRatePct, 2),
        },
        {
          kind: "total",
          label: "Borrowing capacity",
          value: r.maxLoan > 0 ? formatCurrency(r.maxLoan) : "No capacity",
        },
      ]}
      footer={
        <>
          Illustrative only. Not financial advice or credit assistance.{" "}
          <a href="#toolkit" className="font-semibold text-foreground underline underline-offset-[3px]">
            Open the full toolkit
          </a>
        </>
      }
    />
  );
}
