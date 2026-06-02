import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardHeader from "@/components/DashboardHeader";
import DataTable, { Column } from "@/components/DataTable";
import SidebarFilters, { FilterGroup } from "@/components/SidebarFilters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { backendApi, type RecommendationRecord } from "@/lib/backendApi";
import {
  Building2, Layers, BarChart3, FileText, Network,
  TrendingUp, TrendingDown, Download, Eye, ArrowRight,
  Leaf, ShieldCheck, Globe2, HelpCircle, Loader2, SlidersHorizontal, Upload, Pencil, Plus, Trash2,
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

// ── Types ─────────────────────────────────────────────────────────────────────
type TabKey = "issuers" | "offerings" | "indices" | "documents";
type Paginated<T> = { data: T[]; total: number; page: number; pageSize: number; visualConfig?: unknown };
type IssuerRow = { id: string; name: string; country: string; region: string; classification: string; wbxLabel: boolean; euTaxonomy: boolean; assets: string; assetsAmount?: number | null; assetsCurrency?: string; description?: string; foundedYear?: number | null; issuerNameDotColor?: string; wbxLabelDotColor?: string };
type OfferingRow = { id: string; issuerId: string; type: string; segment: string; issuer: string; isin: string; name: string; issuedAmount: number; currency: string; listingDate: string; wbxClassification: string; coupon: number | null; lastPrice: number; delisted: boolean; issuerDotColor?: string; typeDotColor?: string };
type IndexRow = { id: string; type: string; name: string; currency: string; last: number; changePercent: number; change: number; monthHigh: number; monthLow: number; yearHigh: number; yearLow: number; typeDotColor?: string };
type DocumentRow = { id: string; type: string; subType: string; name: string; issuer: string; memberStates: string[]; date: string; fileSize: string; fileUrl?: string | null; issuerDotColor?: string; typeDotColor?: string };
type IssuerFormState = { name: string; country: string; region: string; classification: string; wbxLabel: boolean; euTaxonomy: boolean; assetsAmount: string; assetsCurrency: string; foundedYear: string; description: string };
type OfferingFormState = { issuerId: string; type: string; segment: string; isin: string; name: string; issuedAmount: string; currency: string; listingDate: string; wbxClassification: string; coupon: string; lastPrice: string; delisted: boolean };
type IndexFormState = { type: string; name: string; currency: string; last: string; changePercent: string; change: string; monthHigh: string; monthLow: string; yearHigh: string; yearLow: string };
type AdminDocumentUploadForm = {
  type: string;
  subType: string;
  name: string;
  issuerId: string;
  documentDate: string;
  memberStates: string;
  file: File | null;
};

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

const EMPTY_ISSUER_FORM: IssuerFormState = {
  name: "",
  country: "",
  region: "",
  classification: "",
  wbxLabel: false,
  euTaxonomy: false,
  assetsAmount: "",
  assetsCurrency: "",
  foundedYear: "",
  description: "",
};

const EMPTY_OFFERING_FORM: OfferingFormState = {
  issuerId: "",
  type: "",
  segment: "",
  isin: "",
  name: "",
  issuedAmount: "",
  currency: "",
  listingDate: "",
  wbxClassification: "",
  coupon: "",
  lastPrice: "",
  delisted: false,
};

const EMPTY_INDEX_FORM: IndexFormState = {
  type: "",
  name: "",
  currency: "",
  last: "",
  changePercent: "",
  change: "",
  monthHigh: "",
  monthLow: "",
  yearHigh: "",
  yearLow: "",
};

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

function HeaderDot({ color }: { color: string }) {
  return <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />;
}

function DotLabel({ color, text }: { color: string; text: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-[0.32rem] shrink-0">
        <HeaderDot color={color} />
      </span>
      <span className="font-medium leading-6 text-foreground">{text}</span>
    </div>
  );
}

function numericAssets(value: string) {
  const match = value.match(/^([A-Z]{3})\s+([\d,.]+)([BM])$/i);
  if (!match) {
    return value === "—" ? "—" : value;
  }
  const [, currency, amountText, suffix] = match;
  const amount = Number(amountText.replace(/,/g, ""));
  const multiplier = suffix.toUpperCase() === "B" ? 1_000_000_000 : 1_000_000;
  const expanded = amount * multiplier;
  return `${currency} ${expanded.toLocaleString()}`;
}

// ── Dashboard Home ────────────────────────────────────────────────────────────
function toOptionalNumber(value: string) {
  const trimmed = value.trim();
  return trimmed ? Number(trimmed) : null;
}

function toOptionalInteger(value: string) {
  const trimmed = value.trim();
  return trimmed ? Number.parseInt(trimmed, 10) : null;
}

function issuerToForm(row: IssuerRow): IssuerFormState {
  return {
    name: row.name,
    country: row.country,
    region: row.region ?? "",
    classification: row.classification,
    wbxLabel: row.wbxLabel,
    euTaxonomy: row.euTaxonomy,
    assetsAmount: row.assetsAmount != null ? String(row.assetsAmount) : "",
    assetsCurrency: row.assetsCurrency ?? "",
    foundedYear: row.foundedYear != null ? String(row.foundedYear) : "",
    description: row.description ?? "",
  };
}

function offeringToForm(row: OfferingRow): OfferingFormState {
  return {
    issuerId: row.issuerId,
    type: row.type,
    segment: row.segment,
    isin: row.isin,
    name: row.name,
    issuedAmount: String(row.issuedAmount ?? ""),
    currency: row.currency,
    listingDate: row.listingDate ?? "",
    wbxClassification: row.wbxClassification ?? "",
    coupon: row.coupon != null ? String(row.coupon) : "",
    lastPrice: String(row.lastPrice ?? ""),
    delisted: row.delisted,
  };
}

function indexToForm(row: IndexRow): IndexFormState {
  return {
    type: row.type,
    name: row.name,
    currency: row.currency,
    last: String(row.last ?? ""),
    changePercent: String(row.changePercent ?? ""),
    change: String(row.change ?? ""),
    monthHigh: String(row.monthHigh ?? ""),
    monthLow: String(row.monthLow ?? ""),
    yearHigh: String(row.yearHigh ?? ""),
    yearLow: String(row.yearLow ?? ""),
  };
}

function DashboardHome({ onTabChange }: { onTabChange: (tab: TabKey) => void }) {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const isAdmin = user?.role === "admin";
  const overviewQ = useQuery<{ issuers: number; offerings: number; indices: number; documents: number }>({
    queryKey: ["dashboard", "overview"],
    queryFn: () => backendApi.overview(),
  });
  const recommendationsQ = useQuery<{ data: RecommendationRecord[]; graphSource: "neo4j" | "mock"; generatedAt: string }>({
    queryKey: ["dashboard", "recommendations"],
    queryFn: () => backendApi.recommendations(),
  });
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
  const documentsQ = useQuery<Paginated<DocumentRow>>({
    queryKey: ["documents", "home"],
    queryFn: () => backendApi.documents(buildParams({ page: 1, page_size: 1 })) as Promise<Paginated<DocumentRow>>,
  });

  const stats = [
    {
      label: "Issuers",
      value: `${overviewQ.data?.issuers ?? 0}`,
      icon: Building2,
      color: "text-primary bg-primary/10",
      tab: "issuers" as TabKey,
    },
    {
      label: "Offerings",
      value: `${overviewQ.data?.offerings ?? 0}`,
      icon: Layers,
      color: "text-blue-600 bg-blue-500/10",
      tab: "offerings" as TabKey,
    },
    {
      label: "Indices",
      value: `${overviewQ.data?.indices ?? 0}`,
      icon: BarChart3,
      color: "text-amber-600 bg-amber-500/10",
      tab: "indices" as TabKey,
    },
    {
      label: "Documents",
      value: `${overviewQ.data?.documents ?? 0}`,
      icon: FileText,
      color: "text-purple-600 bg-purple-500/10",
      tab: "documents" as TabKey,
    },
  ];
  const graphSource = recommendationsQ.data?.graphSource ?? "mock";
  const recommendationCards = recommendationsQ.data?.data ?? [];
  const adminActions = [
    {
      title: "Manage issuers",
      description: "Create or refine issuer records and classifications.",
      icon: Building2,
      href: "/dashboard/issuers",
    },
    {
      title: "Manage offerings",
      description: "Open the offering workspace for new listings and edits.",
      icon: Layers,
      href: "/dashboard/offerings",
    },
    {
      title: "Manage indices",
      description: "Update benchmarks, market values, and index coverage.",
      icon: BarChart3,
      href: "/dashboard/indices",
    },
    {
      title: "Review support",
      description: "Jump into support and follow-up workflows for users.",
      icon: HelpCircle,
      href: "/dashboard/account?view=support",
    },
  ];

  const openRecommendation = (recommendation: RecommendationRecord) => {
    const params = new URLSearchParams({
      node: recommendation.nodeId,
      recommended: "1",
      label: recommendation.title,
      reason: recommendation.reason,
      source: recommendation.graphSource,
    });
    navigate(`/dashboard/graph?${params.toString()}`);
  };

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
              className={`group rounded-[22px] border px-5 py-4 text-left shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover ${
                s.label === "Issuers"
                  ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white"
                  : s.label === "Offerings"
                    ? "border-blue-200 bg-gradient-to-br from-blue-50 to-white"
                    : s.label === "Indices"
                      ? "border-amber-200 bg-gradient-to-br from-amber-50 to-white"
                      : "border-violet-200 bg-gradient-to-br from-violet-50 to-white"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${s.color}`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400 opacity-0 transition-opacity group-hover:opacity-100">
                  Open
                </div>
              </div>
              <div className="mt-5 text-[2.1rem] font-semibold leading-none text-foreground">
                {overviewQ.isLoading ? <Loader2 className="h-8 w-8 animate-spin text-primary" /> : s.value}
              </div>
              <div className="mt-1.5 text-sm text-muted-foreground">{s.label}</div>
              <div className="mt-3 flex items-center gap-1 text-xs text-primary opacity-0 transition-opacity group-hover:opacity-100">
                View all <ArrowRight className="w-3 h-3" />
              </div>
            </button>
          );
        })}
      </div>

      {isAdmin ? (
        <div className="rounded-[28px] border border-[#d7dee7] bg-[linear-gradient(180deg,#ffffff_0%,#f7f9fc_100%)] px-4 py-4 shadow-[0_16px_34px_rgba(15,23,42,0.06)] sm:px-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Admin tools
              </div>
              <h2 className="mt-2 text-lg font-semibold text-slate-950">Workspace control</h2>
              <p className="mt-1 text-sm text-slate-600">
                Fast paths into the core admin workflows without crowding the main dashboard.
              </p>
            </div>
            <Badge className="border border-slate-200 bg-white text-slate-700 hover:bg-white">
              Admin only
            </Badge>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-4">
            {adminActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.title}
                  onClick={() => navigate(action.href)}
                  className="group rounded-[22px] border border-slate-200 bg-white/90 px-4 py-4 text-left transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_14px_28px_rgba(15,23,42,0.08)]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
                  </div>
                  <div className="mt-4 text-sm font-semibold text-slate-950">
                    {action.title}
                  </div>
                  <p className="mt-1 text-xs leading-6 text-slate-600">
                    {action.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="relative overflow-hidden rounded-[32px] border border-[#dfe7df] bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.16),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.10),_transparent_24%),linear-gradient(180deg,#fdfdf9_0%,#f7f6f0_100%)] p-5 shadow-[0_24px_60px_rgba(20,31,24,0.08)]">
        <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-500 shadow-[0_8px_20px_rgba(15,23,42,0.04)] backdrop-blur-sm">
              <Network className="h-3.5 w-3.5 text-primary" />
              Graph-guided recommendations
            </div>
            <div className="mt-4 text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
              Recommended for you
            </div>
            <p className="mt-2 max-w-xl text-sm leading-7 text-slate-600">
              Curated starting points that turn the protected workspace into a guided discovery flow instead of a static dashboard.
            </p>
          </div>
          <Badge className={graphSource === "neo4j" ? "border border-emerald-200 bg-white/80 text-primary hover:bg-white/80" : "border border-amber-200 bg-white/80 text-amber-800 hover:bg-white/80"}>
            {graphSource === "neo4j" ? "Powered by live graph" : "Using curated fallback"}
          </Badge>
        </div>

        {recommendationsQ.isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : recommendationCards.length ? (
          <div className="grid gap-4 xl:grid-cols-[1.08fr_0.96fr_0.96fr]">
            {recommendationCards.map((recommendation, index) => (
              <button
                key={recommendation.id}
                onClick={() => openRecommendation(recommendation)}
                className={`group relative overflow-hidden rounded-[28px] border p-5 text-left transition-all hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(20,31,24,0.10)] ${
                  index === 0
                    ? "border-[#d8eadc] bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(241,249,243,0.96)_100%)]"
                    : index === 1
                      ? "border-[#e3e1d8] bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(248,247,241,0.98)_100%)]"
                      : "border-[#dce5ee] bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(243,247,252,0.98)_100%)]"
                }`}
              >
                <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/60 to-transparent opacity-80" />
                <div className="relative">
                  <div className="flex items-start justify-between gap-3">
                    <Badge
                      variant="secondary"
                      className={`border-0 ${
                        recommendation.category === "theme"
                          ? "bg-emerald-100 text-emerald-800"
                          : recommendation.category === "entity"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {recommendation.category}
                    </Badge>
                    <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                      {recommendation.nodeType}
                    </div>
                  </div>
                  <div className="mt-10 text-lg font-semibold leading-7 text-slate-950">
                    {recommendation.title}
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {recommendation.reason}
                  </p>
                  <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary">
                    Open in graph
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-[24px] border border-dashed border-[#ddd7cd] bg-white/70 px-5 py-6 text-sm text-slate-500 backdrop-blur-sm">
            Recommendations will appear here once graph relationships are available.
          </div>
        )}
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
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === "admin";
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIssuer, setEditingIssuer] = useState<IssuerRow | null>(null);
  const [form, setForm] = useState<IssuerFormState>(EMPTY_ISSUER_FORM);

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

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        country: form.country,
        region: form.region,
        classification: form.classification,
        wbxLabel: form.wbxLabel,
        euTaxonomy: form.euTaxonomy,
        description: form.description || undefined,
        foundedYear: toOptionalInteger(form.foundedYear),
        assetsAmount: toOptionalNumber(form.assetsAmount),
        assetsCurrency: form.assetsCurrency || undefined,
      };
      if (editingIssuer) {
        return backendApi.updateIssuer(editingIssuer.id, payload);
      }
      return backendApi.createIssuer(payload);
    },
    onSuccess: () => {
      toast.success(editingIssuer ? "Issuer updated." : "Issuer created.");
      setDialogOpen(false);
      setEditingIssuer(null);
      setForm(EMPTY_ISSUER_FORM);
      void queryClient.invalidateQueries({ queryKey: ["issuers"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not save issuer."),
  });

  const deleteMutation = useMutation({
    mutationFn: (issuerId: string) => backendApi.deleteIssuer(issuerId),
    onSuccess: () => {
      toast.success("Issuer deleted.");
      void queryClient.invalidateQueries({ queryKey: ["issuers"] });
      void queryClient.invalidateQueries({ queryKey: ["offerings"] });
      void queryClient.invalidateQueries({ queryKey: ["documents"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not delete issuer."),
  });

  const openCreate = () => {
    setEditingIssuer(null);
    setForm(EMPTY_ISSUER_FORM);
    setDialogOpen(true);
  };

  const openEdit = (row: IssuerRow) => {
    setEditingIssuer(row);
    setForm(issuerToForm(row));
    setDialogOpen(true);
  };

  const totalActive = Object.values(filters).flat().length;

  const columns: Column<Record<string, unknown>>[] = [
    {
      key: "name",
      label: "Issuer Name",
      sortable: true,
      className: "min-w-[200px]",
      render: (v, row) => (
        <div className="flex items-center gap-2">
          <HeaderDot color={String(row.issuerNameDotColor ?? "#22c55e")} />
          <span className="font-medium text-foreground">{String(v)}</span>
        </div>
      ),
    },
    { key: "country", label: "Country", sortable: true },
    { key: "classification", label: "Classification", sortable: true,
      render: (v) => (
        <Badge variant="secondary" className="text-xs font-medium">{String(v)}</Badge>
      )
    },
    { key: "wbxLabel", label: "WBX Label",
      render: (v, row) => v ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-sky-50 to-emerald-50 px-2.5 py-1 text-xs font-semibold text-primary shadow-[inset_0_0_0_1px_rgba(14,165,233,0.16)]">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: String(row.wbxLabelDotColor ?? "#f59e0b") }} />
          WBX
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
    { key: "assets", label: "Assets", className: "text-right whitespace-nowrap" },
    {
      key: "assetsNumeric",
      label: "Numerical",
      className: "text-right min-w-[170px] whitespace-nowrap",
      render: (_, row) => numericAssets(String(row.assets)),
    },
  ];

  if (isAdmin) {
    columns.push({
      key: "id",
      label: "Actions",
      className: "text-right",
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(row as unknown as IssuerRow)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
            disabled={deleteMutation.isPending}
            onClick={() => {
              const issuer = row as unknown as IssuerRow;
              if (window.confirm(`Delete issuer "${issuer.name}"? This also removes linked offerings.`)) {
                deleteMutation.mutate(issuer.id);
              }
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    });
  }

  return (
    <div className="flex h-full flex-col gap-4 md:flex-row">
      <SidebarFilters
        groups={ISSUER_FILTERS}
        selected={filters}
        onChange={(id, vals) => { setFilters((f) => ({ ...f, [id]: vals })); setPage(1); }}
        onClearAll={() => { setFilters({}); setPage(1); }}
        totalActive={totalActive}
        className="hidden md:flex"
      />
      <div className="flex-1 min-w-0">
        {isAdmin ? (
          <div className="mb-3 flex justify-end">
            <Button className="gap-2" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              New issuer
            </Button>
          </div>
        ) : null}
        <div className="mb-3 flex items-center justify-between gap-2 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {totalActive > 0 ? (
                  <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
                    {totalActive}
                  </span>
                ) : null}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[90vw] max-w-none p-0 sm:max-w-sm">
              <SheetHeader className="border-b border-border pb-4">
                <SheetTitle>Issuer Filters</SheetTitle>
                <SheetDescription>Refine the issuer list without squeezing the results table.</SheetDescription>
              </SheetHeader>
              <div className="h-full overflow-hidden p-4 pt-0">
                <SidebarFilters
                  groups={ISSUER_FILTERS}
                  selected={filters}
                  onChange={(id, vals) => { setFilters((f) => ({ ...f, [id]: vals })); setPage(1); }}
                  onClearAll={() => { setFilters({}); setPage(1); }}
                  totalActive={totalActive}
                  className="h-full w-full rounded-[20px] border-[#2b3a49] shadow-none"
                />
              </div>
            </SheetContent>
          </Sheet>
          {totalActive > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setFilters({}); setPage(1); }}
              className="text-xs text-muted-foreground"
            >
              Clear all
            </Button>
          ) : null}
        </div>
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
          mobileCardRender={(row) => (
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <HeaderDot color={String(row.issuerNameDotColor ?? "#22c55e")} />
                    <h3 className="text-sm font-semibold text-foreground">{String(row.name)}</h3>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{String(row.country)}</p>
                </div>
                <Badge variant="secondary" className="shrink-0 text-[11px] font-medium">
                  {String(row.classification)}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {row.wbxLabel ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">
                    <ShieldCheck className="h-3 w-3" />
                    WBX Label
                  </span>
                ) : null}
                {row.euTaxonomy ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-1 text-[11px] font-semibold text-blue-600">
                    <ShieldCheck className="h-3 w-3" />
                    EU Taxonomy
                  </span>
                ) : null}
              </div>
              <div className="rounded-2xl bg-muted/50 px-3 py-2">
                <div className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Assets</div>
                <div className="mt-1 text-sm font-medium text-foreground">{String(row.assets)}</div>
              </div>
            </div>
          )}
        />
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingIssuer ? "Edit issuer" : "Create issuer"}</DialogTitle>
              <DialogDescription>Manage issuer details shown across the dashboard.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Classification</Label>
                <Input value={form.classification} onChange={(e) => setForm((c) => ({ ...c, classification: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Input value={form.country} onChange={(e) => setForm((c) => ({ ...c, country: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Region</Label>
                <Input value={form.region} onChange={(e) => setForm((c) => ({ ...c, region: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Assets Amount</Label>
                <Input value={form.assetsAmount} onChange={(e) => setForm((c) => ({ ...c, assetsAmount: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Assets Currency</Label>
                <Input value={form.assetsCurrency} onChange={(e) => setForm((c) => ({ ...c, assetsCurrency: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Founded Year</Label>
                <Input value={form.foundedYear} onChange={(e) => setForm((c) => ({ ...c, foundedYear: e.target.value }))} />
              </div>
              <div className="flex items-center gap-6 pt-7">
                <div className="flex items-center gap-2">
                  <Checkbox checked={form.wbxLabel} onCheckedChange={(v) => setForm((c) => ({ ...c, wbxLabel: Boolean(v) }))} />
                  <Label>WBX Label</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox checked={form.euTaxonomy} onCheckedChange={(v) => setForm((c) => ({ ...c, euTaxonomy: Boolean(v) }))} />
                  <Label>EU Taxonomy</Label>
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button disabled={saveMutation.isPending} onClick={() => saveMutation.mutate()}>
                {saveMutation.isPending ? "Saving..." : editingIssuer ? "Save changes" : "Create issuer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// ── Offerings Tab ─────────────────────────────────────────────────────────────
function OfferingsTab() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === "admin";
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOffering, setEditingOffering] = useState<OfferingRow | null>(null);
  const [form, setForm] = useState<OfferingFormState>(EMPTY_OFFERING_FORM);

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

  const issuerOptionsQuery = useQuery<Paginated<IssuerRow>>({
    queryKey: ["offerings-crud", "issuers"],
    queryFn: () => backendApi.issuers(buildParams({ page: 1, page_size: 500 })) as Promise<Paginated<IssuerRow>>,
    enabled: isAdmin,
    staleTime: 60_000,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        issuerId: form.issuerId,
        type: form.type,
        segment: form.segment,
        isin: form.isin,
        name: form.name,
        issuedAmount: toOptionalNumber(form.issuedAmount),
        currency: form.currency,
        listingDate: form.listingDate || undefined,
        wbxClassification: form.wbxClassification || undefined,
        coupon: toOptionalNumber(form.coupon),
        lastPrice: toOptionalNumber(form.lastPrice),
        delisted: form.delisted,
      };
      if (editingOffering) {
        return backendApi.updateOffering(editingOffering.id, payload);
      }
      return backendApi.createOffering(payload);
    },
    onSuccess: () => {
      toast.success(editingOffering ? "Offering updated." : "Offering created.");
      setDialogOpen(false);
      setEditingOffering(null);
      setForm(EMPTY_OFFERING_FORM);
      void queryClient.invalidateQueries({ queryKey: ["offerings"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not save offering."),
  });

  const deleteMutation = useMutation({
    mutationFn: (offeringId: string) => backendApi.deleteOffering(offeringId),
    onSuccess: () => {
      toast.success("Offering deleted.");
      void queryClient.invalidateQueries({ queryKey: ["offerings"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not delete offering."),
  });

  const totalActive = Object.values(filters).flat().length;

  const columns: Column<Record<string, unknown>>[] = [
    { key: "type", label: "Type", sortable: true,
      render: (v, row) => <Badge variant="outline" className="gap-1 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 text-xs text-amber-800"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: String(row.typeDotColor ?? "#f59e0b") }} />{String(v)}</Badge>
    },
    { key: "segment", label: "Segment / Market", sortable: true },
    { key: "issuer", label: "Issuer", sortable: true, className: "min-w-[160px]",
      render: (v, row) => (
        <DotLabel color={String(row.issuerDotColor ?? "#3b82f6")} text={String(v)} />
      ) },
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

  if (isAdmin) {
    columns.push({
      key: "id",
      label: "Actions",
      className: "text-right",
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => {
              const offering = row as unknown as OfferingRow;
              setEditingOffering(offering);
              setForm(offeringToForm(offering));
              setDialogOpen(true);
            }}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
            disabled={deleteMutation.isPending}
            onClick={() => {
              const offering = row as unknown as OfferingRow;
              if (window.confirm(`Delete offering "${offering.name}"?`)) {
                deleteMutation.mutate(offering.id);
              }
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    });
  }

  return (
    <div className="flex h-full flex-col gap-4 md:flex-row">
      <SidebarFilters
        groups={OFFERING_FILTERS}
        selected={filters}
        onChange={(id, vals) => { setFilters((f) => ({ ...f, [id]: vals })); setPage(1); }}
        onClearAll={() => { setFilters({}); setPage(1); }}
        totalActive={totalActive}
        className="hidden md:flex"
      />
      <div className="flex-1 min-w-0">
        {isAdmin ? (
          <div className="mb-3 flex justify-end">
            <Button
              className="gap-2"
              onClick={() => {
                setEditingOffering(null);
                setForm(EMPTY_OFFERING_FORM);
                setDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              New offering
            </Button>
          </div>
        ) : null}
        <div className="mb-3 flex items-center justify-between gap-2 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {totalActive > 0 ? (
                  <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
                    {totalActive}
                  </span>
                ) : null}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[90vw] max-w-none p-0 sm:max-w-sm">
              <SheetHeader className="border-b border-border pb-4">
                <SheetTitle>Offering Filters</SheetTitle>
                <SheetDescription>Refine offerings without squeezing the results into narrow columns.</SheetDescription>
              </SheetHeader>
              <div className="h-full overflow-hidden p-4 pt-0">
                <SidebarFilters
                  groups={OFFERING_FILTERS}
                  selected={filters}
                  onChange={(id, vals) => { setFilters((f) => ({ ...f, [id]: vals })); setPage(1); }}
                  onClearAll={() => { setFilters({}); setPage(1); }}
                  totalActive={totalActive}
                  className="h-full w-full rounded-[20px] border-[#2b3a49] shadow-none"
                />
              </div>
            </SheetContent>
          </Sheet>
          {totalActive > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setFilters({}); setPage(1); }}
              className="text-xs text-muted-foreground"
            >
              Clear all
            </Button>
          ) : null}
        </div>
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
          mobileCardRender={(row) => (
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <HeaderDot color={String(row.typeDotColor ?? "#f59e0b")} />
                    <h3 className="text-sm font-semibold text-foreground">{String(row.name)}</h3>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{String(row.issuer)}</p>
                </div>
                <Badge variant="outline" className="shrink-0 text-[11px]">
                  {String(row.type)}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-muted px-2 py-1 text-[11px] font-medium text-foreground/80">
                  {String(row.segment)}
                </span>
                <span className="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary">
                  {String(row.wbxClassification)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 rounded-2xl bg-muted/50 p-3">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Amount</div>
                  <div className="mt-1 text-sm font-medium text-foreground">
                    {formatCurrency(Number(row.issuedAmount), String(row.currency))}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Last Price</div>
                  <div className="mt-1 text-sm font-medium text-foreground">{Number(row.lastPrice).toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">ISIN</div>
                  <div className="mt-1 truncate font-mono text-xs text-foreground/80">{String(row.isin)}</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Listed</div>
                  <div className="mt-1 text-sm font-medium text-foreground">{String(row.listingDate)}</div>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Coupon</span>
                <span className="font-medium text-foreground">
                  {row.coupon !== null ? `${Number(row.coupon).toFixed(3)}%` : "—"}
                </span>
              </div>
            </div>
          )}
        />
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>{editingOffering ? "Edit offering" : "Create offering"}</DialogTitle>
              <DialogDescription>Manage offering records tied to issuers.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Issuer</Label>
                <Select value={form.issuerId || "__none__"} onValueChange={(value) => setForm((c) => ({ ...c, issuerId: value === "__none__" ? "" : value }))}>
                  <SelectTrigger><SelectValue placeholder="Select issuer" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Select issuer</SelectItem>
                    {(issuerOptionsQuery.data?.data ?? []).map((issuer) => (
                      <SelectItem key={issuer.id} value={issuer.id}>{issuer.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Type</Label><Input value={form.type} onChange={(e) => setForm((c) => ({ ...c, type: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))} /></div>
              <div className="space-y-2"><Label>ISIN</Label><Input value={form.isin} onChange={(e) => setForm((c) => ({ ...c, isin: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Segment</Label><Input value={form.segment} onChange={(e) => setForm((c) => ({ ...c, segment: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Currency</Label><Input value={form.currency} onChange={(e) => setForm((c) => ({ ...c, currency: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Issued Amount</Label><Input value={form.issuedAmount} onChange={(e) => setForm((c) => ({ ...c, issuedAmount: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Listing Date</Label><Input type="date" value={form.listingDate} onChange={(e) => setForm((c) => ({ ...c, listingDate: e.target.value }))} /></div>
              <div className="space-y-2"><Label>WBX Classification</Label><Input value={form.wbxClassification} onChange={(e) => setForm((c) => ({ ...c, wbxClassification: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Coupon</Label><Input value={form.coupon} onChange={(e) => setForm((c) => ({ ...c, coupon: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Last Price</Label><Input value={form.lastPrice} onChange={(e) => setForm((c) => ({ ...c, lastPrice: e.target.value }))} /></div>
              <div className="flex items-center gap-2 pt-7"><Checkbox checked={form.delisted} onCheckedChange={(value) => setForm((c) => ({ ...c, delisted: Boolean(value) }))} /><Label>Delisted</Label></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button disabled={saveMutation.isPending} onClick={() => saveMutation.mutate()}>
                {saveMutation.isPending ? "Saving..." : editingOffering ? "Save changes" : "Create offering"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// ── Indices Tab ───────────────────────────────────────────────────────────────
function IndicesTab() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === "admin";
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<IndexRow | null>(null);
  const [form, setForm] = useState<IndexFormState>(EMPTY_INDEX_FORM);

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

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        type: form.type,
        name: form.name,
        currency: form.currency,
        last: toOptionalNumber(form.last),
        changePercent: toOptionalNumber(form.changePercent),
        change: toOptionalNumber(form.change),
        monthHigh: toOptionalNumber(form.monthHigh),
        monthLow: toOptionalNumber(form.monthLow),
        yearHigh: toOptionalNumber(form.yearHigh),
        yearLow: toOptionalNumber(form.yearLow),
      };
      if (editingIndex) {
        return backendApi.updateIndex(editingIndex.id, payload);
      }
      return backendApi.createIndex(payload);
    },
    onSuccess: () => {
      toast.success(editingIndex ? "Index updated." : "Index created.");
      setDialogOpen(false);
      setEditingIndex(null);
      setForm(EMPTY_INDEX_FORM);
      void queryClient.invalidateQueries({ queryKey: ["indices"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not save index."),
  });

  const deleteMutation = useMutation({
    mutationFn: (indexId: string) => backendApi.deleteIndex(indexId),
    onSuccess: () => {
      toast.success("Index deleted.");
      void queryClient.invalidateQueries({ queryKey: ["indices"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not delete index."),
  });

  const totalActive = Object.values(filters).flat().length;

  const columns: Column<Record<string, unknown>>[] = [
    { key: "type", label: "Type", sortable: true,
      render: (v, row) => <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-50 to-indigo-50 px-2.5 py-1 text-xs font-medium text-violet-700 shadow-[inset_0_0_0_1px_rgba(139,92,246,0.12)]"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: String(row.typeDotColor ?? "#8b5cf6") }} />{String(v)}</span>
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

  if (isAdmin) {
    columns.push({
      key: "id",
      label: "Actions",
      className: "text-right",
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => {
              const index = row as unknown as IndexRow;
              setEditingIndex(index);
              setForm(indexToForm(index));
              setDialogOpen(true);
            }}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
            disabled={deleteMutation.isPending}
            onClick={() => {
              const index = row as unknown as IndexRow;
              if (window.confirm(`Delete index "${index.name}"?`)) {
                deleteMutation.mutate(index.id);
              }
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    });
  }

  return (
    <div className="flex h-full flex-col gap-4 md:flex-row">
      <SidebarFilters
        groups={INDEX_FILTERS}
        selected={filters}
        onChange={(id, vals) => { setFilters((f) => ({ ...f, [id]: vals })); setPage(1); }}
        onClearAll={() => { setFilters({}); setPage(1); }}
        totalActive={totalActive}
        className="hidden md:flex"
      />
      <div className="flex-1 min-w-0">
        {isAdmin ? (
          <div className="mb-3 flex justify-end">
            <Button
              className="gap-2"
              onClick={() => {
                setEditingIndex(null);
                setForm(EMPTY_INDEX_FORM);
                setDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              New index
            </Button>
          </div>
        ) : null}
        <div className="mb-3 flex items-center justify-between gap-2 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {totalActive > 0 ? (
                  <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
                    {totalActive}
                  </span>
                ) : null}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[90vw] max-w-none p-0 sm:max-w-sm">
              <SheetHeader className="border-b border-border pb-4">
                <SheetTitle>Index Filters</SheetTitle>
                <SheetDescription>Refine indices without compressing the data table on mobile.</SheetDescription>
              </SheetHeader>
              <div className="h-full overflow-hidden p-4 pt-0">
                <SidebarFilters
                  groups={INDEX_FILTERS}
                  selected={filters}
                  onChange={(id, vals) => { setFilters((f) => ({ ...f, [id]: vals })); setPage(1); }}
                  onClearAll={() => { setFilters({}); setPage(1); }}
                  totalActive={totalActive}
                  className="h-full w-full rounded-[20px] border-[#2b3a49] shadow-none"
                />
              </div>
            </SheetContent>
          </Sheet>
          {totalActive > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setFilters({}); setPage(1); }}
              className="text-xs text-muted-foreground"
            >
              Clear all
            </Button>
          ) : null}
        </div>
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
          mobileCardRender={(row) => (
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <HeaderDot color={String(row.typeDotColor ?? "#8b5cf6")} />
                    <h3 className="text-sm font-semibold text-foreground">{String(row.name)}</h3>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{String(row.type)}</p>
                </div>
                <span className="rounded-full bg-muted px-2 py-1 text-[11px] font-medium text-foreground/80">
                  {String(row.currency)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 rounded-2xl bg-muted/50 p-3">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Last</div>
                  <div className="mt-1 text-sm font-semibold text-foreground">{Number(row.last).toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Change</div>
                  <div className="mt-1 text-sm">{<ChangeCell value={Number(row.changePercent)} />}</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Month Range</div>
                  <div className="mt-1 text-xs text-foreground/80">
                    {Number(row.monthLow).toFixed(2)} - {Number(row.monthHigh).toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Year Range</div>
                  <div className="mt-1 text-xs text-foreground/80">
                    {Number(row.yearLow).toFixed(2)} - {Number(row.yearHigh).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          )}
        />
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>{editingIndex ? "Edit index" : "Create index"}</DialogTitle>
              <DialogDescription>Manage index records and performance values.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label>Type</Label><Input value={form.type} onChange={(e) => setForm((c) => ({ ...c, type: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Currency</Label><Input value={form.currency} onChange={(e) => setForm((c) => ({ ...c, currency: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Last</Label><Input value={form.last} onChange={(e) => setForm((c) => ({ ...c, last: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Change (%)</Label><Input value={form.changePercent} onChange={(e) => setForm((c) => ({ ...c, changePercent: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Change</Label><Input value={form.change} onChange={(e) => setForm((c) => ({ ...c, change: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Month High</Label><Input value={form.monthHigh} onChange={(e) => setForm((c) => ({ ...c, monthHigh: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Month Low</Label><Input value={form.monthLow} onChange={(e) => setForm((c) => ({ ...c, monthLow: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Year High</Label><Input value={form.yearHigh} onChange={(e) => setForm((c) => ({ ...c, yearHigh: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Year Low</Label><Input value={form.yearLow} onChange={(e) => setForm((c) => ({ ...c, yearLow: e.target.value }))} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button disabled={saveMutation.isPending} onClick={() => saveMutation.mutate()}>
                {saveMutation.isPending ? "Saving..." : editingIndex ? "Save changes" : "Create index"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// ── Documents Tab ─────────────────────────────────────────────────────────────
function DocumentsTab() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === "admin";
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [uploadForm, setUploadForm] = useState<AdminDocumentUploadForm>({
    type: "Offerings Documents",
    subType: "",
    name: "",
    issuerId: "",
    documentDate: "",
    memberStates: "",
    file: null,
  });

  const openDocument = useCallback((fileUrl?: string | null) => {
    if (!fileUrl || typeof window === "undefined") return;
    window.open(fileUrl, "_blank", "noopener,noreferrer");
  }, []);

  const downloadDocument = useCallback((fileUrl?: string | null, fileName?: string) => {
    if (!fileUrl || typeof document === "undefined") return;

    const link = document.createElement("a");
    link.href = fileUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    if (fileName) link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }, []);

  const { data, isLoading, error } = useQuery<Paginated<DocumentRow>>({
    queryKey: ["documents", search, page, filters],
    queryFn: () => backendApi.documents(buildParams({
      search: search || undefined,
      types: filters.types?.length ? filters.types : undefined,
      sub_types: filters.subTypes?.length ? filters.subTypes : undefined,
      page,
      page_size: 15,
    }), { allowFallback: false }) as Promise<Paginated<DocumentRow>>,
  });

  const issuerOptionsQuery = useQuery<Paginated<IssuerRow>>({
    queryKey: ["document-upload", "issuers"],
    queryFn: () => backendApi.issuers(buildParams({ page: 1, page_size: 200 })) as Promise<Paginated<IssuerRow>>,
    enabled: isAdmin,
    staleTime: 60_000,
  });

  const uploadMutation = useMutation({
    mutationFn: () =>
      backendApi.uploadAdminDocument({
        file: uploadForm.file as File,
        type: uploadForm.type,
        name: uploadForm.name || undefined,
        subType: uploadForm.subType || undefined,
        issuerId: uploadForm.issuerId || undefined,
        documentDate: uploadForm.documentDate || undefined,
        memberStates: uploadForm.memberStates
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
      }),
    onSuccess: () => {
      toast.success("Document uploaded and linked.");
      setUploadForm({
        type: "Offerings Documents",
        subType: "",
        name: "",
        issuerId: "",
        documentDate: "",
        memberStates: "",
        file: null,
      });
      setPage(1);
      void queryClient.invalidateQueries({ queryKey: ["documents"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
    },
    onError: (uploadError) => {
      toast.error(uploadError instanceof Error ? uploadError.message : "Could not upload document.");
    },
  });

  const totalActive = Object.values(filters).flat().length;

  const columns: Column<Record<string, unknown>>[] = [
    { key: "type", label: "Type",
      render: (v, row) => <Badge variant="secondary" className="gap-1 border-rose-200 bg-gradient-to-r from-rose-50 to-pink-50 text-xs text-rose-800 shadow-[inset_0_0_0_1px_rgba(244,63,94,0.12)]"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: String(row.typeDotColor ?? "#f43f5e") }} />{String(v)}</Badge>
    },
    { key: "subType", label: "Sub Type",
      render: (v) => <span className="text-xs text-muted-foreground">{String(v)}</span>
    },
    { key: "name", label: "Name", className: "min-w-[260px] font-medium" },
    { key: "issuer", label: "Issuer", className: "min-w-[160px]",
      render: (v, row) => (
        <DotLabel color={String(row.issuerDotColor ?? "#3b82f6")} text={String(v)} />
      ) },
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
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
            onClick={() => openDocument((row.fileUrl as string | null | undefined) ?? undefined)}
            disabled={!row.fileUrl}
            aria-label={`View ${String(row.name)}`}
          >
            <Eye className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
            onClick={() => downloadDocument((row.fileUrl as string | null | undefined) ?? undefined, String(row.name))}
            disabled={!row.fileUrl}
            aria-label={`Download ${String(row.name)}`}
          >
            <Download className="w-3.5 h-3.5" />
          </Button>
        </div>
      )
    },
  ];

  return (
    <div className="flex h-full flex-col gap-4 md:flex-row">
      <SidebarFilters
        groups={DOCUMENT_FILTERS}
        selected={filters}
        onChange={(id, vals) => { setFilters((f) => ({ ...f, [id]: vals })); setPage(1); }}
        onClearAll={() => { setFilters({}); setPage(1); }}
        totalActive={totalActive}
        className="hidden md:flex"
      />
      <div className="flex-1 min-w-0">
        {isAdmin ? (
          <div className="mb-4 rounded-[24px] border border-border bg-card p-4 shadow-card">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="text-sm font-semibold text-foreground">Upload document</div>
                <p className="mt-1 text-xs leading-6 text-muted-foreground">
                  Upload a file to S3 and create the matching metadata row so it appears in this table immediately.
                </p>
              </div>
              <Badge className="bg-primary/10 text-primary hover:bg-primary/10">Admin only</Badge>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Type</div>
                <Select
                  value={uploadForm.type}
                  onValueChange={(value) => setUploadForm((current) => ({ ...current, type: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Offerings Documents">Offerings Documents</SelectItem>
                    <SelectItem value="Notices">Notices</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Sub Type</div>
                <Input
                  placeholder="Prospectus Supplement"
                  value={uploadForm.subType}
                  onChange={(event) => setUploadForm((current) => ({ ...current, subType: event.target.value }))}
                />
              </div>
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Name</div>
                <Input
                  placeholder="Displayed document title"
                  value={uploadForm.name}
                  onChange={(event) => setUploadForm((current) => ({ ...current, name: event.target.value }))}
                />
              </div>
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Issuer</div>
                <Select
                  value={uploadForm.issuerId || "__none__"}
                  onValueChange={(value) =>
                    setUploadForm((current) => ({ ...current, issuerId: value === "__none__" ? "" : value }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Optional issuer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">No issuer</SelectItem>
                    {(issuerOptionsQuery.data?.data ?? []).map((issuer) => (
                      <SelectItem key={issuer.id} value={issuer.id}>
                        {issuer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Date</div>
                <Input
                  type="date"
                  value={uploadForm.documentDate}
                  onChange={(event) => setUploadForm((current) => ({ ...current, documentDate: event.target.value }))}
                />
              </div>
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Member States</div>
                <Input
                  placeholder="DE, FR, LU"
                  value={uploadForm.memberStates}
                  onChange={(event) => setUploadForm((current) => ({ ...current, memberStates: event.target.value }))}
                />
              </div>
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Document File</div>
                <Input
                  type="file"
                  onChange={(event) =>
                    setUploadForm((current) => ({ ...current, file: event.target.files?.[0] ?? null }))
                  }
                />
              </div>
              <Button
                className="gap-2 bg-primary text-white hover:bg-primary/90"
                disabled={uploadMutation.isPending || !uploadForm.file || !uploadForm.type.trim()}
                onClick={() => uploadMutation.mutate()}
              >
                {uploadMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {uploadMutation.isPending ? "Uploading..." : "Upload Document"}
              </Button>
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {error instanceof Error
              ? `Documents could not be loaded from the backend: ${error.message}`
              : "Documents could not be loaded from the backend."}
          </div>
        ) : null}

        <div className="mb-3 flex items-center justify-between gap-2 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {totalActive > 0 ? (
                  <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
                    {totalActive}
                  </span>
                ) : null}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[90vw] max-w-none p-0 sm:max-w-sm">
              <SheetHeader className="border-b border-border pb-4">
                <SheetTitle>Document Filters</SheetTitle>
                <SheetDescription>Refine documents without cramming the list into narrow columns.</SheetDescription>
              </SheetHeader>
              <div className="h-full overflow-hidden p-4 pt-0">
                <SidebarFilters
                  groups={DOCUMENT_FILTERS}
                  selected={filters}
                  onChange={(id, vals) => { setFilters((f) => ({ ...f, [id]: vals })); setPage(1); }}
                  onClearAll={() => { setFilters({}); setPage(1); }}
                  totalActive={totalActive}
                  className="h-full w-full rounded-[20px] border-[#2b3a49] shadow-none"
                />
              </div>
            </SheetContent>
          </Sheet>
          {totalActive > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setFilters({}); setPage(1); }}
              className="text-xs text-muted-foreground"
            >
              Clear all
            </Button>
          ) : null}
        </div>
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
          mobileCardRender={(row) => (
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <HeaderDot color={String(row.typeDotColor ?? "#f43f5e")} />
                    <h3 className="text-sm font-semibold text-foreground">{String(row.name)}</h3>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{String(row.issuer)}</p>
                </div>
                <Badge variant="secondary" className="shrink-0 text-[11px]">
                  {String(row.type)}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-muted px-2 py-1 text-[11px] font-medium text-foreground/80">
                  {String(row.subType)}
                </span>
                {(row.memberStates as string[]).slice(0, 3).map((state) => (
                  <span key={state} className="rounded bg-muted px-2 py-1 text-[10px] font-medium text-muted-foreground">
                    {state}
                  </span>
                ))}
                {(row.memberStates as string[]).length > 3 ? (
                  <span className="rounded bg-muted px-2 py-1 text-[10px] font-medium text-muted-foreground">
                    +{(row.memberStates as string[]).length - 3}
                  </span>
                ) : null}
              </div>
              <div className="grid grid-cols-2 gap-2 rounded-2xl bg-muted/50 p-3">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Date</div>
                  <div className="mt-1 text-sm font-medium text-foreground">{String(row.date)}</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">Size</div>
                  <div className="mt-1 text-sm font-medium text-foreground">{String(row.fileSize)}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1 text-xs"
                  onClick={() => openDocument((row.fileUrl as string | null | undefined) ?? undefined)}
                  disabled={!row.fileUrl}
                >
                  <Eye className="h-3.5 w-3.5" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1 text-xs"
                  onClick={() => downloadDocument((row.fileUrl as string | null | undefined) ?? undefined, String(row.name))}
                  disabled={!row.fileUrl}
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </Button>
              </div>
            </div>
          )}
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
    <div className="min-h-screen bg-[#f4f6fa] flex flex-col">
      <DashboardHeader />

      <div className="flex-1 flex flex-col">
        {/* Tab navigation */}
        <div className="sticky top-[65px] z-40 border-b border-[#334658] bg-[#2d3b49] shadow-[0_10px_32px_rgba(15,23,42,0.12)]">
          <div className="container">
            <div className="grid grid-cols-3 gap-1.5 py-2 md:flex md:items-center md:gap-1 md:overflow-x-auto md:py-1.5">
              <button
                onClick={() => navigate("/dashboard")}
                className={`flex min-w-0 items-center justify-center gap-1 whitespace-nowrap rounded-xl px-2 py-2 text-[11px] font-medium transition-colors sm:gap-2 sm:px-4 sm:py-3 sm:text-sm md:shrink-0 ${
                  activeTab === "home"
                    ? "bg-white text-[#1f2e3b]"
                    : "text-white/72 hover:bg-white/8 hover:text-white"
                }`}
              >
                <BarChart3 className="hidden h-4 w-4 sm:block" />
                Overview
              </button>
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => handleTabChange(tab.key)}
                    className={`flex min-w-0 items-center justify-center gap-1 whitespace-nowrap rounded-xl px-2 py-2 text-[11px] font-medium transition-colors sm:gap-2 sm:px-4 sm:py-3 sm:text-sm md:shrink-0 ${
                      activeTab === tab.key
                        ? "bg-white text-[#1f2e3b]"
                        : "text-white/72 hover:bg-white/8 hover:text-white"
                    }`}
                  >
                    <Icon className="hidden h-4 w-4 sm:block" />
                    {tab.label}
                  </button>
                );
              })}
              <Link
                href="/dashboard/graph"
                className={`flex min-w-0 items-center justify-center gap-1 whitespace-nowrap rounded-xl px-2 py-2 text-[11px] font-medium transition-colors sm:gap-2 sm:px-4 sm:py-3 sm:text-sm md:shrink-0 ${
                  location.includes("/dashboard/graph")
                    ? "bg-white text-[#1f2e3b]"
                    : "text-white/72 hover:bg-white/8 hover:text-white"
                }`}
              >
                <Network className="hidden h-4 w-4 sm:block" />
                <span className="sm:hidden">Graph</span>
                <span className="hidden sm:inline">Graph View</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container flex-1 py-4 md:py-6">
          {activeTab === "home" && <DashboardHome onTabChange={handleTabChange} />}
          {activeTab === "issuers" && (
            <div className="min-h-0 md:h-[calc(100vh-160px)]">
              <IssuersTab />
            </div>
          )}
          {activeTab === "offerings" && (
            <div className="min-h-0 md:h-[calc(100vh-160px)]">
              <OfferingsTab />
            </div>
          )}
          {activeTab === "indices" && (
            <div className="min-h-0 md:h-[calc(100vh-160px)]">
              <IndicesTab />
            </div>
          )}
          {activeTab === "documents" && (
            <div className="min-h-0 md:h-[calc(100vh-160px)]">
              <DocumentsTab />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
