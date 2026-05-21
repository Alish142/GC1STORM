const API_BASE = import.meta.env.VITE_BACKEND_API_BASE_URL ?? "http://localhost:8000";

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

export const backendApi = {
  health: () => request<{ status: string }>("/api/health"),
  me: () => request<unknown>("/api/auth/me"),
  demoLogin: (email: string, password: string) =>
    request<{ success: boolean; user: unknown }>("/api/auth/demo-login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  logout: () => request<{ success: boolean }>("/api/auth/logout", { method: "POST" }),
  issuers: (params: URLSearchParams) => request(`/api/data/issuers?${params.toString()}`),
  offerings: (params: URLSearchParams) => request(`/api/data/offerings?${params.toString()}`),
  indices: (params: URLSearchParams) => request(`/api/data/indices?${params.toString()}`),
  documents: (params: URLSearchParams) => request(`/api/data/documents?${params.toString()}`),
  graph: (params: URLSearchParams) => request(`/api/data/graph?${params.toString()}`),
};

