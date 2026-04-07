import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import PublicHeader from "@/components/PublicHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronRight,
  FileText,
  Globe2,
  Layers,
  Leaf,
  Mail,
  Network,
  ShieldCheck,
  TrendingUp,
  Twitter,
  Linkedin,
  Github,
  Wallet,
  Zap,
} from "lucide-react";

function AnimatedCounter({
  target,
  suffix = "",
  prefix = "",
}: {
  target: number;
  suffix?: string;
  prefix?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) {
          return;
        }

        started.current = true;
        const duration = 1800;
        const steps = 60;
        const increment = target / steps;
        let current = 0;

        const timer = window.setInterval(() => {
          current += increment;
          if (current >= target) {
            setCount(target);
            window.clearInterval(timer);
          } else {
            setCount(Math.floor(current));
          }
        }, duration / steps);
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

const STATS = [
  { label: "Verified Issuers", value: 340, suffix: "+", icon: Building2, color: "text-primary" },
  { label: "Live Offerings", value: 1280, suffix: "+", icon: Layers, color: "text-blue-600" },
  { label: "Sustainable Indices", value: 48, icon: BarChart3, color: "text-amber-600" },
  { label: "Structured Documents", value: 5600, suffix: "+", icon: FileText, color: "text-emerald-600" },
];

const JOURNEYS = [
  {
    title: "For issuers",
    description: "Show Worldbridgers-listed issuers, labelled instruments, and disclosure packs in a cleaner market-facing format.",
    points: ["Stronger visibility for sustainable issuers", "Cleaner access to offering documents", "A sharper first impression for listings"],
    accent: "from-emerald-300/35 to-sky-200/15",
  },
  {
    title: "For investors",
    description: "Help investors move from discovery into trusted Worldbridgers data rooms, indices, and relationship intelligence.",
    points: ["Guided paths into live market data", "Relationship-led discovery around entities", "Faster comparison across offerings"],
    accent: "from-sky-300/35 to-blue-200/15",
  },
  {
    title: "For market teams",
    description: "Give the Worldbridgers brand a more credible public website that connects naturally to the platform and data product.",
    points: ["Branded public storytelling", "Consistent navigation into product areas", "Better hierarchy for platform signals"],
    accent: "from-amber-300/35 to-yellow-200/15",
  },
];

const WORKSPACE_VIEWS = [
  {
    key: "overview",
    label: "Overview",
    eyebrow: "Platform overview",
    title: "A clearer public entry into the platform",
    description:
      "The public website introduces the platform in a more standard way, with stronger structure and clearer navigation into the product.",
    bullets: [
      "Clear primary actions and website navigation",
      "Visible trust, market, and document signals above the fold",
      "A cleaner visual bridge into the authenticated product",
    ],
    metrics: [
      ["Navigation", "Landing page to product"],
      ["Primary focus", "Discover, review, connect"],
      ["Experience", "Cleaner and more standard"],
    ],
  },
  {
    key: "markets",
    label: "Markets",
    eyebrow: "Live intelligence",
    title: "Market information presented more clearly",
    description:
      "Visitors can quickly scan regional market signals and key categories before moving deeper into the platform.",
    bullets: [
      "Region toggles for quick market pulse changes",
      "Clearer category labels and data-style cards",
      "Entry points to issuers, offerings, indices, and graph views",
    ],
    metrics: [
      ["Regions surfaced", "Europe, APAC, Americas"],
      ["Data feel", "More credible and useful"],
      ["Interaction", "Tabs, chips, and guided cards"],
    ],
  },
  {
    key: "access",
    label: "Access",
    eyebrow: "Onboarding",
    title: "A cleaner route into account access",
    description:
      "The website now gives users a more standard path into login and access requests without distracting messaging.",
    bullets: [
      "Clear request-access prompts from multiple sections",
      "More specific calls to action",
      "Cleaner login and onboarding presentation",
    ],
    metrics: [
      ["Flow consistency", "Header, hero, CTA, footer"],
      ["User confidence", "Higher with visible next steps"],
      ["Presentation", "Standard website pattern"],
    ],
  },
];

const MARKET_PULSES = [
  {
    key: "europe",
    label: "Europe",
    summary: "Dense issuer concentration, compliance-first workflows, and document-heavy review.",
    chips: ["EU Taxonomy", "SFDR", "Sustainable bonds"],
    cards: [
      { title: "Green Sovereigns", value: "112 live", delta: "+8.2%", tone: "text-emerald-600" },
      { title: "Document Readiness", value: "94%", delta: "High", tone: "text-blue-600" },
      { title: "Index Momentum", value: "18 benchmarks", delta: "+2.1%", tone: "text-amber-600" },
    ],
  },
  {
    key: "apac",
    label: "APAC",
    summary: "Fast-growing pipeline with strong thematic clustering around climate, energy, and regional market access.",
    chips: ["Growth market", "Transition finance", "Regional issuers"],
    cards: [
      { title: "Emerging Offerings", value: "76 live", delta: "+12.4%", tone: "text-emerald-600" },
      { title: "Cross-border Activity", value: "31 corridors", delta: "Active", tone: "text-blue-600" },
      { title: "Theme Density", value: "9 clusters", delta: "High", tone: "text-amber-600" },
    ],
  },
  {
    key: "americas",
    label: "Americas",
    summary: "Broader thematic variety with stronger investor and project relationship mapping needs.",
    chips: ["Investor networks", "Project finance", "Regional diversification"],
    cards: [
      { title: "Tracked Entities", value: "154 nodes", delta: "+6.7%", tone: "text-emerald-600" },
      { title: "Impact Themes", value: "14 mapped", delta: "Expanded", tone: "text-blue-600" },
      { title: "Listing Velocity", value: "23 / month", delta: "+4.3%", tone: "text-amber-600" },
    ],
  },
];

const PLATFORM_FEATURES = [
  {
    icon: Network,
    title: "Graph relationship engine",
    description: "Map issuers, investors, projects, and themes with visual context instead of flat data rows.",
    badge: "Core",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: ShieldCheck,
    title: "Compliance-aware presentation",
    description: "Keep EU Taxonomy, SFDR, and document trail cues visible throughout the product story.",
    badge: "Trust",
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    icon: TrendingUp,
    title: "Live market language",
    description: "Use index movement, readiness signals, and regional performance to make the frontend feel active.",
    badge: "Live",
    color: "bg-amber-500/10 text-amber-600",
  },
  {
    icon: Globe2,
    title: "Multi-region access",
    description: "Let users understand the platform’s global coverage from the first visit.",
    badge: "Coverage",
    color: "bg-violet-500/10 text-violet-600",
  },
  {
    icon: Wallet,
    title: "Investor-friendly pathways",
    description: "Shape the website around the decisions users are trying to make, not just static marketing text.",
    badge: "UX",
    color: "bg-emerald-500/10 text-emerald-600",
  },
  {
    icon: Zap,
    title: "Stronger website structure",
    description: "Create a more modern public experience with clearer sections, smoother flow, and stronger engagement.",
    badge: "Website",
    color: "bg-rose-500/10 text-rose-600",
  },
];

const PREVIEW_RING_NODES = [
  { label: "Entrepreneurship", ring: "inner" as const, angle: -90, color: "#f8fafc" },
  { label: "Future of Work", ring: "inner" as const, angle: 28, color: "#f8fafc" },
  { label: "Social Justice", ring: "inner" as const, angle: 148, color: "#f8fafc" },
  { label: "EIB", ring: "outer" as const, angle: -34, color: "#4ade80" },
  { label: "NGC", ring: "outer" as const, angle: 18, color: "#4ade80" },
  { label: "Impact Asia", ring: "outer" as const, angle: 92, color: "#60a5fa" },
  { label: "US Climate", ring: "outer" as const, angle: 156, color: "#60a5fa" },
  { label: "Carbon", ring: "outer" as const, angle: 222, color: "#fbbf24" },
  { label: "APAC Market", ring: "outer" as const, angle: -126, color: "#a78bfa" },
];

function previewHexPoints(size: number) {
  return Array.from({ length: 6 }, (_, index) => {
    const angle = (Math.PI / 3) * index - Math.PI / 6;
    return `${Math.cos(angle) * size},${Math.sin(angle) * size}`;
  }).join(" ");
}

const DATABASE_TABLES = [
  { name: "Issuers", rows: "340+", state: "Synced", tone: "emerald" },
  { name: "Offerings", rows: "1,280+", state: "Live", tone: "sky" },
  { name: "Indices", rows: "48", state: "Tracked", tone: "amber" },
  { name: "Documents", rows: "5,600+", state: "Ready", tone: "teal" },
];

const HERO_SIGNAL_CARDS = [
  { label: "Verified issuers", value: "340+", tone: "emerald" },
  { label: "Active offerings", value: "1,280+", tone: "sky" },
  { label: "Tracked indices", value: "48", tone: "amber" },
];

export default function Home() {
  const [, navigate] = useLocation();
  const [activeView, setActiveView] = useState("overview");
  const [activePulse, setActivePulse] = useState("europe");
  const pulse = MARKET_PULSES.find((item) => item.key === activePulse) ?? MARKET_PULSES[0];
  const workspaceView = WORKSPACE_VIEWS.find((item) => item.key === activeView) ?? WORKSPACE_VIEWS[0];

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      <section className="relative overflow-hidden pt-28 text-white" style={{ background: "linear-gradient(135deg, #082249 0%, #0a356d 38%, #0f6c71 72%, #0d4d4a 100%)" }}>
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.16]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,0.18),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(74,222,128,0.22),transparent_30%),radial-gradient(circle_at_center_right,rgba(96,165,250,0.18),transparent_26%)]" />

        <div className="container relative z-10 pb-20">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="max-w-3xl">
              <h1 className="max-w-3xl text-5xl font-bold leading-[1.02] md:text-6xl lg:text-7xl">
                Discover market intelligence with a{" "}
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: "linear-gradient(135deg, #4ade80, #93c5fd, #fde047)" }}
                >
                  clearer and more engaging website
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72 md:text-xl">
                Explore issuers, offerings, indices, documents, and relationship intelligence through a cleaner public experience designed to guide users naturally into the platform.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className="bg-[#4ade80] px-10 text-base font-bold text-slate-950 shadow-brand hover:bg-[#86efac]"
                  onClick={() => navigate("/login")}
                >
                  Explore Platform
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 bg-white/5 px-8 font-semibold text-white hover:border-white/50 hover:bg-white/10"
                  onClick={() => {
                    window.location.href = "/login?mode=request-access";
                  }}
                >
                  Request Access
                </Button>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-5 text-sm text-white/64">
                {["EU Taxonomy aligned", "SFDR compliant", "Graph intelligence", "Global market coverage"].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-x-10 top-12 h-52 rounded-full bg-emerald-400/20 blur-3xl" />
              <div className="relative overflow-hidden rounded-[32px] border border-white/12 bg-white/10 p-4 shadow-[0_30px_100px_rgba(0,0,0,0.28)] backdrop-blur-xl">
                <div className="rounded-[26px] border border-white/10 bg-slate-950/70 p-5">
                  <div className="flex items-center justify-between border-b border-white/10 pb-5">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-white/45">Data Backbone</p>
                      <h2 className="mt-1 text-xl font-semibold">Platform Snapshot</h2>
                    </div>
                    <Badge className="bg-sky-400/15 text-sky-200 hover:bg-sky-400/15">
                      Live view
                    </Badge>
                  </div>

                  <div className="mt-5 grid gap-4">
                    <div className="grid gap-3 sm:grid-cols-3">
                      {HERO_SIGNAL_CARDS.map((item) => (
                        <div key={item.label} className="rounded-2xl border border-white/10 bg-white/6 p-4">
                          <div className={`h-2.5 w-14 rounded-full ${
                            item.tone === "emerald"
                              ? "bg-emerald-300"
                              : item.tone === "sky"
                                ? "bg-sky-300"
                                : "bg-amber-300"
                          }`} />
                          <div className="mt-5 text-[1.8rem] font-semibold leading-none">{item.value}</div>
                          <div className="mt-2 text-sm text-white/64">{item.label}</div>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-white/45">What users can do</p>
                          <p className="mt-2 max-w-md text-sm leading-7 text-white/76">
                            Move from public discovery into real platform areas like issuers, offerings, documents, and graph intelligence through a cleaner branded entry point.
                          </p>
                        </div>
                        <div className="rounded-2xl bg-white/10 px-4 py-3 text-right">
                          <div className="text-[11px] uppercase tracking-[0.16em] text-white/45">Coverage</div>
                          <div className="mt-1 text-lg font-semibold text-white">Global</div>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        {DATABASE_TABLES.map((table) => (
                          <div key={table.name} className="flex items-center justify-between rounded-2xl bg-slate-950/35 px-4 py-3 text-sm text-white/82">
                            <div className="flex items-center gap-3">
                              <div className={`h-2.5 w-2.5 rounded-full ${
                                table.tone === "emerald"
                                  ? "bg-emerald-300"
                                  : table.tone === "sky"
                                    ? "bg-sky-300"
                                    : table.tone === "amber"
                                      ? "bg-amber-300"
                                      : "bg-teal-300"
                              }`} />
                              <span>{table.name}</span>
                            </div>
                            <span className="font-semibold text-white">{table.rows}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-white py-16">
        <div className="container grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={`rounded-3xl border p-6 text-center shadow-card transition-transform hover:-translate-y-1 hover:shadow-card-hover ${
                  stat.label === "Verified Issuers"
                    ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white"
                    : stat.label === "Live Offerings"
                      ? "border-blue-200 bg-gradient-to-br from-blue-50 to-white"
                      : stat.label === "Sustainable Indices"
                        ? "border-amber-200 bg-gradient-to-br from-amber-50 to-white"
                        : "border-teal-200 bg-gradient-to-br from-teal-50 to-white"
                }`}
              >
                <div
                  className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl ${
                    stat.label === "Verified Issuers"
                      ? "bg-emerald-100"
                      : stat.label === "Live Offerings"
                        ? "bg-blue-100"
                        : stat.label === "Sustainable Indices"
                          ? "bg-amber-100"
                          : "bg-teal-100"
                  } ${stat.color}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-4 text-4xl font-bold text-foreground">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="mt-1 text-sm font-medium text-muted-foreground">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-background py-24">
        <div className="container">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary hover:bg-primary/10">
              Worldbridgers Regenify
            </Badge>
            <h2 className="text-4xl font-bold text-foreground md:text-5xl">
              A stronger public website for the Worldbridgers market ecosystem
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              The website now introduces Worldbridgers Regenify with clearer sections, stronger hierarchy, and a more credible path into issuers, offerings, indices, and documents.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {JOURNEYS.map((item) => (
              <div
                key={item.title}
                className={`rounded-[28px] border border-border bg-gradient-to-br ${item.accent} p-6 shadow-card`}
              >
                <h3 className="text-xl font-semibold text-foreground">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.description}</p>
                <div className="mt-6 space-y-3">
                  {item.points.map((point) => (
                    <div key={point} className="flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-3 text-sm text-foreground shadow-sm">
                      <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                      {point}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="container grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/10">
              Platform Sections
            </Badge>
            <h2 className="mt-4 text-4xl font-bold text-foreground">
              Show visitors the platform in a more standard way
            </h2>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              A cleaner layout helps visitors understand the platform, scan sections quickly, and move into the product with less friction.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {WORKSPACE_VIEWS.map((view) => (
                <button
                  key={view.key}
                  onClick={() => setActiveView(view.key)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    activeView === view.key
                      ? "bg-primary text-white shadow-brand"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {view.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[30px] border border-border bg-slate-950 p-5 text-white shadow-[0_24px_80px_rgba(15,23,42,0.16)]">
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
              <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-white/45">{workspaceView.eyebrow}</p>
                  <h3 className="mt-3 text-2xl font-semibold">{workspaceView.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/68">{workspaceView.description}</p>

                  <div className="mt-6 space-y-3">
                    {workspaceView.bullets.map((bullet) => (
                      <div key={bullet} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
                        <ChevronRight className="mt-0.5 h-4 w-4 text-emerald-300" />
                        {bullet}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  {workspaceView.metrics.map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-4">
                      <div className="text-xs uppercase tracking-[0.18em] text-white/45">{label}</div>
                      <div className="mt-2 text-base font-medium text-white/92">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background py-24">
        <div className="container">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/10">
              Core Capabilities
            </Badge>
            <h2 className="mt-4 text-4xl font-bold text-foreground">
              A stronger visual language for the platform
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              The platform now feels more polished, more standard, and easier to understand at a glance.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {PLATFORM_FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group rounded-[28px] border border-border bg-card p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
                >
                  <div className="flex items-start justify-between">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${feature.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {feature.badge}
                    </span>
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{feature.description}</p>
                  <div className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    View pathway
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-24 text-white">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(100,200,160,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(100,200,160,0.3) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="container relative z-10 grid gap-16 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <Badge className="bg-emerald-400/15 text-emerald-200 hover:bg-emerald-400/15">
              Relationship Intelligence
            </Badge>
            <h2 className="mt-5 text-4xl font-bold md:text-5xl">
              Explore connected themes, entities, and market relationships
            </h2>
            <p className="mt-5 text-lg leading-8 text-white/68">
              Relationship intelligence helps users understand how themes, issuers, investors, and opportunities connect across the ecosystem.
            </p>

            <div className="mt-8 space-y-4">
              {[
                "Interactive relationship storytelling between issuers, themes, and investors",
                "A cleaner visual bridge between the website and graph tools",
                "A clearer invitation to explore the network view",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/78">
                  <div className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-300" />
                  {item}
                </div>
              ))}
            </div>

            <Button
              className="mt-8 bg-emerald-400 font-semibold text-slate-950 hover:bg-emerald-300"
              onClick={() => navigate("/dashboard/graph")}
            >
              Explore Graph View
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="relative">
            <div className="aspect-square max-w-xl mx-auto rounded-[32px] border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
              <button
                onClick={() => navigate("/dashboard/graph")}
                className="relative h-full w-full overflow-hidden rounded-[26px] border border-white/10 bg-slate-900/80 text-left transition-transform hover:scale-[1.01]"
              >
                <svg viewBox="0 0 400 400" className="h-full w-full">
                  <circle cx={200} cy={200} r={78} fill="none" stroke="rgba(148,163,184,0.22)" strokeWidth="1.5" />
                  <circle cx={200} cy={200} r={130} fill="none" stroke="rgba(148,163,184,0.30)" strokeWidth="2" />

                  {PREVIEW_RING_NODES.map((node, index) => {
                    const radius = node.ring === "inner" ? 78 : 130;
                    const rad = (node.angle * Math.PI) / 180;
                    const x = 200 + Math.cos(rad) * radius;
                    const y = 200 + Math.sin(rad) * radius;
                    const cx = 200 + Math.cos(rad) * (radius * 0.45);
                    const cy = 200 + Math.sin(rad) * (radius * 0.45);

                    return (
                      <path
                        key={`edge-${index}`}
                        d={`M 200 200 Q ${cx} ${cy} ${x} ${y}`}
                        stroke="rgba(125,211,252,0.18)"
                        strokeWidth="1.2"
                        fill="none"
                      />
                    );
                  })}

                  {PREVIEW_RING_NODES.map((node, index) => {
                    const radius = node.ring === "inner" ? 78 : 130;
                    const rad = (node.angle * Math.PI) / 180;
                    const x = 200 + Math.cos(rad) * radius;
                    const y = 200 + Math.sin(rad) * radius;

                    return (
                      <g key={`node-${index}`}>
                        <circle cx={x} cy={y} r={11} fill="rgba(15,23,42,0.9)" />
                        <circle cx={x} cy={y} r={8.5} fill="rgba(255,255,255,0.95)" stroke={node.color} strokeWidth="2" />
                        {node.ring === "inner" ? (
                          <text
                            x={x + (x >= 200 ? 15 : -15)}
                            y={y}
                            textAnchor={x >= 200 ? "start" : "end"}
                            dominantBaseline="middle"
                            fontSize="9"
                            fill="rgba(255,255,255,0.82)"
                          >
                            {node.label}
                          </text>
                        ) : null}
                      </g>
                    );
                  })}

                  <polygon points={previewHexPoints(52)} transform="translate(200 200)" fill="url(#centerImage)" stroke="rgba(137,166,255,0.9)" strokeWidth="2.5" />
                  <circle cx={200} cy={200} r={60} fill="none" stroke="rgba(137,166,255,0.32)" strokeWidth="2" />
                  <text x={200} y={192} textAnchor="middle" fontSize="9" fill="white" style={{ letterSpacing: "0.18em" }}>
                    THEME
                  </text>
                  <text x={200} y={208} textAnchor="middle" fontSize="13" fill="white" style={{ fontWeight: 700 }}>
                    Entrepreneurship
                  </text>
                  <defs>
                    <pattern id="centerImage" x="0" y="0" width="1" height="1" patternUnits="objectBoundingBox">
                      <image
                        href="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80"
                        x="150"
                        y="150"
                        width="100"
                        height="100"
                        preserveAspectRatio="xMidYMid slice"
                      />
                    </pattern>
                  </defs>
                </svg>

                <div className="absolute bottom-4 left-4 right-4 flex flex-wrap justify-center gap-2">
                  {[
                    { color: "#4ade80", label: "Issuers" },
                    { color: "#60a5fa", label: "Investors" },
                    { color: "#fbbf24", label: "Opportunities" },
                    { color: "#a78bfa", label: "Markets" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-1.5 rounded-full bg-white/8 px-3 py-1 text-[11px] text-white/68">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.label}
                    </div>
                  ))}
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="container grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <Badge variant="secondary" className="bg-amber-500/10 text-amber-700 hover:bg-amber-500/10">
              Markets & Data
            </Badge>
            <h2 className="mt-4 text-4xl font-bold text-foreground">
              Highlight markets and data more clearly
            </h2>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              Region-level views help users scan market activity, benchmarks, and platform coverage more quickly.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {MARKET_PULSES.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setActivePulse(item.key)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    activePulse === item.key
                      ? "bg-foreground text-white"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[30px] border border-border bg-gradient-to-br from-slate-50 via-white to-emerald-50/40 p-6 shadow-card">
            <div className="flex flex-wrap items-center gap-2">
              {pulse.chips.map((chip) => (
                <Badge key={chip} variant="outline" className="rounded-full border-primary/20 bg-white px-3 py-1 text-primary">
                  {chip}
                </Badge>
              ))}
            </div>
            <p className="mt-5 text-base leading-7 text-muted-foreground">{pulse.summary}</p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {pulse.cards.map((card) => (
                <div key={card.title} className="rounded-3xl border border-border bg-white p-5 shadow-sm">
                  <div className="text-sm font-medium text-muted-foreground">{card.title}</div>
                  <div className="mt-3 text-3xl font-semibold text-foreground">{card.value}</div>
                  <div className={`mt-2 text-sm font-medium ${card.tone}`}>{card.delta}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-gradient-to-br from-primary/5 via-blue-500/5 to-amber-500/5 py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Leaf className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-4xl font-bold text-foreground md:text-5xl">
              Clearer structure, stronger website experience
            </h2>
            <p className="mt-5 text-lg leading-8 text-muted-foreground">
              The platform now looks more like a complete website and less like a placeholder entry screen.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                className="bg-primary px-10 font-semibold text-white shadow-brand hover:bg-primary/90"
                onClick={() => navigate("/login")}
              >
                Open Login
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-10 font-semibold"
                onClick={() => {
                  window.location.href = "/login?mode=request-access";
                }}
              >
                Request Access
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-slate-950 py-16 text-slate-400">
        <div className="container">
          <div className="mb-12 grid gap-10 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                  <Leaf className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Worldbridgers</div>
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-primary">Regenify</div>
                </div>
              </div>
              <p className="max-w-md text-sm leading-7">
                Connecting capital to regenerative impact through market intelligence, relationship discovery, and verified opportunities.
              </p>
              <div className="mt-6 flex gap-3">
                {[Twitter, Linkedin, Github, Mail].map((Icon, index) => (
                  <button
                    key={index}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 transition-colors hover:bg-slate-800"
                    onClick={() => navigate("/login")}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>

            {[
              ["Platform", ["Issuers", "Offerings", "Indices", "Documents", "Graph View"]],
              ["Access", ["Log In", "Request Access", "Support", "Onboarding"]],
              ["Company", ["About", "Specialists", "Contact", "Privacy"]],
            ].map(([title, links]) => (
              <div key={title as string}>
                <h4 className="mb-4 text-sm font-semibold text-white">{title as string}</h4>
                <div className="space-y-2">
                  {(links as string[]).map((link) => (
                    <button
                      key={link}
                      className="block text-sm transition-colors hover:text-white"
                      onClick={() => {
                        if (link === "Request Access") {
                          window.location.href = "/login?mode=request-access";
                          return;
                        }
                        navigate("/login");
                      }}
                    >
                      {link}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 text-xs md:flex-row">
            <p>© 2026 Worldbridgers Regenify. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>EU Taxonomy aligned · SFDR compliant · Global market coverage</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
