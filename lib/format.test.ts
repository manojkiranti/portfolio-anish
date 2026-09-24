import { describe, expect, it } from "vitest";
import { formatAccounting } from "@/lib/format";

describe("formatAccounting", () => {
  it("prints a plain figure with thousands separators", () => {
    expect(formatAccounting(9000)).toBe("9,000");
  });

  it("brackets a deduction", () => {
    expect(formatAccounting(3500, { deduct: true })).toBe("(3,500)");
  });

  it("brackets a negative figure", () => {
    expect(formatAccounting(-4720)).toBe("(4,720)");
  });

  it("rounds to whole dollars before bracketing", () => {
    expect(formatAccounting(3499.6, { deduct: true })).toBe("(3,500)");
    expect(formatAccounting(-380.2)).toBe("(380)");
  });

  it("never brackets or signs zero", () => {
    expect(formatAccounting(0, { deduct: true })).toBe("0");
    expect(formatAccounting(-0.4)).toBe("0");
    expect(formatAccounting(0, { currency: true })).toBe("$0");
  });

  it("adds the dollar sign when asked", () => {
    expect(formatAccounting(586610.4, { currency: true })).toBe("$586,610");
    expect(formatAccounting(-1200, { currency: true })).toBe("($1,200)");
  });
});
