import PublicHeader from "@/components/PublicHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Globe2 } from "lucide-react";
import { useLocation } from "wouter";

export default function Privacy() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader lightBackground />

      <section className="border-b border-border bg-gradient-to-br from-slate-50 to-slate-100 py-24">
        <div className="container">
          <Badge variant="secondary" className="bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary hover:bg-primary/10">
            Privacy
          </Badge>
          <h1 className="mt-6 text-4xl font-bold text-foreground md:text-5xl">
            Regenify privacy policy
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            This policy describes how Worldbridgers Regenify collects, processes, and protects personal information for users of the Regenify platform.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button
              className="h-12 rounded-xl bg-primary px-6 text-base font-semibold text-white shadow-brand hover:bg-primary/90"
              onClick={() => navigate("/")}
            >
              Return to home
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container grid gap-8 lg:grid-cols-3">
          <div className="rounded-[20px] border border-border bg-card p-8 shadow-card">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="mt-5 text-2xl font-semibold text-foreground">Data protection</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Regenify maintains robust security controls to protect personal and commercial data. Our approach includes encryption, access restrictions, and continuous monitoring.
            </p>
          </div>

          <div className="rounded-[20px] border border-border bg-card p-8 shadow-card">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Globe2 className="h-6 w-6" />
            </div>
            <h2 className="mt-5 text-2xl font-semibold text-foreground">Use of information</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              We process data to provide platform services, improve experience, secure accounts, and meet regulatory obligations. Personal information is never sold or shared for advertising purposes.
            </p>
          </div>

          <div className="rounded-[20px] border border-border bg-card p-8 shadow-card">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="mt-5 text-2xl font-semibold text-foreground">User rights</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Users may request access, correction, or deletion of their data where permitted by law. Regenify supports transparent handling of personal information.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-muted/30 py-20">
        <div className="container">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-[20px] border border-border bg-card p-8 shadow-card">
              <h2 className="text-2xl font-semibold text-foreground">Scope and compliance</h2>
              <p className="mt-4 text-sm text-muted-foreground">
                This policy applies to all Regenify platform users and visitors. We comply with applicable privacy regulations and regularly review our practices to maintain legal and ethical standards.
              </p>
            </div>
            <div className="rounded-[20px] border border-border bg-card p-8 shadow-card">
              <h2 className="text-2xl font-semibold text-foreground">Retention and access</h2>
              <p className="mt-4 text-sm text-muted-foreground">
                Data is retained only for as long as necessary to fulfill operational requirements, legal obligations, and service delivery. Access is limited to authorized personnel with a legitimate need.
              </p>
            </div>
          </div>

          <div className="mt-10 rounded-[20px] border border-border bg-card p-8 shadow-card">
            <h2 className="text-2xl font-semibold text-foreground">Privacy principles</h2>
            <ul className="mt-4 list-disc space-y-3 pl-5 text-sm text-muted-foreground">
              <li>We collect only the data necessary to operate the platform and support your activities.</li>
              <li>We secure data using proven technical and organizational controls.</li>
              <li>We are transparent about how information is used and who can access it.</li>
              <li>We enable users to exercise privacy rights in accordance with applicable law.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
