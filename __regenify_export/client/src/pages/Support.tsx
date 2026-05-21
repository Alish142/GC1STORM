import { useEffect } from "react";
import PublicHeader from "@/components/PublicHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HelpCircle, MessageCircle, ShieldCheck } from "lucide-react";
import { useLocation } from "wouter";

const SUPPORT_FEATURES = [
  {
    title: "Customer Guidance",
    description: "Practical help for onboarding, setup, and using Regenify’s core functionality.",
    icon: MessageCircle,
  },
  {
    title: "Platform Resources",
    description: "Clear documentation, quick-start guidance, and operational best practices.",
    icon: HelpCircle,
  },
  {
    title: "Governance Support",
    description: "Security, compliance, and account protection guidance for enterprise users.",
    icon: ShieldCheck,
  },
];

export default function Support() {
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
            Support
          </Badge>
          <h1 className="mt-6 text-4xl font-bold text-foreground md:text-5xl">
            Regenify support made simple
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Get expert guidance for setup, platform use, and regulatory best practices. Our team is here to help you move forward with confidence.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button
              className="h-12 rounded-xl bg-primary px-6 text-base font-semibold text-white shadow-brand hover:bg-primary/90"
              onClick={() => navigate("/login")}
            >
              Open support portal
            </Button>
            <Button
              variant="outline"
              className="h-12 rounded-xl border-white/20 bg-white/5 px-6 text-base font-semibold text-white hover:bg-white/10"
              onClick={() => navigate("/")}
            >
              Back to home
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container grid gap-8 md:grid-cols-3">
          {SUPPORT_FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="rounded-[20px] border border-border bg-card p-8 shadow-card">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="mt-5 text-2xl font-semibold text-foreground">{feature.title}</h2>
                <p className="mt-3 text-sm text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="border-t border-border bg-muted/30 py-16">
        <div className="container text-center">
          <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">Need help now?</p>
          <h2 className="mt-4 text-3xl font-bold text-foreground">Email support@regenify.example</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Our customer support team responds to requests quickly and provides practical, professional assistance for business users.
          </p>
        </div>
      </section>
    </div>
  );
}
