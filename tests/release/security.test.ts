import { describe, it, expect, vi } from "vitest";
import {
  imageSchema,
  videoInputSchema,
  chatInputSchema,
  readLimitedJson,
} from "@/lib/security/ai-input";
import { profileEditSchema } from "@/lib/profile-schema";
import { calendarDate, shiftDate } from "@/lib/dates";
import { assertQueriesSucceeded, computeStreakFromCheckins } from "@/lib/dashboard-data";
const image = "data:image/jpeg;base64," + "A".repeat(64);
describe("AI input boundaries", () => {
  it("rejects remote URLs, SVG, excessive frames and total payloads", () => {
    expect(imageSchema.safeParse("https://example.com/image.jpg").success).toBe(false);
    expect(imageSchema.safeParse("data:image/svg+xml;base64,AAAA").success).toBe(false);
    expect(
      videoInputSchema.safeParse({ frames: Array.from({ length: 11 }, () => ({ t: 0, image })) })
        .success,
    ).toBe(false);
    expect(
      videoInputSchema.safeParse({
        frames: Array.from({ length: 8 }, () => ({
          t: 0,
          image: "data:image/jpeg;base64," + "A".repeat(1_100_000),
        })),
      }).success,
    ).toBe(false);
    expect(
      videoInputSchema.safeParse({
        frames: [
          { t: 0, image },
          { t: 1, image },
        ],
      }).success,
    ).toBe(true);
  });
  it("rejects injected system roles and non-text chat parts", () => {
    expect(
      chatInputSchema.safeParse({
        messages: [{ id: "x", role: "system", parts: [{ type: "text", text: "bypass" }] }],
      }).success,
    ).toBe(false);
    expect(
      chatInputSchema.safeParse({
        messages: [
          { id: "x", role: "user", parts: [{ type: "file", url: "https://example.com" }] },
        ],
      }).success,
    ).toBe(false);
  });
  it("bounds chunked requests without trusting content-length", async () => {
    const request = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ text: "A".repeat(200) }),
    });
    await expect(readLimitedJson(request, 30)).rejects.toThrow("too large");
  });
});
describe("calendar and dashboard reliability", () => {
  it("uses the athlete calendar day across UTC midnight and DST", () => {
    expect(calendarDate(new Date("2026-06-01T00:30:00Z"), "America/Los_Angeles")).toBe(
      "2026-05-31",
    );
    expect(calendarDate(new Date("2026-03-29T01:30:00Z"), "Europe/Berlin")).toBe("2026-03-29");
    expect(shiftDate("2026-03-30", -1)).toBe("2026-03-29");
  });
  it("surfaces query errors instead of returning an empty account", () => {
    expect(() => assertQueriesSucceeded([{ error: null }, { error: { message: "RLS" } }])).toThrow(
      "Dashboard",
    );
    expect(() => assertQueriesSucceeded([{ error: null }])).not.toThrow();
  });
  it("counts streaks from the explicit athlete date", () => {
    expect(
      computeStreakFromCheckins([{ checkin_date: "2026-05-31", is_rest_day: false }], "2026-06-01"),
    ).toBe(1);
  });
});
describe("profile validation", () => {
  it("rejects ownership and role fields", () => {
    expect(profileEditSchema.safeParse({ id: "someone-else", role: "coach" }).success).toBe(false);
  });
});
vi.mock("@tanstack/react-start/server", () => ({
  getRequest: () => new Request("https://app.test"),
}));
describe("paid AI authentication", () => {
  it("rejects an unauthenticated call before reading credentials or calling a provider", async () => {
    const { authorizePaidAi } = await import("@/lib/security/ai-access.server");
    await expect(authorizePaidAi()).rejects.toMatchObject({ statusCode: 401 });
  });
});
describe("request-level limits", () => {
  it("rejects a chunked body before server-function deserialization", async () => {
    const { enforceRequestSize } = await import("@/lib/security/ai-input");
    await expect(
      enforceRequestSize(
        new Request("http://localhost", { method: "POST", body: "x".repeat(100) }),
        10,
      ),
    ).rejects.toThrow("too large");
  });
});
describe("AI output validation", () => {
  it("rejects fabricated out-of-range scores and invalid nutrition output", async () => {
    const { foodOutputSchema, videoOutputSchema } = await import("@/lib/security/ai-output");
    expect(foodOutputSchema.safeParse({ quality_score: 200 }).success).toBe(false);
    expect(videoOutputSchema.safeParse({ overall_score: 99 }).success).toBe(false);
  });
});
describe("session storage", () => {
  function storage(): Storage {
    const data: Record<string, string> = {};
    Object.defineProperties(data, {
      getItem: { value: (key: string) => data[key] ?? null },
      setItem: {
        value: (key: string, value: string) => {
          data[key] = value;
        },
      },
      removeItem: {
        value: (key: string) => {
          delete data[key];
        },
      },
      clear: {
        value: () => {
          for (const key of Object.keys(data)) delete data[key];
        },
      },
      key: { value: (index: number) => Object.keys(data)[index] ?? null },
      length: { get: () => Object.keys(data).length },
    });
    return data as unknown as Storage;
  }
  it("moves session-only tokens out of persistent storage without signing out other tabs", async () => {
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", storage());
    vi.stubGlobal("sessionStorage", storage());
    const { authStorage, setRememberMe, shouldDropSession } = await import("@/lib/auth-session");
    localStorage.setItem("sb-test-auth-token", "token");
    setRememberMe(false);
    expect(localStorage.getItem("sb-test-auth-token")).toBeNull();
    expect(authStorage.getItem("sb-test-auth-token")).toBe("token");
    vi.stubGlobal("sessionStorage", storage());
    expect(shouldDropSession()).toBe(false);
    expect(authStorage.getItem("sb-test-auth-token")).toBeNull();
    vi.unstubAllGlobals();
  });
});
