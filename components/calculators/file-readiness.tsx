"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { assessReadiness, type IncomeType, type Tone } from "@/lib/calculators";
import { checklistGroups } from "@/lib/content";
import { ChoiceField, Note, ToneBadge } from "@/components/calculators/parts";
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

export function FileReadinessChecklist() {
  const [incomeType, setIncomeType] = useState<IncomeType>("payg");
  const [checked, setChecked] = useState<string[]>(["id", "payslips"]);

  const r = assessReadiness(allItems, checked, incomeType);
  const verdict = VERDICT[r.verdict];
  const fill = { good: "bg-success", caution: "bg-warning", risk: "bg-destructive" }[verdict.tone];

  const toggle = (id: string) =>
    setChecked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
      <div className="space-y-5">
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
              <legend className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {group.heading}
              </legend>
              {items.map((item) => {
                const on = checked.includes(item.id);
                return (
                  <label
                    key={item.id}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                      on ? "border-success/40 bg-success/5" : "border-border hover:border-accent/40"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => toggle(item.id)}
                      className="sr-only"
                    />
                    <span
                      aria-hidden
                      className={cn(
                        "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border transition",
                        on ? "border-success bg-success text-white dark:text-background" : "border-muted-foreground/60 bg-background"
                      )}
                    >
                      {on && <Check className="size-3.5" strokeWidth={3} />}
                    </span>
                    <span className="space-y-0.5">
                      <span className="flex flex-wrap items-center gap-2 text-sm font-medium">
                        {item.label}
                        {item.critical && (
                          <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-semibold text-destructive">
                            Critical
                          </span>
                        )}
                      </span>
                      {item.hint && (
                        <span className="block text-xs text-muted-foreground">{item.hint}</span>
                      )}
                    </span>
                  </label>
                );
              })}
            </fieldset>
          );
        })}
      </div>

      <div className="lg:sticky lg:top-28 h-fit space-y-4 rounded-xl border border-border p-5" aria-live="polite">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-muted-foreground">File status</p>
          <ToneBadge tone={verdict.tone}>{verdict.label}</ToneBadge>
        </div>
        <p className="text-3xl font-extrabold tracking-tight tabular-nums">{r.completedPct}%</p>
        <div
          role="progressbar"
          aria-label="Documents collected"
          aria-valuenow={r.completedPct}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-2.5 rounded-full bg-secondary"
        >
          <div className={cn("h-full rounded-full transition-all", fill)} style={{ width: `${r.completedPct}%` }} />
        </div>
        <p className="text-sm text-muted-foreground">{verdict.note}</p>

        {r.missingCritical.length > 0 && (
          <MissingList title="Blocking" items={r.missingCritical.map((i) => i.label)} tone="risk" />
        )}
        {r.missingOther.length > 0 && (
          <MissingList title="Will likely come back as conditions" items={r.missingOther.map((i) => i.label)} tone="caution" />
        )}

        <Note>A typical document list. Each lender and scenario adds its own requirements.</Note>
      </div>
    </div>
  );
}

function MissingList({ title, items, tone }: { title: string; items: string[]; tone: Tone }) {
  return (
    <div className="space-y-1.5">
      <p className={cn("text-xs font-semibold uppercase tracking-widest", tone === "risk" ? "text-destructive" : "text-warning")}>
        {title}
      </p>
      <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
