"use client";

import { useId, useState, type CSSProperties, type ReactNode } from "react";
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
      <div className="flex items-center rounded-md border border-input bg-card focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring">
        {prefix && <span className="pl-3 text-[0.9375rem] text-muted-foreground">{prefix}</span>}
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
          className="w-full min-w-0 bg-transparent px-3 py-2.5 text-[0.9375rem] tabular-nums outline-none"
        />
        {suffix && <span className="pr-3 text-sm whitespace-nowrap text-muted-foreground">{suffix}</span>}
      </div>
      {hint && (
        <p id={`${id}-hint`} className="text-[0.8125rem] leading-snug text-muted-foreground">
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
    <fieldset>
      <legend className="mb-1.5 text-sm font-medium">{label}</legend>
      <div className="flex flex-wrap gap-1 rounded-md border border-input bg-card p-1">
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              "flex-1 cursor-pointer rounded-sm px-3 py-1.5 text-center text-[0.9375rem] transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring",
              value === option.value
                ? "bg-secondary font-semibold text-foreground"
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

const toneText: Record<Tone, string> = {
  good: "text-success",
  caution: "text-warning",
  risk: "text-destructive",
};

export function Flag({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-sm border border-current px-2 py-0.5 text-[0.8125rem] font-semibold",
        toneText[tone]
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
      <p className="text-3xl font-extrabold tracking-tight tabular-nums sm:text-4xl">{value}</p>
      {sub && <p className="text-sm text-muted-foreground">{sub}</p>}
    </div>
  );
}

export type WorksheetRow = {
  label: ReactNode;
  value: ReactNode;
  kind?: "line" | "subtotal" | "note" | "total";
  control?: ReactNode;
};

export function Worksheet({
  rows,
  caption,
  footer,
  variant = "tool",
}: {
  rows: WorksheetRow[];
  caption?: ReactNode;
  footer?: ReactNode;
  variant?: "tool" | "hero";
}) {
  const hero = variant === "hero";
  return (
    <div
      data-enter={hero ? "" : undefined}
      className={cn(
        "relative rounded-md border border-border bg-card pr-5 pl-10 tabular-nums lining-nums before:absolute before:inset-y-0 before:left-6 before:w-px before:bg-margin",
        hero ? "py-5" : "py-3"
      )}
    >
      {caption && (
        <p className="mb-2 flex items-baseline justify-between gap-4 text-[0.8125rem] text-muted-foreground">
          {caption}
        </p>
      )}
      <dl>
        {rows.map((row, i) => (
          <WorksheetLine key={i} row={row} index={i} large={hero} />
        ))}
      </dl>
      {footer && <div className="mt-4 text-[0.8125rem] leading-normal text-muted-foreground">{footer}</div>}
    </div>
  );
}

function WorksheetLine({ row, index, large }: { row: WorksheetRow; index: number; large: boolean }) {
  const kind = row.kind ?? "line";
  const stagger = { "--row": index } as CSSProperties;
  if (kind === "total") {
    return (
      <div className="flex items-baseline justify-between gap-4 pt-4 pb-2">
        <dt className="text-[1.0625rem] font-extrabold">{row.label}</dt>
        <dd
          aria-live="polite"
          style={stagger}
          className={cn(
            "enter-figure relative leading-none font-extrabold tracking-[-0.01em]",
            large ? "text-[1.875rem]" : "text-[1.625rem]"
          )}
        >
          {row.value}
          <span aria-hidden style={stagger} className="draw-rule absolute inset-x-0 -bottom-2 h-1 border-y border-margin" />
        </dd>
      </div>
    );
  }
  return (
    <div
      className={cn(
        "grid grid-cols-[1fr_auto] items-baseline gap-x-4 border-b border-border text-[0.9375rem]",
        kind === "subtotal" && "-mt-px border-t border-t-foreground font-bold",
        kind === "note" && "text-[0.8125rem] text-muted-foreground"
      )}
    >
      <dt className="py-2 text-pretty">{row.label}</dt>
      <dd style={stagger} className="enter-figure py-2 text-right">
        {row.value}
      </dd>
      {row.control && <dd className="col-span-2 pb-2">{row.control}</dd>}
    </div>
  );
}

export function Slider({
  labelledBy,
  value,
  min,
  max,
  step,
  onChange,
  valueText,
}: {
  labelledBy: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  valueText: string;
}) {
  return (
    <input
      type="range"
      aria-labelledby={labelledBy}
      aria-valuetext={valueText}
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="block h-6 w-full cursor-pointer accent-foreground"
    />
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
      <div className="relative h-2 rounded-sm bg-secondary">
        <div className={cn("h-full rounded-sm transition-[width]", fill)} style={{ width: `${pct}%` }} />
        {marks.map((mark) => (
          <div key={mark.at} className="absolute top-0 h-full" style={{ left: `${(mark.at / max) * 100}%` }}>
            <div className="h-full w-px -translate-x-1/2 bg-foreground/40" />
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
