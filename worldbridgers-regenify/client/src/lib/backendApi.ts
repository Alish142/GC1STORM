import {
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
  type VisualConfig,
} from "@/lib/frontendFallbackData";

const API_BASE = import.meta.env.VITE_BACKEND_API_BASE_URL ?? "http://localhost:8000";

type AuthUser = {
  id: string;
  openId?: string;
  email: string;
  name: string;
  role: string;
  csrfCookieName?: string;
};

type Paginated<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
};

type PaginatedWithVisualConfig<T> = Paginated<T> & {
  visualConfig: VisualConfig;
};

type GraphResponse = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  visualConfig: VisualConfig;
  graphSource?: "neo4j" | "mock";
};

export type RecommendationRecord = {
  id: string;
  category: "theme" | "entity" | "document";
  title: string;
  reason: string;
  nodeId: string;
  nodeType: string;
  graphSource: "neo4j" | "mock";
};

type RecommendationResponse = {
  data: RecommendationRecord[];
  graphSource: "neo4j" | "mock";
  generatedAt: string;
};

type SupportRequestPayload = {
  fullName: string;
  email: string;
  phoneNumber?: string;
  topic: string;
  message: string;
};

type ContactRequestPayload = {
  fullName: string;
  companyName?: string;
  email: string;
  phoneNumber?: string;
  message: string;
};

type CallRequestPayload = {
  fullName?: string;
  email?: string;
  organisation?: string;
  preferredTime?: string;
  notes: string;
};

type SubmissionResponse<T> = {
  success: boolean;
  requestId: string;
  request: T;
};

type OverviewCounts = {
  issuers: number;
  offerings: number;
  indices: number;
  documents: number;
};

type AdminIssuerPayload = {
  name: string;
  country: string;
  region: string;
  classification: string;
  wbxLabel: boolean;
  euTaxonomy: boolean;
  description?: string;
  foundedYear?: number | null;
  assetsAmount?: number | null;
  assetsCurrency?: string;
};

type AdminOfferingPayload = {
  issuerId: string;
  type: string;
  segment: string;
  isin: string;
  name: string;
  issuedAmount?: number | null;
  currency: string;
  listingDate?: string;
  wbxClassification?: string;
  coupon?: number | null;
  lastPrice?: number | null;
  delisted: boolean;
};

type AdminIndexPayload = {
  type: string;
  name: string;
  currency: string;
  last?: number | null;
  changePercent?: number | null;
  change?: number | null;
  monthHigh?: number | null;
  monthLow?: number | null;
  yearHigh?: number | null;
  yearLow?: number | null;
};

type AdminDocumentUploadPayload = {
  file: File;
  type: string;
  name?: string;
  subType?: string;
  issuerId?: string;
  documentDate?: string;
  memberStates?: string[];
};

const DEFAULT_VISUAL_CONFIG: VisualConfig = {
  tableDots: {
    issuerName: "#22c55e",
    wbxLabel: "#f59e0b",
    offeringIssuer: "#3b82f6",
    documentIssuer: "#3b82f6",
    offeringType: "#f59e0b",
    indexType: "#8b5cf6",
    documentType: "#f43f5e",
  },
  hoverLineColor: "#111111",
};

class ApiRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

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
    let errorMessage = `Request failed: ${res.status} ${res.statusText}`;
    try {
      const payload = (await res.json()) as { detail?: string };
      if (payload?.detail) {
        errorMessage = payload.detail;
      }
    } catch {
      // Keep the generic fallback when the response body is not JSON.
    }
    throw new ApiRequestError(errorMessage, res.status);
  }

  return (await res.json()) as T;
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const prefix = `${name}=`;
  for (const cookie of document.cookie.split(";")) {
    const trimmed = cookie.trim();
    if (trimmed.startsWith(prefix)) {
      return decodeURIComponent(trimmed.slice(prefix.length));
    }
  }

  return null;
}

function withCsrfHeader(init: RequestInit = {}, cookieName = "app_csrf_token"): RequestInit {
  const token = readCookie(cookieName);
  if (!token) {
    return init;
  }

  return {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      "X-CSRF-Token": token,
    },
  };
}

function isNetworkError(error: unknown) {
  return error instanceof TypeError;
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

  return {
    ...paginate(
      sortData(
        rows.map((row) => ({
          ...row,
          issuerNameDotColor: DEFAULT_VISUAL_CONFIG.tableDots.issuerName,
          wbxLabelDotColor: DEFAULT_VISUAL_CONFIG.tableDots.wbxLabel,
        })),
        sortBy,
        sortDir
      ),
      params
    ),
    visualConfig: DEFAULT_VISUAL_CONFIG,
  };
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

  return {
    ...paginate(
      sortData(
        rows.map((row) => ({
          ...row,
          issuerDotColor: DEFAULT_VISUAL_CONFIG.tableDots.offeringIssuer,
          typeDotColor: DEFAULT_VISUAL_CONFIG.tableDots.offeringType,
        })),
        sortBy,
        sortDir
      ),
      params
    ),
    visualConfig: DEFAULT_VISUAL_CONFIG,
  };
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

  return {
    ...paginate(
      sortData(
        rows.map((row) => ({
          ...row,
          typeDotColor: DEFAULT_VISUAL_CONFIG.tableDots.indexType,
        })),
        sortBy,
        sortDir
      ),
      params
    ),
    visualConfig: DEFAULT_VISUAL_CONFIG,
  };
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

  return {
    ...paginate(
      rows.map((row) => ({
        ...row,
        issuerDotColor: DEFAULT_VISUAL_CONFIG.tableDots.documentIssuer,
        typeDotColor: DEFAULT_VISUAL_CONFIG.tableDots.documentType,
      })),
      params
    ),
    visualConfig: DEFAULT_VISUAL_CONFIG,
  };
}

function filterGraph(params: URLSearchParams): GraphResponse {
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

  return {
    nodes,
    edges,
    visualConfig: DEFAULT_VISUAL_CONFIG,
    graphSource: "mock",
  };
}

function buildFallbackRecommendations(): RecommendationResponse {
  const degrees = new Map<string, number>();
  const neighbors = new Map<string, Set<string>>();
  const nodesById = new Map(fallbackGraphData.nodes.map((node) => [node.id, node]));

  for (const edge of fallbackGraphData.edges) {
    degrees.set(edge.source, (degrees.get(edge.source) ?? 0) + 1);
    degrees.set(edge.target, (degrees.get(edge.target) ?? 0) + 1);

    const sourceNeighbors = neighbors.get(edge.source) ?? new Set<string>();
    sourceNeighbors.add(edge.target);
    neighbors.set(edge.source, sourceNeighbors);

    const targetNeighbors = neighbors.get(edge.target) ?? new Set<string>();
    targetNeighbors.add(edge.source);
    neighbors.set(edge.target, targetNeighbors);
  }

  const ranked = [...fallbackGraphData.nodes].sort((left, right) => {
    const degreeDiff = (degrees.get(right.id) ?? 0) - (degrees.get(left.id) ?? 0);
    return degreeDiff !== 0 ? degreeDiff : left.label.localeCompare(right.label);
  });

  const recommendations: RecommendationRecord[] = [];
  const usedNodeIds = new Set<string>();
  const addRecommendation = (node: GraphNode, category: RecommendationRecord["category"], reason: string) => {
    if (usedNodeIds.has(node.id) || recommendations.length >= 3) {
      return;
    }
    recommendations.push({
      id: `${category}:${node.id}`,
      category,
      title: node.label,
      reason,
      nodeId: node.id,
      nodeType: node.type,
      graphSource: "mock",
    });
    usedNodeIds.add(node.id);
  };

  for (const node of ranked) {
    if (node.type !== "Theme") {
      continue;
    }
    addRecommendation(
      node,
      "theme",
      neighbors.get(node.id)?.size
        ? `Connected to ${neighbors.get(node.id)?.size ?? 0} related nodes`
        : "A strong theme to start exploring the network",
    );
    if (recommendations.length >= 2) {
      break;
    }
  }

  for (const node of ranked) {
    if (node.type === "Theme") {
      continue;
    }
    const connectedTypes = [...(neighbors.get(node.id) ?? new Set<string>())]
      .map((neighborId) => nodesById.get(neighborId)?.type)
      .filter((value): value is string => Boolean(value));
    addRecommendation(
      node,
      "entity",
      connectedTypes.length
        ? `Touches ${[...new Set(connectedTypes)].slice(0, 2).join(", ")}`
        : "Worth reviewing from the current graph",
    );
    if (recommendations.length >= 3) {
      break;
    }
  }

  if (fallbackDocuments.length > 0 && recommendations.length > 0) {
    const anchor = recommendations[0];
    recommendations.push({
      id: `document-focus:${anchor.nodeId}`,
      category: "document",
      title: `Track disclosures around ${anchor.title}`,
      reason: `${fallbackDocuments.length} fallback documents are available for review`,
      nodeId: anchor.nodeId,
      nodeType: anchor.nodeType,
      graphSource: "mock",
    });
  }

  return {
    data: recommendations.slice(0, 3),
    graphSource: "mock",
    generatedAt: new Date().toISOString(),
  };
}

export const backendApi = {
  health: async () => {
    try {
      return await request<{ status: string; database?: { status: string; detail?: string } }>("/api/health");
    } catch {
      return { status: "frontend-fallback" };
    }
  },
  me: async () => {
    return request<AuthUser | null>("/api/auth/me");
  },
  login: async (email: string, password: string, rememberMe = false) => {
    return request<{ success: boolean; user: AuthUser }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, remember_me: rememberMe }),
    });
  },
  register: async ({
    firstName,
    lastName,
    email,
    password,
  }: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => {
    return request<{ success: boolean; user: AuthUser }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
      }),
    });
  },
  forgotPassword: async (email: string) => {
    return request<{ success: boolean; message: string; resetToken?: string; resetUrl?: string }>(
      "/api/auth/forgot-password",
      {
        method: "POST",
        body: JSON.stringify({ email }),
      }
    );
  },
  resetPassword: async (token: string, password: string) => {
    return request<{ success: boolean; message: string; user: AuthUser }>("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    });
  },
  changePassword: async (currentPassword: string, newPassword: string) => {
    return request<{ success: boolean; message: string }>("/api/auth/change-password", {
      ...withCsrfHeader(),
      method: "POST",
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });
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
  createSupportRequest: async (payload: SupportRequestPayload) => {
    return request<SubmissionResponse<{
      id: string;
      fullName: string;
      email: string;
      phoneNumber: string | null;
      topic: string;
      message: string;
      status: string;
      createdAt: string;
    }>>("/api/support/support-requests", {
      method: "POST",
      body: JSON.stringify({
        full_name: payload.fullName,
        email: payload.email,
        phone_number: payload.phoneNumber,
        topic: payload.topic,
        message: payload.message,
      }),
    });
  },
  createContactRequest: async (payload: ContactRequestPayload) => {
    return request<SubmissionResponse<{
      id: string;
      fullName: string;
      companyName: string | null;
      email: string;
      phoneNumber: string | null;
      message: string;
      status: string;
      createdAt: string;
    }>>("/api/support/contact-requests", {
      method: "POST",
      body: JSON.stringify({
        full_name: payload.fullName,
        company_name: payload.companyName,
        email: payload.email,
        phone_number: payload.phoneNumber,
        message: payload.message,
      }),
    });
  },
  createCallRequest: async (payload: CallRequestPayload) => {
    return request<SubmissionResponse<{
      id: string;
      userId: string | null;
      fullName: string | null;
      email: string | null;
      organisation: string | null;
      preferredTime: string | null;
      notes: string;
      status: string;
      createdAt: string;
    }>>("/api/support/call-requests", {
      method: "POST",
      body: JSON.stringify({
        full_name: payload.fullName,
        email: payload.email,
        organisation: payload.organisation,
        preferred_time: payload.preferredTime,
        notes: payload.notes,
      }),
    });
  },
  uploadAdminDocument: async (payload: AdminDocumentUploadPayload) => {
    const formData = new FormData();
    formData.append("file", payload.file);
    formData.append("type", payload.type);
    if (payload.name) {
      formData.append("name", payload.name);
    }
    if (payload.subType) {
      formData.append("sub_type", payload.subType);
    }
    if (payload.issuerId) {
      formData.append("issuer_id", payload.issuerId);
    }
    if (payload.documentDate) {
      formData.append("document_date", payload.documentDate);
    }
    if (payload.memberStates?.length) {
      formData.append("member_states", payload.memberStates.join(","));
    }

    const res = await fetch(`${API_BASE}/api/admin/documents`, {
      ...withCsrfHeader({ method: "POST", body: formData }),
      credentials: "include",
    });

    if (!res.ok) {
      let errorMessage = `Request failed: ${res.status} ${res.statusText}`;
      try {
        const payload = (await res.json()) as { detail?: string };
        if (payload?.detail) {
          errorMessage = payload.detail;
        }
      } catch {
        // Keep the generic fallback when the response body is not JSON.
      }
      throw new ApiRequestError(errorMessage, res.status);
    }

    return await res.json();
  },
  createIssuer: async (payload: AdminIssuerPayload) =>
    request<{ success: boolean; issuer: unknown }>("/api/admin/issuers", {
      ...withCsrfHeader(),
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateIssuer: async (issuerId: string, payload: AdminIssuerPayload) =>
    request<{ success: boolean; issuer: unknown }>(`/api/admin/issuers/${issuerId}`, {
      ...withCsrfHeader(),
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  deleteIssuer: async (issuerId: string) => {
    const res = await fetch(`${API_BASE}/api/admin/issuers/${issuerId}`, {
      ...withCsrfHeader({ method: "DELETE" }),
      credentials: "include",
    });
    if (!res.ok) {
      let errorMessage = `Request failed: ${res.status} ${res.statusText}`;
      try {
        const payload = (await res.json()) as { detail?: string };
        if (payload?.detail) errorMessage = payload.detail;
      } catch {}
      throw new ApiRequestError(errorMessage, res.status);
    }
    return { success: true };
  },
  createOffering: async (payload: AdminOfferingPayload) =>
    request<{ success: boolean; offering: unknown }>("/api/admin/offerings", {
      ...withCsrfHeader(),
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateOffering: async (offeringId: string, payload: AdminOfferingPayload) =>
    request<{ success: boolean; offering: unknown }>(`/api/admin/offerings/${offeringId}`, {
      ...withCsrfHeader(),
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  deleteOffering: async (offeringId: string) => {
    const res = await fetch(`${API_BASE}/api/admin/offerings/${offeringId}`, {
      ...withCsrfHeader({ method: "DELETE" }),
      credentials: "include",
    });
    if (!res.ok) {
      let errorMessage = `Request failed: ${res.status} ${res.statusText}`;
      try {
        const payload = (await res.json()) as { detail?: string };
        if (payload?.detail) errorMessage = payload.detail;
      } catch {}
      throw new ApiRequestError(errorMessage, res.status);
    }
    return { success: true };
  },
  createIndex: async (payload: AdminIndexPayload) =>
    request<{ success: boolean; index: unknown }>("/api/admin/indices", {
      ...withCsrfHeader(),
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateIndex: async (indexId: string, payload: AdminIndexPayload) =>
    request<{ success: boolean; index: unknown }>(`/api/admin/indices/${indexId}`, {
      ...withCsrfHeader(),
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  deleteIndex: async (indexId: string) => {
    const res = await fetch(`${API_BASE}/api/admin/indices/${indexId}`, {
      ...withCsrfHeader({ method: "DELETE" }),
      credentials: "include",
    });
    if (!res.ok) {
      let errorMessage = `Request failed: ${res.status} ${res.statusText}`;
      try {
        const payload = (await res.json()) as { detail?: string };
        if (payload?.detail) errorMessage = payload.detail;
      } catch {}
      throw new ApiRequestError(errorMessage, res.status);
    }
    return { success: true };
  },
  overview: async () => request<OverviewCounts>("/api/data/overview"),
  issuers: async (params: URLSearchParams) => {
    try {
      return await request<PaginatedWithVisualConfig<Issuer>>(`/api/data/issuers?${params.toString()}`);
    } catch (error) {
      if (isNetworkError(error)) {
        return filterIssuers(params);
      }
      throw error;
    }
  },
  offerings: async (params: URLSearchParams) => {
    try {
      return await request<PaginatedWithVisualConfig<Offering>>(`/api/data/offerings?${params.toString()}`);
    } catch (error) {
      if (isNetworkError(error)) {
        return filterOfferings(params);
      }
      throw error;
    }
  },
  indices: async (params: URLSearchParams) => {
    try {
      return await request<PaginatedWithVisualConfig<MarketIndex>>(`/api/data/indices?${params.toString()}`);
    } catch (error) {
      if (isNetworkError(error)) {
        return filterIndices(params);
      }
      throw error;
    }
  },
  documents: async (params: URLSearchParams, options?: { allowFallback?: boolean }) => {
    try {
      return await request<PaginatedWithVisualConfig<DocumentRecord>>(`/api/data/documents?${params.toString()}`);
    } catch (error) {
      if (options?.allowFallback !== false && isNetworkError(error)) {
        return filterDocuments(params);
      }
      throw error;
    }
  },
  graph: async (params: URLSearchParams) => {
    try {
      return await request<GraphResponse>(`/api/data/graph?${params.toString()}`);
    } catch (error) {
      if (isNetworkError(error)) {
        return filterGraph(params);
      }
      throw error;
    }
  },
  recommendations: async () => {
    try {
      return await request<RecommendationResponse>("/api/data/recommendations");
    } catch (error) {
      if (isNetworkError(error)) {
        return buildFallbackRecommendations();
      }
      throw error;
    }
  },
  adminVisualConfig: async () => request<VisualConfig>("/api/admin/visual-config"),
  updateVisualConfig: async (payload: { tableDots?: Record<string, string>; hoverLineColor?: string }) =>
    request<VisualConfig>("/api/admin/visual-config", {
      ...withCsrfHeader(),
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
};
