import DashboardHeader from "@/components/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link, useLocation } from "wouter";
import {
  ArrowRight,
  Palette,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Users,
} from "lucide-react";

const ADMIN_ACTIONS = [
  {
    title: "Visual Settings",
    description: "Manage table dot colors and graph connection colors with hex codes.",
    href: "/dashboard/account?view=settings",
    icon: Palette,
  },
  {
    title: "Graph Workspace",
    description: "Review how the live graph looks with the current edge palette and layout.",
    href: "/dashboard/graph",
    icon: SlidersHorizontal,
  },
  {
    title: "Protected Dashboard",
    description: "Check how issuers, offerings, indices, and documents appear to users.",
    href: "/dashboard",
    icon: Users,
  },
];

export default function Admin() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-[#f6f5f1]">
      <DashboardHeader />

      <main className="container py-6">
        <section className="overflow-hidden rounded-[32px] border border-[#e7e1d6] bg-white shadow-[0_20px_70px_rgba(25,34,22,0.08)]">
          <div className="border-b border-[#ece6dc] bg-[radial-gradient(circle_at_top_right,_rgba(73,163,95,0.18),_transparent_34%),linear-gradient(180deg,#f8f6f1_0%,#f2efe8_100%)] px-6 py-8 md:px-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#d9d3c7] bg-white/80 px-3 py-1 text-xs uppercase tracking-[0.22em] text-slate-500">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  Admin Console
                </div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
                  Manage protected platform presentation
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                  Admin users share the same authentication page, but land here after sign-in to manage visual settings and review the protected experience.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Signed in as</div>
                  <div className="mt-2 text-sm font-semibold text-slate-900">{user?.name || "Admin"}</div>
                </div>
                <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400">Role</div>
                  <div className="mt-2">
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
                      {(user?.role || "admin").toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-5 p-6 md:grid-cols-3 md:p-8">
            {ADMIN_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.title}
                  onClick={() => navigate(action.href)}
                  className="group rounded-[28px] border border-[#ebe5db] bg-[#fcfbf8] p-6 text-left shadow-[0_18px_40px_rgba(20,31,24,0.04)] transition-transform hover:-translate-y-0.5 hover:bg-white"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-5 text-xl font-semibold text-slate-900">{action.title}</h2>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{action.description}</p>
                  <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary">
                    Open
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </button>
              );
            })}
          </div>

          <div className="border-t border-[#ece6dc] px-6 py-5 md:px-8">
            <div className="flex flex-col gap-3 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-primary" />
                Admin tools stay separate from the user dashboard while reusing the same design system.
              </div>
              <Link href="/dashboard/account?view=settings" className="font-medium text-primary hover:underline">
                Go straight to visual settings
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
