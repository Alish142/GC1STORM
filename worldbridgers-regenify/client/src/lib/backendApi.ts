import {
  demoUser,
  fallbackDocuments,
  fallbackGraphData,
  fallbackIndices,
  fallbackIssuers,
  fallbackOfferings,
  type DocumentRecord,
  type GraphEdge,
  type GraphNode,
  type Issuer,
  type MarketIndex,
  type Offering,
} from "@/lib/frontendFallbackData";

const API_BASE = import.meta.env.VITE_BACKEND_API_BASE_URL ?? "http://localhost:8000";
const LOCAL_USER_KEY = "manus-runtime-user-info";

type AuthUser = {
  id: number;
  openId?: string;
  email: string;
  name: string;
  role: string;
};

type Paginated<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...(init ?? {}),
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  }

  return (await res.json()) as T;
}

function isNetworkError(error: unknown) {
  return error instanceof TypeError || error instanceof Error;
}

function readStoredUser(): AuthUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = localStorage.getItem(LOCAL_USER_KEY);
    if (!raw || raw === "null") {
      return null;
    }

    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function buildDemoUser(email: string) {
  return {
    ...demoUser,
    email,
  };
}

function sortData<T extends Record<string, unknown>>(rows: T[], sortBy: string | null, sortDir: "asc" | "desc") {
  if (!sortBy) {
    return rows;
  }

  return [...rows].sort((a, b) => {
    const av = a[sortBy];
    const bv = b[sortBy];
    const left = av == null ? "" : String(av);
    const right = bv == null ? "" : String(bv);
    const result = left.localeCompare(right, undefined, { numeric: true, sensitivity: "base" });
    return sortDir === "desc" ? -result : result;
  });
}

function paginate<T>(rows: T[], params: URLSearchParams): Paginated<T> {
  const page = Number(params.get("page") ?? "1");
  const pageSize = Number(params.get("page_size") ?? "20");
  const start = (page - 1) * pageSize;

  return {
    data: rows.slice(start, start + pageSize),
    total: rows.length,
    page,
    pageSize,
  };
}

function filterIssuers(params: URLSearchParams) {
  const search = params.get("search")?.toLowerCase() ?? "";
  const classifications = params.getAll("classifications");
  const regions = params.getAll("regions");
  const wbxLabel = params.get("wbx_label") === "true";
  const euTaxonomy = params.get("eu_taxonomy") === "true";
  const sortBy = params.get("sort_by");
  const sortDir = (params.get("sort_dir") as "asc" | "desc") || "asc";

  let rows = [...fallbackIssuers];
  if (search) {
    rows = rows.filter((row) =>
      [row.name, row.country, row.classification].some((value) => value.toLowerCase().includes(search))
    );
  }
  if (classifications.length) {
    rows = rows.filter((row) => classifications.includes(row.classification));
  }
  if (regions.length) {
    rows = rows.filter((row) => regions.includes(row.region));
  }
  if (wbxLabel) {
    rows = rows.filter((row) => row.wbxLabel);
  }
  if (euTaxonomy) {
    rows = rows.filter((row) => row.euTaxonomy);
  }

  return paginate(sortData(rows, sortBy, sortDir), params);
}

function filterOfferings(params: URLSearchParams) {
  const search = params.get("search")?.toLowerCase() ?? "";
  const types = params.getAll("types");
  const includeDelisted = params.get("include_delisted") === "true";
  const sortBy = params.get("sort_by");
  const sortDir = (params.get("sort_dir") as "asc" | "desc") || "asc";

  let rows = [...fallbackOfferings];
  if (!includeDelisted) {
    rows = rows.filter((row) => !row.delisted);
  }
  if (search) {
    rows = rows.filter((row) =>
      [row.name, row.issuer, row.isin].some((value) => value.toLowerCase().includes(search))
    );
  }
  if (types.length) {
    rows = rows.filter((row) => types.includes(row.type));
  }

  return paginate(sortData(rows, sortBy, sortDir), params);
}

function filterIndices(params: URLSearchParams) {
  const search = params.get("search")?.toLowerCase() ?? "";
  const types = params.getAll("types");
  const currencies = params.getAll("currencies");
  const sortBy = params.get("sort_by");
  const sortDir = (params.get("sort_dir") as "asc" | "desc") || "asc";

  let rows = [...fallbackIndices];
  if (search) {
    rows = rows.filter((row) =>
      [row.name, row.type].some((value) => value.toLowerCase().includes(search))
    );
  }
  if (types.length) {
    rows = rows.filter((row) => types.includes(row.type));
  }
  if (currencies.length) {
    rows = rows.filter((row) => currencies.includes(row.currency));
  }

  return paginate(sortData(rows, sortBy, sortDir), params);
}

function filterDocuments(params: URLSearchParams) {
  const search = params.get("search")?.toLowerCase() ?? "";
  const types = params.getAll("types");
  const subTypes = params.getAll("sub_types");

  let rows = [...fallbackDocuments];
  if (search) {
    rows = rows.filter((row) =>
      [row.name, row.type, row.subType].some((value) => value.toLowerCase().includes(search))
    );
  }
  if (types.length && !types.includes("All")) {
    rows = rows.filter((row) => types.includes(row.type));
  }
  if (subTypes.length) {
    rows = rows.filter((row) => subTypes.includes(row.subType));
  }

  return paginate(rows, params);
}

function filterGraph(params: URLSearchParams): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const search = params.get("search")?.toLowerCase() ?? "";
  const filterTypes = params.getAll("filter_types");
  const filterRegions = params.getAll("filter_regions");

  let nodes = [...fallbackGraphData.nodes];
  let edges = [...fallbackGraphData.edges];

  if (filterTypes.length) {
    nodes = nodes.filter((node) => filterTypes.includes(node.type));
  }
  if (filterRegions.length) {
    nodes = nodes.filter((node) => node.region && filterRegions.includes(node.region));
  }
  if (search) {
    nodes = nodes.filter((node) =>
      [node.label, node.type, node.region ?? "", node.country ?? ""].some((value) =>
        value.toLowerCase().includes(search)
      )
    );
  }

  const validNodeIds = new Set(nodes.map((node) => node.id));
  edges = edges.filter((edge) => validNodeIds.has(edge.source) && validNodeIds.has(edge.target));

  return { nodes, edges };
}

export const backendApi = {
  health: async () => {
    try {
      return await request<{ status: string }>("/api/health");
    } catch {
      return { status: "frontend-fallback" };
    }
  },
  me: async () => {
    try {
      return await request<AuthUser | null>("/api/auth/me");
    } catch (error) {
      if (isNetworkError(error)) {
        return readStoredUser();
      }
      throw error;
    }
  },
  demoLogin: async (email: string, password: string) => {
    try {
      return await request<{ success: boolean; user: AuthUser }>("/api/auth/demo-login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
    } catch (error) {
      if (!isNetworkError(error)) {
        throw error;
      }

      const validCredentials =
        (email === "demo@regenify.com" && password === "demo1234") ||
        (email.includes("@") && password.length >= 4);

      if (!validCredentials) {
        throw new Error("Invalid email or password.");
      }

      return {
        success: true,
        user: buildDemoUser(email),
      };
    }
  },
  logout: async () => {
    try {
      return await request<{ success: boolean }>("/api/auth/logout", { method: "POST" });
    } catch (error) {
      if (isNetworkError(error)) {
        return { success: true };
      }
      throw error;
    }
  },
  issuers: async (params: URLSearchParams) => {
    try {
      return await request<Paginated<Issuer>>(`/api/data/issuers?${params.toString()}`);
    } catch (error) {
      if (isNetworkError(error)) {
        return filterIssuers(params);
      }
      throw error;
    }
  },
  offerings: async (params: URLSearchParams) => {
    try {
      return await request<Paginated<Offering>>(`/api/data/offerings?${params.toString()}`);
    } catch (error) {
      if (isNetworkError(error)) {
        return filterOfferings(params);
      }
      throw error;
    }
  },
  indices: async (params: URLSearchParams) => {
    try {
      return await request<Paginated<MarketIndex>>(`/api/data/indices?${params.toString()}`);
    } catch (error) {
      if (isNetworkError(error)) {
        return filterIndices(params);
      }
      throw error;
    }
  },
  documents: async (params: URLSearchParams) => {
    try {
      return await request<Paginated<DocumentRecord>>(`/api/data/documents?${params.toString()}`);
    } catch (error) {
      if (isNetworkError(error)) {
        return filterDocuments(params);
      }
      throw error;
    }
  },
  graph: async (params: URLSearchParams) => {
    try {
      return await request<{ nodes: GraphNode[]; edges: GraphEdge[] }>(`/api/data/graph?${params.toString()}`);
    } catch (error) {
      if (isNetworkError(error)) {
        return filterGraph(params);
      }
      throw error;
    }
  },
};
