import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardHeader from "@/components/DashboardHeader";
import DataTable, { Column } from "@/components/DataTable";
import SidebarFilters, { FilterGroup } from "@/components/SidebarFilters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { backendApi } from "@/lib/backendApi";
import {
  Building2, Layers, BarChart3, FileText, Network,
  TrendingUp, TrendingDown, Download, Eye, ArrowRight,
  Leaf, ShieldCheck, Globe2, Loader2,
} from "lucide-react";
import { Link } from "wouter";

// ── Types ─────────────────────────────────────────────────────────────────────
type TabKey = "issuers" | "offerings" | "indices" | "documents";
type Paginated<T> = { data: T[]; total: number; page: number; pageSize: number };
type IssuerRow = { name: string; country: string; classification: string; wbxLabel: boolean; euTaxonomy: boolean; assets: string };
type OfferingRow = { type: string; segment: string; issuer: string; isin: string; name: string; issuedAmount: number; currency: string; listingDate: string; wbxClassification: string; coupon: number | null; lastPrice: number };
type IndexRow = { type: string; name: string; currency: string; last: number; changePercent: number; change: number; monthHigh: number; monthLow: number; yearHigh: number; yearLow: number };
type DocumentRow = { id: string; type: string; subType: string; name: string; issuer: string; memberStates: string[]; date: string; fileSize: string };

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "issuers", label: "Issuers", icon: Building2 },
  { key: "offerings", label: "Offerings", icon: Layers },
  { key: "indices", label: "Indices", icon: BarChart3 },
  { key: "documents", label: "Documents", icon: FileText },
];

// ── Filter configs ────────────────────────────────────────────────────────────
const ISSUER_FILTERS: FilterGroup[] = [
  {
    id: "classifications",
    label: "Issuer Classification",
    options: [
      { value: "SSA", label: "SSA", count: 4 },
      { value: "Civic Society", label: "Civic Society", count: 2 },
      { value: "Community", label: "Community", count: 3 },
      { value: "Financial", label: "Financial", count: 7 },
      { value: "Corporate", label: "Corporate", count: 4 },
    ],
  },
  {
    id: "wbx",
    label: "WBX Information",
    options: [
      { value: "wbxLabel", label: "WBX Labelled Instruments" },
      { value: "euTaxonomy", label: "EU Taxonomy Classification" },
    ],
  },
  {
    id: "regions",
    label: "Country & Regions",
    options: [
      { value: "Europe", label: "Europe", count: 8 },
      { value: "Asia", label: "Asia", count: 3 },
      { value: "Pacific", label: "Pacific", count: 2 },
      { value: "North America", label: "North America", count: 2 },
      { value: "South America", label: "South America", count: 2 },
      { value: "Africa", label: "Africa", count: 2 },
      { value: "Middle East", label: "Middle East", count: 1 },
    ],
  },
];

const OFFERING_FILTERS: FilterGroup[] = [
  {
    id: "types",
    label: "Instrument Type",
    options: [
      { value: "Bonds", label: "Bonds", count: 11 },
      { value: "Certificates", label: "Certificates", count: 3 },
      { value: "Funds", label: "Funds", count: 4 },
      { value: "Equities", label: "Equities", count: 3 },
      { value: "Warrants", label: "Warrants", count: 1 },
    ],
  },
  {
    id: "delisted",
    label: "Listing Status",
    options: [{ value: "includeDelisted", label: "Include Delisted" }],
  },
];

const INDEX_FILTERS: FilterGroup[] = [
  {
    id: "types",
    label: "Index Type",
    options: [
      { value: "Average Bond Yield Indices", label: "Average Bond Yield", count: 2 },
      { value: "WBX Indices", label: "WBX Indices", count: 3 },
      { value: "Sustainable Indices", label: "Sustainable Indices", count: 3 },
      { value: "Systems Indices", label: "Systems Indices", count: 2 },
      { value: "Social Indices", label: "Social Indices", count: 2 },
      { value: "Regenify Indices", label: "Regenify Indices", count: 3 },
    ],
  },
  {
    id: "currencies",
    label: "Currency",
    options: [
      { value: "EUR", label: "EUR", count: 8 },
      { value: "USD", label: "USD", count: 5 },
      { value: "AUD", label: "AUD", count: 1 },
      { value: "CHF", label: "CHF", count: 1 },
    ],
  },
];

const DOCUMENT_FILTERS: FilterGroup[] = [
  {
    id: "types",
    label: "Document Type",
    options: [
      { value: "All", label: "All Documents" },
      { value: "Offerings Documents", label: "Offerings Documents", count: 12 },
      { value: "Notices", label: "Notices", count: 6 },
    ],
  },
  {
    id: "subTypes",
    label: "Sub-Type",
    options: [
      { value: "Prospectus Supplement", label: "Prospectus Supplement", count: 5 },
      { value: "Annual Reports", label: "Annual Reports", count: 5 },
      { value: "Public Offer", label: "Public Offer", count: 2 },
      { value: "Publication", label: "Publication", count: 3 },
      { value: "Information Notice", label: "Information Notice", count: 3 },
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatCurrency(amount: number, currency: string) {
  if (amount >= 1_000_000_000) return `${currency} ${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `${currency} ${(amount / 1_000_000).toFixed(0)}M`;
  return `${currency} ${amount.toLocaleString()}`;
}

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

function ChangeCell({ value, suffix = "%" }: { value: number; suffix?: string }) {
  const isPos = value >= 0;
  return (
    <span className={`flex items-center gap-1 font-medium ${isPos ? "text-positive" : "text-negative"}`}>
      {isPos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {isPos ? "+" : ""}{value.toFixed(2)}{suffix}
    </span>
  );
}

// ── Dashboard Home ────────────────────────────────────────────────────────────
function DashboardHome({ onTabChange }: { onTabChange: (tab: TabKey) => void }) {
  const { user } = useAuth();
  const issuersQ = useQuery<Paginated<IssuerRow>>({
    queryKey: ["issuers", "home"],
    queryFn: () => backendApi.issuers(buildParams({ page: 1, page_size: 3 })) as Promise<Paginated<IssuerRow>>,
  });
  const offeringsQ = useQuery<Paginated<OfferingRow>>({
    queryKey: ["offerings", "home"],
    queryFn: () => backendApi.offerings(buildParams({ page: 1, page_size: 3 })) as Promise<Paginated<OfferingRow>>,
  });
  const indicesQ = useQuery<Paginated<IndexRow>>({
    queryKey: ["indices", "home"],
    queryFn: () => backendApi.indices(buildParams({ page: 1, page_size: 4 })) as Promise<Paginated<IndexRow>>,
  });

  const stats = [
    { label: "Issuers", value: "340+", icon: Building2, color: "text-primary bg-primary/10", tab: "issuers" as TabKey },
    { label: "Offerings", value: "1,280+", icon: Layers, color: "text-blue-600 bg-blue-500/10", tab: "offerings" as TabKey },
    { label: "Indices", value: "48", icon: BarChart3, color: "text-amber-600 bg-amber-500/10", tab: "indices" as TabKey },
    { label: "Documents", value: "5,600+", icon: FileText, color: "text-purple-600 bg-purple-500/10", tab: "documents" as TabKey },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {user?.name?.split(" ")[0] || "Demo User"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Here's an overview of your Regenify platform.
          </p>
        </div>
        <Link href="/dashboard/graph">
          <Button className="bg-primary text-white shadow-brand gap-2">
            <Network className="w-4 h-4" />
            Open Graph View
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <button
              key={i}
              onClick={() => onTabChange(s.tab)}
              className="bg-card rounded-xl p-4 border border-border shadow-card hover:shadow-card-hover transition-all text-left group"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${s.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-foreground">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
              <div className="mt-2 flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                View all <ArrowRight className="w-3 h-3" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Recent data */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Recent Issuers */}
        <div className="bg-card rounded-xl border border-border shadow-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" /> Recent Issuers
            </h3>
            <button onClick={() => onTabChange("issuers")} className="text-xs text-primary hover:underline">View all</button>
          </div>
          {issuersQ.isLoading ? (
            <div className="flex items-center justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
          ) : (
            <div className="space-y-2">
              {(issuersQ.data?.data ?? []).map((issuer, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                  <div>
                    <div className="text-xs font-medium text-foreground">{issuer.name}</div>
                    <div className="text-[10px] text-muted-foreground">{issuer.country} · {issuer.classification}</div>
                  </div>
                  <div className="flex gap-1">
                    {issuer.wbxLabel && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">WBX</span>}
                    {issuer.euTaxonomy && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 font-medium">EU</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Offerings */}
        <div className="bg-card rounded-xl border border-border shadow-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" /> Recent Offerings
            </h3>
            <button onClick={() => onTabChange("offerings")} className="text-xs text-primary hover:underline">View all</button>
          </div>
          {offeringsQ.isLoading ? (
            <div className="flex items-center justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
          ) : (
            <div className="space-y-2">
              {(offeringsQ.data?.data ?? []).map((o, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                  <div>
                    <div className="text-xs font-medium text-foreground truncate max-w-[140px]">{o.name}</div>
                    <div className="text-[10px] text-muted-foreground">{o.type} · {o.currency}</div>
                  </div>
                  <div className="text-xs font-semibold text-foreground">{o.lastPrice.toFixed(2)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Indices */}
        <div className="bg-card rounded-xl border border-border shadow-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-600" /> Live Indices
            </h3>
            <button onClick={() => onTabChange("indices")} className="text-xs text-primary hover:underline">View all</button>
          </div>
          {indicesQ.isLoading ? (
            <div className="flex items-center justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
          ) : (
            <div className="space-y-2">
              {(indicesQ.data?.data ?? []).map((idx, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                  <div className="text-xs font-medium text-foreground truncate max-w-[130px]">{idx.name}</div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-foreground">{idx.last.toFixed(2)}</div>
                    <ChangeCell value={idx.changePercent} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: "EU Taxonomy Aligned", icon: ShieldCheck, color: "text-primary" },
          { label: "Global Coverage", icon: Globe2, color: "text-blue-600" },
          { label: "Regenerative Finance", icon: Leaf, color: "text-green-600" },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-xs text-muted-foreground">
              <Icon className={`w-3.5 h-3.5 ${item.color}`} />
              {item.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Issuers Tab ───────────────────────────────────────────────────────────────
function IssuersTab() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [filters, setFilters] = useState<Record<string, string[]>>({});

  const handleSort = (key: string) => {
    if (sortBy === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(key); setSortDir("asc"); }
    setPage(1);
  };

  const { data, isLoading } = useQuery<Paginated<IssuerRow>>({
    queryKey: ["issuers", search, page, sortBy, sortDir, filters],
    queryFn: () => backendApi.issuers(buildParams({
      search: search || undefined,
      classifications: filters.classifications?.length ? filters.classifications : undefined,
      regions: filters.regions?.length ? filters.regions : undefined,
      wbx_label: filters.wbx?.includes("wbxLabel") || undefined,
      eu_taxonomy: filters.wbx?.includes("euTaxonomy") || undefined,
      page,
      page_size: 15,
      sort_by: sortBy,
      sort_dir: sortDir,
    })) as Promise<Paginated<IssuerRow>>,
  });

  const totalActive = Object.values(filters).flat().length;

  const columns: Column<Record<string, unknown>>[] = [
    { key: "name", label: "Issuer Name", sortable: true, className: "min-w-[200px]" },
    { key: "country", label: "Country", sortable: true },
    { key: "classification", label: "Classification", sortable: true,
      render: (v) => (
        <Badge variant="secondary" className="text-xs font-medium">{String(v)}</Badge>
      )
    },
    { key: "wbxLabel", label: "WBX Label",
      render: (v) => v ? (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
          <ShieldCheck className="w-3 h-3" /> WBX
        </span>
      ) : <span className="text-muted-foreground text-xs">—</span>
    },
    { key: "euTaxonomy", label: "EU Taxonomy",
      render: (v) => v ? (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded-full">
          <ShieldCheck className="w-3 h-3" /> Aligned
        </span>
      ) : <span className="text-muted-foreground text-xs">—</span>
    },
    { key: "assets", label: "Assets", className: "text-right" },
  ];

  return (
    <div className="flex gap-4 h-full">
      <SidebarFilters
        groups={ISSUER_FILTERS}
        selected={filters}
        onChange={(id, vals) => { setFilters((f) => ({ ...f, [id]: vals })); setPage(1); }}
        onClearAll={() => { setFilters({}); setPage(1); }}
        totalActive={totalActive}
      />
      <div className="flex-1 min-w-0">
        <DataTable
          columns={columns}
          data={(data?.data ?? []) as unknown as Record<string, unknown>[]}
          total={data?.total ?? 0}
          page={page}
          pageSize={15}
          onPageChange={setPage}
          search={search}
          onSearchChange={(v) => { setSearch(v); setPage(1); }}
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={handleSort}
          isLoading={isLoading}
          searchPlaceholder="Search issuers by name, country..."
          emptyMessage="No issuers found."
        />
      </div>
    </div>
  );
}

// ── Offerings Tab ─────────────────────────────────────────────────────────────
function OfferingsTab() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [filters, setFilters] = useState<Record<string, string[]>>({});

  const handleSort = (key: string) => {
    if (sortBy === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(key); setSortDir("asc"); }
    setPage(1);
  };

  const { data, isLoading } = useQuery<Paginated<OfferingRow>>({
    queryKey: ["offerings", search, page, sortBy, sortDir, filters],
    queryFn: () => backendApi.offerings(buildParams({
      search: search || undefined,
      types: filters.types?.length ? filters.types : undefined,
      include_delisted: filters.delisted?.includes("includeDelisted") ?? false,
      page,
      page_size: 15,
      sort_by: sortBy,
      sort_dir: sortDir,
    })) as Promise<Paginated<OfferingRow>>,
  });

  const totalActive = Object.values(filters).flat().length;

  const columns: Column<Record<string, unknown>>[] = [
    { key: "type", label: "Type", sortable: true,
      render: (v) => <Badge variant="outline" className="text-xs">{String(v)}</Badge>
    },
    { key: "segment", label: "Segment / Market", sortable: true },
    { key: "issuer", label: "Issuer", sortable: true, className: "min-w-[160px]" },
    { key: "isin", label: "ISIN", className: "font-mono text-xs" },
    { key: "name", label: "Name", className: "min-w-[200px]" },
    { key: "issuedAmount", label: "Issued Amount", className: "text-right",
      render: (v, row) => formatCurrency(Number(v), String(row.currency))
    },
    { key: "currency", label: "Currency" },
    { key: "listingDate", label: "Listing Date", sortable: true },
    { key: "wbxClassification", label: "WBX Class",
      render: (v) => <span className="text-xs font-medium text-primary">{String(v)}</span>
    },
    { key: "coupon", label: "Coupon",
      render: (v) => v !== null ? `${Number(v).toFixed(3)}%` : "—"
    },
    { key: "lastPrice", label: "Last Price", sortable: true, className: "text-right font-semibold",
      render: (v) => Number(v).toFixed(2)
    },
  ];

  return (
    <div className="flex gap-4 h-full">
      <SidebarFilters
        groups={OFFERING_FILTERS}
        selected={filters}
        onChange={(id, vals) => { setFilters((f) => ({ ...f, [id]: vals })); setPage(1); }}
        onClearAll={() => { setFilters({}); setPage(1); }}
        totalActive={totalActive}
      />
      <div className="flex-1 min-w-0">
        <DataTable
          columns={columns}
          data={(data?.data ?? []) as unknown as Record<string, unknown>[]}
          total={data?.total ?? 0}
          page={page}
          pageSize={15}
          onPageChange={setPage}
          search={search}
          onSearchChange={(v) => { setSearch(v); setPage(1); }}
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={handleSort}
          isLoading={isLoading}
          searchPlaceholder="Search by name, ISIN, issuer..."
          emptyMessage="No offerings found."
        />
      </div>
    </div>
  );
}

// ── Indices Tab ───────────────────────────────────────────────────────────────
function IndicesTab() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [filters, setFilters] = useState<Record<string, string[]>>({});

  const handleSort = (key: string) => {
    if (sortBy === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(key); setSortDir("asc"); }
    setPage(1);
  };

  const { data, isLoading } = useQuery<Paginated<IndexRow>>({
    queryKey: ["indices", search, page, sortBy, sortDir, filters],
    queryFn: () => backendApi.indices(buildParams({
      search: search || undefined,
      types: filters.types?.length ? filters.types : undefined,
      currencies: filters.currencies?.length ? filters.currencies : undefined,
      page,
      page_size: 15,
      sort_by: sortBy,
      sort_dir: sortDir,
    })) as Promise<Paginated<IndexRow>>,
  });

  const totalActive = Object.values(filters).flat().length;

  const columns: Column<Record<string, unknown>>[] = [
    { key: "type", label: "Type", sortable: true,
      render: (v) => <span className="text-xs font-medium text-muted-foreground">{String(v)}</span>
    },
    { key: "name", label: "Name", sortable: true, className: "min-w-[220px] font-medium" },
    { key: "currency", label: "Currency" },
    { key: "last", label: "Last", sortable: true, className: "text-right font-semibold",
      render: (v) => Number(v).toFixed(2)
    },
    { key: "changePercent", label: "Change (%)", sortable: true, className: "text-right",
      render: (v) => <ChangeCell value={Number(v)} />
    },
    { key: "change", label: "Change", className: "text-right",
      render: (v) => <ChangeCell value={Number(v)} suffix="" />
    },
    { key: "monthHigh", label: "Month High", className: "text-right",
      render: (v) => Number(v).toFixed(2)
    },
    { key: "monthLow", label: "Month Low", className: "text-right",
      render: (v) => Number(v).toFixed(2)
    },
    { key: "yearHigh", label: "Year High", className: "text-right",
      render: (v) => Number(v).toFixed(2)
    },
    { key: "yearLow", label: "Year Low", className: "text-right",
      render: (v) => Number(v).toFixed(2)
    },
  ];

  return (
    <div className="flex gap-4 h-full">
      <SidebarFilters
        groups={INDEX_FILTERS}
        selected={filters}
        onChange={(id, vals) => { setFilters((f) => ({ ...f, [id]: vals })); setPage(1); }}
        onClearAll={() => { setFilters({}); setPage(1); }}
        totalActive={totalActive}
      />
      <div className="flex-1 min-w-0">
        <DataTable
          columns={columns}
          data={(data?.data ?? []) as unknown as Record<string, unknown>[]}
          total={data?.total ?? 0}
          page={page}
          pageSize={15}
          onPageChange={setPage}
          search={search}
          onSearchChange={(v) => { setSearch(v); setPage(1); }}
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={handleSort}
          isLoading={isLoading}
          searchPlaceholder="Search indices by name or type..."
          emptyMessage="No indices found."
        />
      </div>
    </div>
  );
}

// ── Documents Tab ─────────────────────────────────────────────────────────────
function DocumentsTab() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string[]>>({});

  const { data, isLoading } = useQuery<Paginated<DocumentRow>>({
    queryKey: ["documents", search, page, filters],
    queryFn: () => backendApi.documents(buildParams({
      search: search || undefined,
      types: filters.types?.length ? filters.types : undefined,
      sub_types: filters.subTypes?.length ? filters.subTypes : undefined,
      page,
      page_size: 15,
    })) as Promise<Paginated<DocumentRow>>,
  });

  const totalActive = Object.values(filters).flat().length;

  const columns: Column<Record<string, unknown>>[] = [
    { key: "type", label: "Type",
      render: (v) => <Badge variant="secondary" className="text-xs">{String(v)}</Badge>
    },
    { key: "subType", label: "Sub Type",
      render: (v) => <span className="text-xs text-muted-foreground">{String(v)}</span>
    },
    { key: "name", label: "Name", className: "min-w-[260px] font-medium" },
    { key: "issuer", label: "Issuer", className: "min-w-[160px]" },
    { key: "memberStates", label: "Member States",
      render: (v) => (
        <div className="flex flex-wrap gap-1">
          {(v as string[]).slice(0, 3).map((s) => (
            <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">{s}</span>
          ))}
          {(v as string[]).length > 3 && (
            <span className="text-[10px] text-muted-foreground">+{(v as string[]).length - 3}</span>
          )}
        </div>
      )
    },
    { key: "date", label: "Date", sortable: false },
    { key: "fileSize", label: "Size" },
    { key: "id", label: "Actions",
      render: () => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-primary">
            <Eye className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-primary">
            <Download className="w-3.5 h-3.5" />
          </Button>
        </div>
      )
    },
  ];

  return (
    <div className="flex gap-4 h-full">
      <SidebarFilters
        groups={DOCUMENT_FILTERS}
        selected={filters}
        onChange={(id, vals) => { setFilters((f) => ({ ...f, [id]: vals })); setPage(1); }}
        onClearAll={() => { setFilters({}); setPage(1); }}
        totalActive={totalActive}
      />
      <div className="flex-1 min-w-0">
        <DataTable
          columns={columns}
          data={(data?.data ?? []) as unknown as Record<string, unknown>[]}
          total={data?.total ?? 0}
          page={page}
          pageSize={15}
          onPageChange={setPage}
          search={search}
          onSearchChange={(v) => { setSearch(v); setPage(1); }}
          isLoading={isLoading}
          searchPlaceholder="Search documents by name, type..."
          emptyMessage="No documents found."
        />
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [location] = useLocation();
  const [, navigate] = useLocation();

  // Determine active tab from URL
  const getActiveTab = (): TabKey | "home" => {
    if (location.includes("/issuers")) return "issuers";
    if (location.includes("/offerings")) return "offerings";
    if (location.includes("/indices")) return "indices";
    if (location.includes("/documents")) return "documents";
    return "home";
  };

  const activeTab = getActiveTab();

  const handleTabChange = (tab: TabKey) => {
    navigate(`/dashboard/${tab}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardHeader />

      <div className="flex-1 flex flex-col">
        {/* Tab navigation */}
        <div className="bg-white border-b border-border">
          <div className="container">
            <div className="flex items-center gap-0 overflow-x-auto">
              <button
                onClick={() => navigate("/dashboard")}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === "home"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Overview
              </button>
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => handleTabChange(tab.key)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.key
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
              <Link
                href="/dashboard/graph"
                className="flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 border-transparent text-muted-foreground hover:text-foreground hover:border-border transition-colors whitespace-nowrap"
              >
                <Network className="w-4 h-4" />
                Graph View
              </Link>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 container py-5">
          {activeTab === "home" && <DashboardHome onTabChange={handleTabChange} />}
          {activeTab === "issuers" && (
            <div className="h-[calc(100vh-160px)]">
              <IssuersTab />
            </div>
          )}
          {activeTab === "offerings" && (
            <div className="h-[calc(100vh-160px)]">
              <OfferingsTab />
            </div>
          )}
          {activeTab === "indices" && (
            <div className="h-[calc(100vh-160px)]">
              <IndicesTab />
            </div>
          )}
          {activeTab === "documents" && (
            <div className="h-[calc(100vh-160px)]">
              <DocumentsTab />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
