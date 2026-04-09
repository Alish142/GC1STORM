import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import PublicHeader from "@/components/PublicHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { backendApi } from "@/lib/backendApi";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
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

type LandingStat = {
  label: string;
  value: number;
  suffix?: string;
  icon: typeof Building2;
  color: string;
  href: string;
};

const STATS: LandingStat[] = [
  { label: "Verified Issuers", value: 340, suffix: "+", icon: Building2, color: "text-primary", href: "/dashboard/issuers" },
  { label: "Live Offerings", value: 1280, suffix: "+", icon: Layers, color: "text-blue-600", href: "/dashboard/offerings" },
  { label: "Sustainable Indices", value: 48, icon: BarChart3, color: "text-amber-600", href: "/dashboard/indices" },
  { label: "Structured Documents", value: 5600, suffix: "+", icon: FileText, color: "text-emerald-600", href: "/dashboard/documents" },
];

const PLATFORM_FEATURES = [
  {
    icon: Network,
    title: "Graph Relationship Engine",
    description: "Visualize complex relationships between issuers, offerings, investors, and markets through an interactive intelligence layer.",
    badge: "Core",
    color: "bg-primary/10 text-primary",
    href: "/dashboard/graph",
  },
  {
    icon: ShieldCheck,
    title: "EU Taxonomy Compliance",
    description: "Every offering is mapped against EU Taxonomy and ESG classification frameworks, ensuring full regulatory alignment.",
    badge: "Compliance",
    color: "bg-blue-500/10 text-blue-600",
    href: "/dashboard/documents",
  },
  {
    icon: TrendingUp,
    title: "Real-time Market Data",
    description: "Live indices, price feeds, and performance metrics across asset classes and regions with mission-focused precision.",
    badge: "Live",
    color: "bg-amber-500/10 text-amber-600",
    href: "/dashboard/indices",
  },
  {
    icon: Globe2,
    title: "Global Coverage",
    description: "Access issuers and opportunities across Europe, Asia-Pacific, Americas, Africa, and the Middle East in one unified platform.",
    badge: "Global",
    color: "bg-violet-500/10 text-violet-600",
    href: "/discover",
  },
  {
    icon: Leaf,
    title: "Regenerative Finance",
    description: "Purpose-built for impact investing by connecting capital to projects that restore ecosystems, communities, and economies.",
    badge: "Impact",
    color: "bg-emerald-500/10 text-emerald-600",
    href: "/dashboard/offerings",
  },
  {
    icon: Zap,
    title: "WBX Exchange Integration",
    description: "Seamless access to the Worldbridgers Exchange for direct listing, trading, and settlement of regenerative instruments.",
    badge: "Exchange",
    color: "bg-rose-500/10 text-rose-600",
    href: "/dashboard/account?view=portfolio",
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
  const { user } = useAuth();
  const isAuthenticated = Boolean(user);
  const landingStatsQuery = useQuery<LandingStat[]>({
    queryKey: ["landing-stats"],
    queryFn: async () => {
      const [issuers, offerings, indices, documents] = await Promise.all([
        backendApi.issuers(new URLSearchParams({ page: "1", page_size: "1" })),
        backendApi.offerings(new URLSearchParams({ page: "1", page_size: "1" })),
        backendApi.indices(new URLSearchParams({ page: "1", page_size: "1" })),
        backendApi.documents(new URLSearchParams({ page: "1", page_size: "1" })),
      ]);

      return [
        { ...STATS[0], value: issuers.total },
        { ...STATS[1], value: offerings.total },
        { ...STATS[2], value: indices.total },
        { ...STATS[3], value: documents.total },
      ];
    },
    staleTime: 60_000,
  });
  const displayStats = landingStatsQuery.data ?? STATS;

  return (
    <div className="min-h-screen bg-background">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(0, -16px, 0) scale(1.04); }
        }

        @keyframes pulseBars {
          0%, 100% { transform: scaleY(0.92); opacity: 0.35; }
          50% { transform: scaleY(1.08); opacity: 0.72; }
        }

        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes gridDrift {
          0% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(-12px, 10px, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }
      `}</style>
      <PublicHeader />

      <section
        className="relative overflow-hidden pt-28 text-white"
        style={{
          background:
            "linear-gradient(120deg, #123765 0%, #1d5c9a 26%, #23839b 52%, #3aa176 76%, #7fbf63 100%)",
          backgroundSize: "180% 180%",
          animation: "gradientShift 18s ease-in-out infinite",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.16]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            animation: "gridDrift 22s ease-in-out infinite",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,0.18),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(74,222,128,0.22),transparent_30%),radial-gradient(circle_at_center_right,rgba(96,165,250,0.18),transparent_26%)]" />
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-12 top-28 h-48 w-48 rounded-full bg-emerald-300/14 blur-3xl [animation:float_16s_ease-in-out_infinite]" />
          <div className="absolute right-24 top-36 h-56 w-56 rounded-full bg-sky-300/12 blur-3xl [animation:float_20s_ease-in-out_infinite_reverse]" />
          <div className="absolute bottom-16 left-1/3 h-44 w-44 rounded-full bg-amber-200/12 blur-3xl [animation:float_18s_ease-in-out_infinite]" />
          <div className="absolute inset-x-0 bottom-0 h-36 opacity-35">
            <div className="flex h-full items-end gap-3 px-12">
              {[28, 34, 31, 42, 48, 40, 58, 66, 60, 72, 76, 82].map((height, index) => (
                <div
                  key={index}
                  className="flex-1 rounded-t-[18px] bg-gradient-to-t from-white/10 via-sky-200/10 to-emerald-200/20"
                  style={{
                    height: `${height}%`,
                    animation: `pulseBars ${6 + (index % 4)}s ease-in-out ${index * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="container relative z-10 pb-20">
          <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
            <div className="max-w-[780px] pt-6">
              <h1 className="max-w-[760px] text-[3.7rem] font-bold leading-[0.98] md:text-[4.7rem] lg:text-[5.55rem]">
                Connecting Capital to{" "}
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: "linear-gradient(135deg, #4ade80, #93c5fd, #fde047)" }}
                >
                  Regenerative Impact
                </span>
              </h1>

              <p className="mt-7 max-w-[660px] text-[1.22rem] leading-[1.7] text-white/74 md:text-[1.28rem]">
                Worldbridgers Regenify bridges ethical capital with verified ESG opportunities. Discover issuers, explore offerings, and navigate the regenerative economy through real-time data and intelligent relationship mapping.
              </p>

              <div className="mt-9 flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className="h-16 rounded-xl bg-[#4ade80] px-12 text-[1.05rem] font-bold text-slate-950 shadow-brand hover:bg-[#86efac]"
                  onClick={() => navigate(isAuthenticated ? "/dashboard" : "/login")}
                >
                  Explore Platform
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-16 rounded-xl border-white/30 bg-white/5 px-11 text-[1.05rem] font-semibold text-white hover:border-white/50 hover:bg-white/10"
                  onClick={() => {
                    window.location.href = isAuthenticated ? "/dashboard/account?view=support" : "/login?mode=request-access";
                  }}
                >
                  Request Access
                </Button>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-5 text-sm text-white/64">
                {["EU Taxonomy aligned", "ISO 14001 certified", "SFDR compliant", "Graph intelligence"].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative lg:pl-2">
              <div className="absolute inset-x-10 top-12 h-52 rounded-full bg-emerald-400/20 blur-3xl" />
              <div className="relative mx-auto max-w-[450px] overflow-hidden rounded-[32px] border border-white/12 bg-white/10 p-4 shadow-[0_30px_100px_rgba(0,0,0,0.28)] backdrop-blur-xl">
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
          {displayStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <button
                key={stat.label}
                type="button"
                onClick={() =>
                  navigate(isAuthenticated ? stat.href : `/login?next=${encodeURIComponent(stat.href)}`)
                }
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
                <div className="mt-4 text-[2.9rem] font-bold leading-none text-foreground md:text-[3.25rem]">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="mt-2 text-[0.95rem] font-medium text-muted-foreground">{stat.label}</div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="bg-background py-24">
        <div className="container">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <Badge variant="secondary" className="bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary hover:bg-primary/10">
              Platform Capabilities
            </Badge>
            <h2 className="mt-4 text-4xl font-bold text-foreground">
              Everything you need for{" "}
              <span className="text-primary">intelligent ESG investing</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              A unified platform combining real-time data, relationship intelligence, and compliance tools for the regenerative economy.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {PLATFORM_FEATURES.map((feature) => {
              const Icon = feature.icon;
              const href = feature.href;
              const targetHref =
                isAuthenticated || href === "/discover"
                  ? href
                  : `/login?next=${encodeURIComponent(href)}`;
              return (
                <button
                  key={feature.title}
                  type="button"
                  onClick={() => navigate(targetHref)}
                  className="flex min-h-[248px] flex-col rounded-[28px] border border-border bg-card p-7 text-left shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
                >
                  <div className="flex items-start justify-between">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${feature.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {feature.badge}
                    </span>
                  </div>
                  <h3 className="mt-6 text-[1.35rem] font-semibold leading-tight text-foreground">{feature.title}</h3>
                  <p className="mt-4 text-sm leading-6 text-muted-foreground">{feature.description}</p>
                  <div className="mt-auto inline-flex items-center gap-1 pt-6 text-base font-semibold text-primary">
                    Learn more
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-16 text-white">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(100,200,160,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(100,200,160,0.3) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="container relative z-10 grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="max-w-[560px]">
            <Badge className="bg-emerald-400/15 text-emerald-200 hover:bg-emerald-400/15">
              Relationship Intelligence
            </Badge>
            <h2 className="mt-5 text-4xl font-bold md:text-5xl">
              See the full picture with{" "}
              <span className="bg-gradient-to-r from-emerald-300 to-sky-300 bg-clip-text text-transparent">
                graph intelligence
              </span>
            </h2>
            <p className="mt-5 max-w-[620px] text-[1.02rem] leading-8 text-white/68">
              Our proprietary database and graph intelligence layer maps every relationship between issuers, investors, opportunities, and markets, revealing hidden connections and investment pathways invisible to traditional data tools.
            </p>

            <div className="mt-8 max-w-[430px] space-y-4">
              {[
                "Interactive node-edge visualization",
                "Click-to-explore entity details",
                "Filter by type, region, or category",
                "Real-time relationship updates",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[0.95rem] text-white/82">
                  <div className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-300" />
                  {item}
                </div>
              ))}
            </div>

            <Button
              className="mt-8 h-12 rounded-xl bg-emerald-400 px-7 text-base font-semibold text-slate-950 shadow-brand hover:bg-emerald-300"
              onClick={() => navigate(isAuthenticated ? "/dashboard/graph" : "/login?next=/dashboard/graph")}
            >
              Explore Graph View
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="relative">
            <div className="mx-auto max-w-[560px] rounded-[32px] border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
              <button
                onClick={() => navigate("/dashboard/graph")}
                className="relative w-full text-left transition-transform hover:scale-[1.01]"
              >
                <div className="rounded-[26px] border border-white/10 bg-slate-900/80 p-4">
                <svg viewBox="0 0 400 400" className="mx-auto h-[360px] w-full">
                    <circle cx="200" cy="200" r="78" fill="none" stroke="rgba(148,163,184,0.22)" strokeWidth="1.5" />
                    <circle cx="200" cy="200" r="130" fill="none" stroke="rgba(148,163,184,0.30)" strokeWidth="2" />

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
                        ) : (
                          <text
                            x={x}
                            y={y + 24}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize="8.5"
                            fill="rgba(255,255,255,0.76)"
                          >
                            {node.label}
                          </text>
                        )}
                      </g>
                    );
                  })}

                    <g>
                      <polygon points={previewHexPoints(52)} transform="translate(200 200)" fill="url(#centerGlow)" stroke="rgba(96,165,250,0.95)" strokeWidth="2.5" />
                      <circle cx="200" cy="200" r="60" fill="none" stroke="rgba(137,166,255,0.32)" strokeWidth="2" />
                    </g>

                    <defs>
                      <radialGradient id="centerGlow" cx="50%" cy="50%" r="65%">
                        <stop offset="0%" stopColor="#fb923c" />
                        <stop offset="58%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#ea580c" />
                      </radialGradient>
                    </defs>
                </svg>

                <div className="mt-2 flex flex-wrap justify-center gap-2 px-2 pb-1">
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
                </div>
              </button>
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
              Ready to invest in the{" "}
              <span className="bg-gradient-to-r from-emerald-500 to-sky-500 bg-clip-text text-transparent">
                regenerative future?
              </span>
            </h2>
            <p className="mt-5 text-lg leading-8 text-muted-foreground">
              Join institutional investors, family offices, and impact allocators already using Worldbridgers Regenify to discover, analyse, and deploy capital into verified ESG opportunities.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                className="bg-primary px-10 font-semibold text-white shadow-brand hover:bg-primary/90"
                onClick={() => navigate(isAuthenticated ? "/dashboard" : "/login")}
              >
                Get Started Today
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-10 font-semibold"
                onClick={() => {
                  window.location.href = isAuthenticated ? "/dashboard/account?view=support" : "/login?mode=request-access";
                }}
              >
                Schedule a Demo
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
