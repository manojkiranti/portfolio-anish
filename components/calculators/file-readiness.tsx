"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { assessReadiness, type IncomeType, type Tone } from "@/lib/calculators";
import { checklistGroups } from "@/lib/content";
import { ChoiceField, Flag, Note } from "@/components/calculators/parts";
import { cn } from "@/lib/utils";

const allItems = checklistGroups.flatMap((group) => group.items);

const VERDICT: Record<"ready" | "nearly" | "not-ready", { label: string; tone: Tone; note: string }> = {
  ready: {
    label: "Ready to submit",
    tone: "good",
    note: "Everything a lender typically asks for is in. Clean first submissions get fewer conditions.",
  },
  nearly: {
    label: "Nearly there",
    tone: "caution",
    note: "Nothing blocking, but the gaps below usually come back as conditions and slow approval.",
  },
  "not-ready": {
    label: "Not ready",
    tone: "risk",
    note: "Critical documents are missing. A lender can't assess the application without them.",
  },
};

const FILL: Record<Tone, string> = { good: "bg-success", caution: "bg-warning", risk: "bg-destructive" };

export function FileReadinessChecklist() {
  const [incomeType, setIncomeType] = useState<IncomeType>("payg");
  const [checked, setChecked] = useState<string[]>(["id", "payslips"]);

  const r = assessReadiness(allItems, checked, incomeType);
  const verdict = VERDICT[r.verdict];

  const toggle = (id: string) =>
    setChecked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
      <div className="space-y-6">
        <ChoiceField
          label="Main income type"
          value={incomeType}
          onChange={setIncomeType}
          options={[
            { value: "payg", label: "PAYG employee" },
            { value: "self-employed", label: "Self-employed" },
          ]}
        />

        {checklistGroups.map((group) => {
          const items = group.items.filter((item) => item.appliesTo.includes(incomeType));
          if (!items.length) return null;
          return (
            <fieldset key={group.heading} className="space-y-2">
              <legend className="mb-2 text-sm font-semibold text-muted-foreground">{group.heading}</legend>
              {items.map((item) => {
                const on = checked.includes(item.id);
                return (
                  <label
                    key={item.id}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-md border bg-card p-3 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring",
                      on ? "border-success" : "border-border hover:border-input"
                    )}
                  >
                    <input type="checkbox" checked={on} onChange={() => toggle(item.id)} className="sr-only" />
                    <span
                      aria-hidden
                      className={cn(
                        "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-sm border",
                        on ? "border-success bg-success text-card" : "border-input bg-card"
                      )}
                    >
                      {on && <Check className="size-3.5" strokeWidth={3} />}
                    </span>
                    <span className="space-y-0.5">
                      <span className="flex flex-wrap items-center gap-2 text-[0.9375rem] font-medium">
                        {item.label}
                        {item.critical && <Flag tone="risk">Critical</Flag>}
                      </span>
                      {item.hint && <span className="block text-[0.8125rem] text-muted-foreground">{item.hint}</span>}
                    </span>
                  </label>
                );
              })}
            </fieldset>
          );
        })}
      </div>

      <div className="h-fit space-y-4 rounded-md border border-border bg-card p-5 lg:sticky lg:top-20" aria-live="polite">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-muted-foreground">File status</p>
          <Flag tone={verdict.tone}>{verdict.label}</Flag>
        </div>
        <p className="text-3xl font-extrabold tracking-tight tabular-nums">{r.completedPct}%</p>
        <div
          role="progressbar"
          aria-label="Documents collected"
          aria-valuenow={r.completedPct}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-2 rounded-sm bg-secondary"
        >
          <div className={cn("h-full rounded-sm transition-[width]", FILL[verdict.tone])} style={{ width: `${r.completedPct}%` }} />
        </div>
        <p className="text-sm text-muted-foreground">{verdict.note}</p>

        {r.missingCritical.length > 0 && (
          <MissingList title="Blocking" items={r.missingCritical.map((i) => i.label)} tone="risk" />
        )}
        {r.missingOther.length > 0 && (
          <MissingList
            title="Will likely come back as conditions"
            items={r.missingOther.map((i) => i.label)}
            tone="caution"
          />
        )}

        <Note>A typical document list. Each lender and scenario adds its own requirements.</Note>
      </div>
    </div>
  );
}

function MissingList({ title, items, tone }: { title: string; items: string[]; tone: Tone }) {
  return (
    <div className="space-y-1.5">
      <p className={cn("text-sm font-semibold", tone === "risk" ? "text-destructive" : "text-warning")}>{title}</p>
      <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
