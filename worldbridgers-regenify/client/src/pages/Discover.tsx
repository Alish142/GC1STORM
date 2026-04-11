import PublicHeader from "@/components/PublicHeader";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

const TOPICS = [
  {
    title: "Green Bonds",
    image: "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1200&q=80",
    overlay: "from-emerald-500/78 via-emerald-400/22 to-slate-950/92",
  },
  {
    title: "Transition Finance",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    overlay: "from-sky-500/78 via-blue-400/22 to-slate-950/92",
  },
  {
    title: "Climate Issuers",
    image: "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?auto=format&fit=crop&w=1200&q=80",
    overlay: "from-amber-400/74 via-yellow-300/22 to-slate-950/92",
  },
  {
    title: "Impact Capital",
    image: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80",
    overlay: "from-emerald-500/72 via-sky-400/18 to-slate-950/92",
  },
  {
    title: "Sustainable Indices",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    overlay: "from-sky-600/76 via-blue-400/22 to-slate-950/92",
  },
  {
    title: "Biodiversity",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80",
    overlay: "from-amber-400/70 via-emerald-300/22 to-slate-950/92",
  },
  {
    title: "Carbon Markets",
    image: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=80",
    overlay: "from-emerald-500/76 via-emerald-400/20 to-slate-950/92",
  },
  {
    title: "Document Intelligence",
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80",
    overlay: "from-sky-500/78 via-blue-400/20 to-slate-950/92",
  },
  {
    title: "Regen Finance",
    image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1200&q=80",
    overlay: "from-amber-400/74 via-yellow-300/18 to-slate-950/92",
  },
  {
    title: "APAC Markets",
    image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=80",
    overlay: "from-emerald-500/72 via-sky-400/20 to-slate-950/92",
  },
  {
    title: "Infrastructure",
    image: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80",
    overlay: "from-sky-600/76 via-blue-400/22 to-slate-950/92",
  },
  {
    title: "Social Bonds",
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
    overlay: "from-amber-400/72 via-emerald-300/18 to-slate-950/92",
  },
  {
    title: "Water Security",
    image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80",
    overlay: "from-emerald-500/72 via-emerald-300/18 to-slate-950/92",
  },
  {
    title: "Energy Transition",
    image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1200&q=80",
    overlay: "from-sky-500/78 via-blue-400/22 to-slate-950/92",
  },
  {
    title: "Nature Data",
    image: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=1200&q=80",
    overlay: "from-amber-400/74 via-yellow-300/18 to-slate-950/92",
  },
];

export default function Discover() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <PublicHeader lightBackground />

      <main className="px-6 pb-16 pt-28 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-[1460px]">
          <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Badge className="border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-50">Worldbridgers Discover</Badge>
              <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
                Explore the themes, markets, instruments, and climate intelligence shaping Regenify.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
                Each panel opens a focused story around the Worldbridgers ecosystem, from sustainable securities and
                indices to relationship intelligence and market discovery.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600">
              15 live discovery panels
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {TOPICS.map((topic) => (
              <button
                key={topic.title}
                onClick={() => navigate("/dashboard/graph")}
                className="group relative min-h-[208px] overflow-hidden rounded-[26px] border border-white/10 text-left transition-transform duration-300 hover:-translate-y-1"
              >
                <img
                  src={topic.image}
                  alt={topic.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className={`absolute inset-0 bg-gradient-to-br ${topic.overlay}`} />
                <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.09) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_24%)]" />
                <div className="relative flex h-full flex-col justify-between p-5">
                  <div className="h-12 w-12 rounded-2xl bg-white/14 backdrop-blur-sm" />
                  <div>
                    <div
                      className="max-w-[180px] text-[1.65rem] font-semibold leading-[1.02] text-white"
                      style={{ textShadow: "0 2px 10px rgba(0,0,0,0.35)" }}
                    >
                      {topic.title}
                    </div>
                    <div
                      className="mt-5 inline-flex items-center gap-2 text-sm font-medium opacity-0 transition-opacity group-hover:opacity-100"
                      style={{ color: "rgba(255,255,255,0.82)", textShadow: "0 2px 10px rgba(0,0,0,0.35)" }}
                    >
                      Open topic
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
