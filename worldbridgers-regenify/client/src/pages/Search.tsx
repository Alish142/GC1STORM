import { useQuery } from "@tanstack/react-query";
import DashboardHeader from "@/components/DashboardHeader";
import { backendApi } from "@/lib/backendApi";
import {
  type Issuer,
  type Offering,
  type MarketIndex,
  type DocumentRecord,
} from "@/lib/frontendFallbackData";
import {
  Building2,
  Layers,
  BarChart3,
  FileText,
  Search as SearchIcon,
  Loader2,
} from "lucide-react";

type Paginated<T> = { data: T[]; total: number; page: number; pageSize: number };

function buildParams(input: Record<string, string | number | boolean | string[] | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || value === "") continue;
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v));
      continue;
    }
    params.set(key, String(value));
  }
  return params;
}

export default function Search() {
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get("q") || "";

  const issuersQuery = useQuery<Paginated<Issuer>>({
    queryKey: ["search-issuers", searchQuery],
    queryFn: () =>
      searchQuery
        ? (backendApi.issuers(buildParams({ search: searchQuery, page: 1, page_size: 10 })) as Promise<Paginated<Issuer>>)
        : Promise.resolve({ data: [], total: 0, page: 1, pageSize: 10 }),
    enabled: Boolean(searchQuery),
  });

  const offeringsQuery = useQuery<Paginated<Offering>>({
    queryKey: ["search-offerings", searchQuery],
    queryFn: () =>
      searchQuery
        ? (backendApi.offerings(buildParams({ search: searchQuery, page: 1, page_size: 10 })) as Promise<Paginated<Offering>>)
        : Promise.resolve({ data: [], total: 0, page: 1, pageSize: 10 }),
    enabled: Boolean(searchQuery),
  });

  const indicesQuery = useQuery<Paginated<MarketIndex>>({
    queryKey: ["search-indices", searchQuery],
    queryFn: () =>
      searchQuery
        ? (backendApi.indices(buildParams({ search: searchQuery, page: 1, page_size: 10 })) as Promise<Paginated<MarketIndex>>)
        : Promise.resolve({ data: [], total: 0, page: 1, pageSize: 10 }),
    enabled: Boolean(searchQuery),
  });

  const documentsQuery = useQuery<Paginated<DocumentRecord>>({
    queryKey: ["search-documents", searchQuery],
    queryFn: () =>
      searchQuery
        ? (backendApi.documents(buildParams({ search: searchQuery, page: 1, page_size: 10 })) as Promise<Paginated<DocumentRecord>>)
        : Promise.resolve({ data: [], total: 0, page: 1, pageSize: 10 }),
    enabled: Boolean(searchQuery),
  });

  const isLoading = issuersQuery.isLoading || offeringsQuery.isLoading || indicesQuery.isLoading || documentsQuery.isLoading;
  const totalResults =
    (issuersQuery.data?.data.length ?? 0) +
    (offeringsQuery.data?.data.length ?? 0) +
    (indicesQuery.data?.data.length ?? 0) +
    (documentsQuery.data?.data.length ?? 0);

  return (
    <div className="min-h-screen bg-[#f4f6fa] flex flex-col">
      <DashboardHeader />

      <div className="flex-1">
        <div className="container py-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <SearchIcon className="w-6 h-6 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Search Results</h1>
            </div>
            <p className="text-muted-foreground">
              {searchQuery ? `Results for "${searchQuery}"` : "Enter a search query"}
            </p>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {!isLoading && !searchQuery && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No search query provided</p>
            </div>
          )}

          {!isLoading && searchQuery && totalResults === 0 && (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">No results found for "{searchQuery}"</p>
              <p className="text-sm text-muted-foreground mt-2">Try searching with different keywords</p>
            </div>
          )}

          {!isLoading && searchQuery && totalResults > 0 && (
            <div className="space-y-8">
              {/* Issuers */}
              {(issuersQuery.data?.data.length ?? 0) > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Building2 className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold text-foreground">Issuers ({issuersQuery.data?.total})</h2>
                  </div>
                  <div className="space-y-2">
                    {issuersQuery.data?.data.map((item, i) => (
                      <div key={i} className="rounded-lg border border-border bg-white p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-foreground">{item.name}</h3>
                            <p className="text-sm text-muted-foreground">{item.country} • {item.classification}</p>
                          </div>
                          <div className="flex gap-1">
                            {item.wbxLabel && <span className="text-[9px] px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">WBX</span>}
                            {item.euTaxonomy && <span className="text-[9px] px-2 py-1 rounded-full bg-blue-500/10 text-blue-600 font-medium">EU</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Offerings */}
              {(offeringsQuery.data?.data.length ?? 0) > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Layers className="w-5 h-5 text-blue-600" />
                    <h2 className="text-xl font-semibold text-foreground">Offerings ({offeringsQuery.data?.total})</h2>
                  </div>
                  <div className="space-y-2">
                    {offeringsQuery.data?.data.map((item, i) => (
                      <div key={i} className="rounded-lg border border-border bg-white p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-foreground">{item.name}</h3>
                            <p className="text-sm text-muted-foreground">{item.issuer} • {item.isin}</p>
                            <p className="text-xs text-muted-foreground mt-1">{item.type} • {item.currency}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-foreground">{item.lastPrice.toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">{item.wbxClassification}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Indices */}
              {(indicesQuery.data?.data.length ?? 0) > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-5 h-5 text-amber-600" />
                    <h2 className="text-xl font-semibold text-foreground">Indices ({indicesQuery.data?.total})</h2>
                  </div>
                  <div className="space-y-2">
                    {indicesQuery.data?.data.map((item, i) => (
                      <div key={i} className="rounded-lg border border-border bg-white p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-foreground">{item.name}</h3>
                            <p className="text-sm text-muted-foreground">{item.type} • {item.currency}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-foreground">{item.last.toFixed(2)}</p>
                            <p className={`text-sm font-medium ${item.changePercent >= 0 ? "text-positive" : "text-negative"}`}>
                              {item.changePercent >= 0 ? "+" : ""}{item.changePercent.toFixed(2)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents */}
              {(documentsQuery.data?.data.length ?? 0) > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-purple-600" />
                    <h2 className="text-xl font-semibold text-foreground">Documents ({documentsQuery.data?.total})</h2>
                  </div>
                  <div className="space-y-2">
                    {documentsQuery.data?.data.map((item, i) => (
                      <div key={i} className="rounded-lg border border-border bg-white p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-foreground">{item.name}</h3>
                            <p className="text-sm text-muted-foreground">{item.issuer} • {item.subType}</p>
                            <p className="text-xs text-muted-foreground mt-1">{item.date} • {item.fileSize}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">{item.type}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
