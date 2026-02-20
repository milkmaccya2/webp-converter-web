import { describe, expect, it } from "vitest";
import { formatBytes, formatPercent } from "../utils.js";

describe("formatBytes", () => {
  it("formats bytes correctly", () => {
    expect(formatBytes(500)).toBe("500B");
  });

  it("formats kilobytes correctly", () => {
    expect(formatBytes(1024)).toBe("1.0KB");
    expect(formatBytes(1536)).toBe("1.5KB");
  });

  it("formats megabytes correctly", () => {
    expect(formatBytes(1024 * 1024)).toBe("1.00MB");
    expect(formatBytes(1024 * 1024 * 2.5)).toBe("2.50MB");
  });
});

describe("formatPercent", () => {
  it("shows reduction as negative percent", () => {
    expect(formatPercent(1000, 800)).toBe("-20.0%");
  });

  it("shows increase as positive percent", () => {
    expect(formatPercent(800, 1000)).toBe("+25.0%");
  });

  it("handles zero original size", () => {
    expect(formatPercent(0, 100)).toBe("0%");
  });

  it("shows 0% for equal sizes", () => {
    expect(formatPercent(1000, 1000)).toBe("-0.0%");
  });
});
