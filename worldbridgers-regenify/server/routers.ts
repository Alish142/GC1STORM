import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { mockIssuers, mockOfferings, mockIndices, mockDocuments, mockGraphData } from "./mockData";
import { TRPCError } from "@trpc/server";
import { ENV } from "./_core/env";
import { sdk } from "./_core/sdk";
import { upsertUser } from "./db";

// ── Demo login ──────────────────────────────────────────────────────────────
const DEMO_OPEN_ID = "demo-regenify-user-9999";

async function createDemoToken(email: string) {
  // Upsert the demo user so authenticateRequest can find them in DB
  if (ENV.databaseUrl) {
    await upsertUser({
      openId: DEMO_OPEN_ID,
      name: "Demo User",
      email,
      loginMethod: "demo",
      lastSignedIn: new Date(),
    });
  }
  // Create a proper session token the SDK can verify
  // Use a stable local fallback when VITE_APP_ID is not configured.
  return sdk.signSession({
    openId: DEMO_OPEN_ID,
    appId: ENV.appId || "local-dev-app",
    name: "Demo User",
  });
}

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    demoLogin: publicProcedure
      .input(z.object({ email: z.string(), password: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const validCredentials =
          (input.email === "demo@regenify.com" && input.password === "demo1234") ||
          (input.email.includes("@") && input.password.length >= 4);

        if (!validCredentials) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password." });
        }

        // Create a demo session cookie
        const token = await createDemoToken(input.email);
        const cookieOptions = getSessionCookieOptions(ctx.req);
        (ctx.res as import("express").Response).cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

        return {
          success: true,
          user: {
            id: 9999,
            name: "Demo User",
            email: input.email,
            role: "user" as const,
          },
        };
      }),
  }),

  // ── Issuers ──────────────────────────────────────────────────────────────
  issuers: router({
    list: publicProcedure
      .input(
        z.object({
          search: z.string().optional(),
          classifications: z.array(z.string()).optional(),
          regions: z.array(z.string()).optional(),
          wbxLabel: z.boolean().optional(),
          euTaxonomy: z.boolean().optional(),
          page: z.number().default(1),
          pageSize: z.number().default(20),
          sortBy: z.string().optional(),
          sortDir: z.enum(["asc", "desc"]).default("asc"),
        })
      )
      .query(({ input }) => {
        let data = [...mockIssuers];

        if (input.search) {
          const q = input.search.toLowerCase();
          data = data.filter(
            (d) =>
              d.name.toLowerCase().includes(q) ||
              d.country.toLowerCase().includes(q) ||
              d.classification.toLowerCase().includes(q)
          );
        }
        if (input.classifications?.length) {
          data = data.filter((d) => input.classifications!.includes(d.classification));
        }
        if (input.regions?.length) {
          data = data.filter((d) => input.regions!.includes(d.region));
        }
        if (input.wbxLabel) data = data.filter((d) => d.wbxLabel);
        if (input.euTaxonomy) data = data.filter((d) => d.euTaxonomy);

        if (input.sortBy) {
          data.sort((a, b) => {
            const av = (a as unknown as Record<string, unknown>)[input.sortBy!] ?? "";
            const bv = (b as unknown as Record<string, unknown>)[input.sortBy!] ?? "";
            const cmp = String(av).localeCompare(String(bv));
            return input.sortDir === "desc" ? -cmp : cmp;
          });
        }

        const total = data.length;
        const start = (input.page - 1) * input.pageSize;
        return { data: data.slice(start, start + input.pageSize), total, page: input.page, pageSize: input.pageSize };
      }),
  }),

  // ── Offerings ────────────────────────────────────────────────────────────
  offerings: router({
    list: publicProcedure
      .input(
        z.object({
          search: z.string().optional(),
          types: z.array(z.string()).optional(),
          includeDelisted: z.boolean().default(false),
          page: z.number().default(1),
          pageSize: z.number().default(20),
          sortBy: z.string().optional(),
          sortDir: z.enum(["asc", "desc"]).default("asc"),
        })
      )
      .query(({ input }) => {
        let data = [...mockOfferings];

        if (!input.includeDelisted) data = data.filter((d) => !d.delisted);
        if (input.search) {
          const q = input.search.toLowerCase();
          data = data.filter(
            (d) =>
              d.name.toLowerCase().includes(q) ||
              d.issuer.toLowerCase().includes(q) ||
              d.isin.toLowerCase().includes(q)
          );
        }
        if (input.types?.length) data = data.filter((d) => input.types!.includes(d.type));

        if (input.sortBy) {
          data.sort((a, b) => {
            const av = (a as unknown as Record<string, unknown>)[input.sortBy!] ?? "";
            const bv = (b as unknown as Record<string, unknown>)[input.sortBy!] ?? "";
            const cmp = String(av).localeCompare(String(bv));
            return input.sortDir === "desc" ? -cmp : cmp;
          });
        }

        const total = data.length;
        const start = (input.page - 1) * input.pageSize;
        return { data: data.slice(start, start + input.pageSize), total, page: input.page, pageSize: input.pageSize };
      }),
  }),

  // ── Indices ──────────────────────────────────────────────────────────────
  indices: router({
    list: publicProcedure
      .input(
        z.object({
          search: z.string().optional(),
          types: z.array(z.string()).optional(),
          currencies: z.array(z.string()).optional(),
          page: z.number().default(1),
          pageSize: z.number().default(20),
          sortBy: z.string().optional(),
          sortDir: z.enum(["asc", "desc"]).default("asc"),
        })
      )
      .query(({ input }) => {
        let data = [...mockIndices];

        if (input.search) {
          const q = input.search.toLowerCase();
          data = data.filter((d) => d.name.toLowerCase().includes(q) || d.type.toLowerCase().includes(q));
        }
        if (input.types?.length) data = data.filter((d) => input.types!.includes(d.type));
        if (input.currencies?.length) data = data.filter((d) => input.currencies!.includes(d.currency));

        if (input.sortBy) {
          data.sort((a, b) => {
            const av = (a as unknown as Record<string, unknown>)[input.sortBy!] ?? "";
            const bv = (b as unknown as Record<string, unknown>)[input.sortBy!] ?? "";
            const cmp = String(av).localeCompare(String(bv));
            return input.sortDir === "desc" ? -cmp : cmp;
          });
        }

        const total = data.length;
        const start = (input.page - 1) * input.pageSize;
        return { data: data.slice(start, start + input.pageSize), total, page: input.page, pageSize: input.pageSize };
      }),
  }),

  // ── Documents ────────────────────────────────────────────────────────────
  documents: router({
    list: publicProcedure
      .input(
        z.object({
          search: z.string().optional(),
          types: z.array(z.string()).optional(),
          subTypes: z.array(z.string()).optional(),
          page: z.number().default(1),
          pageSize: z.number().default(20),
        })
      )
      .query(({ input }) => {
        let data = [...mockDocuments];

        if (input.search) {
          const q = input.search.toLowerCase();
          data = data.filter(
            (d) =>
              d.name.toLowerCase().includes(q) ||
              d.type.toLowerCase().includes(q) ||
              d.subType.toLowerCase().includes(q)
          );
        }
        if (input.types?.length && !input.types.includes("All")) {
          data = data.filter((d) => input.types!.includes(d.type));
        }
        if (input.subTypes?.length) data = data.filter((d) => input.subTypes!.includes(d.subType));

        const total = data.length;
        const start = (input.page - 1) * input.pageSize;
        return { data: data.slice(start, start + input.pageSize), total, page: input.page, pageSize: input.pageSize };
      }),
  }),

  // ── Graph ────────────────────────────────────────────────────────────────
  graph: router({
    data: publicProcedure
      .input(
        z.object({
          filterTypes: z.array(z.string()).optional(),
          filterRegions: z.array(z.string()).optional(),
          search: z.string().optional(),
        })
      )
      .query(({ input }) => {
        let nodes = [...mockGraphData.nodes];
        let edges = [...mockGraphData.edges];

        if (input.filterTypes?.length) {
          nodes = nodes.filter((n) => input.filterTypes!.includes(n.type));
          const nodeIds = new Set(nodes.map((n) => n.id));
          edges = edges.filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target));
        }
        if (input.filterRegions?.length) {
          nodes = nodes.filter((n) => !n.region || input.filterRegions!.includes(n.region));
          const nodeIds = new Set(nodes.map((n) => n.id));
          edges = edges.filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target));
        }
        if (input.search) {
          const q = input.search.toLowerCase();
          nodes = nodes.filter((n) => n.label.toLowerCase().includes(q));
          const nodeIds = new Set(nodes.map((n) => n.id));
          edges = edges.filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target));
        }

        return { nodes, edges };
      }),
  }),
});

export type AppRouter = typeof appRouter;
