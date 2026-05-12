import PublicHeader from "@/components/PublicHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Globe2, Network, User } from "lucide-react";
import { useLocation } from "wouter";

const ABOUT_SECTIONS = [
  {
    title: "Vision",
    icon: Globe2,
    description:
      "Worldbridgers Regenify is building a clearer pathway between capital and regenerative outcomes, helping markets discover opportunities that support ecosystems, communities, and long-term resilience.",
    bullets: [
      "Make regenerative finance easier to understand and access",
      "Connect market participants through trusted public information",
      "Create a stronger bridge between discovery, compliance, and impact",
    ],
  },
  {
    title: "Team Members",
    icon: User,
    description:
      "Our team brings together platform strategy, onboarding, relationship building, and sustainable finance thinking to support a more connected and transparent market experience.",
    bullets: [
      "Guides platform onboarding and stakeholder support",
      "Shapes the product experience around clarity and trust",
      "Supports partnerships across finance, data, and impact themes",
    ],
  },
  {
    title: "Themes",
    icon: Network,
    description:
      "The platform is organized around regenerative and ESG themes that help visitors understand how offerings, issuers, and market intelligence connect across the wider ecosystem.",
    bullets: [
      "Regenerative finance and transition opportunities",
      "ESG and taxonomy-aligned market context",
      "Cross-market relationship intelligence and thematic discovery",
    ],
  },
];

export default function AboutPage() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader lightBackground />

      <section className="relative overflow-hidden border-b border-border bg-[radial-gradient(circle_at_top_right,rgba(74,222,128,0.12),transparent_28%),linear-gradient(135deg,#08151b_0%,#0f252c_52%,#173640_100%)] pt-32 text-white">
        <div className="container relative z-10 py-20">
          <div className="max-w-[760px]">
            <Badge className="border-0 bg-primary/15 text-primary">About Us</Badge>
            <h1 className="mt-6 text-4xl font-bold leading-tight md:text-6xl">
              The vision, people, and themes behind Regenify.
            </h1>
            <p className="mt-6 max-w-[680px] text-lg leading-8 text-white/78">
              Explore the public story behind Worldbridgers Regenify, including the long-term vision, the team focus,
              and the core themes that shape the platform.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button
                className="h-12 rounded-xl bg-primary px-6 text-base font-semibold text-white shadow-brand hover:bg-primary/90"
                onClick={() => navigate("/login?mode=request-access")}
              >
                Request Access
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-12 rounded-xl border-white/20 bg-white/5 px-6 text-base font-semibold text-white hover:bg-white/10"
                onClick={() => navigate("/")}
              >
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container grid gap-6 lg:grid-cols-3">
          {ABOUT_SECTIONS.map((section) => {
            const Icon = section.icon;

            return (
              <article key={section.title} className="rounded-[28px] border border-border bg-card p-8 shadow-card">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="mt-6 text-2xl font-semibold text-foreground">{section.title}</h2>
                <p className="mt-4 text-[1rem] leading-8 text-muted-foreground">{section.description}</p>
                <div className="mt-6 space-y-3">
                  {section.bullets.map((bullet) => (
                    <div
                      key={bullet}
                      className="rounded-2xl border border-border bg-muted/30 px-4 py-4 text-sm leading-7 text-muted-foreground"
                    >
                      {bullet}
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
