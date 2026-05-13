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
  heroTitleAccent?: string;
  heroDescription: string;
  bullets: string[];
  detailBlocks: { title: string; copy: string }[];
  audienceColumns: { title: string; points: string[] }[];
  image?: string;
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
    heroTitleAccent: "connect",
    heroDescription: "Worldbridgers Regenify uses relationship intelligence to help users explore how issuers, offerings, investors, and regions are linked across the regenerative economy.",
    bullets: [
      "Interactive relationship mapping across entities and themes",
      "Discovery of hidden links that static tables can miss",
      "Clearer context before moving into deeper platform workflows",
    ],
    detailBlocks: [
      { title: "Why it matters", copy: "Relationship intelligence lets users move beyond isolated tables and see how issuers, themes, opportunities, and markets influence one another." },
      { title: "What users gain", copy: "A clearer decision path, better context before opening supporting data, and faster discovery of clusters that matter to sustainable finance." },
      { title: "Where it appears", copy: "This capability connects to public discover flow, the logged-in graph page, and issuer/offering context shown across the dashboard." },
    ],
    audienceColumns: [
      {
        title: "For issuers",
        points: [
          "Show how offerings, disclosures, and identity signals connect in one view",
          "Create clearer storytelling for sustainability-related records",
          "Help market participants understand context beyond a single listing",
        ],
      },
      {
        title: "For investors",
        points: [
          "Follow linked themes, entities, and related market signals",
          "Discover hidden relationships before moving into detailed review",
          "Use graph context to compare opportunities with more confidence",
        ],
      },
    ],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
  },
  {
    slug: "eu-taxonomy-compliance",
    title: "EU Taxonomy Compliance",
    badge: "Compliance",
    color: "bg-blue-500/10 text-blue-600",
    icon: ShieldCheck,
    description: "Every offering is mapped against EU Taxonomy and ESG classification frameworks, ensuring full regulatory alignment.",
    heroTitle: "Compliance context built into the platform story.",
    heroTitleAccent: "Compliance",
    heroDescription: "This page gives public visitors a clear view of how classification, trust signals, and regulatory framing support sustainable finance participation.",
    bullets: [
      "Alignment with EU Taxonomy and ESG frameworks",
      "Document-backed trust and transparency cues",
      "Public explanation before users enter secure workflows",
    ],
    detailBlocks: [
      { title: "Why it matters", copy: "Compliance context increases trust and reduces ambiguity for users reviewing sustainability-related products and issuers." },
      { title: "What users gain", copy: "Visitors and registered users can immediately understand whether records align with recognised classification systems." },
      { title: "Where it appears", copy: "This supports the public landing story as well as the issuer, offerings, and documents views in the authenticated workspace." },
    ],
    audienceColumns: [
      {
        title: "For issuers",
        points: [
          "Communicate alignment with recognised sustainability frameworks",
          "Reduce confusion around labelling and eligibility expectations",
          "Support more transparent public-facing disclosure journeys",
        ],
      },
      {
        title: "For investors",
        points: [
          "Review taxonomy and ESG context before entering deeper analysis",
          "Compare records with clearer regulatory framing",
          "Build trust through visible compliance-related presentation",
        ],
      },
    ],
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80",
  },
  {
    slug: "real-time-market-data",
    title: "Real-time Market Data",
    badge: "Live",
    color: "bg-amber-500/10 text-amber-600",
    icon: TrendingUp,
    description: "Live indices, price feeds, and performance metrics across asset classes and regions with mission-focused precision.",
    heroTitle: "Live market intelligence for regenerative finance.",
    heroTitleAccent: "Live market intelligence",
    heroDescription: "Public visitors can understand how platform turns live sustainable market data into actionable context for investors, issuers, and partners.",
    bullets: [
      "Live benchmark and pricing visibility",
      "Market signals across sectors and regions",
      "Faster understanding of active opportunity conditions",
    ],
    detailBlocks: [
      { title: "Why it matters", copy: "Market snapshots create a stronger sense of movement and let users understand which signals are rising or declining." },
      { title: "What users gain", copy: "Users can compare trends, review changes, and move from public-facing index storytelling into the detailed indices dashboard." },
      { title: "Where it appears", copy: "This capability is reflected in the landing-page chart panel and dedicated indices page used after sign-in." },
    ],
    audienceColumns: [
      {
        title: "For issuers",
        points: [
          "Understand the market context surrounding listed instruments",
          "Track how benchmarks and performance signals shape visibility",
          "Support better preparation before investor conversations",
        ],
      },
      {
        title: "For investors",
        points: [
          "Review index movement and comparative market direction quickly",
          "Move from high-level trend reading into detailed index tables",
          "Use live-style context to spot changes across sectors and regions",
        ],
      },
    ],
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80",
  },
  {
    slug: "global-coverage",
    title: "Global Coverage",
    badge: "Global",
    color: "bg-violet-500/10 text-violet-600",
    icon: Globe2,
    description: "Access issuers and opportunities across Europe, Asia-Pacific, Americas, Africa, and the Middle East in one unified platform.",
    heroTitle: "A broader view across global regenerative markets.",
    heroTitleAccent: "global regenerative markets",
    heroDescription: "The platform connects regional activity into one public-facing story, helping visitors understand its international reach before signing in.",
    bullets: [
      "Coverage across Europe, APAC, Americas, Africa, and the Middle East",
      "One unified experience for cross-border discovery",
      "Regional context that supports comparison and exploration",
    ],
    detailBlocks: [
      { title: "Why it matters", copy: "Coverage across multiple regions helps users understand breadth of available sustainable and regenerative market activity." },
      { title: "What users gain", copy: "A better ability to compare regions, identify cross-border patterns, and navigate opportunities without losing context." },
      { title: "Where it appears", copy: "Regional coverage supports discover cards, issuer tables, graph nodes, and public-facing market explanations." },
    ],
    audienceColumns: [
      {
        title: "For issuers",
        points: [
          "Position opportunities within a wider cross-border market context",
          "Show where offerings sit in relation to regional peers",
          "Build stronger visibility across multiple market zones",
        ],
      },
      {
        title: "For investors",
        points: [
          "Compare opportunities across Europe, APAC, Americas, and beyond",
          "Understand region-linked signals before drilling into details",
          "Use one consistent experience for multi-region discovery",
        ],
      },
    ],
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
  },
  {
    slug: "regenerative-finance",
    title: "Regenerative Finance",
    badge: "Impact",
    color: "bg-emerald-500/10 text-emerald-600",
    icon: Leaf,
    description: "Purpose-built for impact investing by connecting capital to projects that restore ecosystems, communities, and economies.",
    heroTitle: "Capital aligned with restorative long-term outcomes.",
    heroTitleAccent: "restorative long-term outcomes",
    heroDescription: "This page explains how Worldbridgers Regenify is designed for investors and partners seeking measurable regenerative impact, not just financial activity alone.",
    bullets: [
      "Focus on projects that restore ecosystems and communities",
      "Mission-led framing for impact-oriented capital",
      "A clearer public explanation of the platform purpose",
    ],
    detailBlocks: [
      { title: "Why it matters", copy: "Regenerative finance positions platform around long-term ecological and social outcomes rather than narrow short-term activity." },
      { title: "What users gain", copy: "Users can better understand platform's mission, its thematic priorities, and how capital is connected to restorative outcomes." },
      { title: "Where it appears", copy: "This theme underpins homepage messaging, discover content, graph exploration, and portfolio-oriented pathways." },
    ],
    audienceColumns: [
      {
        title: "For issuers",
        points: [
          "Frame projects and instruments around restorative impact outcomes",
          "Connect public visibility with a stronger sustainability narrative",
          "Show alignment between capital access and mission-led goals",
        ],
      },
      {
        title: "For investors",
        points: [
          "Understand how capital is positioned within regenerative themes",
          "Move from interest to clearer review of impact-aligned records",
          "See how long-term ecological and social outcomes are represented",
        ],
      },
    ],
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
  },
  {
    slug: "wbx-exchange-integration",
    title: "WBX Exchange Integration",
    badge: "Exchange",
    color: "bg-rose-500/10 text-rose-600",
    icon: Zap,
    description: "Seamless access to the Worldbridgers Exchange for direct listing, trading, and settlement of regenerative instruments.",
    heroTitle: "Exchange connectivity as part of the wider ecosystem.",
    heroTitleAccent: "Exchange connectivity",
    heroDescription: "Visitors can see how exchange access fits into broader Worldbridgers journey, from discovery and structuring through listing and participation.",
    bullets: [
      "Direct listing and exchange workflow context",
      "A public explanation of WBX ecosystem connectivity",
      "Clearer bridge from discovery to exchange participation",
    ],
    detailBlocks: [
      { title: "Why it matters", copy: "Exchange integration helps explain how discovery and evaluation can lead into listing, trading, and market participation." },
      { title: "What users gain", copy: "Users see a clearer end-to-end story from public discovery through structured investment access and exchange-connected workflows." },
      { title: "Where it appears", copy: "This supports offering discovery, portfolio views, and wider ecosystem narrative used across site." },
    ],
    audienceColumns: [
      {
        title: "For issuers",
        points: [
          "Understand how discovery can lead toward listing-readiness",
          "Bridge public visibility with more structured exchange workflows",
          "Support a clearer end-to-end market participation story",
        ],
      },
      {
        title: "For investors",
        points: [
          "See how platform exploration can connect to participation pathways",
          "Understand wider WBX ecosystem around listed instruments",
          "Follow a clearer route from evaluation into exchange context",
        ],
      },
    ],
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80",
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
  const accentTitle = feature.heroTitleAccent
    ? feature.heroTitle.replace(
        feature.heroTitleAccent,
        `%%ACCENT_START%%${feature.heroTitleAccent}%%ACCENT_END%%`
      )
    : feature.heroTitle;
  const heroTitleParts = accentTitle.split(/(%%ACCENT_START%%.*?%%ACCENT_END%%)/g).filter(Boolean);

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader lightBackground />

      <section className="relative overflow-hidden border-b border-border bg-[radial-gradient(circle_at_top_right,rgba(74,222,128,0.12),transparent_28%),linear-gradient(135deg,#08151b_0%,#0f252c_52%,#173640_100%)] pt-32 text-white">
        <div className="container relative z-10 py-20">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(420px,560px)] lg:items-center">
            <div className="max-w-[720px]">
              <Badge className={`${feature.color} border-0`}>{feature.badge}</Badge>
              <h1 className="mt-6 text-4xl font-bold leading-tight md:text-6xl">
                {heroTitleParts.map((part, index) =>
                  part.startsWith("%%ACCENT_START%%") ? (
                    <span key={index} className="bg-gradient-to-r from-primary via-green-300 to-sky-300 bg-clip-text text-transparent">
                      {part.replace("%%ACCENT_START%%", "").replace("%%ACCENT_END%%", "")}
                    </span>
                  ) : (
                    <span key={index}>{part}</span>
                  )
                )}
              </h1>
              <p className="mt-6 max-w-[640px] text-lg leading-8 text-white/74">{feature.heroDescription}</p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Button className="h-12 rounded-xl bg-primary px-6 text-base font-semibold text-white shadow-brand hover:bg-primary/90" onClick={() => navigate("/login?mode=create-account")}>
                  Sign Up
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="h-12 rounded-xl border-white/20 bg-white/5 px-6 text-base font-semibold text-white hover:bg-white/10" onClick={() => navigate("/")}>
                  Back to Home
                </Button>
              </div>
            </div>

            <div className="relative min-h-[560px] rounded-[38px] border border-white/10 bg-white/8 p-6 backdrop-blur-md">
              {feature.image && (
                <div className="absolute right-[7%] top-[8%] h-[320px] w-[320px] rounded-[38px] bg-cover bg-center shadow-[0_20px_55px_rgba(0,0,0,0.22)] [clip-path:polygon(25%_6%,75%_6%,96%_28%,96%_72%,75%_94%,25%_94%,4%_72%,4%_28%)]" style={{ backgroundImage: `url(${feature.image})` }} />
              )}
              <div className="absolute left-[7%] top-[50%] h-[140px] w-[140px] rounded-[24px] bg-cover bg-center shadow-[0_16px_35px_rgba(0,0,0,0.16)] [clip-path:polygon(25%_6%,75%_6%,96%_28%,96%_72%,75%_94%,25%_94%,4%_72%,4%_28%)]" style={{ backgroundImage: "url('/her0-bg-2.png')" }} />

              <div className="absolute bottom-[7%] left-[7%] right-[7%] rounded-[30px] border border-white/10 bg-white/95 p-8 text-slate-900 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${feature.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="mt-6 text-2xl font-semibold">{feature.title}</h2>
                <p className="mt-4 text-[1rem] leading-7 text-slate-600">{feature.description}</p>
                <div className="mt-8 grid gap-4 md:grid-cols-2">
                  <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-5">
                    <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Platform value</div>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      This capability helps visitors and registered users move from high-level platform discovery into
                      clearer, more structured review.
                    </p>
                  </div>
                  <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-5">
                    <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">In practice</div>
                    <div className="mt-3 space-y-2">
                      {feature.bullets.slice(0, 2).map((bullet) => (
                        <div key={bullet} className="flex gap-3 text-sm leading-6 text-slate-600">
                          <div className="mt-2 h-2 w-2 rounded-full bg-primary/70" />
                          <div>{bullet}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container">
          <div className="mx-auto max-w-[92rem] space-y-8">
            <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] xl:gap-10">
              <div className="overflow-hidden rounded-[32px] border border-border bg-card shadow-card">
                <div className="grid gap-0 lg:grid-cols-[0.88fr_1.12fr]">
                  <div className="flex flex-col justify-between border-b border-border p-8 lg:border-b-0 lg:border-r">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Platform value</div>
                      <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-foreground">What this gives the platform</h2>
                      <p className="mt-5 text-[1rem] leading-8 text-muted-foreground">{feature.description}</p>
                    </div>
                    <div className="mt-8 rounded-[24px] border border-border bg-muted/20 p-5">
                      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Regenify context</div>
                      <p className="mt-3 text-sm leading-7 text-muted-foreground">
                        Within Worldbridgers Regenify, this capability supports the wider journey from public discovery into
                        structured review, helping users understand market relevance before they act.
                      </p>
                    </div>
                  </div>

                  <div className="p-6 lg:p-8 xl:p-9">
                    <div
                      className="h-[250px] rounded-[28px] border border-border bg-cover bg-center shadow-[0_18px_40px_rgba(15,23,42,0.08)] md:h-[320px] xl:h-[340px]"
                      style={{ backgroundImage: feature.image ? `url(${feature.image})` : "url('/hero-bg-1.jpg')" }}
                    />
                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      {feature.bullets.slice(0, 2).map((bullet, index) => (
                        <div key={bullet} className="rounded-[20px] border border-border bg-slate-50 p-4">
                          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Signal 0{index + 1}</div>
                          <p className="mt-3 text-sm leading-7 text-slate-600">{bullet}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[32px] border border-border bg-card p-8 xl:p-9 shadow-card">
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Audience fit</div>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-foreground">Why it matters</h2>
                <p className="mt-4 text-[1rem] leading-8 text-muted-foreground">
                  The platform is designed to help different audiences understand the same capability in a more direct
                  way, whether they are presenting opportunities or reviewing them.
                </p>
                <div className="mt-8 grid gap-6 xl:grid-cols-2">
                  {feature.audienceColumns.map((column) => (
                    <div key={column.title} className="rounded-[26px] border border-border bg-gradient-to-br from-white to-slate-50 p-6">
                      <h3 className="text-[1.8rem] font-semibold tracking-[-0.03em] text-foreground">{column.title}</h3>
                      <div className="mt-5 space-y-4">
                        {column.points.map((point) => (
                          <div key={point} className="flex gap-3 text-[0.98rem] leading-8 text-muted-foreground">
                            <div className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-primary/70" />
                            <div>{point}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {feature.detailBlocks.map((block, index) => (
                <div key={block.title} className="rounded-[28px] border border-border bg-gradient-to-br from-white to-slate-50 p-7 shadow-card">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-500">
                      0{index + 1}
                    </div>
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{block.title}</div>
                  </div>
                  <p className="mt-5 text-[0.98rem] leading-8 text-slate-600">{block.copy}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-8 xl:grid-cols-[1.08fr_0.92fr]">
              <div className="rounded-[32px] border border-border bg-card p-8 shadow-card">
                <div className="flex items-end justify-between gap-6">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Applied value</div>
                    <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-foreground">Highlights in practice</h2>
                  </div>
                  <div className="hidden rounded-full border border-border bg-slate-50 px-4 py-2 text-xs font-medium text-slate-500 md:block">
                    Public + logged-in flow
                  </div>
                </div>
                <div className="mt-6 space-y-4">
                  {feature.bullets.map((bullet) => (
                    <div
                      key={bullet}
                      className="rounded-[22px] border border-border bg-muted/30 px-5 py-4 text-sm leading-7 text-muted-foreground"
                    >
                      {bullet}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[32px] border border-border bg-card p-8 shadow-card">
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">User journey</div>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-foreground">How it supports users</h2>
                <div className="mt-6 grid gap-4">
                  {[
                    "Creates a clearer bridge between the public website and the logged-in workspace",
                    "Makes Worldbridgers Regenify easier to understand before deeper platform interaction",
                    "Adds stronger context around issuers, offerings, indices, documents, and graph intelligence",
                  ].map((item) => (
                    <div key={item} className="rounded-[22px] border border-border bg-muted/20 px-5 py-4 text-sm leading-7 text-muted-foreground">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
