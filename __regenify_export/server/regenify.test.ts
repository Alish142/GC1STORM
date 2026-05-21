import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

// ── Shared context factory ────────────────────────────────────────────────────
type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createMockContext(user?: Partial<AuthenticatedUser>): {
  ctx: TrpcContext;
  setCookies: Array<{ name: string; value: string; options: Record<string, unknown> }>;
  clearedCookies: Array<{ name: string; options: Record<string, unknown> }>;
} {
  const setCookies: Array<{ name: string; value: string; options: Record<string, unknown> }> = [];
  const clearedCookies: Array<{ name: string; options: Record<string, unknown> }> = [];

  const defaultUser: AuthenticatedUser = {
    id: 1,
    openId: "demo-regenify-user-9999",
    email: "demo@regenify.com",
    name: "Demo User",
    loginMethod: "demo",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...user,
  };

  const ctx: TrpcContext = {
    user: defaultUser,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      cookie: (name: string, value: string, options: Record<string, unknown>) => {
        setCookies.push({ name, value, options });
      },
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as unknown as TrpcContext["res"],
  };

  return { ctx, setCookies, clearedCookies };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      cookie: () => {},
      clearCookie: () => {},
    } as unknown as TrpcContext["res"],
  };
}

// ── Auth tests ────────────────────────────────────────────────────────────────
describe("auth.me", () => {
  it("returns the current user when authenticated", async () => {
    const { ctx } = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).not.toBeNull();
    expect(result?.name).toBe("Demo User");
    expect(result?.email).toBe("demo@regenify.com");
  });

  it("returns null when unauthenticated", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });
});

describe("auth.logout", () => {
  it("clears the session cookie and returns success", async () => {
    const { ctx, clearedCookies } = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
    expect(clearedCookies).toHaveLength(1);
    expect(clearedCookies[0]?.name).toBe(COOKIE_NAME);
    expect(clearedCookies[0]?.options).toMatchObject({ maxAge: -1 });
  });
});

// ── Issuers tests ─────────────────────────────────────────────────────────────
describe("issuers.list", () => {
  it("returns paginated issuers", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.issuers.list({ page: 1, pageSize: 5 });
    expect(result.data).toHaveLength(5);
    expect(result.total).toBe(20);
    expect(result.page).toBe(1);
  });

  it("filters by search term", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.issuers.list({ search: "Nordic", page: 1, pageSize: 20 });
    expect(result.data.length).toBeGreaterThan(0);
    expect(result.data.every((d) => d.name.toLowerCase().includes("nordic"))).toBe(true);
  });

  it("filters by classification", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.issuers.list({ classifications: ["SSA"], page: 1, pageSize: 20 });
    expect(result.data.every((d) => d.classification === "SSA")).toBe(true);
  });

  it("filters by WBX label", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.issuers.list({ wbxLabel: true, page: 1, pageSize: 20 });
    expect(result.data.every((d) => d.wbxLabel === true)).toBe(true);
  });

  it("sorts by name ascending", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.issuers.list({ sortBy: "name", sortDir: "asc", page: 1, pageSize: 20 });
    const names = result.data.map((d) => d.name);
    const sorted = [...names].sort((a, b) => a.localeCompare(b));
    expect(names).toEqual(sorted);
  });
});

// ── Offerings tests ───────────────────────────────────────────────────────────
describe("offerings.list", () => {
  it("excludes delisted by default", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.offerings.list({ page: 1, pageSize: 30 });
    expect(result.data.every((d) => !d.delisted)).toBe(true);
  });

  it("includes delisted when flag is set", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.offerings.list({ includeDelisted: true, page: 1, pageSize: 30 });
    const hasDelisted = result.data.some((d) => d.delisted);
    expect(hasDelisted).toBe(true);
  });

  it("filters by type", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.offerings.list({ types: ["Bonds"], page: 1, pageSize: 30 });
    expect(result.data.every((d) => d.type === "Bonds")).toBe(true);
  });

  it("searches by ISIN", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.offerings.list({ search: "XS2345678901", page: 1, pageSize: 10 });
    expect(result.data.length).toBeGreaterThan(0);
    expect(result.data[0]?.isin).toBe("XS2345678901");
  });
});

// ── Indices tests ─────────────────────────────────────────────────────────────
describe("indices.list", () => {
  it("returns all indices paginated", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.indices.list({ page: 1, pageSize: 20 });
    expect(result.total).toBe(15);
    expect(result.data.length).toBeLessThanOrEqual(15);
  });

  it("filters by type", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.indices.list({ types: ["WBX Indices"], page: 1, pageSize: 20 });
    expect(result.data.every((d) => d.type === "WBX Indices")).toBe(true);
  });

  it("filters by currency", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.indices.list({ currencies: ["EUR"], page: 1, pageSize: 20 });
    expect(result.data.every((d) => d.currency === "EUR")).toBe(true);
  });
});

// ── Documents tests ───────────────────────────────────────────────────────────
describe("documents.list", () => {
  it("returns paginated documents", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.documents.list({ page: 1, pageSize: 10 });
    expect(result.data).toHaveLength(10);
    expect(result.total).toBe(18);
  });

  it("filters by document type", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.documents.list({ types: ["Notices"], page: 1, pageSize: 20 });
    expect(result.data.every((d) => d.type === "Notices")).toBe(true);
  });

  it("filters by sub-type", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.documents.list({ subTypes: ["Annual Reports"], page: 1, pageSize: 20 });
    expect(result.data.every((d) => d.subType === "Annual Reports")).toBe(true);
  });
});

// ── Graph tests ───────────────────────────────────────────────────────────────
describe("graph.data", () => {
  it("returns all nodes and edges by default", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.graph.data({});
    expect(result.nodes.length).toBe(23);
    expect(result.edges.length).toBe(27);
  });

  it("filters nodes by type", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.graph.data({ filterTypes: ["Issuer"] });
    expect(result.nodes.every((n) => n.type === "Issuer")).toBe(true);
    // Edges should only connect filtered nodes
    const nodeIds = new Set(result.nodes.map((n) => n.id));
    expect(result.edges.every((e) => nodeIds.has(e.source) && nodeIds.has(e.target))).toBe(true);
  });

  it("filters nodes by search", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.graph.data({ search: "Nordic" });
    expect(result.nodes.every((n) => n.label.toLowerCase().includes("nordic"))).toBe(true);
  });
});
