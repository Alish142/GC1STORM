import PublicHeader from "@/components/PublicHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Globe2, Leaf, Network, ShieldCheck, TrendingUp, Zap, type LucideIcon } from "lucide-react";
import { useLocation } from "wouter";
import NotFound from "./NotFound";

type FeaturePageData = {
  slug: string;
  title: string;
  badge: string;
  color: string;
  icon: LucideIcon;
  description: string;
  heroTitle: string;
  heroDescription: string;
  bullets: string[];
};

const FEATURE_PAGES: FeaturePageData[] = [
  {
    slug: "graph-relationship-engine",
    title: "Graph Relationship Engine",
    badge: "Core",
    color: "bg-primary/10 text-primary",
    icon: Network,
    description: "Visualize complex relationships between issuers, offerings, investors, and markets through an interactive intelligence layer.",
    heroTitle: "Understand how entities, themes, and markets connect.",
    heroDescription: "Worldbridgers Regenify uses relationship intelligence to help users explore how issuers, offerings, investors, and regions are linked across the regenerative economy.",
    bullets: [
      "Interactive relationship mapping across entities and themes",
      "Discovery of hidden links that static tables can miss",
      "Clearer context before moving into deeper platform workflows",
    ],
  },
  {
    slug: "eu-taxonomy-compliance",
    title: "EU Taxonomy Compliance",
    badge: "Compliance",
    color: "bg-blue-500/10 text-blue-600",
    icon: ShieldCheck,
    description: "Every offering is mapped against EU Taxonomy and ESG classification frameworks, ensuring full regulatory alignment.",
    heroTitle: "Compliance context built into the platform story.",
    heroDescription: "This page gives public visitors a clear view of how classification, trust signals, and regulatory framing support sustainable finance participation.",
    bullets: [
      "Alignment with EU Taxonomy and ESG frameworks",
      "Document-backed trust and transparency cues",
      "Public explanation before users enter secure workflows",
    ],
  },
  {
    slug: "real-time-market-data",
    title: "Real-time Market Data",
    badge: "Live",
    color: "bg-amber-500/10 text-amber-600",
    icon: TrendingUp,
    description: "Live indices, price feeds, and performance metrics across asset classes and regions with mission-focused precision.",
    heroTitle: "Live market intelligence for regenerative finance.",
    heroDescription: "Public visitors can understand how the platform turns live sustainable market data into actionable context for investors, issuers, and partners.",
    bullets: [
      "Live benchmark and pricing visibility",
      "Market signals across sectors and regions",
      "Faster understanding of active opportunity conditions",
    ],
  },
  {
    slug: "global-coverage",
    title: "Global Coverage",
    badge: "Global",
    color: "bg-violet-500/10 text-violet-600",
    icon: Globe2,
    description: "Access issuers and opportunities across Europe, Asia-Pacific, Americas, Africa, and the Middle East in one unified platform.",
    heroTitle: "A broader view across global regenerative markets.",
    heroDescription: "The platform connects regional activity into one public-facing story, helping visitors understand its international reach before signing in.",
    bullets: [
      "Coverage across Europe, APAC, the Americas, Africa, and the Middle East",
      "One unified experience for cross-border discovery",
      "Regional context that supports comparison and exploration",
    ],
  },
  {
    slug: "regenerative-finance",
    title: "Regenerative Finance",
    badge: "Impact",
    color: "bg-emerald-500/10 text-emerald-600",
    icon: Leaf,
    description: "Purpose-built for impact investing by connecting capital to projects that restore ecosystems, communities, and economies.",
    heroTitle: "Capital aligned with restorative long-term outcomes.",
    heroDescription: "This page explains how Worldbridgers Regenify is designed for investors and partners seeking measurable regenerative impact, not just financial activity alone.",
    bullets: [
      "Focus on projects that restore ecosystems and communities",
      "Mission-led framing for impact-oriented capital",
      "A clearer public explanation of the platform purpose",
    ],
  },
  {
    slug: "wbx-exchange-integration",
    title: "WBX Exchange Integration",
    badge: "Exchange",
    color: "bg-rose-500/10 text-rose-600",
    icon: Zap,
    description: "Seamless access to the Worldbridgers Exchange for direct listing, trading, and settlement of regenerative instruments.",
    heroTitle: "Exchange connectivity as part of the wider ecosystem.",
    heroDescription: "Visitors can see how exchange access fits into the broader Worldbridgers journey, from discovery and structuring through listing and participation.",
    bullets: [
      "Direct listing and exchange workflow context",
      "A public explanation of WBX ecosystem connectivity",
      "Clearer bridge from discovery to exchange participation",
    ],
  },
];

const FEATURE_BY_SLUG = Object.fromEntries(FEATURE_PAGES.map((feature) => [feature.slug, feature])) as Record<string, FeaturePageData>;

type PlatformFeaturePageProps = {
  params?: {
    slug?: string;
  };
};

export default function PlatformFeaturePage({ params }: PlatformFeaturePageProps) {
  const [, navigate] = useLocation();
  const feature = params?.slug ? FEATURE_BY_SLUG[params.slug] : undefined;

  if (!feature) {
    return <NotFound />;
  }

  const Icon = feature.icon;

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader lightBackground />

      <section className="relative overflow-hidden border-b border-border bg-[radial-gradient(circle_at_top_right,rgba(74,222,128,0.12),transparent_28%),linear-gradient(135deg,#08151b_0%,#0f252c_52%,#173640_100%)] pt-32 text-white">
        <div className="container relative z-10 py-20">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="max-w-[720px]">
              <Badge className={`${feature.color} border-0`}>{feature.badge}</Badge>
              <h1 className="mt-6 text-4xl font-bold leading-tight md:text-6xl">{feature.heroTitle}</h1>
              <p className="mt-6 max-w-[640px] text-lg leading-8 text-white/74">{feature.heroDescription}</p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Button className="h-12 rounded-xl bg-primary px-6 text-base font-semibold text-white shadow-brand hover:bg-primary/90" onClick={() => navigate("/login?mode=request-access")}>
                  Request Access
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="h-12 rounded-xl border-white/20 bg-white/5 px-6 text-base font-semibold text-white hover:bg-white/10" onClick={() => navigate("/")}>
                  Back to Home
                </Button>
              </div>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-white/8 p-6 backdrop-blur-md">
              <div className="rounded-[26px] border border-white/10 bg-white/95 p-8 text-slate-900 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${feature.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="mt-6 text-2xl font-semibold">{feature.title}</h2>
                <p className="mt-4 text-[1rem] leading-7 text-slate-600">{feature.description}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[28px] border border-border bg-card p-8 shadow-card">
            <h2 className="text-2xl font-semibold text-foreground">Overview</h2>
            <p className="mt-5 text-[1rem] leading-8 text-muted-foreground">{feature.description}</p>
          </div>

          <div className="rounded-[28px] border border-border bg-card p-8 shadow-card">
            <h2 className="text-2xl font-semibold text-foreground">Highlights</h2>
            <div className="mt-6 space-y-4">
              {feature.bullets.map((bullet) => (
                <div key={bullet} className="rounded-2xl border border-border bg-muted/30 px-4 py-4 text-sm leading-7 text-muted-foreground">
                  {bullet}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
