import { useEffect } from "react";
import PublicHeader from "@/components/PublicHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  FileText,
  BarChart3,
  Network,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { useLocation } from "wouter";

const FEATURES = [
  {
    title: "Verified Issuers",
    icon: Building2,
    description: "Access verified issuer profiles and sustainability credentials.",
    color: "text-emerald-600",
  },
  {
    title: "Live Offerings",
    icon: Layers,
    description: "Review active opportunities with compliance and performance data.",
    color: "text-blue-600",
  },
  {
    title: "Sustainable Indices",
    icon: BarChart3,
    description: "Monitor curated ESG benchmarks and market themes.",
    color: "text-amber-600",
  },
  {
    title: "Structured Documents",
    icon: FileText,
    description: "Browse standardized investment documentation and disclosures.",
    color: "text-teal-600",
  },
  {
    title: "Graph View",
    icon: Network,
    description: "Visualize relationships across issuers, offerings, and markets.",
    color: "text-violet-600",
  },
];

export default function LearnMore() {
  const [, navigate] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader lightBackground />

      <section className="border-b border-border bg-gradient-to-br from-slate-50 to-slate-100 py-24">
        <div className="container">
          <Badge variant="secondary" className="bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary hover:bg-primary/10">
            Platform Overview
          </Badge>
          <h1 className="mt-6 text-4xl font-bold text-foreground md:text-5xl">
            Regenify platform capabilities
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            A streamlined platform for ESG and regenerative finance, bringing verified data, live opportunities, index analytics, structured documentation, and relationship intelligence together in one place.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-[20px] border border-border bg-card p-8 shadow-card"
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 ${feature.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-muted/30 py-16">
        <div className="container text-center">
          <h2 className="text-3xl font-bold text-foreground">
            Why Regenify?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A unified experience that makes ESG discovery, compliance, and relationship intelligence accessible for capital allocators and impact investors.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {[
              "Verified issuer data for trusted decision-making.",
              "Live opportunity feeds with regulatory context.",
              "Curated indices for benchmark comparison.",
              "Graph intelligence to reveal hidden relationships.",
            ].map((item) => (
              <div key={item} className="rounded-[18px] border border-border bg-card p-6 text-sm text-muted-foreground">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
