import PublicHeader from "@/components/PublicHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DISCOVER_TOPICS, DISCOVER_TOPICS_BY_SLUG } from "@/lib/discoverTopics";
import { ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import NotFound from "./NotFound";

type DiscoverTopicPageProps = {
  params?: {
    slug?: string;
  };
};

export default function DiscoverTopicPage({ params }: DiscoverTopicPageProps) {
  const [, navigate] = useLocation();
  const topic = params?.slug ? DISCOVER_TOPICS_BY_SLUG[params.slug] : undefined;

  if (!topic) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader lightBackground />

      <section className="relative overflow-hidden pt-32 text-white">
        <div className="absolute inset-0">
          <img src={topic.image} alt={topic.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(4,12,16,0.88)_0%,rgba(8,18,24,0.78)_36%,rgba(8,18,24,0.48)_58%,rgba(8,18,24,0.18)_78%,rgba(8,18,24,0.08)_100%)]" />
        </div>
        <div className="container relative z-10 py-24">
          <div className="max-w-[760px]">
            <Badge className="border border-white/20 bg-white/10 text-white hover:bg-white/10">Discover Topic</Badge>
            <h1 className="mt-6 text-4xl font-bold leading-tight md:text-6xl">{topic.title}</h1>
            <p className="mt-6 max-w-[640px] text-lg leading-8 text-white/78">{topic.summary}</p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button className="h-12 rounded-xl bg-primary px-6 text-base font-semibold text-white shadow-brand hover:bg-primary/90" onClick={() => navigate("/login?mode=create-account")}>
                Sign Up
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="h-12 rounded-xl border-white/20 bg-white/5 px-6 text-base font-semibold text-white hover:bg-white/10" onClick={() => navigate("/discover")}>
                Back to Discover
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[28px] border border-border bg-card p-8 shadow-card">
            <h2 className="text-2xl font-semibold text-foreground">Overview</h2>
            <p className="mt-5 text-[1rem] leading-8 text-muted-foreground">{topic.overview}</p>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {(topic.details ?? [topic.summary]).slice(0, 2).map((detail) => (
                <div key={detail} className="rounded-2xl border border-border bg-muted/20 p-5">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Additional context</div>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-border bg-card p-8 shadow-card">
            <h2 className="text-2xl font-semibold text-foreground">Highlights</h2>
            <p className="mt-4 text-[0.98rem] leading-7 text-muted-foreground">
              These points show how this topic is positioned inside the wider Worldbridgers Regenify story and why it matters before users move into more detailed platform views.
            </p>
            <div className="mt-6 space-y-4">
              {topic.highlights.map((highlight) => (
                <div key={highlight} className="rounded-2xl border border-border bg-muted/30 px-4 py-4 text-sm leading-7 text-muted-foreground">
                  {highlight}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-slate-50 py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary hover:bg-primary/10">
              More Topics
            </Badge>
            <h2 className="mt-4 text-3xl font-bold text-foreground md:text-4xl">Continue Exploring Discover</h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {DISCOVER_TOPICS.filter((item) => item.slug !== topic.slug).slice(0, 6).map((item) => (
              <button
                key={item.slug}
                type="button"
                onClick={() => navigate(`/discover/${item.slug}`)}
                className="group overflow-hidden rounded-[28px] border border-border bg-background text-left shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
              >
                <div className="relative h-44">
                  <img src={item.image} alt={item.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/18" />
                </div>
                <div className="p-6">
                  <h3 className="text-[1.25rem] font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.summary}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
