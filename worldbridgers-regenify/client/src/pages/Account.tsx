import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardHeader from "@/components/DashboardHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bell,
  CheckCircle2,
  CreditCard,
  HelpCircle,
  Leaf,
  Mail,
  Settings,
  ShieldCheck,
  User,
  Wallet,
} from "lucide-react";

type AccountView = "profile" | "portfolio" | "settings" | "support";

const ACCOUNT_TABS: {
  key: AccountView;
  label: string;
  icon: React.ElementType;
  description: string;
}[] = [
  {
    key: "profile",
    label: "Profile",
    icon: User,
    description: "Core account details and platform identity.",
  },
  {
    key: "portfolio",
    label: "My WBX Portfolio",
    icon: Wallet,
    description: "A quick summary of your regenerative finance workspace.",
  },
  {
    key: "settings",
    label: "Settings",
    icon: Settings,
    description: "Preferences for notifications, security, and access.",
  },
  {
    key: "support",
    label: "Support",
    icon: HelpCircle,
    description: "Help channels and onboarding assistance.",
  },
];

function getView(search: string): AccountView {
  const params = new URLSearchParams(search);
  const raw = params.get("view");
  if (raw === "portfolio" || raw === "settings" || raw === "support") {
    return raw;
  }
  return "profile";
}

export default function Account() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const [view, setView] = useState<AccountView>(() =>
    getView(typeof window !== "undefined" ? window.location.search : "")
  );
  const activeTab = ACCOUNT_TABS.find((tab) => tab.key === view) ?? ACCOUNT_TABS[0];

  useEffect(() => {
    if (typeof window === "undefined") return;
    setView(getView(window.location.search));
  }, [location]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const syncView = () => setView(getView(window.location.search));
    window.addEventListener("popstate", syncView);
    return () => window.removeEventListener("popstate", syncView);
  }, []);

  const openView = (nextView: AccountView) => {
    setView(nextView);
    if (typeof window !== "undefined") {
      window.history.pushState({}, "", `/dashboard/account?view=${nextView}`);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardHeader />

      <main className="container flex-1 py-6">
        <section className="overflow-hidden rounded-[28px] border border-border bg-card shadow-card">
          <div className="relative overflow-hidden border-b border-border bg-hero-gradient px-6 py-8 text-white md:px-8">
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage:
                "radial-gradient(circle at top left, rgba(255,255,255,0.25), transparent 32%), radial-gradient(circle at bottom right, rgba(74,222,128,0.22), transparent 36%)",
            }} />
            <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-white/75">
                  <Leaf className="h-3.5 w-3.5" />
                  Account Center
                </div>
                <h1 className="text-3xl font-semibold tracking-tight">
                  {user?.name || "Demo User"}
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-white/75">
                  {activeTab.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm md:min-w-[320px]">
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <div className="text-white/60">Role</div>
                  <div className="mt-1 font-semibold capitalize">{user?.role || "user"}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <div className="text-white/60">Status</div>
                  <div className="mt-1 flex items-center gap-2 font-semibold">
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    Active
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-b border-border bg-background/70 px-4 py-3 md:px-6">
            <div className="flex gap-2 overflow-x-auto">
              {ACCOUNT_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = tab.key === view;
                return (
                  <button
                    key={tab.key}
                    onClick={() => openView(tab.key)}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-white shadow-brand"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-6 p-4 md:grid-cols-[1.35fr_0.9fr] md:p-6">
            <section className="space-y-6">
              {view === "profile" && (
                <>
                  <div className="rounded-3xl border border-border bg-muted/30 p-6">
                    <h2 className="text-lg font-semibold">Profile details</h2>
                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl border border-border bg-card p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Full name</p>
                        <p className="mt-2 text-sm font-medium">{user?.name || "Demo User"}</p>
                      </div>
                      <div className="rounded-2xl border border-border bg-card p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Email</p>
                        <p className="mt-2 text-sm font-medium">{user?.email || "demo@regenify.com"}</p>
                      </div>
                      <div className="rounded-2xl border border-border bg-card p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Workspace</p>
                        <p className="mt-2 text-sm font-medium">Worldbridgers Regenify</p>
                      </div>
                      <div className="rounded-2xl border border-border bg-card p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Permissions</p>
                        <p className="mt-2 text-sm font-medium">Dashboard, graph, documents</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-3xl border border-border bg-card p-6">
                    <h2 className="text-lg font-semibold">Verification and compliance</h2>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
                        <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                        Demo identity verified
                      </Badge>
                      <Badge className="bg-blue-500/10 text-blue-700 hover:bg-blue-500/10">
                        Taxonomy aligned access
                      </Badge>
                      <Badge className="bg-amber-500/10 text-amber-700 hover:bg-amber-500/10">
                        Onboarding complete
                      </Badge>
                    </div>
                  </div>
                </>
              )}

              {view === "portfolio" && (
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    { label: "Tracked Issuers", value: "18", icon: User },
                    { label: "Open Offerings", value: "42", icon: CreditCard },
                    { label: "Saved Indices", value: "12", icon: Wallet },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="rounded-3xl border border-border bg-card p-6 shadow-card">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        <p className="mt-4 text-3xl font-semibold">{item.value}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
                      </div>
                    );
                  })}
                </div>
              )}

              {view === "settings" && (
                <div className="space-y-4">
                  {[
                    ["Notifications", "Market alerts, index updates, and document availability."],
                    ["Security", "Session protection and verified access enforcement."],
                    ["Workspace preferences", "Saved filters, table settings, and graph defaults."],
                  ].map(([title, description]) => (
                    <div key={title} className="rounded-3xl border border-border bg-card p-6">
                      <h2 className="text-lg font-semibold">{title}</h2>
                      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
                    </div>
                  ))}
                </div>
              )}

              {view === "support" && (
                <div className="space-y-4">
                  {[
                    {
                      title: "Product support",
                      description: "Questions about access, data quality, or onboarding.",
                      action: "Email support",
                    },
                    {
                      title: "Specialist desk",
                      description: "Talk with the team about structuring offerings or impact workflows.",
                      action: "Request call",
                    },
                  ].map((item) => (
                    <div key={item.title} className="rounded-3xl border border-border bg-card p-6">
                      <h2 className="text-lg font-semibold">{item.title}</h2>
                      <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                      <Button className="mt-4 bg-primary text-white hover:bg-primary/90">
                        {item.action}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <aside className="space-y-4">
              <div className="rounded-3xl border border-border bg-card p-6">
                <h2 className="text-lg font-semibold">Quick actions</h2>
                <div className="mt-4 space-y-3">
                  <Button className="w-full justify-start bg-primary text-white hover:bg-primary/90" onClick={() => navigate("/dashboard/graph")}>
                    <Leaf className="h-4 w-4" />
                    Open relationship graph
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/dashboard/documents")}>
                    <Mail className="h-4 w-4" />
                    Review documents
                  </Button>
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-muted/30 p-6">
                <h2 className="text-lg font-semibold">Workspace health</h2>
                <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between rounded-2xl bg-card px-4 py-3">
                    <span className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-primary" />
                      Alerts
                    </span>
                    <span className="font-medium text-foreground">3 active</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-card px-4 py-3">
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      Security
                    </span>
                    <span className="font-medium text-foreground">Healthy</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}
