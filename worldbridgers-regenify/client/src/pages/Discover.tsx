import PublicHeader from "@/components/PublicHeader";
import { Badge } from "@/components/ui/badge";
import { DISCOVER_TOPICS } from "@/lib/discoverTopics";
import { ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

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
            {DISCOVER_TOPICS.map((topic) => (
              <button
                key={topic.title}
                onClick={() => navigate(`/discover/${topic.slug}`)}
                className="group relative min-h-[208px] overflow-hidden rounded-[26px] border border-white/10 text-left transition-transform duration-300 hover:-translate-y-1"
              >
                <img
                  src={topic.image}
                  alt={topic.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/22" />
                <div className="relative flex h-full flex-col justify-between p-5">
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
