"use client";

import { useId, useState, type ReactNode } from "react";
import type { Tone } from "@/lib/calculators";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

export function parseAmount(raw: string): number {
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : 0;
}

export function NumberField({
  label,
  value,
  onChange,
  prefix,
  suffix,
  hint,
  decimals = 0,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
  hint?: string;
  decimals?: number;
}) {
  const id = useId();
  const [draft, setDraft] = useState<string | null>(null);
  const shown = draft ?? formatNumber(value, decimals);

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <div className="flex items-center rounded-xl border border-input bg-background transition focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/40">
        {prefix && <span className="pl-3 text-sm text-muted-foreground">{prefix}</span>}
        <input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          value={shown}
          aria-describedby={hint ? `${id}-hint` : undefined}
          onFocus={() => setDraft(value ? String(value) : "")}
          onChange={(e) => {
            const cleaned = e.target.value.replace(/[^0-9.]/g, "");
            setDraft(cleaned);
            onChange(parseAmount(cleaned));
          }}
          onBlur={() => setDraft(null)}
          className="w-full min-w-0 bg-transparent px-3 py-2.5 text-sm tabular-nums outline-none"
        />
        {suffix && <span className="pr-3 text-sm text-muted-foreground whitespace-nowrap">{suffix}</span>}
      </div>
      {hint && (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}

export function ChoiceField<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  const name = useId();
  return (
    <fieldset className="space-y-1.5">
      <legend className="mb-1.5 text-sm font-medium">{label}</legend>
      <div className="flex flex-wrap gap-1 rounded-xl border border-input bg-background p-1">
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              "flex-1 cursor-pointer rounded-lg px-3 py-1.5 text-center text-sm font-medium transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
              value === option.value
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

const toneClasses: Record<Tone, string> = {
  good: "bg-success/10 text-success border-success/30",
  caution: "bg-warning/10 text-warning border-warning/30",
  risk: "bg-destructive/10 text-destructive border-destructive/30",
};

export function ToneBadge({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-semibold",
        toneClasses[tone]
      )}
    >
      {children}
    </span>
  );
}

export function Headline({
  label,
  value,
  sub,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
}) {
  return (
    <div className="space-y-1" aria-live="polite">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-3xl sm:text-4xl font-extrabold tracking-tight tabular-nums text-accent-strong dark:text-accent">
        {value}
      </p>
      {sub && <p className="text-sm text-muted-foreground">{sub}</p>}
    </div>
  );
}

export type WorksheetRow = {
  op?: "−" | "+" | "=" | "×";
  label: ReactNode;
  value: ReactNode;
  strong?: boolean;
};

export function Worksheet({ rows }: { rows: WorksheetRow[] }) {
  return (
    <dl className="divide-y divide-border rounded-xl border border-border text-sm">
      {rows.map((row, i) => (
        <div
          key={i}
          className={cn(
            "flex items-baseline justify-between gap-4 px-4 py-2.5",
            row.strong && "bg-secondary/60 font-semibold"
          )}
        >
          <dt className="flex gap-2 text-muted-foreground">
            <span aria-hidden className="w-3 shrink-0 text-center font-mono">
              {row.op ?? "\u00a0"}
            </span>
            <span className={cn(row.strong && "text-foreground")}>{row.label}</span>
          </dt>
          <dd className="shrink-0 tabular-nums">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Meter({
  value,
  max,
  tone,
  marks,
  label,
}: {
  value: number;
  max: number;
  tone: Tone;
  marks: { at: number; label?: string }[];
  label: string;
}) {
  const pct = Math.min(Math.max(value / max, 0), 1) * 100;
  const fill = { good: "bg-success", caution: "bg-warning", risk: "bg-destructive" }[tone];
  return (
    <div role="img" aria-label={label} className="pt-1 pb-5">
      <div className="relative h-2.5 rounded-full bg-secondary">
        <div className={cn("h-full rounded-full transition-all", fill)} style={{ width: `${pct}%` }} />
        {marks.map((mark) => (
          <div
            key={mark.at}
            className="absolute top-0 h-full"
            style={{ left: `${(mark.at / max) * 100}%` }}
          >
            <div className="h-full w-0.5 -translate-x-1/2 bg-foreground/30" />
            {mark.label && (
              <span className="absolute top-3.5 -translate-x-1/2 text-[11px] text-muted-foreground tabular-nums">
                {mark.label}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Note({ children }: { children: ReactNode }) {
  return <p className="text-xs leading-relaxed text-muted-foreground">{children}</p>;
}
