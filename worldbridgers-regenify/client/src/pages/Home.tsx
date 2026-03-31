import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import PublicHeader from "@/components/PublicHeader";
import HeroCanvas from "@/components/HeroCanvas";
import {
  ArrowRight,
  BarChart3,
  Globe2,
  Network,
  ShieldCheck,
  TrendingUp,
  Leaf,
  FileText,
  Building2,
  Layers,
  Zap,
  ChevronRight,
  Twitter,
  Linkedin,
  Github,
  Mail,
} from "lucide-react";

/* ─── Animated counter ──────────────────────────────────────────────────────── */
function AnimatedCounter({ target, suffix = "", prefix = "" }: { target: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1800;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

/* ─── Stats data ─────────────────────────────────────────────────────────────── */
const STATS = [
  { label: "Issuers", value: 340, suffix: "+", icon: Building2, color: "text-primary" },
  { label: "Offerings", value: 1280, suffix: "+", icon: Layers, color: "text-blue-500" },
  { label: "Indices", value: 48, suffix: "", icon: BarChart3, color: "text-amber-500" },
  { label: "Documents", value: 5600, suffix: "+", icon: FileText, color: "text-purple-500" },
];

/* ─── Features data ──────────────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: Network,
    title: "Graph Relationship Engine",
    description: "Visualize complex relationships between issuers, offerings, investors, and markets through an interactive Neo4j-powered graph.",
    color: "bg-primary/10 text-primary",
    badge: "Core",
  },
  {
    icon: ShieldCheck,
    title: "EU Taxonomy Compliance",
    description: "Every offering is mapped against EU Taxonomy and ESG classification frameworks, ensuring full regulatory alignment.",
    color: "bg-blue-500/10 text-blue-600",
    badge: "Compliance",
  },
  {
    icon: TrendingUp,
    title: "Real-time Market Data",
    description: "Live indices, price feeds, and performance metrics across all asset classes and regions with millisecond precision.",
    color: "bg-amber-500/10 text-amber-600",
    badge: "Live",
  },
  {
    icon: Globe2,
    title: "Global Coverage",
    description: "Access issuers and opportunities across Europe, Asia-Pacific, Americas, Africa, and the Middle East in one unified platform.",
    color: "bg-purple-500/10 text-purple-600",
    badge: "Global",
  },
  {
    icon: Leaf,
    title: "Regenerative Finance",
    description: "Purpose-built for impact investing — connecting capital to projects that restore ecosystems, communities, and economies.",
    color: "bg-green-500/10 text-green-600",
    badge: "Impact",
  },
  {
    icon: Zap,
    title: "WBX Exchange Integration",
    description: "Seamless access to the Worldbridgers Exchange for direct listing, trading, and settlement of regenerative instruments.",
    color: "bg-rose-500/10 text-rose-600",
    badge: "Exchange",
  },
];

/* ─── How it works ───────────────────────────────────────────────────────────── */
const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Discover Opportunities",
    description: "Browse curated ESG-aligned issuers and offerings filtered by region, classification, and impact category.",
  },
  {
    step: "02",
    title: "Analyse Relationships",
    description: "Explore the interconnected graph of entities — understand how issuers, investors, and markets are linked.",
  },
  {
    step: "03",
    title: "Verify Compliance",
    description: "Review EU Taxonomy classifications, WBX labels, and full document trails for every instrument.",
  },
  {
    step: "04",
    title: "Connect & Transact",
    description: "Engage directly through the WBX Exchange or connect with our specialist team to structure your investment.",
  },
];

/* ─── Graph preview nodes (decorative) ──────────────────────────────────────── */
const PREVIEW_NODES = [
  { label: "Green Bond Issuer", x: 50, y: 50, color: "#4ade80", size: 14 },
  { label: "ESG Fund", x: 75, y: 30, color: "#60a5fa", size: 10 },
  { label: "Carbon Credit", x: 25, y: 30, color: "#fbbf24", size: 10 },
  { label: "Infrastructure", x: 80, y: 65, color: "#a78bfa", size: 9 },
  { label: "Renewable Energy", x: 20, y: 68, color: "#4ade80", size: 9 },
  { label: "Social Bond", x: 55, y: 78, color: "#60a5fa", size: 8 },
];

export default function Home() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-hero-gradient">
        <HeroCanvas />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/20 pointer-events-none" />

        <div className="container relative z-10 pt-24 pb-20">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs font-medium mb-6 animate-fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Regenerative Finance Platform — Now Live
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.05] mb-6 animate-fade-in-up">
              Connecting Capital to{" "}
              <span className="text-transparent bg-clip-text" style={{
                backgroundImage: "linear-gradient(135deg, #4ade80, #60a5fa)"
              }}>
                Regenerative Impact
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/70 leading-relaxed mb-10 max-w-2xl animate-fade-in-up delay-200">
              Worldbridgers Regenify bridges ethical capital with verified ESG opportunities.
              Discover issuers, explore offerings, and navigate the regenerative economy through
              real-time data and intelligent relationship mapping.
            </p>

            <div className="flex flex-wrap gap-4 animate-fade-in-up delay-300">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 shadow-brand group"
                onClick={() => navigate("/login")}
              >
                Explore Platform
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 font-semibold px-8 bg-transparent"
                onClick={() => navigate("/login")}
              >
                Request Access
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-6 mt-12 animate-fade-in-up delay-400">
              {[
                { label: "EU Taxonomy Aligned" },
                { label: "ISO 14001 Certified" },
                { label: "SFDR Compliant" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-white/60 text-sm">
                  <ShieldCheck className="w-4 h-4 text-green-400" />
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40 text-xs animate-bounce">
          <span>Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/40 to-transparent" />
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white border-y border-border">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="text-center group">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-muted mb-4 group-hover:scale-110 transition-transform ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-4xl font-bold text-foreground mb-1">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-background">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
              Platform Capabilities
            </div>
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Everything you need for{" "}
              <span className="gradient-text">intelligent ESG investing</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              A unified platform combining real-time data, relationship intelligence, and compliance tools for the regenerative economy.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="group relative bg-card rounded-2xl p-6 border border-border shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${f.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {f.badge}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                  <div className="mt-4 flex items-center gap-1 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Learn more <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── GRAPH PREVIEW ────────────────────────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "linear-gradient(rgba(100,200,160,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(100,200,160,0.3) 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }} />

        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold mb-6">
                <Network className="w-3.5 h-3.5" /> Relationship Intelligence
              </div>
              <h2 className="text-4xl font-bold text-white mb-6">
                See the full picture with{" "}
                <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #4ade80, #60a5fa)" }}>
                  graph intelligence
                </span>
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-8">
                Our Neo4j-powered graph engine maps every relationship between issuers, investors,
                opportunities, and markets — revealing hidden connections and investment pathways
                invisible to traditional data tools.
              </p>
              <div className="space-y-4 mb-8">
                {[
                  "Interactive node-edge visualization",
                  "Click-to-explore entity details",
                  "Filter by type, region, or category",
                  "Real-time relationship updates",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    </div>
                    {item}
                  </div>
                ))}
              </div>
              <Button
                className="bg-green-500 hover:bg-green-400 text-slate-900 font-semibold"
                onClick={() => navigate("/login")}
              >
                Explore Graph View
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>

            {/* Graph preview visualization */}
            <div className="relative">
              <div className="aspect-square max-w-md mx-auto relative">
                <div className="absolute inset-0 rounded-3xl bg-slate-800/80 border border-slate-700/50 backdrop-blur-sm overflow-hidden">
                  <svg viewBox="0 0 400 400" className="w-full h-full">
                    {/* Edges */}
                    {[
                      [200, 200, 300, 120],
                      [200, 200, 100, 120],
                      [200, 200, 320, 260],
                      [200, 200, 80, 270],
                      [200, 200, 220, 310],
                      [300, 120, 320, 260],
                      [100, 120, 80, 270],
                    ].map(([x1, y1, x2, y2], i) => (
                      <line
                        key={i}
                        x1={x1} y1={y1} x2={x2} y2={y2}
                        stroke="rgba(100,200,160,0.25)"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                      />
                    ))}
                    {/* Nodes */}
                    {PREVIEW_NODES.map((n, i) => (
                      <g key={i}>
                        <circle
                          cx={n.x * 4}
                          cy={n.y * 4}
                          r={n.size + 6}
                          fill={n.color}
                          opacity={0.12}
                        />
                        <circle
                          cx={n.x * 4}
                          cy={n.y * 4}
                          r={n.size}
                          fill={n.color}
                          opacity={0.9}
                        />
                        <text
                          x={n.x * 4}
                          y={n.y * 4 + n.size + 14}
                          textAnchor="middle"
                          fill="rgba(255,255,255,0.6)"
                          fontSize="9"
                          fontFamily="Inter, sans-serif"
                        >
                          {n.label}
                        </text>
                      </g>
                    ))}
                    {/* Center node */}
                    <circle cx={200} cy={200} r={22} fill="rgba(74,222,128,0.15)" />
                    <circle cx={200} cy={200} r={14} fill="#4ade80" opacity={0.9} />
                    <text x={200} y={230} textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="10" fontFamily="Inter, sans-serif">
                      Central Hub
                    </text>
                  </svg>
                </div>

                {/* Legend */}
                <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2 justify-center">
                  {[
                    { color: "#4ade80", label: "Issuers" },
                    { color: "#60a5fa", label: "Investors" },
                    { color: "#fbbf24", label: "Opportunities" },
                    { color: "#a78bfa", label: "Markets" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 text-xs font-semibold mb-4">
              How It Works
            </div>
            <h2 className="text-4xl font-bold text-foreground mb-4">
              From discovery to{" "}
              <span className="gradient-text">deployment</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              A structured workflow designed for institutional investors, family offices, and impact-first allocators.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} className="relative">
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-[calc(100%-16px)] w-8 h-px bg-border z-10" />
                )}
                <div className="text-5xl font-bold text-primary/15 mb-4 font-mono">{step.step}</div>
                <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-br from-primary/5 via-blue-500/5 to-amber-500/5 border-y border-border">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Leaf className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Ready to invest in the{" "}
              <span className="gradient-text">regenerative future</span>?
            </h2>
            <p className="text-muted-foreground text-lg mb-10">
              Join institutional investors, family offices, and impact allocators already using Worldbridgers Regenify to discover, analyse, and deploy capital into verified ESG opportunities.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white font-semibold px-10 shadow-brand"
                onClick={() => navigate("/login")}
              >
                Get Started Today
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="font-semibold px-10"
                onClick={() => navigate("/login")}
              >
                Schedule a Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer className="bg-slate-900 text-slate-400 py-16">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-white font-bold text-sm">Worldbridgers</div>
                  <div className="text-primary text-[10px] font-semibold tracking-widest uppercase">Regenify</div>
                </div>
              </div>
              <p className="text-sm leading-relaxed mb-6">
                Connecting capital to regenerative impact through intelligent ESG data, relationship mapping, and verified investment opportunities.
              </p>
              <div className="flex gap-3">
                {[Twitter, Linkedin, Github, Mail].map((Icon, i) => (
                  <button key={i} className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors">
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>

            {/* Links */}
            {[
              {
                title: "Platform",
                links: ["Issuers", "Offerings", "Indices", "Documents", "Graph View"],
              },
              {
                title: "Company",
                links: ["About Us", "Our Specialists", "Careers", "Press", "Contact"],
              },
              {
                title: "Legal",
                links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "Disclosures"],
              },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="text-white font-semibold text-sm mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link, j) => (
                    <li key={j}>
                      <button
                        className="text-sm hover:text-white transition-colors"
                        onClick={() => navigate("/login")}
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            <p>© 2026 Worldbridgers Regenify. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
              <span>EU Taxonomy Aligned · SFDR Compliant · ISO 14001</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
