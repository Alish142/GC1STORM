import PublicHeader from "@/components/PublicHeader";
import { Badge } from "@/components/ui/badge";

const PRIVACY_SECTIONS = [
  {
    title: "Data use",
    body: "Worldbridgers Regenify uses account, market, and document-related information to support access, dashboard use, discovery, and relationship intelligence features inside the platform.",
  },
  {
    title: "Platform access",
    body: "User access information is used to authenticate sessions, protect protected pages, and provide appropriate access to platform content.",
  },
  {
    title: "Document and market data",
    body: "Displayed document, issuer, offering, and index information is shown to support platform research, review, and decision-making. Data visibility depends on the page context and access level.",
  },
  {
    title: "Support requests",
    body: "Messages submitted through contact, support, or request-call forms are used to respond to onboarding, access, and support needs. For the current frontend demo flow, form submissions are stored only in frontend state unless later connected to backend services.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader lightBackground />

      <main className="pt-28">
        <section className="border-b border-border bg-muted/20 py-20">
          <div className="container max-w-4xl">
            <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/10">
              Privacy
            </Badge>
            <h1 className="mt-4 text-4xl font-bold text-foreground md:text-5xl">Privacy and data use</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
              This page explains how the platform handles visible account, market, and support data within the current project implementation.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="container max-w-4xl space-y-6">
            {PRIVACY_SECTIONS.map((section) => (
              <article key={section.title} className="rounded-[28px] border border-border bg-card p-7 shadow-card">
                <h2 className="text-2xl font-semibold text-foreground">{section.title}</h2>
                <p className="mt-4 text-base leading-8 text-muted-foreground">{section.body}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
