import PublicHeader from "@/components/PublicHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2, Globe2, Network, ShieldCheck, Sparkles, Users, Leaf } from "lucide-react";
import { useLocation } from "wouter";

const TEAM_MEMBERS = [
  {
    name: "Platform Direction",
    role: "Public story and ecosystem positioning",
    image: "/hero-bg-1.jpg",
    description:
      "Defines how Worldbridgers Regenify introduces sustainable markets to public visitors and turns that first impression into a clearer path toward deeper platform use.",
  },
  {
    name: "Issuer and Offering Intelligence",
    role: "Structured capital-market presentation",
    image: "/her0-bg-2.png",
    description:
      "Organises issuers, offerings, documents, and indices into a cleaner review experience so users can move from overview to detailed comparison with less friction.",
  },
  {
    name: "Relationship and Theme Discovery",
    role: "Graph exploration and connected market context",
    image: "/hero-bg-1.jpg",
    description:
      "Explains how themes, entities, investors, and markets connect across the Worldbridgers Regenify ecosystem through graph-led discovery.",
  },
  {
    name: "Access, Support, and Exchange Context",
    role: "Onboarding, guidance, and WBX ecosystem flow",
    image: "/her0-bg-2.png",
    description:
      "Supports account access, onboarding, support journeys, and the wider transition from public platform discovery into the Worldbridgers Exchange environment.",
  },
];

const CAPABILITIES = [
  {
    icon: Globe2,
    title: "Public platform clarity",
    text: "A clearer public-facing experience that explains what Worldbridgers Regenify does before users enter the authenticated platform.",
  },
  {
    icon: Building2,
    title: "Structured market access",
    text: "Structured pathways into issuers, offerings, indices, and documents so users can review market information more confidently.",
  },
  {
    icon: Network,
    title: "Relationship-led discovery",
    text: "A graph-driven layer that helps themes, entities, and markets feel connected rather than separated across isolated tables.",
  },
  {
    icon: ShieldCheck,
    title: "Compliance-aware presentation",
    text: "Visible taxonomy alignment, WBX labels, and market context that help users interpret records with more confidence.",
  },
];

const TEAM_PROFILES = [
  {
    name: "Research and Platform Strategy",
    title: "Market narrative and public clarity",
    text: "Shapes how the platform explains sustainable markets, why the data matters, and how visitors move from first impression into trusted exploration.",
  },
  {
    name: "Data and Structuring",
    title: "Issuer, offering, and document organisation",
    text: "Translates complex capital-market records into cleaner tables, stronger metadata, and clearer review flows across the authenticated workspace.",
  },
  {
    name: "Graph and Discovery Experience",
    title: "Relationship intelligence and navigation",
    text: "Designs how users uncover themes, related entities, and connected market context through graph-led interaction and discovery journeys.",
  },
];

const VISION_CARD_BG_IMAGE = "/hero-bg-1.jpg";

const THEME_AREAS = [
  {
    name: "Entrepreneurship",
    description: "Highlights ventures, operators, and capital pathways that support regenerative business creation and long-term economic resilience.",
  },
  {
    name: "Social Justice",
    description: "Frames access, fairness, and inclusion as visible parts of how institutions, markets, and opportunities are evaluated.",
  },
  {
    name: "Sustainable Development",
    description: "Connects issuers and offerings to broader development outcomes so users can interpret market activity within long-range systems change.",
  },
  {
    name: "Future of Work",
    description: "Shows how labour transitions, reskilling, and next-generation industry priorities connect to regenerative capital deployment.",
  },
];

export default function AboutPage() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <PublicHeader lightBackground />

      <main className="pt-28">
        <section className="py-16 md:py-20">
          <div className="container">
            <div className="rounded-[42px] border border-[#e6e2d9] bg-[#f3f4f8] p-6 shadow-[0_18px_48px_rgba(15,23,42,0.06)] md:p-10">
              <div className="rounded-[34px] border border-[#ece8df] bg-white px-8 py-12 md:px-14 md:py-16">
                <div className="mx-auto max-w-[860px] text-center">
                  <Badge className="border-0 bg-[#eef1f6] px-4 py-1.5 text-[#475467]">About Us</Badge>
                  <h1 className="mt-6 text-4xl font-semibold tracking-[-0.04em] text-[#0f172a] md:text-6xl">
                    Understand the platform story behind Worldbridgers Regenify
                  </h1>
                  <p className="mx-auto mt-6 max-w-[720px] text-lg leading-8 text-[#5f6673]">
                    Worldbridgers Regenify brings together issuer intelligence, offering visibility, document access,
                    index context, and relationship discovery so sustainable market participants can understand
                    opportunities through one connected platform story.
                  </p>

                  <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                    <Button className="h-12 rounded-full px-6 text-sm font-semibold" onClick={() => navigate("/contact")}>
                      Get in Touch
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="h-12 rounded-full border-[#e7e2d8] bg-[#fcfcfb] px-6 text-sm font-semibold"
                      onClick={() => navigate("/discover")}
                    >
                      Explore Discover
                    </Button>
                  </div>
                </div>

                <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                  {TEAM_MEMBERS.map((member) => (
                    <article
                      key={member.name}
                      className="flex h-full flex-col overflow-hidden rounded-[28px] border border-[#ede8df] bg-[#fcfcfb] shadow-[0_14px_38px_rgba(15,23,42,0.06)]"
                    >
                      <div
                        className="h-56 bg-cover bg-center px-6 pt-6"
                        style={{ backgroundImage: `linear-gradient(180deg, rgba(7,16,24,0.1) 0%, rgba(7,16,24,0.28) 100%), url('${member.image}')` }}
                      >
                        <div className="flex h-full items-end rounded-[22px] border border-white/35 bg-[linear-gradient(180deg,rgba(255,255,255,0.86)_0%,rgba(247,244,238,0.92)_100%)] p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm">
                          <div className="flex min-h-[158px] flex-col justify-end">
                            <div className="min-h-[96px] text-2xl font-semibold tracking-[-0.03em] text-[#0f172a]">
                              {member.name}
                            </div>
                            <div className="mt-2 text-sm font-medium text-[#667085]">{member.role}</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-1 px-6 py-6">
                        <p className="text-[0.98rem] leading-7 text-[#5f6673]">{member.description}</p>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="mt-16 grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
                  <div className="max-w-[420px]">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#ebe7de] bg-[#f8f9fb] text-[#111827]">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <h2 className="mt-8 text-4xl font-semibold tracking-[-0.04em] text-[#0f172a]">
                      Why Regenify is structured this way
                    </h2>
                    <p className="mt-6 text-lg leading-8 text-[#5f6673]">
                      Worldbridgers Regenify is intentionally structured to bridge public market storytelling with
                      authenticated analysis, so users can move from first discovery into issuers, offerings, documents,
                      indices, and graph intelligence without losing context.
                    </p>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    {CAPABILITIES.map((item) => {
                      const Icon = item.icon;

                      return (
                        <article
                          key={item.title}
                          className="rounded-[26px] border border-[#ede8df] bg-[#fcfcfb] p-6 shadow-[0_12px_28px_rgba(15,23,42,0.05)]"
                        >
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#ebe7de] bg-white text-[#111827]">
                            <Icon className="h-5 w-5" />
                          </div>
                          <h3 className="mt-5 text-xl font-semibold tracking-[-0.02em] text-[#0f172a]">{item.title}</h3>
                          <p className="mt-3 text-[0.98rem] leading-7 text-[#5f6673]">{item.text}</p>
                        </article>
                      );
                    })}
                  </div>
                </div>

                <div id="team-members" className="mt-16 rounded-[32px] border border-[#ece8df] bg-[#fbfbfa] px-8 py-10 md:px-10 md:py-12">
                  <div className="max-w-[720px]">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#ebe7de] bg-white text-[#111827]">
                      <Users className="h-6 w-6" />
                    </div>
                    <h2 className="mt-6 text-3xl font-semibold tracking-[-0.04em] text-[#0f172a] md:text-4xl">Team Members</h2>
                    <p className="mt-4 text-lg leading-8 text-[#5f6673]">
                      The platform brings together strategy, market structure, and relationship design so users can understand the ecosystem through one coherent experience.
                    </p>
                  </div>

                  <div className="mt-8 grid gap-5 md:grid-cols-3">
                    {TEAM_PROFILES.map((profile) => (
                      <article
                        key={profile.name}
                        className="rounded-[26px] border border-[#ede8df] bg-white p-6 shadow-[0_12px_28px_rgba(15,23,42,0.05)]"
                      >
                        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#98a2b3]">{profile.title}</div>
                        <h3 className="mt-4 text-xl font-semibold tracking-[-0.02em] text-[#0f172a]">{profile.name}</h3>
                        <p className="mt-3 text-[0.98rem] leading-7 text-[#5f6673]">{profile.text}</p>
                      </article>
                    ))}
                  </div>
                </div>

                <div id="themes" className="mt-16 grid gap-10 rounded-[32px] border border-[#ece8df] bg-[linear-gradient(135deg,#f7f8f3_0%,#fdfaf5_48%,#f3f7fb_100%)] px-8 py-10 md:px-10 md:py-12 lg:grid-cols-[0.9fr_1.1fr]">
                  <div className="max-w-[420px]">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#ebe7de] bg-white text-[#111827]">
                      <Leaf className="h-6 w-6" />
                    </div>
                    <h2 className="mt-6 text-3xl font-semibold tracking-[-0.04em] text-[#0f172a] md:text-4xl">Themes</h2>
                    <p className="mt-4 text-lg leading-8 text-[#5f6673]">
                      Themes give the platform a connective layer beyond isolated records, helping users understand how market activity clusters around shared regenerative priorities.
                    </p>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    {THEME_AREAS.map((theme) => (
                      <article
                        key={theme.name}
                        className="rounded-[26px] border border-[#ede8df] bg-white/88 p-6 shadow-[0_12px_28px_rgba(15,23,42,0.05)] backdrop-blur-sm"
                      >
                        <h3 className="text-xl font-semibold tracking-[-0.02em] text-[#0f172a]">{theme.name}</h3>
                        <p className="mt-3 text-[0.98rem] leading-7 text-[#5f6673]">{theme.description}</p>
                      </article>
                    ))}
                  </div>
                </div>

                <div
                  className="relative overflow-hidden rounded-[32px] border border-[#ece8df] px-8 py-10 text-center md:px-14 md:py-14"
                  style={{ backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.22), rgba(15, 23, 42, 0.72)), url('${VISION_CARD_BG_IMAGE}')`, backgroundSize: "cover", backgroundPosition: "center" }}
                >
                  <div className="absolute inset-0 bg-slate-950/50" />
                  <div className="relative">
                    <p className="mx-auto max-w-[860px] text-2xl font-medium leading-10 tracking-[-0.03em] text-white md:text-[2rem]">
                      “Worldbridgers Regenify is designed to make issuer, offering, document, and relationship
                      intelligence easier to understand, easier to trust, and easier to explore across one unified market
                      experience.”
                    </p>
                    <div className="mt-8 text-sm font-semibold uppercase tracking-[0.24em] text-slate-200">
                      Worldbridgers Regenify
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
