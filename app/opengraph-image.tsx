import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { calculateServiceability } from "@/lib/calculators";
import { heroWorksheet as cfg, siteConfig } from "@/lib/content";
import { formatAccounting, formatCurrency } from "@/lib/format";

export const alt = `${siteConfig.name}, ${siteConfig.title}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAPER = "#F3F6F1";
const SHEET = "#FFFFFF";
const INK = "#14211A";
const PENCIL = "#4A5A50";
const RULE = "#C9D8CB";
const MARGIN = "#D98F88";

export default async function Image() {
  const [regular, extraBold] = await Promise.all([
    readFile(join(process.cwd(), "assets/fonts/LibreFranklin-Regular.ttf")),
    readFile(join(process.cwd(), "assets/fonts/LibreFranklin-ExtraBold.ttf")),
  ]);

  const r = calculateServiceability({
    netMonthlyIncome: cfg.income.initial,
    monthlyExpenses: cfg.expenses.initial,
    otherMonthlyRepayments: cfg.otherMonthlyRepayments,
    creditCardLimits: cfg.creditCardLimits,
    annualRatePct: cfg.annualRatePct,
    termYears: cfg.termYears,
  });

  const rows: [string, string][] = [
    ["Net monthly income", formatAccounting(cfg.income.initial)],
    ["Living expenses", formatAccounting(cfg.expenses.initial, { deduct: true })],
    ["Other loan repayments", formatAccounting(cfg.otherMonthlyRepayments, { deduct: true })],
    ["Card limits", formatAccounting(r.creditCardCommitment, { deduct: true })],
    ["Monthly surplus", formatAccounting(r.monthlySurplus)],
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: PAPER,
          color: INK,
          fontFamily: "Libre Franklin",
          padding: 72,
          gap: 64,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1 }}>
          <div style={{ fontSize: 96, fontWeight: 800, lineHeight: 0.95, letterSpacing: "-0.025em" }}>
            {siteConfig.name}
          </div>
          <div style={{ fontSize: 34, color: PENCIL, marginTop: 28, lineHeight: 1.35 }}>{siteConfig.tagline}</div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignSelf: "center",
            width: 440,
            background: SHEET,
            border: `2px solid ${RULE}`,
            borderRadius: 6,
            padding: "28px 32px 28px 56px",
            position: "relative",
          }}
        >
          <div style={{ position: "absolute", left: 30, top: 0, bottom: 0, width: 2, background: MARGIN }} />
          {rows.map(([label, value], i) => {
            const last = i === rows.length - 1;
            return (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 24,
                  padding: "10px 0",
                  borderBottom: `1.5px solid ${RULE}`,
                  // Satori trims every shorthand value, so an undefined border crashes the render.
                  ...(last ? { borderTop: `2px solid ${INK}` } : {}),
                  fontWeight: last ? 800 : 400,
                }}
              >
                <span>{label}</span>
                <span>{value}</span>
              </div>
            );
          })}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 22 }}>
            <span style={{ fontSize: 26, fontWeight: 800 }}>Capacity</span>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <span style={{ fontSize: 44, fontWeight: 800 }}>{formatCurrency(r.maxLoan)}</span>
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  height: 7,
                  marginTop: 6,
                  borderTop: `2px solid ${MARGIN}`,
                  borderBottom: `2px solid ${MARGIN}`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Libre Franklin", data: regular, style: "normal", weight: 400 },
        { name: "Libre Franklin", data: extraBold, style: "normal", weight: 800 },
      ],
    }
  );
}
